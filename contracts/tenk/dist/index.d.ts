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
/** 64 bit unsigned integer less than 2^53 -1 */
declare type u64 = number;
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
export declare type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
*
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export declare type PublicKey = string;
export declare type AccountId = string;
/**
* Raw type for timestamp in nanoseconds
*/
export declare type Timestamp = u64;
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
export declare type TokenId = string;
export interface StorageBalance {
    total: U128;
    available: U128;
}
export declare type WrappedDuration = string;
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
    is_premint?: boolean;
    is_premint_over?: boolean;
    allowance?: number;
}
export declare type BasisPoint = number;
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
export interface PriceStructure {
    base_cost: U128;
    min_cost?: U128;
    percent_off?: number;
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
    remaining_allowance(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<number>;
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
    nft_token(args: {
        token_id: TokenId;
    }, options?: ViewFunctionOptions): Promise<Token | null>;
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
    nft_mint_many(args: {
        num: number;
    }, options?: ChangeMethodOptions): Promise<Token[]>;
    nft_mint_manyRaw(args: {
        num: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_manyTx(args: {
        num: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    start_premint(args: {
        duration: u64;
    }, options?: ChangeMethodOptions): Promise<void>;
    start_premintRaw(args: {
        duration: u64;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    start_premintTx(args: {
        duration: u64;
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
    end_premint(args: {
        base_cost: U128;
        min_cost: U128;
        percent_off?: number;
    }, options?: ChangeMethodOptions): Promise<void>;
    end_premintRaw(args: {
        base_cost: U128;
        min_cost: U128;
        percent_off?: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    end_premintTx(args: {
        base_cost: U128;
        min_cost: U128;
        percent_off?: number;
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
    update_royalties(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<Royalties | null>;
    update_royaltiesRaw(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_royaltiesTx(args: {
        royalties: Royalties;
    }, options?: ChangeMethodOptions): transactions.Action;
    cost_of_linkdrop(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    new(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        price_structure: PriceStructure;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    newRaw(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        price_structure: PriceStructure;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    newTx(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: number;
        price_structure: PriceStructure;
        sale: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    total_cost(args: {
        num: number;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    get_linkdrop_contract(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
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
    cost_per_token(args: {
        num: number;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    new_default_meta(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        price_structure: PriceStructure;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    new_default_metaRaw(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        price_structure: PriceStructure;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    new_default_metaTx(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: number;
        price_structure: PriceStructure;
        sale?: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
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
    discount(args: {
        num: number;
    }, options?: ViewFunctionOptions): Promise<U128>;
    tokens_left(args?: {}, options?: ViewFunctionOptions): Promise<number>;
    nft_supply_for_owner(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    nft_mint_one(args?: {}, options?: ChangeMethodOptions): Promise<Token>;
    nft_mint_oneRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_oneTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
}
export {};
