use linkdrop::LINKDROP_DEPOSIT;
use near_contract_standards::non_fungible_token::{
    events::NftMint,
    metadata::{NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC},
    refund_deposit_to_account, NonFungibleToken, Token, TokenId,
};
use near_sdk::{
    borsh::{self, BorshDeserialize, BorshSerialize},
    collections::{LazyOption, LookupMap},
    env, ext_contract,
    json_types::{Base64VecU8, U128},
    log, near_bindgen, require, witgen, AccountId, Balance, BorshStorageKey, Duration, Gas,
    PanicOnDefault, Promise, PromiseOrValue, PublicKey,
};
use near_units::{parse_gas, parse_near};

pub mod linkdrop;
pub mod payout;
mod raffle;
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

#[witgen]
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

#[witgen]
#[derive(Deserialize, Serialize, BorshSerialize, BorshDeserialize)]
pub struct Sale {
    royalties: Option<Royalties>,
    initial_royalties: Option<Royalties>,
    presale_start: Option<Duration>,
    public_sale_start: Option<Duration>,
    allowance: Option<u32>,
    presale_price: Option<U128>,
    price: U128,
}

impl Default for Sale {
    fn default() -> Self {
        Self {
            price: U128(0),
            // ..Default::default()
            royalties: Default::default(),
            initial_royalties: Default::default(),
            presale_start: Default::default(),
            public_sale_start: Default::default(),
            allowance: Default::default(),
            presale_price: Default::default(),
        }
    }
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

