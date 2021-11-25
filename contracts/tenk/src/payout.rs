use crate::*;
use near_sdk::{
    assert_one_yocto,
    borsh::{self, BorshDeserialize, BorshSerialize},
    json_types::U128,
    near_bindgen,
    serde::{Deserialize, Serialize},
    AccountId,
};
/// Copied from https://github.com/near/NEPs/blob/6170aba1c6f4cd4804e9ad442caeae9dc47e7d44/specs/Standards/NonFungibleToken/Payout.md#reference-level-explanation

/// A mapping of NEAR accounts to the amount each should be paid out, in
/// the event of a token-sale. The payout mapping MUST be shorter than the
/// maximum length specified by the financial contract obtaining this
/// payout data. Any mapping of length 10 or less MUST be accepted by
/// financial contracts, so 10 is a safe upper limit.

pub type Payout = HashMap<AccountId, U128>;

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
        let owner_id = self.tokens.owner_by_id.get(&token_id).expect("No such token_id");
        self.royalties.get().map_or(Payout::default(), |r| {
            r.create_payout(balance.0, &owner_id)
        })
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
        self.nft_transfer(
            receiver_id.clone(),
            token_id.clone(),
            approval_id.clone(),
            memo.clone(),
        );
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
            require!(*percent <= 100, "each royalty should be less than 100");
            total += percent;
        });
        require!(
            total <= 100,
            "total percent of each royalty split  must be less than 100"
        )
    }
    fn create_payout(&self, balance: Balance, owner_id: &AccountId) -> Payout {
        let royalty_payment = apply_percent(self.percent, balance);
        let mut payout: Payout = self
            .accounts
            .iter()
            .map(|(account, percent)| {
                (
                    account.clone(),
                    apply_percent(*percent, royalty_payment).into(),
                )
            })
            .collect();
        let rest = balance - royalty_payment;
        let owner_payout: u128 = payout.get(owner_id).map_or(0, |x| x.0) + rest;
        payout.insert(owner_id.clone(), owner_payout.into());
        payout
    }
}

fn apply_percent(percent: u8, int: u128) -> u128 {
    int * percent as u128 / 100u128
}
