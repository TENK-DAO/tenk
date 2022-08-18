/**
* @minimum 0
* @maximum 18446744073709551615
* @asType integer
*/
export declare type u64 = number;
/**
* @minimum -9223372036854775808
* @maximum 9223372036854775807
* @asType integer
*/
export declare type i64 = number;
/**
* @minimum  0
* @maximum 255
* @asType integer
* */
export declare type u8 = number;
/**
* @minimum  -128
* @maximum 127
* @asType integer
* */
export declare type i8 = number;
/**
* @minimum  0
* @maximum 65535
* @asType integer
* */
export declare type u16 = number;
/**
* @minimum -32768
* @maximum 32767
* @asType integer
* */
export declare type i16 = number;
/**
* @minimum 0
* @maximum 4294967295
* @asType integer
* */
export declare type u32 = number;
/**
* @minimum 0
* @maximum 4294967295
* @asType integer
* */
export declare type usize = number;
/**
* @minimum  -2147483648
* @maximum 2147483647
* @asType integer
* */
export declare type i32 = number;
/**
* @minimum -3.40282347E+38
* @maximum 3.40282347E+38
*/
export declare type f32 = number;
/**
* @minimum -1.7976931348623157E+308
* @maximum 1.7976931348623157E+308
*/
export declare type f64 = number;
export declare type CallOptions = {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
};
/**
* milliseconds elapsed since the UNIX epoch
*/
export declare type TimestampMs = u64;
/**
* Copied from https://github.com/near/NEPs/blob/6170aba1c6f4cd4804e9ad442caeae9dc47e7d44/specs/Standards/NonFungibleToken/Payout.md#reference-level-explanation
* A mapping of NEAR accounts to the amount each should be paid out, in
* the event of a token-sale. The payout mapping MUST be shorter than the
* maximum length specified by the financial contract obtaining this
* payout data. Any mapping of length 10 or less MUST be accepted by
* financial contracts, so 10 is a safe upper limit.
* This currently deviates from the standard but is in the process of updating to use this type
*/
export interface Payout {
    payout: Record<AccountId, U128>;
}
export declare type BasisPoint = u16;
export interface Royalties {
    accounts: Record<AccountId, BasisPoint>;
    percent: BasisPoint;
}
/**
* String of yocto NEAR; 1N = 1000000000000000000000000 yN
*/
export declare type YoctoNear = U128;
export interface InitialMetadata {
    name: string;
    symbol: string;
    uri: string;
    icon?: string;
    spec?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface Sale {
    royalties?: Royalties;
    initial_royalties?: Royalties;
    presale_start?: TimestampMs;
    public_sale_start?: TimestampMs;
    allowance?: u16;
    presale_price?: U128;
    price: U128;
    mint_rate_limit?: u16;
}
/**
* Current state of contract
*/
export declare enum Status {
    /**
    * Not open for any sales
    */
    Closed = "Closed",
    /**
    * VIP accounts can mint
    */
    Presale = "Presale",
    /**
    * Any account can mint
    */
    Open = "Open",
    /**
    * No more tokens to be minted
    */
    SoldOut = "SoldOut"
}
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
    sale_info: SaleInfo;
    is_vip: boolean;
    remaining_allowance?: u16;
}
/**
* Information about the current sale
*/
export interface SaleInfo {
    /**
    * Current state of contract
    */
    status: Status;
    /**
    * Start of the VIP sale
    */
    presale_start: TimestampMs;
    /**
    * Start of public sale
    */
    sale_start: TimestampMs;
    /**
    * Total tokens that could be minted
    */
    token_final_supply: u64;
    /**
    * Current price for one token
    */
    price: U128;
}
/**
* Id for roketo stream
*/
export declare type StreamId = string;
/**
* Ft Token Type used by Rokte
*
*/
export interface FtToken {
    storage_balance_needed: U128;
}
export interface RoketoStream {
    stream_id: StreamId;
    storage_balance_needed: Balance;
}
/**
* Stream used by Rokte
*
* Not all fields are listed
*
*/
export interface Stream {
    owner_id: AccountId;
    is_locked: boolean;
    token_account_id: AccountId;
}
/**
* StorageUsage is used to count the amount of storage used by a contract.
*/
export declare type StorageUsage = u64;
/**
* Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
*/
export declare type Balance = U128;
/**
* Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
*/
export declare type Gas = u64;
/**
* base64 string.
*/
export declare type Base64VecU8 = string;
/**
* Raw type for duration in nanoseconds
*/
export declare type Duration = u64;
/**
* @minLength 2
* @maxLength 64
* @pattern ^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$
*/
export declare type AccountId = string;
/**
* String representation of a u128-bit integer
* @pattern ^[0-9]+$
*/
export declare type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
*
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export declare type PublicKey = string;
/**
* Raw type for timestamp in nanoseconds
*/
export declare type Timestamp = u64;
/**
* In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
*/
export interface Token {
    token_id: TokenId;
    owner_id: AccountId;
    metadata?: TokenMetadata;
    approved_account_ids?: Record<AccountId, u64>;
}
export interface FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
    decimals: u8;
}
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export declare type TokenId = string;
/**
* Metadata for the NFT contract itself.
*/
export interface NftContractMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    base_uri?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface StorageBalanceBounds {
    min: U128;
    max?: U128;
}
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
    title?: string;
    description?: string;
    media?: string;
    media_hash?: Base64VecU8;
    copies?: u64;
    issued_at?: string;
    expires_at?: string;
    starts_at?: string;
    updated_at?: string;
    extra?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
export interface StorageBalance {
    total: U128;
    available: U128;
}
export declare type WrappedDuration = string;
