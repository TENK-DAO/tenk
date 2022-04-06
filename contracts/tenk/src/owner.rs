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

    pub fn update_initial_royalties(&mut self, initial_royalties: Royalties) {
        self.assert_owner_or_admin();
        initial_royalties.validate();
        self.sale.initial_royalties = Some(initial_royalties);
    }

    pub fn update_royalties(&mut self, royalties: Royalties) {
        self.assert_owner_or_admin();
        royalties.validate();
        self.sale.royalties = Some(royalties);
    }

    pub fn update_allowance(&mut self, allowance: u32) {
        self.assert_owner_or_admin();
        self.sale.allowance = Some(allowance);
    }

    pub fn update_uri(&mut self, uri: String) {
        self.assert_owner_or_admin();
        let mut metadata = self.metadata.get().unwrap();
        log!("New URI: {}", &uri);
        metadata.base_uri = Some(uri);
        self.metadata.set(&metadata);
    }
    pub fn add_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance: Option<u32>) {
        #[cfg(feature = "testnet")]
        self.assert_owner_or_admin();
        let allowance = allowance.unwrap_or_else(|| self.sale.allowance.unwrap_or(0));
        accounts.iter().for_each(|account_id| {
            self.whitelist.insert(account_id, &allowance);
        });
    }

    pub fn update_whitelist_accounts(&mut self, accounts: Vec<AccountId>, allowance_increase: u32) {
        self.assert_owner_or_admin();
        accounts.iter().for_each(|account_id| {
            let allowance = self.whitelist.get(&account_id).unwrap_or(0) + allowance_increase;
            self.whitelist.insert(account_id, &allowance);
        });
    }

    /// Contract wwill
    pub fn close_contract(&mut self) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        self.sale.presale_start = None;
        self.sale.public_sale_start = None;
    }

    /// Override the current presale start time to start presale now.
    /// Most provide when public sale starts. None, means never.
    /// Can provide new presale price.
    /// Note: you most likely won't need to call this since the presale
    /// starts automatically based on time.
    pub fn start_presale(
        &mut self,
        public_sale_start: Option<TimestampMs>,
        presale_price: Option<U128>,
    ) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        let current_time = current_time_ms();
        self.sale.presale_start = Some(current_time);
        self.sale.public_sale_start = public_sale_start;
        if presale_price.is_some() {
            self.sale.presale_price = presale_price;
        }
    }

    pub fn start_sale(&mut self, price: Option<U128>) {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        self.sale.public_sale_start = Some(current_time_ms());
        if let Some(price) = price {
            self.sale.price = price
        }
    }

    /// Add a new admin. Careful who you add!
    pub fn add_admin(&mut self, account_id: AccountId) {
        self.assert_owner_or_admin();
        self.admins.insert(&account_id);
    }

    /// Update public sale price
    pub fn update_price(&mut self, price: U128) {
        self.assert_owner_or_admin();
        self.sale.price = price;
    }

    /// Update the presale price
    pub fn update_presale_price(&mut self, presale_price: Option<U128>) {
        self.assert_owner_or_admin();
        self.sale.presale_price = presale_price;
    }
}
