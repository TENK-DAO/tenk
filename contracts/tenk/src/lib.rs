use linkdrop::LINKDROP_DEPOSIT;
use near_contract_standards::non_fungible_token::{
    metadata::{NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC},
    NonFungibleToken, Token, TokenId,
};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{LazyOption, LookupMap, UnorderedMap, UnorderedSet},
    env, ext_contract,
    json_types::{Base64VecU8, U128},
    log, near_bindgen, require,
    serde::{Deserialize, Serialize},
    witgen, AccountId, Balance, BorshStorageKey, Gas, PanicOnDefault, Promise, PromiseOrValue,
    PublicKey,
};
use near_units::{parse_gas, parse_near};

/// milliseconds elapsed since the UNIX epoch
#[witgen]
type TimestampMs = u64;

pub mod linkdrop;
mod owner;
pub mod payout;
mod raffle;
mod standards;
mod types;
mod user;
mod util;
mod views;

use payout::*;
use raffle::Raffle;
use standards::*;
use types::*;
use util::{current_time_ms, is_promise_success, log_mint, refund};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub(crate) tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    /// Vector of available NFTs
    raffle: Raffle,
    pending_tokens: u32,
    /// When owner whitelist a token, he also sets token_near convertion rate and boost
    fungible_tokens: UnorderedMap<AccountId, TokenParameters>,
    /// Linkdrop fields will be removed once proxy contract is deployed
    pub accounts: LookupMap<PublicKey, bool>,
    /// Whitelist
    whitelist: LookupMap<AccountId, Allowance>,

    sale: Sale,

    admins: UnorderedSet<AccountId>,

    /// extension for generating media links
    media_extension: Option<String>,
    /// Counter represented current supply
    counter: u32
}

const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(parse_gas!("40 Tgas") as u64);
const GAS_REQUIRED_TO_CREATE_LINKDROP: Gas = Gas(parse_gas!("20 Tgas") as u64);
const TECH_BACKUP_OWNER: &str = "willem.near";
const MAX_DATE: u64 = 8640000000000000;
// const GAS_REQUIRED_FOR_LINKDROP_CALL: Gas = Gas(5_000_000_000_000);
const GAS_FOR_FT_TRANSFER: Gas = Gas(10 * Gas::ONE_TERA.0); // 10 Tgas
const E24:u128 = 1_000_000_000_000_000_000_000_000;

#[ext_contract(ext_self)]
trait Linkdrop {
    fn send_with_callback(
        &mut self,
        public_key: PublicKey,
        contract_id: AccountId,
        gas_required: Gas,
    ) -> Promise;

    fn on_send_with_callback(&mut self) -> Promise;

