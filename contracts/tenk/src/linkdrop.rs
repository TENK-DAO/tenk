use crate::*;
use near_sdk::{
    env, ext_contract, json_types::U128, near_bindgen, AccountId, Balance, Gas, Promise, PublicKey,
};
use near_units::parse_near;

/// 0.064311394105062020653824 N
pub(crate) const ACCESS_KEY_ALLOWANCE: u128 = parse_near!("0 N");
/// can take 0.5 of access key since gas required is 6.6 times what was actually used
const ON_CREATE_ACCOUNT_GAS: Gas = Gas(30_000_000_000_000);
const NO_DEPOSIT: Balance = 0;

/// Gas attached to the callback from account creation.
pub const ON_CREATE_ACCOUNT_CALLBACK_GAS: Gas = Gas(10_000_000_000_000);

#[ext_contract(ext_linkdrop)]
trait ExtLinkdrop {
    fn create_account(&mut self, new_account_id: AccountId, new_public_key: PublicKey) -> Promise;
    fn on_create_and_claim(&mut self) -> bool;
}

fn get_deposit() -> u128 {
    parse_near!("0.1 N")
}

pub fn full_link_price() -> u128 {
    ACCESS_KEY_ALLOWANCE + get_deposit() + parse_near!("100 mN")
}

#[near_bindgen]
impl Contract {
    /// Allows given public key to claim sent balance.
    /// Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.

    /// Claim tokens for specific account that are attached to the public key this tx is signed with.
    #[private]
    pub fn claim(&mut self, account_id: AccountId) -> Promise {
        // require!(false, "Cannot claim at this time try again later");
        self.delete_current_access_key()
            .then(Promise::new(account_id.clone()).transfer(get_deposit()))
            .then(ext_self::link_callback(
                account_id,
                env::current_account_id(),
                self.total_cost(1).0,
                GAS_REQUIRED_FOR_LINKDROP,
            ))
            .then(ext_linkdrop::on_create_and_claim(
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
        self.delete_current_access_key()
            .and(self.create_account(new_account_id.clone(), new_public_key))
            .then(ext_self::link_callback(
                new_account_id,
                env::current_account_id(),
                self.total_cost(1).0,
                GAS_REQUIRED_FOR_LINKDROP,
            ))
            .then(ext_linkdrop::on_create_and_claim(
                env::current_account_id(),
                NO_DEPOSIT,
                ON_CREATE_ACCOUNT_CALLBACK_GAS,
            ))
    }

    /// Returns the balance associated with given key.
    #[allow(unused_variables)]
    pub fn get_key_balance(&self) -> U128 {
        get_deposit().into()
    }

    pub fn check_key(&self, public_key: PublicKey) -> bool {
        self.accounts.contains(&public_key)
    }

    #[private]
    pub fn on_create_and_claim(&mut self) {
        if !is_promise_success(None) {
            self.send(env::signer_account_pk());
        }
    }

    pub fn get_linkdrop_contract(&self) -> AccountId {
        AccountId::new_unchecked(
            (if cfg!(feature = "mainnet") {
                "near"
            } else {
                "testnet"
            })
            .to_string(),
        )
    }
}

// Private methods
impl Contract {
    pub(crate) fn send(&mut self, public_key: PublicKey) -> Promise {
        self.add_key(public_key)
    }
    fn create_account(&self, new_account_id: AccountId, new_public_key: PublicKey) -> Promise {
        ext_linkdrop::create_account(
            new_account_id,
            new_public_key,
            self.get_linkdrop_contract(),
            get_deposit(),
            ON_CREATE_ACCOUNT_GAS,
        )
    }
    fn add_key(&mut self, key: PublicKey) -> Promise {
        // insert returns false if key was present
        if !self.accounts.insert(&key) {
            env::panic_str("key already added");
        }
        Promise::new(env::current_account_id()).add_access_key(
            key,
            ACCESS_KEY_ALLOWANCE,
            env::current_account_id(),
            "claim,create_account_and_claim".to_string(),
        )
    }

    fn delete_current_access_key(&mut self) -> Promise {
        let key = env::signer_account_pk();
        if !self.accounts.remove(&key) {
            env::panic_str("Can't use a full access key.");
        }
        Promise::new(env::current_account_id()).delete_key(key)
    }
}
