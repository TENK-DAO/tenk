use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::U128;
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{assert_one_yocto, near_bindgen, AccountId};
/// Copied from https://github.com/near/NEPs/blob/6170aba1c6f4cd4804e9ad442caeae9dc47e7d44/specs/Standards/NonFungibleToken/Payout.md#reference-level-explanation

/// A mapping of NEAR accounts to the amount each should be paid out, in
/// the event of a token-sale. The payout mapping MUST be shorter than the
/// maximum length specified by the financial contract obtaining this
/// payout data. Any mapping of length 10 or less MUST be accepted by
/// financial contracts, so 10 is a safe upper limit.
#[derive(Serialize, Deserialize, Default)]
#[serde(crate = "near_sdk::serde")]
pub struct Payout {
    pub payout: HashMap<AccountId, U128>,
}

pub trait Payouts {
    /// Given a `token_id` and NEAR-denominated balance, return the `Payout`.
    /// struct for the given token. Panic if the length of the payout exceeds
    /// `max_len_payout.`
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: u32) -> Payout;
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
        max_len_payout: u32,
    ) -> Payout;
}

#[near_bindgen]
impl Payouts for Contract {
    #[allow(unused_variables)]
    fn nft_payout(&self, token_id: String, balance: U128, max_len_payout: u32) -> Payout {
        self.royalties
            .get()
            .map_or(Payout::default(), |r| r.create_payout(balance.0))
    }

    #[payable]
    fn nft_transfer_payout(
        &mut self,
        receiver_id: AccountId,
        token_id: String,
        approval_id: Option<u64>,
        memo: Option<String>,
        balance: U128,
        max_len_payout: u32,
    ) -> Payout {
        assert_one_yocto();
        let payout = self.nft_payout(String::from(&token_id), balance, max_len_payout);
        self.nft_transfer(receiver_id, token_id, approval_id, memo);
        payout
    }
}

#[derive(BorshSerialize, BorshDeserialize, Deserialize, Serialize, Default)]
pub struct Royalties {
    pub accounts: HashMap<AccountId, u8>,
    pub percent: u8,
}

impl Royalties {
    pub(crate) fn validate(&self) {
        require!(
            self.percent <= 100,
            "royalty percent must be between 0 - 100"
        );
        require!(
            self.accounts.len() <= 10,
            "can only have a maximum of 10 accounts spliting royalties"
        );
        let mut total: u8 = 0;
        self.accounts.iter().for_each(|(_, percent)| {
            require!(
                *percent <= 100,
                "can only have a maximum of 10 accounts spliting royalties"
            );
            total += percent;
        });
        require!(
            total <= 100,
            "total percent of each royalty split  must be less than 100"
        )
    }
    fn create_payout(&self, balance: Balance) -> Payout {
        let royalty_payment = apply_percent(self.percent, balance);
        let payout = self
            .accounts
            .iter()
            .map(|(account, percent)| {
                return (
                    account.clone(),
                    apply_percent(*percent, royalty_payment).into(),
                );
            })
            .collect();
        Payout { payout }
    }
}

fn apply_percent(percent: u8, int: u128) -> u128 {
    int * percent as u128 / 100u128
}
