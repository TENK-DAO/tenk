use crate::*;

/// String of yocto NEAR; 1N = 1000000000000000000000000 yN
#[witgen]
pub type YoctoNEAR = U128;

#[derive(Deserialize, Serialize, Default)]
#[serde(crate = "near_sdk::serde")]
#[witgen]
pub struct InitialMetadata {
    name: String,
    symbol: String,
    uri: String,
    icon: Option<String>,
    spec: Option<String>,
    reference: Option<String>,
    reference_hash: Option<Base64VecU8>,
}

impl From<InitialMetadata> for NFTContractMetadata {
    fn from(inital_metadata: InitialMetadata) -> Self {
        let InitialMetadata {
            spec,
            name,
            symbol,
            icon,
            uri,
            reference,
            reference_hash,
        } = inital_metadata;
        NFTContractMetadata {
            spec: spec.unwrap_or_else(|| NFT_METADATA_SPEC.to_string()),
            name,
            symbol,
            icon,
            base_uri: Some(uri),
            reference,
            reference_hash,
        }
    }
}

#[derive(Deserialize, Serialize, BorshSerialize, BorshDeserialize)]
#[serde(crate = "near_sdk::serde")]
#[witgen]
pub struct Sale {
    pub royalties: Option<Royalties>,
    pub initial_royalties: Option<Royalties>,
    pub presale_start: Option<TimestampMs>,
    pub public_sale_start: Option<TimestampMs>,
    pub allowance: Option<u32>,
    pub presale_price: Option<U128>,
    pub price: U128,
    pub mint_rate_limit: Option<u32>,
}

impl Default for Sale {
    fn default() -> Self {
        Self {
            price: U128(0),
            // ..Default::default()
            royalties: Default::default(),
            initial_royalties: Default::default(),
            presale_start: Default::default(),
            public_sale_start: Default::default(),
            allowance: Default::default(),
            presale_price: Default::default(),
            mint_rate_limit: Some(10),
        }
    }
}

impl Sale {
    pub fn validate(&self) {
        if let Some(r) = self.royalties.as_ref() {
            r.validate()
        }
        if let Some(r) = self.initial_royalties.as_ref() {
            r.validate()
        }
    }
}
/// Current state of contract
#[witgen]
#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Status {
    /// Not open for any sales
    Closed,
    /// VIP accounts can mint
    Presale,
    /// Any account can mint
    Open,
    /// No more tokens to be minted
    SoldOut,
}

/// Information about the current sale from user perspective
#[allow(dead_code)]
#[witgen]
#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct UserSaleInfo {
    pub sale_info: SaleInfo,
    pub is_vip: bool,
    pub remaining_allowance: Option<u32>,
}

/// Information about the current sale
#[allow(dead_code)]
#[witgen]
#[derive(Serialize)]
#[serde(crate = "near_sdk::serde")]
pub struct SaleInfo {
    /// Current state of contract
    pub status: Status,
    /// Start of the VIP sale
    pub presale_start: TimestampMs,
    /// Start of public sale
    pub sale_start: TimestampMs,
    /// Total tokens that could be minted
    pub token_final_supply: u64,
    /// Current price for one token
    pub price: U128,
}


#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use super::*;
    use near_units::parse_near;
    const TEN: u128 = parse_near!("10 N");

    fn account() -> AccountId {
        AccountId::new_unchecked("alice.near".to_string())
    }

    fn initial_metadata() -> InitialMetadata {
        InitialMetadata {
            name: "name".to_string(),
            symbol: "sym".to_string(),
            uri: "https://".to_string(),
            ..Default::default()
        }
    }

    fn new_contract() -> Contract {
        Contract::new_default_meta(
            AccountId::new_unchecked("root".to_string()),
            initial_metadata(),
            10_000,
            Some(Sale {
                price: TEN.into(),
                ..Default::default()
            }),
        )
    }

    #[test]
    fn check_price() {
        let contract = new_contract();
        assert_eq!(
            contract.cost_per_token(&account()).0,
            TEN
        );
    }
}
