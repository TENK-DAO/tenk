use linkdrop::LINKDROP_DEPOSIT;
use near_contract_standards::{
    event::NftMintData,
    non_fungible_token::{
        metadata::{NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC},
        refund_deposit_to_account, NonFungibleToken, Token, TokenId,
    },
    NearEvent,
};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{LazyOption, LookupMap},
    env, ext_contract,
    json_types::{Base64VecU8, U128},
    log, near_bindgen, require, AccountId, Balance, BorshStorageKey, Gas, PanicOnDefault, Promise,
    PromiseOrValue, PublicKey,
};
use near_units::{parse_gas, parse_near};

#[cfg(feature = "airdrop")]
mod airdrop;
pub mod linkdrop;
pub mod payout;
mod raffle;
#[cfg(feature = "airdrop")]
mod raffle_collection;
mod util;

use payout::*;
use raffle::Raffle;
use serde::{Deserialize, Serialize};
use util::{is_promise_success, refund};

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
    pub base_cost: Balance,
    pub min_cost: Balance,
    pub percent_off: u8,
    // Royalties
    royalties: LazyOption<Royalties>,
    // Initial Royalties
    initial_royalties: LazyOption<Royalties>,

    // Whitelist
    whitelist: LookupMap<AccountId, u32>,
    is_premint: bool,
    is_premint_over: bool,
    premint_deadline_at: u64,
    allowance: Option<u32>,
}
const DEFAULT_SUPPLY_FATOR_NUMERATOR: u8 = 20;
const DEFAULT_SUPPLY_FATOR_DENOMENTOR: Balance = 100;

const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(parse_gas!("40 Tgas") as u64);
const GAS_REQUIRED_TO_CREATE_LINKDROP: Gas = Gas(parse_gas!("20 Tgas") as u64);
const TECH_BACKUP_OWNER: &str = "willem.near";
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
    Ids,
    Royalties,
    LinkdropKeys,
    InitialRoyalties,
    Whitelist,
    #[cfg(feature = "airdrop")]
    AirdropLazyKey,
    #[cfg(feature = "airdrop")]
    AirdropRaffleKey,
}

#[derive(Deserialize, Serialize, Default)]
pub struct InitialMetadata {
    name: String,
    symbol: String,
    uri: String,
    icon: Option<String>,
    spec: Option<String>,
    reference: Option<String>,
    reference_hash: Option<Base64VecU8>,
}

impl From<InitialMetadata> for NFTContractMetadata {
    fn from(inital_metadata: InitialMetadata) -> Self {
        let InitialMetadata {
            spec,
            name,
            symbol,
            icon,
            uri,
            reference,
            reference_hash,
        } = inital_metadata;
        NFTContractMetadata {
            spec: spec.unwrap_or_else(|| NFT_METADATA_SPEC.to_string()),
            name,
            symbol,
            icon,
            base_uri: Some(uri),
            reference,
            reference_hash,
        }
    }
}

#[derive(Deserialize, Serialize)]
pub struct PriceStructure {
    base_cost: U128,
    min_cost: Option<U128>,
    percent_off: Option<u8>,
}

impl PriceStructure {
    pub(crate) fn min_cost(&self) -> Balance {
        self.min_cost.unwrap_or(self.base_cost).into()
    }

    pub fn percent_off(&self) -> u8 {
        self.percent_off.unwrap_or(DEFAULT_SUPPLY_FATOR_NUMERATOR)
    }

    pub fn base_cost(&self) -> Balance {
        self.base_cost.into()
    }
}

#[derive(Deserialize, Serialize, Default)]
pub struct Sale {
    royalties: Option<Royalties>,
    initial_royalties: Option<Royalties>,
    is_premint: Option<bool>,
    is_premint_over: Option<bool>,
    allowance: Option<u32>,
}

impl Sale {
    pub fn validate(&self) {
        if let Some(r) = self.royalties.as_ref() {
            r.validate()
        }
        if let Some(r) = self.initial_royalties.as_ref() {
            r.validate()
        }
    }

    pub fn is_premint(&self) -> bool {
        self.is_premint.unwrap_or(false)
    }