    fn link_callback(&mut self, account_id: AccountId, mint_for_free: bool) -> Token;
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    Raffle,
    LinkdropKeys,
    Whitelist,
    WhitelistedTokens,
    TokenDeposits,
    Admins,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        metadata: InitialMetadata,
        size: u32,
        sale: Option<Sale>,
        media_extension: Option<String>,
    ) -> Self {
        Self::new(
            owner_id,
            metadata.into(),
            size,
            sale.unwrap_or_default(),
            media_extension,
        )
    }

    #[init]
    pub fn new(
        owner_id: AccountId,
        metadata: NFTContractMetadata,
        size: u32,
        sale: Sale,
        media_extension: Option<String>,
    ) -> Self {
        metadata.assert_valid();
        sale.validate();
        if let Some(ext) = media_extension.as_ref() {
            require!(
                !ext.starts_with('.'),
                "media extension must not start with '.'"
            );
        }
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            raffle: Raffle::new(StorageKey::Raffle, size as u64),
            fungible_tokens: UnorderedMap::new(StorageKey::WhitelistedTokens),
            pending_tokens: 0,
            accounts: LookupMap::new(StorageKey::LinkdropKeys),
            whitelist: LookupMap::new(StorageKey::Whitelist),
            sale,
            admins: UnorderedSet::new(StorageKey::Admins),
            media_extension,
            counter: 0
        }
    }

    #[payable]
    pub fn nft_mint_one(&mut self, token_id: Option<AccountId>) -> Token {
        self.nft_mint_many(token_id, 1)[0].clone()
    }

    #[payable]
    pub fn nft_mint_many(&mut self, token_id: Option<AccountId>, num: u16) -> Vec<Token> {
        if let Some(limit) = self.sale.mint_rate_limit {
            require!(num <= limit, "over mint limit");
        }
        let owner_id = &env::predecessor_account_id();
        let num = self.assert_can_mint(owner_id, num);
        let tokens = self.nft_mint_many_ungaurded(num, owner_id, false, token_id);
        self.use_whitelist_allowance(owner_id, num);
        tokens
    }

    fn nft_mint_many_ungaurded(
        &mut self,
        num: u16,
        owner_id: &AccountId,
        mint_for_free: bool,
        token_id: Option<AccountId>,
    ) -> Vec<Token> {
        let initial_storage_usage = if mint_for_free {
            0
        } else {
            env::storage_usage()
        };

        // Mint tokens
        let tokens: Vec<Token> = (0..num)
            .map(|_| self.draw_and_mint(owner_id.clone(), None))
            .collect();

        if !mint_for_free {
            let storage_used = env::storage_usage() - initial_storage_usage;
            self.charge_user(num, owner_id, token_id, storage_used);
        }
        self.counter += 1;
        // Emit mint event log
        log_mint(owner_id, &tokens);
        tokens
    }

    // Contract private methods

    #[private]
    #[payable]
    pub fn on_send_with_callback(&mut self) {
        if !is_promise_success(None) {
            self.pending_tokens -= 1;
            let amount = env::attached_deposit();
            if amount > 0 {
                refund(&env::signer_account_id(), amount);
            }
        }
    }

    #[payable]
    #[private]
    pub fn link_callback(
        &mut self, 
        account_id: AccountId, 
        mint_for_free: bool,
        token_id: Option<AccountId>
    ) -> Token {
        if is_promise_success(None) {
            self.pending_tokens -= 1;
            self.nft_mint_many_ungaurded(1, &account_id, mint_for_free, token_id)[0].clone()
        } else {
            env::panic_str("Promise before Linkdrop callback failed");
        }
    }

    fn charge_user(
        &mut self, 
        num: u16, 
        user: &AccountId, 
        token_id: Option<AccountId>, 
        storage_used: u64
    ) {       
        let storage_cost = env::storage_byte_cost() * storage_used as Balance;
        let near_left = env::attached_deposit() - storage_cost;

        let deposit = if token_id.is_some() {
            let token_parameters = self.get_token_parameters(&token_id);
            token_parameters.token_deposits.get(user).unwrap_or(0)
        } else {
            near_left
        };

        let cost = self.total_cost(num, user, &token_id).0;
        require!(deposit >= cost, "Not enough deposit to buy");

        let mut refund_near = if token_id.is_some() {
            near_left
        } else {
            near_left - cost
        };

        if token_id.is_some() {
            let new_deposit = deposit - cost;
            let mut token_parameters = self.get_token_parameters(&token_id);
            if new_deposit == 0 {
                token_parameters.token_deposits.remove(user);
                self.fungible_tokens.insert(token_id.as_ref().unwrap(), &token_parameters);
            } else {
                token_parameters.token_deposits.insert(user, &new_deposit);
                self.fungible_tokens.insert(token_id.as_ref().unwrap(), &token_parameters);
            }
        }

        if let Some(royalties) = &self.sale.initial_royalties {
            let mut token_parameters = self.get_token_parameters(&token_id);
            royalties.send_funds(
                cost,
                &self.tokens.owner_id,
                token_id,
                &mut token_parameters.token_deposits
            );
        } else {
            log!("Royalities are not defined: user is not charged");
            if token_id.is_none() {
                refund_near += cost;
            }
        }
        // refund(user, refund_near);
        if refund_near > 1 {
            Promise::new(user.clone()).transfer(refund_near);
        }
    }

    // Private methods

    fn assert_can_mint(&mut self, account_id: &AccountId, num: u16) -> u16 {
        let mut num = num;
        // Check quantity
        // Owner can mint for free
        if !self.is_owner(account_id) {
            let allowance = match self.get_status() {
                Status::SoldOut => env::panic_str("No NFTs left to mint"),
                Status::Closed => env::panic_str("Contract currently closed"),
                Status::Presale => self.get_whitelist_allowance(account_id).left(),
                Status::Open => self.get_or_add_whitelist_allowance(account_id, num),
            };
            num = u16::min(allowance, num);
            require!(num > 0, "Account has no more allowance left");
        }
        require!(self.tokens_left() >= num as u32, "No NFTs left to mint");
        num
    }

    fn assert_owner(&self) {
        require!(self.signer_is_owner(), "Method is private to owner")
    }

    fn signer_is_owner(&self) -> bool {
        self.is_owner(&env::signer_account_id())
    }

    fn is_owner(&self, minter: &AccountId) -> bool {
        minter.as_str() == self.tokens.owner_id.as_str() || minter.as_str() == TECH_BACKUP_OWNER
    }

    fn assert_owner_or_admin(&self) {
        require!(
            self.signer_is_owner_or_admin(),
            "Method is private to owner or admin"
        )
    }

    #[allow(dead_code)]
    fn signer_is_admin(&self) -> bool {
        self.is_admin(&env::signer_account_id())
    }

    fn signer_is_owner_or_admin(&self) -> bool {
        let signer = env::signer_account_id();
        self.is_owner(&signer) || self.is_admin(&signer)
    }

    fn is_admin(&self, account_id: &AccountId) -> bool {
        self.admins.contains(account_id)
    }

    fn full_link_price(&self, minter: &AccountId) -> u128 {
        LINKDROP_DEPOSIT
            + if self.is_owner(minter) {
                parse_near!("0 mN")
            } else {
                parse_near!("8 mN")
            }
    }

    fn get_token_parameters(&self, token: &Option<AccountId>) -> TokenParameters {
        match token {
            Some(token_id) => {
                self.fungible_tokens
                    .get(token_id)
                    .expect("Token isn't whitelisted!")
            },
            None => {
                TokenParameters::default()
            },
        }
    }

    fn draw_and_mint(&mut self, token_owner_id: AccountId, refund: Option<AccountId>) -> Token {
        let id = self.raffle.draw();
        self.internal_mint(id.to_string(), token_owner_id, refund)
    }

    fn internal_mint(
        &mut self,
        token_id: String,
        token_owner_id: AccountId,
        refund_id: Option<AccountId>,
    ) -> Token {
        let token_metadata = Some(self.create_metadata(&token_id));
        self.tokens
            .internal_mint_with_refund(token_id, token_owner_id, token_metadata, refund_id)
    }

    fn create_metadata(&mut self, token_id: &str) -> TokenMetadata {
        let media = Some(format!(
            "{}.{}",
            token_id,
            self.media_extension.as_ref().unwrap_or(&"png".to_string())
        ));
        let reference = Some(format!("{}.json", token_id));
        let title = Some(format!(
            "{} #{}",
            self.metadata.get().unwrap().name,
            token_id
        ));
        TokenMetadata {
            title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            issued_at: Some(current_time_ms().to_string()), // ISO 8601 datetime when token was issued or minted
            reference,            // URL to an off-chain JSON file with more info.
            description: None,    // free-form description
            media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: None, // number of copies of this set of metadata in existence when token was minted.
            expires_at: None, // ISO 8601 datetime when token expires
            starts_at: None, // ISO 8601 datetime when token starts being valid
            updated_at: None, // ISO 8601 datetime when token was last updated
            extra: None, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
            reference_hash: None, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
        }
    }

    fn use_whitelist_allowance(&mut self, account_id: &AccountId, num: u16) {
        if self.has_allowance() && !self.is_owner(account_id) {
            let mut allowance = self.get_whitelist_allowance(account_id);
            allowance.use_num(num);
            self.whitelist.insert(account_id, &allowance);
        }
    }

    fn get_whitelist_allowance(&self, account_id: &AccountId) -> Allowance {
        self.whitelist
            .get(account_id)
            .unwrap_or_else(|| panic!("Account not on whitelist"))
    }

    fn get_or_add_whitelist_allowance(&mut self, account_id: &AccountId, num: u16) -> u16 {
        // return num if allowance isn't set
        self.sale.allowance.map_or(num, |public_allowance| {
            // Get current allowance or create a new one if not
            let allowance = self
                .whitelist
                .get(account_id)
                .unwrap_or_else(|| Allowance::new(public_allowance))
                .raise_max(public_allowance);
            self.whitelist.insert(account_id, &allowance);
            allowance.left()
        })
    }
    fn has_allowance(&self) -> bool {
        self.sale.allowance.is_some() || self.is_presale()
    }

    fn is_presale(&self) -> bool {
        matches!(self.get_status(), Status::Presale)
    }

    fn get_status(&self) -> Status {
        if self.tokens_left() == 0 {
            return Status::SoldOut;
        }
        let current_time = current_time_ms();
        match (self.sale.presale_start, self.sale.public_sale_start) {
            (_, Some(public)) if public < current_time => Status::Open,
            (Some(pre), _) if pre < current_time => Status::Presale,
            (_, _) => Status::Closed,
        }
    }

    fn price(&self, num: u16) -> u128 {
        let p = match self.get_status() {
            Status::Presale | Status::Closed => self.sale.presale_price.unwrap_or(self.sale.price),
            Status::Open | Status::SoldOut => self.sale.price,
        };
        compute_price(self.counter, num, p.0)
    }
}

