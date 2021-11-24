//! A vector implemented on a trie. Unlike standard vector does not support insertion and removal
//! of an element results in the last element being placed in the empty position.
use core::convert::TryInto;
use std::marker::PhantomData;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{env, IntoStorageKey};

const ERR_INCONSISTENT_STATE: &str = "The collection is an inconsistent state. Did previous smart contract execution terminate unexpectedly?";
const ERR_INDEX_OUT_OF_BOUNDS: &str = "Index out of bounds";

fn expect_consistent_state<T>(val: Option<T>) -> T {
    val.unwrap_or_else(|| env::panic_str(ERR_INCONSISTENT_STATE))
}

pub(crate) fn append_slice(id: &[u8], extra: &[u8]) -> Vec<u8> {
    [id, extra].concat()
}

/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element.
#[derive(BorshSerialize, BorshDeserialize)]
#[cfg_attr(not(feature = "expensive-debug"), derive(Debug))]
pub struct Raffle {
    len: u64,
    prefix: Vec<u8>,
    #[borsh_skip]
    el: PhantomData<u64>,
}

impl Raffle {
    /// Returns the number of elements in the vector, also referred to as its size.
    pub fn len(&self) -> u64 {
        self.len
    }

    /// Returns `true` if the vector contains no elements.
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Create new vector with zero elements. Use `id` as a unique identifier on the trie.
    pub fn new<S>(prefix: S, len: u64) -> Self
    where
        S: IntoStorageKey,
    {
        return Self {
            len,
            prefix: prefix.into_storage_key(),
            el: PhantomData,
        };
    }

    fn index_to_lookup_key(&self, index: u64) -> Vec<u8> {
        append_slice(&self.prefix, &index.to_le_bytes()[..])
    }

    /// # Panics
    ///
    /// Panics if `index` is out of bounds.
    fn swap_remove_raw(&mut self, index: u64) -> Vec<u8> {
        if index >= self.len {
            env::panic_str(ERR_INDEX_OUT_OF_BOUNDS)
        } else if index + 1 == self.len {
            expect_consistent_state(self.pop_raw())
        } else {
            let lookup_key = self.index_to_lookup_key(index);
            let raw_last_value = self
                .pop_raw()
                .expect("checked `index < len` above, so `len > 0`");
            if env::storage_write(&lookup_key, &raw_last_value) {
                expect_consistent_state(env::storage_get_evicted())
            } else {
                // no value was at location its index is the value
                index.to_le_bytes().to_vec()
            }
        }
    }

    /// Removes the last element from a vector and returns it without deserializing, or `None` if it is empty.
    fn pop_raw(&mut self) -> Option<Vec<u8>> {
        if self.is_empty() {
            None
        } else {
            self.len -= 1;
            let last_lookup_key = self.index_to_lookup_key(self.len);
            let raw_last_value = if env::storage_remove(&last_lookup_key) {
                // if key is en in storage, it's value will be stored as last evicted value
                expect_consistent_state(env::storage_get_evicted())
            } else {
                // otherwise the value is index of the last element
                self.len.to_le_bytes().to_vec()
            };
            Some(raw_last_value)
        }
    }

    pub fn draw(&mut self) -> u64 {
        let seed = env::random_seed();
        let mut arr: [u8; 8] = Default::default();
        arr.copy_from_slice(&seed[..8]);
        let seed_num: u64 = u64::from_le_bytes(arr).try_into().unwrap();
        u64::try_from_slice(&self.swap_remove_raw(seed_num % self.len())).unwrap()
    }
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use rand::{Rng, SeedableRng};
    use std::collections::HashSet;

    use super::Raffle;
    use near_sdk::test_utils::test_env;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    #[test]
    pub fn test_swap_remove() {
        test_env::setup();
        let mut rng = rand_xorshift::XorShiftRng::seed_from_u64(2);
        let mut vec = Raffle::new(b"v".to_vec(), 100);
        let mut set: HashSet<u64> = HashSet::new();
        let mut context = VMContextBuilder::new();
        testing_env!(context.build());
        for _ in 0..100 {
            let len = vec.len();
            assert!(set.insert(vec.draw()));
            let next = rng.gen::<u64>().to_le_bytes().to_vec();
            testing_env!(context.random_seed(next).build());
            assert_eq!(len - 1, vec.len())
        }
    }
}
