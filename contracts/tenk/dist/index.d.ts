import { Account, transactions, providers } from 'near-api-js';
import BN from 'bn.js';
export interface ChangeMethodOptions {
    gas?: BN;
    attachedDeposit?: BN;
    walletMeta?: string;
    walletCallbackUrl?: string;
}
export interface ViewFunctionOptions {
    parse?: (response: Uint8Array) => any;
    stringify?: (input: any) => any;
}
/**
* @minimum 0
* @maximum 18446744073709551615
* @asType integer
*/
declare type u64 = number;
/**
* @minimum  0
* @maximum 255
* @asType integer
* */
declare type u8 = number;
/**
* @minimum  0
* @maximum 65535
* @asType integer
* */
declare type u16 = number;
/**
* @minimum 0
* @maximum 4294967295
* @asType integer
* */
declare type u32 = number;
/**
* @pattern ^[0-9]+$
*/
declare type U128 = string;
export { U128 };
/**
* StorageUsage is used to count the amount of storage used by a contract.
*/
declare type StorageUsage = u64;
export { StorageUsage };
/**
* Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
*/
declare type Balance = U128;
export { Balance };
/**
* Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
*/
declare type Gas = u64;
export { Gas };
/**
* base64 string.
*/
declare type Base64VecU8 = string;
export { Base64VecU8 };
/**
* Raw type for duration in nanoseconds
*/
declare type Duration = u64;
export { Duration };
/**
* @pattern ^(([a-z\d]+[\-_])*[a-z\d]+\.)*([a-z\d]+[\-_])*[a-z\d]+$
*/
declare type AccountId = string;
export { AccountId };
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
*
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
declare type PublicKey = string;
export { PublicKey };
/**
* Raw type for timestamp in nanoseconds
*/
declare type Timestamp = u64;
export { Timestamp };
export interface StorageBalanceBounds {
    min: U128;
    max?: U128;
}
export interface FungibleTokenMetadata {
    spec: string;
    name: string;
    symbol: string;
    icon?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
    decimals: number;
}
/**
* In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
*/
export interface Token {
    token_id: TokenId;
    owner_id: AccountId;
    metadata?: TokenMetadata;
    approved_account_ids?: Record<AccountId, u64>;
}
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
declare type TokenId = string;
export { TokenId };
export interface StorageBalance {
    total: U128;
    available: U128;
}
declare type WrappedDuration = string;
export { WrappedDuration };
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
/**
* Current state of contract
*/
export declare enum Status {
    /**
    * Not open for any sales
    */
    Closed = 0,
    /**
    * VIP accounts can mint
    */
    Presale = 1,
    /**
    * Any account can mint
    */
    Open = 2,
    /**
    * No more tokens to be minted
    */
    SoldOut = 3
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
export interface InitialMetadata {
    name: string;
    symbol: string;
    uri: string;
    icon?: string;
    spec?: string;
    reference?: string;
    reference_hash?: Base64VecU8;
}
/**
* milliseconds elapsed since the UNIX epoch
*/
declare type TimestampMs = u64;
export { TimestampMs };
export interface Sale {
    royalties?: Royalties;
    initial_royalties?: Royalties;
    presale_start?: TimestampMs;
    public_sale_start?: TimestampMs;
    allowance?: u32;
    presale_price?: U128;
    price: U128;
}
declare type BasisPoint = u16;
export { BasisPoint };
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
    sale_info: SaleInfo;
    is_vip: boolean;
    remaining_allowance?: number;
}
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
export interface Royalties {
    accounts: Record<AccountId, BasisPoint>;
    percent: BasisPoint;
}
export declare class Contract {
    account: Account;
    readonly contractId: string;
    constructor(account: Account, contractId: string);
    check_key(args: {
        public_key: PublicKey;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    update_allowance(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<void>;
    update_allowanceRaw(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_allowanceTx(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    whitelisted(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    get_sale_info(args?: {}, options?: ViewFunctionOptions): Promise<SaleInfo>;
    cost_per_token(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    transfer_ownership(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<void>;
    transfer_ownershipRaw(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    transfer_ownershipTx(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_total_supply(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    nft_tokens(args: {
        from_index?: U128;
        limit?: u64;
    }, options?: ViewFunctionOptions): Promise<Token[]>;
    start_presale(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<void>;
    start_presaleRaw(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    start_presaleTx(args: {
        public_sale_start?: TimestampMs;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_token(args: {
        token_id: TokenId;
    }, options?: ViewFunctionOptions): Promise<Token | null>;
    close_contract(args?: {}, options?: ChangeMethodOptions): Promise<void>;
    close_contractRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    close_contractTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
    nft_approve(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_approveRaw(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_approveTx(args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    start_sale(args: {
        price?: U128;
    }, options?: ChangeMethodOptions): Promise<void>;
    start_saleRaw(args: {
        price?: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    start_saleTx(args: {
        price?: U128;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_mint_many(args: {
        num: number;
    }, options?: ChangeMethodOptions): Promise<Token[]>;
    nft_mint_manyRaw(args: {
        num: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_manyTx(args: {
        num: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    update_uri(args: {
        uri: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    update_uriRaw(args: {
        uri: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_uriTx(args: {
        uri: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_transfer_call(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_transfer_callRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_callTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_payout(args: {
        token_id: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ViewFunctionOptions): Promise<Payout>;
    nft_transfer_payout(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): Promise<Payout>;
    nft_transfer_payoutRaw(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_payoutTx(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    /**
    * Returns the balance associated with given key.
    */
    get_key_balance(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdrop(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): Promise<void>;
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdropRaw(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    create_linkdropTx(args: {
        public_key: PublicKey;
    }, options?: ChangeMethodOptions): transactions.Action;
    add_whitelist_accounts(args: {
        accounts: AccountId[];
        allowance?: number;
    }, options?: ChangeMethodOptions): Promise<void>;
    add_whitelist_accountsRaw(args: {
        accounts: AccountId[];
        allowance?: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    add_whitelist_accountsTx(args: {
        accounts: AccountId[];
        allowance?: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    new(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    newRaw(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    newTx(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        sale: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    token_storage_cost(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    nft_transfer(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_transferRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transferTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_revoke_all(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_revoke_allRaw(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_revoke_allTx(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): transactions.Action;
    cost_of_linkdrop(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    total_cost(args: {
        num: number;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    get_linkdrop_contract(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
    new_default_meta(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    new_default_metaRaw(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    new_default_metaTx(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        sale?: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_revoke(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_revokeRaw(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_revokeTx(args: {
        token_id: TokenId;
        account_id: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_metadata(args?: {}, options?: ViewFunctionOptions): Promise<NftContractMetadata>;
    nft_is_approved(args: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: u64;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    remaining_allowance(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<number | null>;
    nft_mint(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): Promise<Token>;
    nft_mintRaw(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mintTx(args: {
        token_id: TokenId;
        token_owner_id: AccountId;
        token_metadata: TokenMetadata;
    }, options?: ChangeMethodOptions): transactions.Action;
    get_user_sale_info(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<UserSaleInfo>;
    nft_tokens_for_owner(args: {
        account_id: AccountId;
        from_index?: U128;
        limit?: u64;
    }, options?: ViewFunctionOptions): Promise<Token[]>;
    add_whitelist_account_ungaurded(args: {
        account_id: AccountId;
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<void>;
    add_whitelist_account_ungaurdedRaw(args: {
        account_id: AccountId;
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    add_whitelist_account_ungaurdedTx(args: {
        account_id: AccountId;
        allowance: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    tokens_left(args?: {}, options?: ViewFunctionOptions): Promise<number>;
    nft_supply_for_owner(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    update_royalties(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<void>;
    update_royaltiesRaw(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_royaltiesTx(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_mint_one(args?: {}, options?: ChangeMethodOptions): Promise<Token>;
    nft_mint_oneRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_oneTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
}
/** @contractMethod view */
export interface CheckKey {
    public_key: PublicKey;
}
/** @contractMethod change */
export interface UpdateAllowance {
    allowance: u32;
}
/** @contractMethod view */
export interface Whitelisted {
    account_id: AccountId;
}
/** @contractMethod view */
export interface GetSaleInfo {
}
/** @contractMethod view */
export interface CostPerToken {
    minter: AccountId;
}
/** @contractMethod change */
export interface TransferOwnership {
    new_owner: AccountId;
}
/** @contractMethod view */
export interface NftTotalSupply {
}
/** @contractMethod view */
export interface NftTokens {
    from_index?: U128;
    limit?: u64;
}
/** @contractMethod change */
export interface StartPresale {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
}
/** @contractMethod view */
export interface NftToken {
    token_id: TokenId;
}
/** @contractMethod change */
export interface CloseContract {
}
/** @contractMethod change */
export interface NftApprove {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
}
/** @contractMethod change */
export interface StartSale {
    price?: U128;
}
/** @contractMethod change */
export interface NftMintMany {
    num: u32;
}
/** @contractMethod change */
export interface UpdateUri {
    uri: string;
}
/** @contractMethod change */
export interface MintSpecial {
}
/** @contractMethod change */
export interface NftTransferCall {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
}
/** @contractMethod view */
export interface NftPayout {
    token_id: string;
    balance: U128;
    max_len_payout?: u32;
}
/** @contractMethod change */
export interface NftTransferPayout {
    receiver_id: AccountId;
    token_id: string;
    approval_id?: u64;
    memo?: string;
    balance: U128;
    max_len_payout?: u32;
}
/** @contractMethod view */
export interface GetKeyBalance {
}
/** @contractMethod change */
export interface CreateLinkdrop {
    public_key: PublicKey;
}
/** @contractMethod change */
export interface AddWhitelistAccounts {
    accounts: AccountId[];
    allowance?: u32;
}
/** @contractMethod change */
export interface New {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
}
/** @contractMethod view */
export interface TokenStorageCost {
}
/** @contractMethod change */
export interface NftTransfer {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
}
/** @contractMethod change */
export interface NftRevokeAll {
    token_id: TokenId;
}
/** @contractMethod view */
export interface CostOfLinkdrop {
    minter: AccountId;
}
/** @contractMethod view */
export interface TotalCost {
    num: u32;
    minter: AccountId;
}
/** @contractMethod view */
export interface GetLinkdropContract {
}
/** @contractMethod change */
export interface NewDefaultMeta {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
}
/** @contractMethod change */
export interface NftRevoke {
    token_id: TokenId;
    account_id: AccountId;
}
/** @contractMethod view */
export interface NftMetadata {
}
/** @contractMethod view */
export interface NftIsApproved {
    token_id: TokenId;
    approved_account_id: AccountId;
    approval_id?: u64;
}
/** @contractMethod view */
export interface RemainingAllowance {
    account_id: AccountId;
}
/** @contractMethod change */
export interface NftMint {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
}
/** @contractMethod view */
export interface GetUserSaleInfo {
    account_id: AccountId;
}
/** @contractMethod view */
export interface Initial {
}
/** @contractMethod view */
export interface NftTokensForOwner {
    account_id: AccountId;
    from_index?: U128;
    limit?: u64;
}
/** @contractMethod change */
export interface AddWhitelistAccountUngaurded {
    account_id: AccountId;
    allowance: u32;
}
/** @contractMethod view */
export interface TokensLeft {
}
/** @contractMethod view */
export interface NftSupplyForOwner {
    account_id: AccountId;
}
/** @contractMethod change */
export interface UpdateRoyalties {
    royalties: Royalties;
}
/** @contractMethod change */
export interface NftMintOne {
}
