use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{refund_deposit, NonFungibleToken};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap};
use near_sdk::json_types::Base64VecU8;
use near_sdk::{
    env, ext_contract, near_bindgen, require, AccountId, Balance, BorshStorageKey, Gas,
    PanicOnDefault, Promise, PromiseOrValue, PublicKey,
};
use near_units::parse_gas;

use contract_utils::is_promise_success;

mod raffle;
use raffle::Raffle;
mod action;
use action::Action;

pub mod linkdrop;
use linkdrop::*;
pub mod payout;
use payout::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Vector of available NFTs
    raffle: Raffle,
    pending_tokens: u32,
    // Linkdrop fields will be removed once proxy contract is deployed
    pub accounts: LookupMap<PublicKey, Action>,
    pub base_cost: Balance,
    pub min_cost: Balance,
    pub percent_off: u8,
    // Royalties
    royalties: LazyOption<Royalties>,
}
const DEFAULT_SUPPLY_FATOR_NUMERATOR: u8 = 20;
const DEFAULT_SUPPLY_FATOR_DENOMENTOR: Balance = 100;

const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(parse_gas!("70 Tgas") as u64);
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
}

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
    Ids,
    LinkdropKeys,
    Royalties,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        name: String,
        symbol: String,
        uri: String,
        size: u32,
        base_cost: U128,
        min_cost: U128,
        percent_off: Option<u8>,
        icon: Option<String>,
        spec: Option<String>,
        reference: Option<String>,
        reference_hash: Option<Base64VecU8>,
        royalties: Option<Royalties>,
    ) -> Self {
        royalties.as_ref().map(|r| r.validate());
        Self::new(
            owner_id.clone(),
            NFTContractMetadata {
                spec: spec.unwrap_or(NFT_METADATA_SPEC.to_string()),
                name,
                symbol,
                icon,
                base_uri: Some(uri),
                reference,
                reference_hash,
            },
            size,
            base_cost,
            min_cost,
            percent_off.unwrap_or(DEFAULT_SUPPLY_FATOR_NUMERATOR),
            royalties,
        )
    }

    #[init]
    pub fn new(
        owner_id: AccountId,
        metadata: NFTContractMetadata,
        size: u32,
        base_cost: U128,
        min_cost: U128,
        percent_off: u8,
        royalties: Option<Royalties>,
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
            base_cost: base_cost.0,
            min_cost: min_cost.0,
            percent_off,
            royalties: LazyOption::new(StorageKey::Royalties, royalties.as_ref()),
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
    pub fn create_linkdrop(&mut self, public_key: PublicKey) -> Promise {
        self.assert_can_mint(1);
        let total_cost = self.cost_of_linkdrop().0;
        require!(
            total_cost <= env::attached_deposit(),
            format!("attached deposit must be at least {}", total_cost)
        );
        self.pending_tokens += 1;
        self.send_with_callback(
            public_key,
            env::current_account_id(),
            GAS_REQUIRED_FOR_LINKDROP,
        )
        .then(ext_self::on_send_with_callback(
            env::current_account_id(),
            0,
            GAS_REQUIRED_FOR_LINKDROP,
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
        self.assert_can_mint(num);
        let initial_storage_usage = env::storage_usage();
        let owner_id = env::signer_account_id();

        // Mint tokens
        let tokens: Vec<Token> = (0..num)
            .map(|_| self.internal_mint(owner_id.clone()))
            .collect();

        // Keep enough funds to cover storage and send rest to contract owner
        refund_deposit(
            env::storage_usage() - initial_storage_usage,
            self.tokens.owner_id.clone(),
        );

        // Emit mint event log
        log_mint(
            owner_id.as_str(),
            tokens.iter().map(|t| t.token_id.to_string()).collect(),
        );
        tokens
    }

    pub fn cost_of_linkdrop(&self) -> U128 {
        (ACCESS_KEY_ALLOWANCE + self.total_cost(1).0).into()
    }

    pub fn total_cost(&self, num: u32) -> U128 {
        (num as Balance * self.cost_per_token(num).0).into()
    }

    pub fn cost_per_token(&self, num: u32) -> U128 {
        let base_cost = (self.base_cost - self.discount(num).0).max(self.min_cost);
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
        self.raffle.len() as u32
    }

    // Contract private methods

    #[private]
    pub fn on_send_with_callback(&mut self) {
        if !is_promise_success(None) {
            self.pending_tokens -= 1;
            env::panic_str(&"Promise before Linkdrop creation failed");
        }
    }

    #[payable]
    #[private]
    pub fn link_callback(&mut self, account_id: AccountId) -> Token {
        if is_promise_success(None) {
            self.pending_tokens -= 1;
            let token = self.internal_mint(account_id.clone());
            log_mint(account_id.as_str(), vec![token.token_id.clone()]);
            token
        } else {
            env::panic_str(&"Promise before Linkdrop callback failed");
        }
    }

    // Private methods
    fn assert_deposit(&self, num: u32) {
        require!(
            env::attached_deposit() >= self.total_cost(num).0,
            "Not enough attached deposit to buy"
        );
    }

    fn assert_can_mint(&self, num: u32) {
        // Check quantity
        require!(
            self.tokens_left() as u32 >= self.pending_tokens + num,
            "No NFTs left to mint"
        );
        // Owner can mint for free
        if env::signer_account_id() == self.tokens.owner_id {
            return;
        }
        self.assert_deposit(num);
    }

    fn internal_mint(&mut self, token_owner_id: AccountId) -> Token {
        let id = self.raffle.draw();
        let token_metadata = Some(self.create_metadata(id));
        let token_id = id.to_string();
        let refund = None;
        self.tokens
            .internal_mint(token_id, token_owner_id, token_metadata, refund)
    }

    fn create_metadata(&mut self, token_id: u64) -> TokenMetadata {
        let media = Some(format!("{}.png", token_id));
        let reference = Some(format!("{}.json", token_id));
        TokenMetadata {
            title: Some(token_id.to_string()), // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            description: None,                 // free-form description
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

    // #[cfg(test)]
    // pub fn deleteToken(&mut self, token_ids: Vec<TokenId>) {
    //   token_ids.into_iter().for_each(|id|self.tokens.tokens_per_owner.;

    // }

    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    // pub fn set_uri(&mut self, base_uri: String) {
    //   let mut metadata = self.metadata.get().unwrap();
    //   metadata.base_uri = Some(base_uri);
    //   self.metadata.set(&metadata);
    // }
}
fn log_mint(owner_id: &str, token_ids: Vec<String>) {
    near_sdk::env::log_str(&format!("EVENT_JSON:{}", generate_log(owner_id, token_ids)))
}

fn generate_log(owner_id: &str, token_ids: Vec<String>) -> String {
    let token_strs: Vec<String> = token_ids.iter().map(|id| format!("\"{}\"", id)).collect();

    format!(
        r#"{{"standard":"nep171","version":"1.0.0","event":"nft_mint","data":[{{"owner_id":"{}","token_ids":[{}]}}]}}"#,
        owner_id,
        token_strs.join(",")
    )
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

const fn to_near(num: u32) -> Balance {
    (num as Balance * 10u128.pow(24)) as Balance
}
#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::Value;
    const TEN: u128 = to_near(10);
    const ONE: u128 = to_near(1);

    fn new_contract() -> Contract {
        Contract::new_default_meta(
            AccountId::new_unchecked("root".to_string()),
            "name".to_string(),
            "sym".to_string(),
            "https://".to_string(),
            10_000,
            TEN.into(),
            ONE.into(),
            None,
            None,
            None,
            None,
            None,
            None,
        )
    }

    #[test]
    fn generate_log() {
        let contract = new_contract();
        let owner_id = "bob";
        let token_ids = (vec!["0", "3", "10"])
            .iter()
            .map(|s| s.to_string())
            .collect();

        let data = contract.generate_log(owner_id, token_ids);
        println!("{}", data);
        let v: Value = serde_json::from_str(&data).unwrap();
        let data = v.get("data").unwrap().as_array().unwrap()[0]
            .as_object()
            .unwrap();
        assert_eq!(data.get("owner_id").unwrap().as_str().unwrap(), owner_id);
    }
    #[test]
    fn check_price() {
        let contract = new_contract();
        assert_eq!(
            contract.cost_per_token(1).0,
            TEN + contract.token_storage_cost().0
        );
        assert_eq!(
            contract.cost_per_token(2).0,
            TEN + contract.token_storage_cost().0 - contract.discount(2).0
        );
        println!(
            "{}, {}, {}",
            contract.discount(1).0,
            contract.discount(2).0,
            contract.discount(10).0
        );
        println!(
            "{}",
            (contract.base_cost - contract.discount(10).0).max(contract.min_cost)
        );
        println!(
            "{}, {}",
            contract.cost_per_token(24).0,
            contract.cost_per_token(10).0
        );
    }
}
