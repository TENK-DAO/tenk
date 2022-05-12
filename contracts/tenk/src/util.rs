use near_contract_standards::non_fungible_token::{events::NftMint, Token};
use near_sdk::{env, AccountId, Promise, PromiseResult};

use crate::TimestampMs;
pub fn is_promise_success(num_of_promises: Option<u64>) -> bool {
    let count = env::promise_results_count();
    if num_of_promises.map_or(false, |num| num != count) {
        return false;
    }
    for i in 0..count {
        match env::promise_result(i) {
            PromiseResult::Successful(_) => (),
            _ => return false,
        }
    }
    true
}

pub fn get_random_number(shift_amount: u32) -> u32 {
    let mut seed = env::random_seed();
    let seed_len = seed.len();
    let mut arr: [u8; 4] = Default::default();
    seed.rotate_left(shift_amount as usize % seed_len);
    arr.copy_from_slice(&seed[..4]);
    u32::from_le_bytes(arr)
}

pub fn refund(account_id: &AccountId, amount: u128) -> Option<Promise> {
    if amount > 0 {
        return Some(Promise::new(account_id.clone()).transfer(amount));
    };
    None
}

pub fn current_time_ms() -> TimestampMs {
    env::block_timestamp() / 1_000_000
}

pub fn log_mint(owner_id: &AccountId, tokens: &[Token]) {
    let token_ids = &tokens
        .iter()
        .map(|t| t.token_id.as_str())
        .collect::<Vec<&str>>();
    NftMint {
        owner_id,
        token_ids,
        memo: None,
    }
    .emit()
}
