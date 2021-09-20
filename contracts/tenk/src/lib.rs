use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::NonFungibleToken;
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap, UnorderedSet};
use near_sdk::json_types::Base64VecU8;
use near_sdk::{
    env, ext_contract, near_bindgen, AccountId, Balance, BorshStorageKey, Gas, PanicOnDefault,
    Promise, PromiseOrValue, PromiseResult, PublicKey,
};

mod raffle;
use raffle::Raffle;
mod action;
use action::Action;

pub mod linkdrop;
use linkdrop::*;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    tokens: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // Vector of available NFTs
    raffle: Raffle,
    pending_tokens: u32,
    // Linkdrop fields will be removed once proxy contract is deployed
    pub linkdrop_contract: String,
    pub accounts: LookupMap<PublicKey, Action>,
    pub base_cost: Balance,
    pub min_cost: Balance,
    pub percent_off: u8,
}
const DEFAULT_SUPPLY_FATOR_NUMERATOR: u8 = 20;
const DEFAULT_SUPPLY_FATOR_DENOMENTOR: Balance = 100;

const GAS_REQUIRED_FOR_LINKDROP: Gas = Gas(20_000_000_000_000);

#[ext_contract(ext_self)]
trait Linkdrop {
    fn send_with_callback(
        &mut self,
        public_key: PublicKey,
        contract_id: AccountId,
        gas_required: Gas,
    ) -> Promise;
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
    TokensPerOwner { account_hash: Vec<u8> },
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new_default_meta(
        owner_id: AccountId,
        name: String,
        symbol: String,
        uri: String,
        linkdrop_contract: String,
        size: u32,
        base_cost: U128,
        min_cost: U128,
        percent_off: Option<u8>,
        icon: Option<String>,
        spec: Option<String>,
        reference: Option<String>,
        reference_hash: Option<Base64VecU8>,
    ) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: spec.unwrap_or(NFT_METADATA_SPEC.to_string()),
                name,
                symbol,
                icon,
                base_uri: Some(uri),
                reference,
                reference_hash,
            },
            linkdrop_contract,
            size,
            base_cost,
            min_cost,
            percent_off.unwrap_or(DEFAULT_SUPPLY_FATOR_NUMERATOR),
        )
    }

    #[init]
    pub fn new(
        owner_id: AccountId,
        metadata: NFTContractMetadata,
        network_id: String,
        size: u32,
        base_cost: U128,
        min_cost: U128,
        percent_off: u8,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
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
            linkdrop_contract: network_id,
            accounts: LookupMap::new(StorageKey::LinkdropKeys),
            base_cost: base_cost.0,
            min_cost: min_cost.0,
            percent_off,
        }
    }
    fn assert_deposit(&self, num: u32) {
        assert!(
            env::attached_deposit() >= self.total_cost(num).0,
            "Not enough attached deposit to buy"
        );
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
        self.pending_tokens += 1;
        let current_account_id = env::current_account_id();
        ext_self::send_with_callback(
            public_key,
            current_account_id.clone(),
            GAS_REQUIRED_FOR_LINKDROP,
            &current_account_id,
            env::attached_deposit(),
            GAS_REQUIRED_FOR_LINKDROP * 2,
        )
    }

    #[payable]
    pub fn nft_mint_one(&mut self) -> Token {
        self.assert_can_mint(1);
        self.internal_mint(env::signer_account_id())
    }

    #[payable]
    pub fn nft_mint_many(&mut self, num: u32) -> Vec<Token> {
        self.assert_can_mint(num);
        (0..num)
            .map(|_| self.internal_mint(env::signer_account_id()))
            .collect::<Vec<Token>>()
    }

    #[payable]
    #[private]
    pub fn link_callback(&mut self, account_id: AccountId) -> Token {
        if is_promise_success() {
            self.pending_tokens -= 1;
            self.internal_mint(account_id)
        } else {
            env::panic(b"Promise before Linkdrop callback failed");
        }
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

    // Private methods

    pub fn discount(&self, num: u32) -> U128 {
        ((to_near(num - 1) * self.percent_off as Balance) / DEFAULT_SUPPLY_FATOR_DENOMENTOR).into()
    }

    fn assert_can_mint(&self, num: u32) {
        // Check quantity
        assert!(
            self.raffle.len() as u32 >= self.pending_tokens + num,
            "No NFTs left to mint"
        );
        // Owner can mint for free
        if env::signer_account_id() == self.tokens.owner_id {
            return;
        }
        self.assert_deposit(num);
    }

    // Currently have to copy the internals of mint because it requires that only the owner can mint
    fn internal_mint(&mut self, token_owner_id: AccountId) -> Token {
        let id = self.raffle.draw();
        let token_metadata = Some(self.create_metadata(id));
        let token_id = id.to_string();
        // TODO: figure out how to use internals
        // self.tokens.mint(token_id, token_owner_id, token_metadata);
        let initial_storage_usage = env::storage_usage();
        // assert_eq!(env::predecessor_account_id(), self.owner_id, "Unauthorized");
        // if self.tokens.token_metadata_by_id.is_some() && token_metadata.is_none() {
        //     env::panic(b"Must provide metadata");
        // }
        // if self.tokens.owner_by_id.get(&token_id).is_some() {
        //     env::panic(b"token_id must be unique");
        // }

        let owner_id: AccountId = token_owner_id;

        // Core behavior: every token must have an owner
        self.tokens.owner_by_id.insert(&token_id, &owner_id);

        // Metadata extension: Save metadata, keep variable around to return later.
        // Note that check above already panicked if metadata extension in use but no metadata
        // provided to call.
        self.tokens
            .token_metadata_by_id
            .as_mut()
            .and_then(|by_id| by_id.insert(&token_id, &token_metadata.as_ref().unwrap()));

        // Enumeration extension: Record tokens_per_owner for use with enumeration view methods.
        if let Some(tokens_per_owner) = &mut self.tokens.tokens_per_owner {
            let mut token_ids = tokens_per_owner.get(&owner_id).unwrap_or_else(|| {
                UnorderedSet::new(StorageKey::TokensPerOwner {
                    account_hash: env::sha256(owner_id.as_bytes()),
                })
            });
            token_ids.insert(&token_id);
            tokens_per_owner.insert(&owner_id, &token_ids);
        }

        // Approval Management extension: return empty HashMap as part of Token
        let approved_account_ids = if self.tokens.approvals_by_id.is_some() {
            Some(HashMap::new())
        } else {
            None
        };

        // Return any extra attached deposit not used for storage
        refund_deposit(env::storage_usage() - initial_storage_usage);

        Token {
            token_id,
            owner_id,
            metadata: token_metadata,
            approved_account_ids,
        }
    }

    fn create_metadata(&mut self, token_id: u64) -> TokenMetadata {
        let media = Some(format!("{}/{}/media", self.base_url(), token_id));
        let reference = Some(format!("{}/{}/info.json", self.base_url(), token_id));
        TokenMetadata {
            title: None,          // ex. "Arch Nemesis: Mail Carrier" or "Parcel #5055"
            description: None,    // free-form description
            media, // URL to associated media, preferably to decentralized, content-addressed storage
            media_hash: None, // Base64-encoded sha256 hash of content referenced by the `media` field. Required if `media` is included.
            copies: None, // number of copies of this set of metadata in existence when token was minted.
            issued_at: None, // ISO 8601 datetime when token was issued or minted
            expires_at: None, // ISO 8601 datetime when token expires
            starts_at: None, // ISO 8601 datetime when token starts being valid
            updated_at: None, // ISO 8601 datetime when token was last updated
            extra: None, // anything extra the NFT wants to store on-chain. Can be stringified JSON.
            reference,   // URL to an off-chain JSON file with more info.
            reference_hash: None, // Base64-encoded sha256 hash of JSON from reference field. Required if `reference` is included.
        }
    }

    fn base_url(&self) -> String {
        format!(
            "https://ipfs.io/ipfs/{}",
            self.metadata.get().unwrap().base_uri.unwrap()
        )
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_approval!(Contract, tokens);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, tokens);

#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

fn is_promise_success() -> bool {
    assert_eq!(
        env::promise_results_count(),
        1,
        "Contract expected a result on the callback"
    );
    match env::promise_result(0) {
        PromiseResult::Successful(_) => true,
        _ => false,
    }
}

fn _to_yocto(value: &str) -> u128 {
    let vals: Vec<_> = value.split('.').collect();
    let part1 = vals[0].parse::<u128>().unwrap() * 10u128.pow(24);
    if vals.len() > 1 {
        let power = vals[1].len() as u32;
        let part2 = vals[1].parse::<u128>().unwrap() * 10u128.pow(24 - power);
        part1 + part2
    } else {
        part1
    }
}

fn refund_deposit(storage_used: u64) {
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(
        required_cost <= attached_deposit,
        "Must attach {} yoctoNEAR to cover storage",
        required_cost,
    );

    let refund = attached_deposit - required_cost;
    if refund > 1 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
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
    #[test]
    fn check_price() {
        let contract: Contract = Contract::new_default_meta(
            AccountId::new_unchecked("root".to_string()),
            "name".to_string(),
            "sym".to_string(),
            "https://".to_string(),
            "testnet".to_string(),
            10_000,
            TEN.into(),
            ONE.into(),
            None,
            None,
            None,
            None,
            None,
        );
        assert_eq!(contract.cost_per_token(1).0, TEN + contract.token_storage_cost().0);
        assert_eq!(contract.cost_per_token(2).0, TEN + contract.token_storage_cost().0 - contract.discount(2).0);
        println!("{}, {}, {}", contract.discount(1).0, contract.discount(2).0, contract.discount(10).0);
        println!("{}", (contract.base_cost - contract.discount(10).0).max(contract.min_cost));
        println!("{}, {}", contract.cost_per_token(24).0, contract.cost_per_token(10).0);
    }
}