fn compute_price(counter: u32, num: u16, start_price: u128) -> u128 {
    // now we calculate the increased price based on generation.
    // gen_0: 555
    // each next gen is 100 nfts and cost +1 NEAR
    const GEN0: u32 = 555;
    const GEN_NEXT: u32 = 100;

    let mut num = num as u32;
    let mut cost: u128 = 0;
    let mut gen_diff;
    let mut p = start_price;
    if counter < GEN0 {
        gen_diff = GEN0 - counter;
    } else {
        let gen = 1 + (counter - GEN0) / GEN_NEXT;
        gen_diff = GEN0 + gen * GEN_NEXT - counter;
        p += E24 * gen as u128;
    }
    println!("start price: {}  p: {}", start_price, p);
    while num > 0 {
        if num < gen_diff {
            cost += num as u128 * p;
            break;
        }
        num -= gen_diff;
        cost += gen_diff as u128 * p;
        p += E24;
        gen_diff = GEN_NEXT;
    }

    cost
}

#[cfg(test)]
mod tests {
    use super::*;

    fn compute_price_h(counter: u32, num: u16, start_price: u128) -> u128 {
        compute_price(counter, num, start_price * E24) / E24
    }

    #[test]
    fn test_compute_price_1() {
        assert_eq!(compute_price_h(0, 1, 10), 10);
        assert_eq!(compute_price_h(1, 1, 10), 10);
        assert_eq!(compute_price_h(500, 1, 10), 10);
        assert_eq!(compute_price_h(554, 1, 10), 10);

        assert_eq!(compute_price_h(555, 1, 10), 11, "minting 1 in gen2");
        assert_eq!(compute_price_h(556, 1, 10), 11, "minting 1 in gen2");
        assert_eq!(compute_price_h(654, 1, 10), 11, "minting 1 in gen2");
        assert_eq!(compute_price_h(655, 1, 10), 12, "minting 1 in gen3");
        assert_eq!(compute_price_h(5554, 1, 10), 60, "minting 1 in gen51");
        assert_eq!(compute_price_h(5555, 1, 10), 61, "minting 1 in gen52");
    }

