use crate::*;
use near_sdk::{
    env, ext_contract, json_types::U128, log, near_bindgen, AccountId, Balance, Gas, Promise,
    PublicKey,
};
use near_units::parse_near;

/// 0.064311394105062020653824 N
pub(crate) const ACCESS_KEY_ALLOWANCE: u128 = parse_near!("0 N");

pub(crate) const LINKDROP_DEPOSIT: u128 = parse_near!("0.02 N");
/// can take 0.5 of access key since gas required is 6.6 times what was actually used
const ON_CREATE_ACCOUNT_GAS: Gas = Gas(30_000_000_000_000);
const NO_DEPOSIT: Balance = 0;

/// Gas attached to the callback from account creation.
pub const ON_CREATE_ACCOUNT_CALLBACK_GAS: Gas = Gas(10_000_000_000_000);

#[ext_contract(ext_linkdrop)]
trait ExtLinkdrop {
    fn create_account(&mut self, new_account_id: AccountId, new_public_key: PublicKey) -> Promise;
    fn on_create_and_claim(&mut self, mint_for_free: bool) -> bool;
}

#[near_bindgen]
impl Contract {
    /// Allows given public key to claim sent balance.
    /// Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.

    /// Claim tokens for specific account that are attached to the public key this tx is signed with.
    #[private]
    pub fn claim(&mut self, account_id: AccountId) -> Promise {
        // require!(false, "Cannot claim at this time try again later");
        let (mint_for_free, deletion_promise) = self.delete_current_access_key();
        deletion_promise
            .then(Promise::new(account_id.clone()).transfer(LINKDROP_DEPOSIT))
            .then(ext_self::link_callback(
                account_id.clone(),
                mint_for_free,
                env::current_account_id(),
                self.total_cost(1, &account_id).0,
                GAS_REQUIRED_FOR_LINKDROP,
            ))
            .then(ext_linkdrop::on_create_and_claim(
                mint_for_free,
                env::current_account_id(),
                NO_DEPOSIT,
                ON_CREATE_ACCOUNT_CALLBACK_GAS,
            ))
    }

    /// Create new account and and claim tokens to it.
    #[private]
    pub fn create_account_and_claim(
        &mut self,
        new_account_id: AccountId,
        new_public_key: PublicKey,
    ) -> Promise {
        // require!(false, "Cannot claim at this time try again later");
        let (mint_for_free, deletion_promise) = self.delete_current_access_key();
        deletion_promise
            .and(self.create_account(new_account_id.clone(), new_public_key))
            .then(ext_self::link_callback(
                new_account_id.clone(),
                mint_for_free,
                env::current_account_id(),
                self.total_cost(1, &new_account_id).0,
                GAS_REQUIRED_FOR_LINKDROP,
            ))
            .then(ext_linkdrop::on_create_and_claim(
                mint_for_free,
                env::current_account_id(),
                NO_DEPOSIT,
                ON_CREATE_ACCOUNT_CALLBACK_GAS,
            ))
    }

    /// Returns the balance associated with given key.
    #[allow(unused_variables)]
    pub fn get_key_balance(&self) -> U128 {
        LINKDROP_DEPOSIT.into()
    }

    pub fn check_key(&self, public_key: PublicKey) -> bool {
        self.accounts.contains_key(&public_key)
    }

    #[private]
    pub fn on_create_and_claim(&mut self, mint_for_free: bool) {
        if !is_promise_success(None) {
            self.send(env::signer_account_pk(), mint_for_free);
        }
    }

    pub fn get_linkdrop_contract(&self) -> AccountId {
        AccountId::new_unchecked(
            (if cfg!(feature = "testnet") {
                "testnet"
            } else {
                "near"
            })
            .to_string(),
        )
    }
}

// Private methods
impl Contract {
    pub(crate) fn send(&mut self, public_key: PublicKey, mint_for_free: bool) -> Promise {
        self.add_key(public_key, mint_for_free)
    }
    fn create_account(&self, new_account_id: AccountId, new_public_key: PublicKey) -> Promise {
        log!("creating account for {}", &new_account_id);
        ext_linkdrop::create_account(
            new_account_id,
            new_public_key,
            self.get_linkdrop_contract(),
            LINKDROP_DEPOSIT,
            ON_CREATE_ACCOUNT_GAS,
        )
    }

    fn add_key(&mut self, key: PublicKey, mint_for_free: bool) -> Promise {
        // insert returns false if key was present
        if self.accounts.insert(&key, &mint_for_free).is_some() {
            env::panic_str("key already added");
        }
        Promise::new(env::current_account_id()).add_access_key(
            key,
            ACCESS_KEY_ALLOWANCE,
            env::current_account_id(),
            "claim,create_account_and_claim".to_string(),
        )
    }

    fn delete_current_access_key(&mut self) -> (bool, Promise) {
        let key = env::signer_account_pk();
        let mint_for_free = self.accounts.remove(&key);
        require!(mint_for_free.is_some(), "Can't use a full access key.");
        (
            mint_for_free.unwrap(),
            Promise::new(env::current_account_id()).delete_key(key),
        )
    }
}
