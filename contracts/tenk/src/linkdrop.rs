use near_sdk::json_types::U128;
use near_sdk::{
    env, ext_contract, near_bindgen, require, AccountId, Balance, Gas, Promise, PromiseResult,
    PublicKey,
};

use crate::*;

// #[near_bindgen]
// #[derive(PanicOnDefault, BorshDeserialize, BorshSerialize)]
// pub struct LinkDrop {
//     pub linkdrop_contract: AccountId,
//     pub accounts: LookupMap<PublicKey, Action>,
// }

/// 1.0 N
pub(crate) const ACCESS_KEY_ALLOWANCE: u128 = 2_000_000_000_000_000_000_000_000;
/// can take 0.5 of access key since gas required is 6.6 times what was actually used
const NEW_ACCOUNT_BASIC_AMOUNT: u128 = 100_000_000_000_000_000_000_000;
const ON_CREATE_ACCOUNT_GAS: Gas = Gas(40_000_000_000_000);
const NO_DEPOSIT: Balance = 0;

/// Gas attached to the callback from account creation.
pub const ON_CREATE_ACCOUNT_CALLBACK_GAS: Gas = Gas(5_000_000_000_000);
const ON_CLAIM_CALLBACK_DEPOSIT: Balance = 10_000_000_000_000_000_000_000;

#[ext_contract(ext_linkdrop)]
trait ExtLinkdrop {
    fn create_account(&mut self, new_account_id: AccountId, new_public_key: PublicKey) -> Promise;

    fn on_create_and_claim(&mut self, action: Action) -> bool;
}

#[ext_contract]
trait LinkdropCallback {
    fn link_callback(&mut self, account_id: AccountId) -> Promise;
}

fn assert_allowance() {
    assert!(
        env::attached_deposit() >= ACCESS_KEY_ALLOWANCE,
        "Attached deposit must be greater than or equal to ACCESS_KEY_ALLOWANCE"
    );
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

#[near_bindgen]
impl Contract {
    /// Allows given public key to claim sent balance.
    /// Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
    #[payable]
    pub fn send(&mut self, public_key: PublicKey) -> Promise {
        assert_allowance();
        let pk = public_key.into();
        let value = self.get_action(&pk);
        self.add_action(pk, value)
    }

    /// Allows given public key to claim sent balance and attach a callback to be called when claimed.
    /// Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
    #[payable]
    pub fn send_with_callback(
        &mut self,
        public_key: PublicKey,
        contract_id: AccountId,
        gas_required: Gas,
    ) -> Promise {
        assert_allowance();
        let pk = public_key.into();
        let value = self.get_action(&pk).add_callback(contract_id, gas_required);
        self.add_action(pk, value)
    }

    /// Claim tokens for specific account that are attached to the public key this tx is signed with.
    pub fn claim(&mut self, account_id: AccountId) -> Promise {
        require!(
            env::predecessor_account_id() == env::current_account_id(),
            "Claim only can come from this account"
        );
        let action = self
            .accounts
            .remove(&env::signer_account_pk())
            .expect("Unexpected public key");
        match action {
            Action::Deposit(amount) => {
                Promise::new(env::current_account_id()).delete_key(env::signer_account_pk());
                Promise::new(account_id).transfer(amount)
            }
            Action::DepositCallBack(amount, receiver_id, gas) => {
                Promise::new(env::current_account_id())
                    .delete_key(env::signer_account_pk())
                    .and(Promise::new(account_id.clone()).transfer(amount))
                    .then(linkdrop_callback::link_callback(
                        account_id,
                        receiver_id,
                        10_000_000_000_000_000_000_000,
                        gas,
                    ))
            }
        }
    }

    /// Create new account and and claim tokens to it.
    pub fn create_account_and_claim(
        &mut self,
        new_account_id: AccountId,
        new_public_key: PublicKey,
    ) -> Promise {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Create account and claim only can come from this account"
        );

        let action = self
            .accounts
            .remove(&env::signer_account_pk())
            .expect("Unexpected public key");

        let mut amount = action.deposit();
        if amount == 0 {
            amount = NEW_ACCOUNT_BASIC_AMOUNT;
        }
        let promise = self
            .create_account(new_account_id.clone(), new_public_key, amount)
            .then(ext_linkdrop::on_create_and_claim(
                action.clone(),
                env::current_account_id(),
                NO_DEPOSIT,
                ON_CREATE_ACCOUNT_CALLBACK_GAS,
            ));

        match action {
            Action::Deposit(_) => promise,
            Action::DepositCallBack(_, receiver_id, gas) => {
                promise.then(linkdrop_callback::link_callback(
                    new_account_id,
                    receiver_id,
                    ON_CLAIM_CALLBACK_DEPOSIT,
                    gas,
                ))
            }
        }
    }

    /// Returns the balance associated with given key.
    pub fn get_key_balance(&self, key: PublicKey) -> U128 {
        self.accounts
            .get(&key.into())
            .expect("Key is missing")
            .deposit()
            .into()
    }
    // pub fn link_callback(account_id: AccountId) -> String {
    //     env::log_str("Account Created");
    //     env::log_str(account_id.as_str());
    //     account_id.into()
    // }

    pub fn on_create_and_claim(&mut self, action: Action) -> bool {
        assert_eq!(
            env::predecessor_account_id(),
            env::current_account_id(),
            "Callback can only be called from the contract"
        );
        let creation_succeeded = is_promise_success();
        if creation_succeeded {
            Promise::new(env::current_account_id()).delete_key(env::signer_account_pk());
        } else {
            // In case of failure, put the amount back.
            self.accounts.insert(&env::signer_account_pk(), &action);
        }
        creation_succeeded
    }

    // Private methods
    fn create_account(
        &self,
        new_account_id: AccountId,
        new_public_key: PublicKey,
        amount: Balance,
    ) -> Promise {
        ext_linkdrop::create_account(
            new_account_id,
            new_public_key,
            self.linkdrop_contract.parse().unwrap(),
            amount,
            ON_CREATE_ACCOUNT_GAS,
        )
    }

    fn add_action(&mut self, key: PublicKey, value: Action) -> Promise {
        self.accounts.insert(&key, &value);
        Promise::new(env::current_account_id()).add_access_key(
            key,
            ACCESS_KEY_ALLOWANCE,
            env::current_account_id(),
            "claim,create_account_and_claim".into(),
        )
    }

    fn get_action(&self, key: &PublicKey) -> Action {
        self.accounts.get(key).unwrap_or_default().update_balance()
    }
}
