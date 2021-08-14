use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, AccountId, Balance};
use serde::{Deserialize, Serialize};

use crate::*;

///
#[derive(Serialize, Deserialize, BorshSerialize, BorshDeserialize, Clone)]
pub enum Action {
    Deposit(Balance),
    DepositCallBack(Balance, AccountId, Gas),
}

use Action::*;

impl Default for Action {
    fn default() -> Action {
        Deposit(0)
    }
}

impl Action {
    pub fn update_balance(self) -> Action {
        match self {
            Deposit(old) => Deposit(add_balance(old)),
            DepositCallBack(old, a, gas) => DepositCallBack(add_balance(old), a, gas),
        }
    }

    // Can only upgrade Deposit and remove required gas from balance
    pub fn add_callback(self, contract: AccountId, gas: Gas) -> Action {
        match self {
            Deposit(old) => DepositCallBack(old, contract, gas),
            _ => self,
        }
    }

    pub fn deposit(&self) -> Balance {
        match self {
            DepositCallBack(b, _, _) | Deposit(b) => *b,
        }
    }

    pub fn gas(&self) -> Gas {
        match self {
            DepositCallBack(_, _, gas) => *gas,
            _ => Gas(0),
        }
    }
}

fn add_balance(value: Balance) -> Balance {
    value + env::attached_deposit() - ACCESS_KEY_ALLOWANCE
}
