//! A vector implemented on a trie. Unlike standard vector does not support insertion and removal
//! of an element results in the last element being placed in the empty position.
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, Vector, LookupMap};
use near_sdk::{env, require, IntoStorageKey};

const ERR_INDEX_OUT_OF_BOUNDS: &str = "Index out of bounds";

/// An iterable implementation of vector that stores its content on the trie.
/// Uses the following map: index -> element.
#[derive(BorshSerialize, BorshDeserialize)]
pub struct RaffleCollection {
    inner_map: LookupMap<u32, u32>,
    winners: Vector<u32>,
    len: u32,
    max_winners: u32,
}

impl RaffleCollection {
    /// Returns the number of elements left in the raffle, also referred to as its size.
    pub fn len(&self) -> u32 {
        self.len
    }

    /// Returns `true` if the vector contains no elements.
    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    /// Create new vector with zero elements. Use `id` as a unique identifier on the trie.
    pub fn new<S>(prefix: S, len: u32, max_winners: u32) -> Self
    where
        S: IntoStorageKey,
    {
        let mut winners_key = prefix.into_storage_key();
        let inner_map_key = winners_key.clone();
        winners_key.push(100); // Add 100 to key
        Self {
            inner_map: LookupMap::new(inner_map_key),
            winners: Vector::new(winners_key),
            len,
            max_winners
        }
    }

    /// # Panics
    ///
    /// Panics if `index` is out of bounds.
    fn swap_remove(&mut self, index: u32) -> u32 {
        if index >= self.len {
            env::panic_str(ERR_INDEX_OUT_OF_BOUNDS)
        }

        let value = if index + 1 == self.len {
            self.pop()
        } else {
            let last_val = self.pop();
            self.inner_map.insert(&index, &last_val).unwrap_or(index)
        };
        // save back value to end.
        self.winners.push(&value);
        value
    }

    fn pop(&mut self) -> u32 {
        let last_index = self.len();
        self.len -= 1;
        self.inner_map.remove(&last_index).unwrap_or(last_index)
    }

    pub fn draw_raw(&mut self) -> u32 {
        let seed_num = crate::util::get_random_number(0);
        self.swap_remove(seed_num % self.len())
    }

    pub fn draw(&mut self) -> Option<u32> {
        require!(!self.is_empty(), "Nothing left to draw");
        if self.num_winners() == self.max_winners {
          return None;
        }
        let res = self.draw_raw();
        Some(res)
    }

    pub fn get_winners(&self, index: Option<u32>, limit: Option<u32>) -> Vec<u32> {
        let limit = limit.unwrap_or_else(|| self.num_winners()) as usize;
        let starting_index = index.unwrap_or(0) as usize;
        env::log_str(&format!("{}, len {}", self.num_winners(), self.len()));
        self.winners
            .iter()
            .skip(starting_index)
            .take(limit)
            .collect()
    }

    pub fn num_winners(&self) -> u32 {
        self.winners.len() as u32
    }
}

pub fn get_raffle_collection<S>(prefix: S) -> LazyOption<RaffleCollection>
where
    S: IntoStorageKey,
{
    LazyOption::new(prefix, None)
}

pub fn initialize_raffle_collection<S>(prefix: S, raffle_prefix: S, length: u32, max_winners: u32)
where
    S: IntoStorageKey,
{
    let storage_usage = env::storage_usage();
    env::log_str(&format!(
        "used {} storage",
        env::storage_usage() - storage_usage
    ));
    let mut raffle = get_raffle_collection(prefix);
    require!(raffle.get().is_none(), "Raffle is already initialized");
    let inner_raffle = RaffleCollection::new(raffle_prefix, length, max_winners);
    raffle.set(&inner_raffle);
    env::log_str(&format!(
        "used {} storage",
        env::storage_usage() - storage_usage
    ));
}

#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use rand::{Rng, SeedableRng};
    use std::collections::HashSet;

    use super::RaffleCollection;
    use near_sdk::test_utils::test_env;
    use near_sdk::test_utils::VMContextBuilder;
    use near_sdk::testing_env;

    #[test]
    pub fn test_swap_remove() {
        test_env::setup();
        let mut rng = rand_xorshift::XorShiftRng::seed_from_u64(2);
        let mut vec = RaffleCollection::new(b"v".to_vec(), 100, 99);
        let mut set: HashSet<u32> = HashSet::new();
        let mut context = VMContextBuilder::new();
        testing_env!(context.build());
        println!("{}", near_sdk::env::storage_usage());
        for i in 0..50 {
            let len = vec.len();
            let val = vec.draw().unwrap();
            println!("{} len {}", val, len);
            assert!(set.insert(val));
            let winner = vec.get_winners(Some(i), Some(1));
            assert_eq!(winner, vec![val]);
            let next = rng.gen::<u64>().to_le_bytes().to_vec();
            testing_env!(context.random_seed(next).build());
            assert_eq!(len - 1, vec.len())
        }

        for _ in 0..49 {
            let len = vec.len();
            let val = vec.draw().unwrap();
            println!("{}", val);
            assert!(set.insert(val));
            let next = rng.gen::<u64>().to_le_bytes().to_vec();
            testing_env!(context.random_seed(next).build());
            assert_eq!(len - 1, vec.len())
        }
        let val = vec.draw();
        assert!(val.is_none());
        println!("{}", near_sdk::env::storage_usage());
        assert!(vec.is_empty())
    }
}
