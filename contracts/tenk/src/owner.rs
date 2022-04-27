use crate::*;

#[near_bindgen]
impl Contract {
    // Owner private methods

    /// @allow ["::admins", "::owner"]
    pub fn transfer_ownership(&mut self, new_owner: AccountId) -> bool {
        self.assert_owner();
        env::log_str(&format!(
            "{} transfers ownership to {}",
            self.tokens.owner_id, new_owner
        ));
        self.tokens.owner_id = new_owner;
        true
    }

    /// @allow ["::admins", "::owner"]
    pub fn update_initial_royalties(&mut self, initial_royalties: Royalties) -> bool {
        self.assert_owner_or_admin();
        initial_royalties.validate();
        self.sale.initial_royalties = Some(initial_royalties);
        true
    }

    /// @allow ["::admins", "::owner"]
    pub fn update_royalties(&mut self, royalties: Royalties) -> bool {
        self.assert_owner_or_admin();
        royalties.validate();
        self.sale.royalties = Some(royalties);
        true
    }

    /// @allow ["::admins", "::owner"]
    pub fn update_allowance(&mut self, allowance: u16) -> bool {
        self.assert_owner_or_admin();
        self.sale.allowance = Some(allowance);
        true
    }

    /// @allow ["::admins", "::owner"]
    pub fn update_uri(&mut self, uri: String) -> bool {
        self.assert_owner_or_admin();
        let mut metadata = self.metadata.get().unwrap();
        log!("New URI: {}", &uri);
        metadata.base_uri = Some(uri);
        self.metadata.set(&metadata);
        true
    }

    /// Add whitelist accounts at a given max allowance
    /// @allow ["::admins", "::owner"]
    pub fn add_whitelist_accounts(
        &mut self,
        accounts: Vec<AccountId>,
        max_allowance: Option<u16>,
    ) -> bool {
        #[cfg(feature = "testnet")]
        self.assert_owner_or_admin();
        let max_allowance = max_allowance.unwrap_or_else(|| self.sale.allowance.unwrap_or(0));
        accounts.iter().for_each(|account_id| {
            let allowance = self
                .whitelist
                .get(account_id)
                .unwrap_or_else(|| Allowance::new(max_allowance))
                .raise_max(max_allowance);
            self.whitelist.insert(account_id, &allowance);
        });
        true
    }

    /// Increases allowance for whitelist accounts
    /// @allow ["::admins", "::owner"]
    pub fn update_whitelist_accounts(
        &mut self,
        accounts: Vec<AccountId>,
        allowance_increase: u16,
    ) -> bool {
        self.assert_owner_or_admin();
        accounts.iter().for_each(|account_id| {
            if let Some(mut allowance) = self.whitelist.get(account_id) {
                allowance.increase_max(allowance_increase);
                self.whitelist.insert(account_id, &allowance);
            } else {
                log!("Account {} is not in whitelist", account_id);
            }
        });
        true
    }

    /// End public sale/minting, going back to the pre-presale state in which no one can mint.
    /// @allow ["::admins", "::owner"]
    pub fn close_sale(&mut self) -> bool {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        self.sale.presale_start = None;
        self.sale.public_sale_start = None;
        true
    }

    /// Override the current presale start time to start presale now.
    /// Most provide when public sale starts. None, means never.
    /// Can provide new presale price.
    /// Note: you most likely won't need to call this since the presale
    /// starts automatically based on time.
    /// @allow ["::admins", "::owner"]
    pub fn start_presale(
        &mut self,
        public_sale_start: Option<TimestampMs>,
        presale_price: Option<U128>,
    ) -> bool {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        let current_time = current_time_ms();
        self.sale.presale_start = Some(current_time);
        self.sale.public_sale_start = public_sale_start;
        if presale_price.is_some() {
            self.sale.presale_price = presale_price;
        }
        true
    }

    /// @allow ["::admins", "::owner"]
    pub fn start_sale(&mut self, price: Option<YoctoNEAR>) -> bool {
        #[cfg(not(feature = "testnet"))]
        self.assert_owner_or_admin();
        self.sale.public_sale_start = Some(current_time_ms());
        if let Some(price) = price {
            self.sale.price = price
        }
        true
    }

    /// Add a new admin. Careful who you add!
    /// @allow ["::admins", "::owner"]
    pub fn add_admin(&mut self, account_id: AccountId) -> bool {
        self.assert_owner_or_admin();
        self.admins.insert(&account_id);
        true
    }

    /// Update public sale price.
    /// Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    /// @allow ["::admins", "::owner"]
    pub fn update_price(&mut self, price: U128) -> bool {
        self.assert_owner_or_admin();
        self.sale.price = price;
        true
    }

    /// Update the presale price
    /// Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    /// @allow ["::admins", "::owner"]
    pub fn update_presale_price(&mut self, presale_price: Option<U128>) -> bool {
        self.assert_owner_or_admin();
        self.sale.presale_price = presale_price;
        true
    }

    /// Update the presale start
    /// Careful this is in ms since 1970
    /// @allow ["::admins", "::owner"]
    pub fn update_presale_start(&mut self, presale_start: TimestampMs) -> bool {
        self.assert_owner_or_admin();
        self.sale.presale_start = Some(presale_start);
        true
    }

    /// Update the public sale start
    /// Careful this is in ms since 1970
    /// @allow ["::admins", "::owner"]
    pub fn update_public_sale_start(&mut self, public_sale_start: TimestampMs) -> bool {
        self.assert_owner_or_admin();
        self.sale.public_sale_start = Some(public_sale_start);
        true
    }

    #[payable]
    /// Create a pending token that can be claimed with corresponding private key
    /// @allow ["::admins", "::owner"]
    pub fn create_linkdrop(&mut self, public_key: PublicKey) -> Promise {
        self.assert_owner_or_admin();
        let deposit = env::attached_deposit();
        let account = &env::predecessor_account_id();
        self.assert_can_mint(account, 1);
        let total_cost = self.cost_of_linkdrop(account).0;
        self.pending_tokens += 1;
        let mint_for_free = self.is_owner(account);
        self.use_whitelist_allowance(account, 1);
        log!("Total cost of creation is {}", total_cost);
        refund(account, deposit - total_cost);
        self.send(public_key, mint_for_free)
            .then(ext_self::on_send_with_callback(
                env::current_account_id(),
                total_cost,
                GAS_REQUIRED_TO_CREATE_LINKDROP,
            ))
    }
}
