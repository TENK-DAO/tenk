//! User deposits

use near_contract_standards::fungible_token::receiver::FungibleTokenReceiver;
use near_sdk::json_types::U128;
use near_sdk::{env, ext_contract, log, AccountId, PromiseOrValue};

use crate::*;

/// token deposits are done through NEP-141 ft_transfer_call
#[near_bindgen]
impl FungibleTokenReceiver for Contract {
    /**
    FungibleTokenReceiver implementation Callback on receiving tokens by this contract.
    Handles both farm deposits and stake deposits. For farm deposit (sending tokens
    to setup the farm) you must set "setup reward deposit" msg.
    Otherwise tokens will be staken.
    Returns zero.
    Panics when:
    - account is not registered
    - or receiving a wrong token
    - or making a farm deposit after farm is finalized
    - or staking before farm is finalized. */
    #[allow(unused_variables)]
    fn ft_on_transfer(
        &mut self,
        sender_id: AccountId,
        amount: U128,
        msg: String,
    ) -> PromiseOrValue<U128> {
        let token_id = env::predecessor_account_id();
        let mut token_parameters = self.get_token_parameters(&Some(token_id.clone()));
        
        let new_amount = if let Some(deposit) = token_parameters.token_deposits.get(&sender_id) {
            deposit + amount.0
        } else {
            let token_dime = self
                .get_one_token_in_yocto(token_id.clone())
                .checked_div(10) // div to 10 to cast 1 => 0.1 of token value
                .expect("Incorrect decimals on FT transfer call");
            assert!(
                amount.0 >= token_dime,
                "deposit amount must be at least {} of {}", 
                token_dime, &token_id
            );
            amount.0
        };

        token_parameters
            .token_deposits
            .insert(&sender_id, &new_amount);
        self.fungible_tokens.insert(&token_id, &token_parameters);

        PromiseOrValue::Value(U128(0))
    }
}

#[near_bindgen]
impl Contract {
    /// if amount == None, then we withdraw all tokens and unregister the user
    pub fn withdraw_token(&mut self, amount: Option<U128>, token_id: AccountId) {
        let user = env::predecessor_account_id();
        let token = &Some(token_id.clone());

        let mut deposit = self.get_token_parameters(token)
            .token_deposits
            .get(&user)
            .expect("account deposit is empty");

        if let Some(amount) = amount {
            assert!(deposit >= amount.0, "not enough deposit");
            if deposit == amount.0 {
                log!("Unregistering account {}", user);
                self.get_token_parameters(token)
                    .token_deposits
                    .remove(&user);
            } else {
                deposit -= amount.0;
                assert!(deposit > self.get_one_token_in_yocto(token_id.clone()), "When withdrawing, either withdraw everyting to unregister or keep at least 1 Token");
                self.get_token_parameters(token)
                    .token_deposits
                    .insert(&user, &deposit);
            }
        } else {
            log!("Unregistering account {}", user);
            self.get_token_parameters(token)
                .token_deposits
                .remove(&user);
        }

        ext_ft::ft_transfer(
            user,
            deposit.into(),
            Some("Token withdraw".to_string()),
            token_id,
            near_sdk::ONE_YOCTO,
            GAS_FOR_FT_TRANSFER,
        );
        
    }

    /// View method. 
    /// Returns user Token balance
    pub fn balance_of(&self, account_id: &AccountId, token_id: &Option<AccountId>) -> U128 {
        self.get_token_parameters(token_id)
            .token_deposits
            .get(account_id)
            .unwrap_or_default()
            .into()
    }
}

#[ext_contract(ext_ft)]
pub trait FungibleToken {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    //fn ft_mint(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
}