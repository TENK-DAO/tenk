use crate::*;

#[near_bindgen]
impl Contract {
    pub fn whitelisted(&self, account_id: &AccountId) -> bool {
        self.whitelist.contains_key(account_id)
    }

    pub fn cost_of_linkdrop(&self, minter: &AccountId) -> U128 {
        (self.full_link_price(minter) + self.total_cost(1, minter).0 + self.token_storage_cost().0)
            .into()
    }

    pub fn total_cost(&self, num: u32, minter: &AccountId) -> U128 {
        (num as Balance * self.cost_per_token(minter).0).into()
    }

    pub fn cost_per_token(&self, minter: &AccountId) -> U128 {
        if self.is_owner(minter) {
            0
        } else {
            self.price()
        }
        .into()
    }

    pub fn token_storage_cost(&self) -> U128 {
        (env::storage_byte_cost() * self.tokens.extra_storage_in_bytes_per_token as Balance).into()
    }

    pub fn tokens_left(&self) -> u32 {
        self.raffle.len() as u32 - self.pending_tokens
    }

    pub fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }

    pub fn remaining_allowance(&self, account_id: &AccountId) -> Option<u32> {
        self.whitelist.get(account_id)
    }

    pub fn mint_rate_limit(&self) -> Option<u32> {
        self.sale.mint_rate_limit
    }

    pub fn get_sale_info(&self) -> SaleInfo {
        SaleInfo {
            status: self.get_status(),
            presale_start: self.sale.presale_start.unwrap_or(MAX_DATE),
            sale_start: self.sale.public_sale_start.unwrap_or(MAX_DATE),
            token_final_supply: self.initial(),
            price: self.price().into(),
        }
    }

    pub fn get_user_sale_info(&self, account_id: &AccountId) -> UserSaleInfo {
        let sale_info = self.get_sale_info();
        let remaining_allowance = if self.is_presale() || self.sale.allowance.is_some() {
            self.remaining_allowance(account_id)
        } else {
            None
        };
        UserSaleInfo {
            sale_info,
            remaining_allowance,
            is_vip: self.whitelisted(account_id),
        }
    }

    pub fn initial(&self) -> u64 {
      self.raffle.len() + self.nft_total_supply().0 as u64
  }
}
