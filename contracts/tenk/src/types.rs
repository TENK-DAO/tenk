use crate::*;

/// String of yocto NEAR; 1N = 1000000000000000000000000 yN
#[witgen]
pub type YoctoNEAR = U128;

/// Fungible token parameters for computing price and boost
/* 
from convertion expressed in 1e3, including the boost:
amount of token = (amount_near / 1e3) * token_near;
Example. If 1N = 438 tokens, then we need to set token_near = 438'000 
token_boost is a factor which will be applied when purchasing NFT with this fungible token
token_deposits - all deposits by user into this token
token_boost: 100 - token_discount,
*/
#[derive(BorshSerialize, BorshDeserialize)]
pub struct TokenParameters {
    pub token_near: u128,
    pub token_boost: u32,
    pub token_deposits: LookupMap<AccountId, Balance>,
    pub decimals: u8
}
impl Default for TokenParameters {
    fn default() -> Self {
        Self { 
            token_near: 0, 
            token_boost: 100, 
            token_deposits: LookupMap::new(StorageKey::TokenDeposits),
            decimals: 24 
        }
    }
}
#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenParametersOutput {
    pub token_near: u128,
    pub discount: u8,
    pub decimals: u8
}
impl From<TokenParameters> for TokenParametersOutput {
    fn from(token_parameters: TokenParameters) -> Self {
        Self { 
            token_near: token_parameters.token_near, 
            discount: 100 - token_parameters.token_boost as u8,
            decimals: token_parameters.decimals
        }
    }
}

impl TokenParameters {
    pub fn new(token_near: u128, token_boost: u32, decimals: u8) -> Self {
        Self { 
            token_near, 
            token_boost, 
            token_deposits: LookupMap::new(StorageKey::TokenDeposits),
            decimals
        }
    }
}

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
    fn from(initial_metadata: InitialMetadata) -> Self {
        let InitialMetadata {
            spec,
            name,
            symbol,
            icon,
            uri,
            reference,
            reference_hash,
        } = initial_metadata;
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

#[derive(BorshSerialize, BorshDeserialize)]
pub struct Allowance {
    max: u16,
    used: u16,
}

impl Allowance {
    pub fn new(max: u16) -> Self {
        Self { max, used: 0 }
    }
    pub fn left(&self) -> u16 {
        self.max - self.used
    }

    pub fn use_num(&mut self, num: u16) {
        self.used += num
    }

    pub fn increase_max(&mut self, num: u16) {
        self.max += num;
    }

    pub fn raise_max(mut self, new_max: u16) -> Self {
        self.max = u16::max(self.max, new_max);
        self
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
    pub allowance: Option<u16>,
    pub presale_price: Option<U128>,
    pub price: U128,
    pub mint_rate_limit: Option<u16>,
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
    pub remaining_allowance: Option<u16>,
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
            None,
        )
    }

    #[test]
    fn check_price() {
        let contract = new_contract();
        assert_eq!(contract.cost_per_token(&account(), 1).0, TEN);
    }
}
