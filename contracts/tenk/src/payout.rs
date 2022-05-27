use crate::*;
use near_sdk::{
    assert_one_yocto,
    borsh::{self, BorshDeserialize, BorshSerialize},
    json_types::U128,
    near_bindgen,
    serde::{Deserialize, Serialize},
    AccountId, Promise,
};

use std::collections::HashMap;

/// Copied from https://github.com/near/NEPs/blob/6170aba1c6f4cd4804e9ad442caeae9dc47e7d44/specs/Standards/NonFungibleToken/Payout.md#reference-level-explanation

/// A mapping of NEAR accounts to the amount each should be paid out, in
/// the event of a token-sale. The payout mapping MUST be shorter than the
/// maximum length specified by the financial contract obtaining this
/// payout data. Any mapping of length 10 or less MUST be accepted by
/// financial contracts, so 10 is a safe upper limit.

/// This currently deviates from the standard but is in the process of updating to use this type
#[derive(Default, BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
#[near_sdk::witgen]
pub struct Payout {
    payout: HashMap<AccountId, U128>,
}

impl Payout {
    pub fn send_funds(self) {
        self.payout.into_iter().for_each(|(account, amount)| {
            Promise::new(account).transfer(amount.0);
        });
    }
}

pub trait Payouts {
    /// Given a `token_id` and NEAR-denominated balance, return the `Payout`.
    /// struct for the given token. Panic if the length of the payout exceeds
    /// `max_len_payout.`
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: Option<u32>) -> Payout;
    /// Given a `token_id` and NEAR-denominated balance, transfer the token
    /// and return the `Payout` struct for the given token. Panic if the
    /// length of the payout exceeds `max_len_payout.`
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: String,
        approval_id: Option<u64>,
        memo: Option<String>,
        balance: U128,
        max_len_payout: Option<u32>,
    ) -> Payout;
}

#[near_bindgen]
impl Payouts for Contract {
    #[allow(unused_variables)]
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: Option<u32>) -> Payout {
        let owner_id = self
            .tokens
            .owner_by_id
            .get(&token_id)
            .expect("No such token_id");
        self.sale
            .royalties
            .as_ref()
            .map_or(Payout::default(), |r| r.create_payout(balance.0, &owner_id))
    }

    #[payable]
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: String,
        approval_id: Option<u64>,
        memo: Option<String>,
        balance: U128,
        max_len_payout: Option<u32>,
    ) -> Payout {
        assert_one_yocto();
        let payout = self.nft_payout(token_id.clone(), balance, max_len_payout);
        self.nft_transfer(receiver_id, token_id, approval_id, memo);
        payout
    }
}

#[near_sdk::witgen]
type BasisPoint = u16;

const ONE_HUNDRED_PERCENT_IN_BPS: BasisPoint = 10_000;

#[near_sdk::witgen]
#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct Royalties {
    pub accounts: HashMap<AccountId, BasisPoint>,
    pub percent: BasisPoint,
}

impl Royalties {
    pub(crate) fn validate(&self) {
        require!(
            self.percent <= ONE_HUNDRED_PERCENT_IN_BPS,
            "royalty percent is in basis points and must be between 0 - 10,0000"
        );
        require!(
            self.accounts.len() <= 10,
            "can only have a maximum of 10 accounts spliting royalties"
        );
        let mut total: BasisPoint = 0;
        self.accounts.iter().for_each(|(_, percent)| {
            require!(
                *percent <= ONE_HUNDRED_PERCENT_IN_BPS,
                "each royalty should be less than 10,000"
            );
            total += percent;
        });
        require!(
            total == ONE_HUNDRED_PERCENT_IN_BPS,
            "total percent of each royalty split must equal 10,000"
        )
    }
    pub(crate) fn create_payout(&self, balance: Balance, owner_id: &AccountId) -> Payout {
        let royalty_payment = apply_percent(self.percent, balance);
        let mut payout = Payout {
            payout: self
                .accounts
                .iter()
                .map(|(account, percent)| {
                    (
                        account.clone(),
                        apply_percent(*percent, royalty_payment).into(),
                    )
                })
                .collect(),
        }
        .tenk_royalities();
        let rest = balance - u128::min(royalty_payment, balance);
        let owner_payout: u128 = payout.payout.get(owner_id).map_or(0, |x| x.0) + rest;
        payout.payout.insert(owner_id.clone(), owner_payout.into());
        payout
    }

    pub(crate) fn send_funds(&self, balance: Balance, owner_id: &AccountId) {
        self.create_payout(balance, owner_id).send_funds();
    }
}

fn apply_percent(percent: BasisPoint, int: u128) -> u128 {
    int * percent as u128 / 10_000u128
}

// Thanks for using our code. Here is a suggested donation.

#[doc(hidden)]
impl Payout {
    pub fn tenk_royalities(mut self) -> Self {
        let tenk = tenk_account();
        if self.payout.len() == 0 || self.payout.contains_key(&tenk) {
            return self;
        }
        // Currently 4.8%, can lower it or make this zero.
        let bp = 480;
        let mut sum = 0;
        self.payout = self
            .payout
            .into_iter()
            .map(|(account, amount)| {
                let new_amount = apply_percent(10_000 - bp, amount.0);
                sum += amount.0 - new_amount;
                (account, new_amount.into())
            })
            .collect();
        self.payout.insert(tenk_account(), sum.into());
        self
    }
}

fn tenk_account() -> AccountId {
    if cfg!(feature = "testnet") {
        "tenk.testnet"
    } else {
        "tenk.sputnik-dao.near"
    }
    .parse()
    .unwrap()
}
