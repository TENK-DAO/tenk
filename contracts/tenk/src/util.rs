use core::convert::TryInto;
use near_sdk::{env, PromiseResult};

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
    seed.rotate_left((shift_amount as usize % seed_len));
    arr.copy_from_slice(&seed[..4]);
    u32::from_le_bytes(arr).try_into().unwrap()
}