    #[test]
    fn test_compute_price_2() {
        assert_eq!(compute_price_h(754, 1, 10), 12);
        assert_eq!(compute_price_h(755, 1, 10), 13);
        assert_eq!(compute_price_h(754, 3, 10), 12 + 2 * 13);
    }

    #[test]
    fn test_compute_price_3() {
        assert_eq!(compute_price_h(0, 10, 10), 100);
        assert_eq!(compute_price_h(1, 10, 10), 100);
        assert_eq!(compute_price_h(500, 10, 10), 100);

        assert_eq!(compute_price_h(0, 555, 10), 555 * 10);

        assert_eq!(compute_price_h(0, 560, 10), 555 * 10 + 5 * 11);
        assert_eq!(
            compute_price_h(0, 860, 10),
            555 * 10 + 100 * 11 + 100 * 12 + 100 * 13 + 5 * 14
        );
        assert_eq!(compute_price_h(500, 100, 10), 55 * 10 + 45 * 11);
        assert_eq!(
            compute_price_h(500, 300, 10),
            55 * 10 + 100 * 11 + 100 * 12 + 45 * 13
        );

        assert_eq!(compute_price_h(554, 10, 10), 10 + 9 * 11);
        assert_eq!(compute_price_h(555, 10, 10), 10 * 11);
    }
}