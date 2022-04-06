use linkdrop::LINKDROP_DEPOSIT;
use near_contract_standards::non_fungible_token::{
    metadata::{NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC},
    refund_deposit_to_account, NonFungibleToken, Token, TokenId,
};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{LazyOption, LookupMap},
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
mod types;
mod util;
mod views;

use payout::*;
use raffle::Raffle;
use types::*;
use util::{current_time_ms, is_promise_success, log_mint, refund};

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub(crate) tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Vector of available NFTs
    raffle: Raffle,
    pending_tokens: u32,
    // Linkdrop fields will be removed once proxy contract is deployed
    pub accounts: LookupMap<PublicKey, bool>,
    // Whitelist
    whitelist: LookupMap<AccountId, u32>,

    sale: Sale,
}

const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(parse_gas!("40 Tgas") as u64);
const GAS_REQUIRED_TO_CREATE_LINKDROP: Gas = Gas(parse_gas!("20 Tgas") as u64);
const TECH_BACKUP_OWNER: &str = "willem.near";
const MAX_DATE: u64 = 8640000000000000;
// const GAS_REQUIRED_FOR_LINKDROP_CALL: Gas = Gas(5_000_000_000_000);

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
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        metadata: InitialMetadata,
        size: u32,
        sale: Option<Sale>,
    ) -> Self {
        Self::new(owner_id, metadata.into(), size, sale.unwrap_or_default())
    }

    #[init]
    pub fn new(owner_id: AccountId, metadata: NFTContractMetadata, size: u32, sale: Sale) -> Self {
        metadata.assert_valid();
        sale.validate();
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
            pending_tokens: 0,
            accounts: LookupMap::new(StorageKey::LinkdropKeys),
            whitelist: LookupMap::new(StorageKey::Whitelist),
            sale,
        }
    }

    #[payable]
    pub fn nft_mint(
        &mut self,
        _token_id: TokenId,
        _token_owner_id: AccountId,
        _token_metadata: TokenMetadata,
    ) -> Token {
        self.nft_mint_one()
    }

    #[payable]
    pub fn nft_mint_one(&mut self) -> Token {
        self.nft_mint_many(1)[0].clone()
    }

    #[payable]
    pub fn nft_mint_many(&mut self, num: u32) -> Vec<Token> {
        if let Some(limit) = self.sale.mint_rate_limit {
            require!(num <= limit, "over mint limit");
        }
        let owner_id = &env::signer_account_id();
        let num = self.assert_can_mint(owner_id, num);
        let tokens = self.nft_mint_many_ungaurded(num, owner_id, self.total_cost(num, owner_id).0 == 0);
        self.use_whitelist_allowance(owner_id, num);
        tokens
    }

    fn nft_mint_many_ungaurded(
        &mut self,
        num: u32,
        owner_id: &AccountId,
        mint_for_free: bool,
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
            if let Some(royalties) = &self.sale.initial_royalties {
                // Keep enough funds to cover storage and split the rest as royalties
                let storage_cost = env::storage_byte_cost() * storage_used as Balance;
                let left_over_funds = env::attached_deposit() - storage_cost;
                royalties.send_funds(left_over_funds, &self.tokens.owner_id);
            } else {
                // Keep enough funds to cover storage and send rest to contract owner
                refund_deposit_to_account(storage_used, self.tokens.owner_id.clone());
            }
        }
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
    pub fn link_callback(&mut self, account_id: AccountId, mint_for_free: bool) -> Token {
        if is_promise_success(None) {
            self.pending_tokens -= 1;
            self.nft_mint_many_ungaurded(1, &account_id, mint_for_free)[0].clone()
        } else {
            env::panic_str("Promise before Linkdrop callback failed");
        }
    }

    // Private methods
    fn assert_deposit(&self, num: u32, account_id: &AccountId) {
        require!(
            env::attached_deposit() >= self.total_cost(num, account_id).0,
            "Not enough attached deposit to buy"
        );
    }

    fn assert_can_mint(&mut self, account_id: &AccountId, num: u32) -> u32 {
        let mut num = num;
        // Check quantity
        // Owner can mint for free
        if !self.is_owner(account_id) {
            let allowance = match self.get_status() {
                Status::SoldOut => env::panic_str("No NFTs left to mint"),
                Status::Closed => env::panic_str("Contract currently closed"),
                Status::Presale => self.get_whitelist_allowance(account_id),
                Status::Open => self.get_or_add_whitelist_allowance(account_id, num),
            };
            let allowed_to_mint = u32::min(allowance, num);
            require!(allowed_to_mint > 0, "Account has no more allowance left");
            require!(allowed_to_mint == num, "Cannot mint more than allowance");
            num = allowed_to_mint;
            
        }
        require!(self.tokens_left() >= num, "No NFTs left to mint");
        self.assert_deposit(num, account_id);
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

    fn full_link_price(&self, minter: &AccountId) -> u128 {
        LINKDROP_DEPOSIT
            + if self.is_owner(minter) {
                parse_near!("0 mN")
            } else {
                parse_near!("8 mN")
            }
    }

    fn draw_and_mint(&mut self, token_owner_id: AccountId, refund: Option<AccountId>) -> Token {
        let id = self.raffle.draw() + 1;
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
        let media = Some(format!("{}.png", token_id));
        let reference = Some(format!("{}.json", token_id));
        let title = Some(token_id.to_string());
        TokenMetadata {
            title, // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            issued_at: Some(env::block_timestamp().to_string()), // ISO 8601 datetime when token was issued or minted
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

    fn use_whitelist_allowance(&mut self, account_id: &AccountId, num: u32) {
        if self.has_allowance() && !self.is_owner(account_id) {
            let allowance = self.get_whitelist_allowance(account_id);
            let new_allowance = allowance - u32::min(num, allowance);
            self.whitelist.insert(account_id, &new_allowance);
        }
    }

    fn get_whitelist_allowance(&self, account_id: &AccountId) -> u32 {
        self.whitelist
            .get(account_id)
            .unwrap_or_else(|| panic!("Account not on whitelist"))
    }

    fn get_or_add_whitelist_allowance(&mut self, account_id: &AccountId, num: u32) -> u32 {
        // return num if allowance isn't set
        self.sale.allowance.map_or(num, |allowance| {
            self.whitelist.get(account_id).unwrap_or_else(|| {
                self.whitelist.insert(account_id, &allowance);
                allowance
            })
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

    fn price(&self) -> u128 {
        match self.get_status() {
            Status::Presale | Status::Closed => self.sale.presale_price.unwrap_or(self.sale.price),
            Status::Open | Status::SoldOut => self.sale.price,
        }
        .into()
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);
