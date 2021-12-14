use crate::*;
use near_sdk::{collections::LazyOption, near_bindgen, IntoStorageKey};
use raffle_collection::RaffleCollection;

#[near_bindgen]
impl Contract {
    pub fn initialize_airdop(&self, total_supply: u32, max_winners: u32) {
        self.assert_owner();
        initialize_raffle_collection(
            StorageKey::AirdropLazyKey,
            StorageKey::AirdropRaffleKey,
            total_supply,
            max_winners,
        );
    }

    fn get_winner(&self) -> u32 {
        let mut lazy_raffle = get_raffle_collection(StorageKey::AirdropLazyKey);
        let mut raffle = lazy_raffle.get().expect("Airdrop raffle doesn't exist");
        let index = raffle.draw().expect("No more tokens left");
        lazy_raffle.set(&raffle);
        index
    }

    pub fn get_winners(&self, index: Option<u32>, limit: Option<u32>) -> Vec<u32> {
        get_raffle_collection(StorageKey::AirdropLazyKey)
            .get()
            .expect("Not initialized")
            .get_winners(index, limit)
    }

    // This was the big offender.  It is too expensive on mainnet to use this to find the owner of the token.
    // fn nft_token_minted(&self, index: u32) -> (TokenId, AccountId) {
    //     let from_index = Some(U128::from(index as u128));
    //     let tokens = self.nft_tokens(from_index, Some(1));
    //     require!(tokens.len() == 1, format!("{}", tokens.len()));
    //     let token = &tokens[0];
    //     (token.token_id.clone(), token.owner_id.clone())
    //     // token
    // }

    // This was a temporary hack since `nft_tokens` as too costly.
    //  pub fn get_owner(&self, token_index: u32) -> AccountId {
    //    let node = self.tokens.owner_by_id.node(token_index as u64).unwrap();
    //     self.tokens.owner_by_id.get(&node.key).unwrap()
    //  }

    pub fn draw_airdrop_winner(&mut self) -> u32 {
        self.assert_owner();
        self.get_winner()
    }

    pub fn mint_airdrop_token(&mut self, owner_id: AccountId, token_id: u32) -> Token {
        self.assert_owner();
        let token_id = token_id.to_string();
        let token = self.internal_mint(token_id.to_string(), owner_id.clone(), None);
        NearEvent::log_nft_mint(owner_id.to_string(), vec![token_id], None);
        token
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
    let mut raffle = get_raffle_collection(prefix);
    require!(raffle.get().is_none(), "Raffle is already initialized");
    let inner_raffle = RaffleCollection::new(raffle_prefix, length, max_winners);
    raffle.set(&inner_raffle);
}