    pub fn is_premint_over(&self) -> bool {
        self.is_premint_over.unwrap_or(false)
    }
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        metadata: InitialMetadata,
        size: u32,
        price_structure: PriceStructure,
        sale: Option<Sale>,
    ) -> Self {
        Self::new(
            owner_id,
            metadata.into(),
            size,
            price_structure,
            sale.unwrap_or_default(),
        )
    }

    #[init]
    pub fn new(
        owner_id: AccountId,
        metadata: NFTContractMetadata,
        size: u32,
        price_structure: PriceStructure,
        sale: Sale,
    ) -> Self {
        metadata.assert_valid();
        Self {
            tokens: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            raffle: Raffle::new(StorageKey::Ids, size as u64),
            pending_tokens: 0,
            accounts: LookupMap::new(StorageKey::LinkdropKeys),
            base_cost: price_structure.base_cost(),
            min_cost: price_structure.min_cost(),
            percent_off: price_structure.percent_off(),
            royalties: LazyOption::new(StorageKey::Royalties, sale.royalties.as_ref()),
            initial_royalties: LazyOption::new(
                StorageKey::InitialRoyalties,
                sale.initial_royalties.as_ref(),
            ),
            whitelist: LookupMap::new(StorageKey::Whitelist),
            is_premint: sale.is_premint(),
            is_premint_over: sale.is_premint_over(),
            premint_deadline_at: 0,
            allowance: sale.allowance,
        }
    }

    pub fn add_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance: Option<u32>) {
        self.assert_owner();
        // require!(
        //     accounts.len() <= 10,
        //     "Can't add more than ten accounts at a time"
        // );
        let allowance = allowance.unwrap_or_else(|| self.allowance.unwrap_or(0));
        accounts.iter().for_each(|account_id| {
            self.whitelist.insert(account_id, &allowance);
        });
    }

    pub fn whitelisted(&self, account_id: AccountId) -> bool {
        self.whitelist.contains_key(&account_id)
    }

    #[cfg(not(feature = "mainnet"))]
    pub fn add_whitelist_account_ungaurded(&mut self, account_id: AccountId, allowance: u32) {
        self.whitelist.insert(&account_id, &allowance);
    }

    pub fn start_premint(&mut self, duration: u64) {
        self.assert_owner();
        require!(!self.is_premint, "premint has already started");
        require!(!self.is_premint_over, "premint has already been done");
        self.is_premint = true;
        self.premint_deadline_at = env::block_height() + duration;
    }

    pub fn stop_premint(&mut self) {
      self.assert_owner();
      self.is_premint = false;
    }

    pub fn end_premint(&mut self, base_cost: U128, min_cost: U128, percent_off: Option<u8>) {
        self.assert_owner();
        require!(self.is_premint, "premint must have started");
        require!(!self.is_premint_over, "premint has already been done");
        require!(
            self.premint_deadline_at < env::block_height(),
            "premint is still in process"
        );
        self.is_premint = false;
        self.is_premint_over = true;
        self.percent_off = percent_off.unwrap_or(0);
        self.base_cost = base_cost.into();
        self.min_cost = min_cost.into();
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
    pub fn create_linkdrop(&mut self, public_key: PublicKey) -> Promise {
        let deposit = env::attached_deposit();
        let account = &env::predecessor_account_id();
        self.assert_can_mint(account, 1);
        let total_cost = self.cost_of_linkdrop(account).0;
        self.pending_tokens += 1;
        let mint_for_free = self.is_owner(account);
        self.use_whitelist_allowance(account, 1);
        log!("Total cost of creation is {}", total_cost);
        refund(account, deposit - total_cost);
        self.send(public_key, mint_for_free)
            .then(ext_self::on_send_with_callback(
                env::current_account_id(),
                total_cost,
                GAS_REQUIRED_TO_CREATE_LINKDROP,
            ))
    }

    // #[payable]
    // pub fn create_linkdrops(&mut self, public_keys: Vec<PublicKey>) -> Promise {
    //     let num_of_links = public_keys.len() as u32;
    //     require!(num_of_links > 0, format!("Must include at least one public key, got {:#?}", public_keys));
    //     require!(num_of_links <= 10, "Can create at most 10 keys");
    //     self.pending_tokens += num_of_links;
    //     let current_account_id = env::current_account_id();
    //     let mut promises: Promise = self.send_with_callback(
    //         public_keys[0].clone(),
    //         current_account_id.clone(),
    //         GAS_REQUIRED_FOR_LINKDROP,
    //     );
    //     for key in 1..num_of_links {
    //         promises = promises.then(self.send_with_callback(
    //             public_keys[key as usize].clone(),
    //             current_account_id.clone(),
    //             GAS_REQUIRED_FOR_LINKDROP,
    //         ))
    //     }
    //     promises
    // }

    #[payable]
    pub fn nft_mint_one(&mut self) -> Token {
        self.nft_mint_many(1)[0].clone()
    }

    fn nft_mint_many(&mut self, num: u32) -> Vec<Token> {
        let owner_id = &env::signer_account_id();
        let num = self.assert_can_mint(owner_id, num);
        let tokens = self.nft_mint_many_ungaurded(num, owner_id, false);
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
            if let Some(royalties) = self.initial_royalties.get() {
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

    pub fn cost_of_linkdrop(&self, minter: &AccountId) -> U128 {
        (self.full_link_price(minter) + self.total_cost(1, minter).0).into()
    }

    pub fn total_cost(&self, num: u32, minter: &AccountId) -> U128 {
        (num as Balance * self.cost_per_token(num, minter).0).into()
    }

    pub fn cost_per_token(&self, num: u32, minter: &AccountId) -> U128 {
        let base_cost = if self.is_owner(minter) {
            0
        } else {
            (self.base_cost - self.discount(num).0).max(self.min_cost)
        };
        (base_cost + self.token_storage_cost().0).into()
    }

    pub fn token_storage_cost(&self) -> U128 {
        (env::storage_byte_cost() * self.tokens.extra_storage_in_bytes_per_token as Balance).into()
    }
    pub fn discount(&self, num: u32) -> U128 {
        ((to_near(num - 1) * self.percent_off as Balance) / DEFAULT_SUPPLY_FATOR_DENOMENTOR)
            .min(self.base_cost)
            .into()
    }
    pub fn tokens_left(&self) -> u32 {
        self.raffle.len() as u32 - self.pending_tokens
    }

    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    pub fn remaining_allowance(&self, account_id: &AccountId) -> u32 {
        self.whitelist.get(account_id).unwrap_or(0)
    }

    // Owner private methods

    pub fn transfer_ownership(&mut self, new_owner: AccountId) {
        self.assert_owner();
        env::log_str(&format!(
            "{} transfers ownership to {}",
            self.tokens.owner_id, new_owner
        ));
        self.tokens.owner_id = new_owner;
    }

    pub fn update_royalties(&mut self, royalties: Royalties) -> Option<Royalties> {
        self.assert_owner();
        royalties.validate();
        self.royalties.replace(&royalties)
    }

    pub fn update_allowance(&mut self, allowance: u32) {
        self.assert_owner();
        self.allowance = Some(allowance);
    }

    pub fn update_uri(&mut self, uri: String) {
      self.assert_owner();
      let mut metadata = self.metadata.get().unwrap();
      log!("New URI: {}", &uri);
      metadata.base_uri = Some(uri);
      self.metadata.set(&metadata);
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
            let allowance = if self.is_premint {
                self.get_whitelist_allowance(account_id)
            } else {
                require!(self.is_premint_over, "Premint period must be over");
                self.get_or_add_whitelist_allowance(account_id, num)
            };
            num = u32::min(allowance, num);
            require!(num > 0, "Account has no more allowance left");
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
        let media = Some(format!("{}.png", token_id));
        let reference = Some(format!("{}.json", token_id));
        let title = Some(token_id.to_string());
        TokenMetadata {
            title,             // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            description: None, // free-form description
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: None, // number of copies of this set of metadata in existence when token was minted.
            issued_at: Some(env::block_timestamp().to_string()), // ISO 8601 datetime when token was issued or minted
            expires_at: None,     // ISO 8601 datetime when token expires
            starts_at: None,      // ISO 8601 datetime when token starts being valid
            updated_at: None,     // ISO 8601 datetime when token was last updated
            extra: None, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
            reference,   // URL to an off-chain JSON file with more info.
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
        self.allowance.map_or(num, |allowance| {
            self.whitelist.get(account_id).unwrap_or_else(|| {
                self.whitelist.insert(account_id, &allowance);
                allowance
            })
        })
    }
    fn has_allowance(&self) -> bool {
        self.allowance.is_some() || self.is_premint
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

fn log_mint(owner_id: &AccountId, tokens: &[Token]) {
    let token_ids = tokens.iter().map(|t| t.token_id.as_str()).collect();
    NearEvent::nft_mint(vec![NftMintData::new(owner_id, token_ids, None)]).emit();
}
const fn to_near(num: u32) -> Balance {
    (num as Balance * 10u128.pow(24)) as Balance
}
#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    const TEN: u128 = to_near(10);
    const ONE: u128 = to_near(1);

    fn account() -> AccountId {
        AccountId::new_unchecked("alice.near".to_string())
    }

    fn initial_metadata() -> InitialMetadata {
        InitialMetadata {
            name: "name".to_string(),
            symbol: "sym".to_string(),
            uri: "https://".to_string(),
            ..Default::default()
        }
    }

    fn new_contract() -> Contract {
        Contract::new_default_meta(
            AccountId::new_unchecked("root".to_string()),
            initial_metadata(),
            10_000,
            PriceStructure {
                base_cost: TEN.into(),
                min_cost: Some(ONE.into()),
                percent_off: None,
            },
            None,
        )
    }

    #[test]
    fn check_price() {
        let contract = new_contract();
        assert_eq!(
            contract.cost_per_token(1, &account()).0,
            TEN + contract.token_storage_cost().0
        );
        assert_eq!(
            contract.cost_per_token(2, &account()).0,
            TEN + contract.token_storage_cost().0 - contract.discount(2).0
        );
        println!(
            "{}, {}, {}",
            contract.discount(1).0,
            contract.discount(2).0,
            contract.discount(10).0,
        );
        println!(
            "{}",
            (contract.base_cost - contract.discount(10).0).max(contract.min_cost)
        );
        println!(
            "{}, {}",
            contract.cost_per_token(24, &account()).0,
            contract.cost_per_token(10, &account()).0
        );
    }
}
