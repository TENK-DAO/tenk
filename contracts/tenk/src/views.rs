use crate::*;

#[near_bindgen]
impl Contract {
    /// Current contract owner
    pub fn owner(&self) -> AccountId {
        self.tokens.owner_id.clone()
    }

    /// Current set of admins
    pub fn admins(&self) -> Vec<AccountId> {
        self.admins.to_vec()
    }

    /// Check whether an account is allowed to mint during the presale
    pub fn whitelisted(&self, account_id: &AccountId) -> bool {
        self.whitelist.contains_key(account_id)
    }

    /// Cost of NFT + fees for linkdrop
    pub fn cost_of_linkdrop(&self, minter: &AccountId) -> U128 {
        (self.full_link_price(minter) + self.total_cost(1, minter).0 + self.token_storage_cost().0)
            .into()
    }

    pub fn total_cost(&self, num: u16, minter: &AccountId) -> U128 {
        (num as Balance * self.cost_per_token(minter).0).into()
    }

    /// Flat cost of one token
    pub fn cost_per_token(&self, minter: &AccountId) -> U128 {
        if self.is_owner(minter) {
            0
        } else {
            self.price()
        }
        .into()
    }

    /// Current cost in NEAR to store one NFT
    pub fn token_storage_cost(&self) -> U128 {
        (env::storage_byte_cost() * self.tokens.extra_storage_in_bytes_per_token as Balance).into()
    }

    /// Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
    pub fn tokens_left(&self) -> u32 {
        self.raffle.len() as u32 - self.pending_tokens - 7334
    }

    /// Part of the NFT metadata standard. Returns the contract's metadata
    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    /// How many tokens an account is still allowed to mint. None, means unlimited
    pub fn remaining_allowance(&self, account_id: &AccountId) -> Option<u16> {
        let allowance = if self.is_presale() {
            0
        } else if let Some(allowance) = self.sale.allowance {
            allowance
        } else {
            return None;
        };
        self.whitelist
            .get(account_id)
            .map(|a| a.raise_max(allowance).left())
    }

    /// Max number of mints in one transaction. None, means unlimited
    pub fn mint_rate_limit(&self) -> Option<u16> {
        self.sale.mint_rate_limit
    }

    /// Information about the current sale. When in starts, status, price, and how many could be minted.
    pub fn get_sale_info(&self) -> SaleInfo {
        SaleInfo {
            presale_start: self.sale.presale_start.unwrap_or(MAX_DATE),
            sale_start: self.sale.public_sale_start.unwrap_or(MAX_DATE),
            status: self.get_status(),
            price: self.price().into(),
            token_final_supply: self.initial(),
        }
    }

    /// Information about a current user. Whether they are VIP and how many tokens left in their allowance.
    pub fn get_user_sale_info(&self, account_id: &AccountId) -> UserSaleInfo {
        let sale_info = self.get_sale_info();
        let remaining_allowance = self.remaining_allowance(account_id);
        UserSaleInfo {
            sale_info,
            remaining_allowance,
            is_vip: self.whitelisted(account_id),
        }
    }

    /// Initial size of collection. Number left to raffle + current total supply
    pub fn initial(&self) -> u64 {
        self.raffle.len() + self.nft_total_supply().0 as u64
    }

    pub fn get_stream_info(&self, token_id: TokenId) -> Option<RoketoStream> {
      self.roketo_ids.get(&token_id)
    }
    
    pub fn roketo_address(&self) -> AccountId {
      self.roketo_account_id()
    }
}
