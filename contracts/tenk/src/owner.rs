use crate::*;

#[near_bindgen]
impl Contract {
    // Owner private methods

    pub fn transfer_ownership(&mut self, new_owner: AccountId) {
        self.assert_owner();
        env::log_str(&format!(
            "{} transfers ownership to {}",
            self.tokens.owner_id, new_owner
        ));
        self.tokens.owner_id = new_owner;
    }

    pub fn update_royalties(&mut self, royalties: Royalties) {
        self.assert_owner();
        royalties.validate();
        self.sale.royalties = Some(royalties);
    }

    pub fn update_initial_royalties(&mut self, initial_royalties: Royalties) {
      self.assert_owner();
      initial_royalties.validate();
      self.sale.initial_royalties = Some(initial_royalties);
  }

    pub fn update_allowance(&mut self, allowance: u32) {
        self.assert_owner();
        self.sale.allowance = Some(allowance);
    }

    pub fn update_uri(&mut self, uri: String) {
        self.assert_owner();
        let mut metadata = self.metadata.get().unwrap();
        log!("New URI: {}", &uri);
        metadata.base_uri = Some(uri);
        self.metadata.set(&metadata);
    }
    pub fn add_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance: Option<u32>) {
        self.assert_owner();
        let allowance = allowance.unwrap_or_else(|| self.sale.allowance.unwrap_or(0));
        accounts.iter().for_each(|account_id| {
            self.whitelist.insert(account_id, &allowance);
        });
    }

    pub fn update_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance_increase: u32) {
      self.assert_owner();
      accounts.iter().for_each(|account_id| {
          let allowance = self.whitelist.get(&account_id).unwrap_or(0) + allowance_increase;
          self.whitelist.insert(account_id, &allowance);
      });
  }

    #[cfg(feature = "testnet")]
    pub fn add_whitelist_account_ungaurded(&mut self, account_id: AccountId, allowance: u32) {
        self.whitelist.insert(&account_id, &allowance);
    }

    pub fn close_contract(&mut self) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        self.sale.presale_start = None;
        self.sale.public_sale_start = None;
    }

    pub fn start_presale(
        &mut self,
        public_sale_start: Option<TimestampMs>,
        presale_price: Option<U128>,
    ) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        let current_time = current_time_ms();
        self.sale.presale_start = Some(current_time);
        self.sale.public_sale_start = public_sale_start;
        if presale_price.is_some() {
            self.sale.presale_price = presale_price;
        }
    }

    pub fn start_sale(&mut self, price: Option<U128>) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner();
        self.sale.public_sale_start = Some(current_time_ms());
        if let Some(price) = price {
            self.sale.price = price
        }
    }
}