    pub fn add_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance: Option<u32>) {
        self.assert_owner();
        let allowance = allowance.unwrap_or_else(|| self.sale.allowance.unwrap_or(0));
        accounts.iter().for_each(|account_id| {
            self.whitelist.insert(account_id, &allowance);
        });
    }

    pub fn whitelisted(&self, account_id: &AccountId) -> bool {
        self.whitelist.contains_key(account_id)
    }

    #[cfg(feature = "testnet")]
    pub fn add_whitelist_account_ungaurded(&mut self, account_id: AccountId, allowance: u32) {
        self.whitelist.insert(&account_id, &allowance);
    }

    pub fn close_contract(&mut self) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        self.sale.presale_start = None;
        self.sale.public_sale_start = None;
    }

    pub fn start_presale(
        &mut self,
        public_sale_start: Option<Duration>,
        presale_price: Option<U128>,
    ) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        let current_time = current_time_ms();
        self.sale.presale_start = Some(current_time);
        self.sale.public_sale_start = public_sale_start;
        if presale_price.is_some() {
            self.sale.presale_price = presale_price;
        }
    }

    pub fn start_sale(&mut self, price: Option<U128>) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        self.sale.public_sale_start = Some(current_time_ms());
        if let Some(price) = price {
            self.sale.price = price
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
    /// Create a pending token that can be claimed with corresponding private key
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

    #[payable]
    pub fn nft_mint_many(&mut self, num: u32) -> Vec<Token> {
        require!(num <= 3 && num > 0, "Can mint at most three in one transaction");
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

    pub fn cost_of_linkdrop(&self, minter: &AccountId) -> U128 {
        (self.full_link_price(minter) + self.total_cost(1, minter).0).into()
    }

    pub fn total_cost(&self, num: u32, minter: &AccountId) -> U128 {
        (num as Balance * self.cost_per_token(minter).0).into()
    }

    pub fn cost_per_token(&self, minter: &AccountId) -> U128 {
        let base_cost = if self.is_owner(minter) {
            0
        } else {
            self.price()
        };
        (base_cost + self.token_storage_cost().0).into()
    }

    pub fn token_storage_cost(&self) -> U128 {
        (env::storage_byte_cost() * self.tokens.extra_storage_in_bytes_per_token as Balance).into()
    }

    pub fn tokens_left(&self) -> u32 {
        self.raffle.len() as u32 - self.pending_tokens
    }

    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    pub fn remaining_allowance(&self, account_id: &AccountId) -> Option<u32> {
        self.whitelist.get(account_id)
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

    pub fn update_royalties(&mut self, royalties: Royalties) {
        self.assert_owner();
        royalties.validate();
        self.sale.royalties = Some(royalties);
    }

    pub fn update_allowance(&mut self, allowance: u32) {
        self.assert_owner();
        self.sale.allowance = Some(allowance);
    }

    pub fn update_uri(&mut self, uri: String) {
        self.assert_owner();
        let mut metadata = self.metadata.get().unwrap();
        log!("New URI: {}", &uri);
        metadata.base_uri = Some(uri);
        self.metadata.set(&metadata);
    }

    pub fn get_sale_info(&self) -> SaleInfo {
        SaleInfo {
            status: self.get_status(),
            presale_start: self.sale.presale_start.unwrap_or(MAX_DATE),
            sale_start: self.sale.public_sale_start.unwrap_or(MAX_DATE),
            token_final_supply: self.initial(),
            price: self.price().into(),
        }
    }

    pub fn get_user_sale_info(&self, account_id: &AccountId) -> UserSaleInfo {
        let sale_info = self.get_sale_info();
        let remaining_allowance = if self.is_presale() || self.sale.allowance.is_some() {
            self.remaining_allowance(account_id)
        } else {
            None
        };
        UserSaleInfo {
            sale_info,
            remaining_allowance,
            is_vip: self.whitelisted(account_id),
        }
    }

    pub fn mint_special(&mut self) -> Option<Vec<Token>> {
        self.assert_owner();
        let mut tokens = Vec::new();
        let owners = [
            "capardano.near",
            "boneshanks.near",
            "796eef516a6751801a677ea4caf17722923fd1bc315940f09f10f574d9086c2c",
            "dannyb69.near",
            "jolyon.near",
        ].iter().map(|s| <AccountId as std::str::FromStr>::from_str(s).unwrap());
        for (id, token_owner_id) in owners.enumerate() {
          self.raffle.swap_remove_raw(id as u64);
          tokens.push(self.internal_mint(id.to_string(), token_owner_id, None));
        }

        Some(tokens)
    }

    pub fn initial(&self) -> u64 {
        self.raffle.len() + self.nft_total_supply().0 as u64
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
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            issued_at: Some(env::block_timestamp().to_string()), // ISO 8601 datetime when token was issued or minted
            reference,   // URL to an off-chain JSON file with more info.
            description: None, // free-form description
            media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: None, // number of copies of this set of metadata in existence when token was minted.
            expires_at: None,     // ISO 8601 datetime when token expires
            starts_at: None,      // ISO 8601 datetime when token starts being valid
            updated_at: None,     // ISO 8601 datetime when token was last updated
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

fn current_time_ms() -> Duration {
    env::block_timestamp() / 1_000_000
}

/// Current state of contract
#[witgen]
#[derive(Serialize)]
enum Status {
    /// Not open for any sales
    Closed,
    /// VIP accounts can mint
    Presale,
    /// Any account can mint
    Open,
    /// No more tokens to be minted
    SoldOut,
}

/// Information about the current sale from user perspective
#[allow(dead_code)]
#[witgen]
#[derive(Serialize)]
pub struct UserSaleInfo {
    sale_info: SaleInfo,
    is_vip: bool,
    remaining_allowance: Option<u32>,
}

/// Information about the current sale
#[allow(dead_code)]
#[witgen]
#[derive(Serialize)]
pub struct SaleInfo {
    /// Current state of contract
    status: Status,
    /// Start of the VIP sale
    presale_start: Duration,
    /// Start of public sale
    sale_start: Duration,
    /// Total tokens that could be minted
    token_final_supply: u64,
    /// Current price for one token
    price: U128,
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

fn log_mint(owner_id: &AccountId, tokens: &[Token]) {
    let token_ids = &tokens
        .iter()
        .map(|t| t.token_id.as_str())
        .collect::<Vec<&str>>();
    NftMint {
        owner_id,
        token_ids,
        memo: None,
    }
    .emit()
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_units::parse_near;
    const TEN: u128 = parse_near!("10 N");

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
            Some(Sale {
                price: TEN.into(),
                ..Default::default()
            }),
        )
    }

    #[test]
    fn check_price() {
        let contract = new_contract();
        assert_eq!(
            contract.cost_per_token(&account()).0,
            TEN + contract.token_storage_cost().0
        );
    }
}
