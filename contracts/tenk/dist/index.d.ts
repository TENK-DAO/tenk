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
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export declare type TokenId = string;
export declare type AccountId = string;
export declare type Base64VecU8 = string;
export declare type U128 = string;
export interface Token {
    token_id: TokenId;
    owner_id: AccountId;
    metadata?: TokenMetadata;
    approved_account_ids?: Record<AccountId, bigint>;
}
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
    title?: string;
    description?: string;
    media?: string;
    media_hash?: Base64VecU8;
    copies?: bigint;
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
export declare type PublicKey = string;
export declare type BasisPoint = number;
export declare type BatchPromise = [];
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
    update_allowance(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<void>;
    update_allowanceRaw(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_allowanceTx(args: {
        allowance: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    transfer_ownership(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<void>;
    transfer_ownershipRaw(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    transfer_ownershipTx(args: {
        new_owner: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
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
    whitelisted(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    total_cost(args: {
        num: number;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
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
        duration: bigint;
    }, options?: ChangeMethodOptions): Promise<void>;
    start_premintRaw(args: {
        duration: bigint;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    start_premintTx(args: {
        duration: bigint;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_payout(args: {
        token_id: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ViewFunctionOptions): Promise<Payout>;
    nft_transfer_call(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_transfer_callRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_callTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
        msg: string;
    }, options?: ChangeMethodOptions): transactions.Action;
    nft_transfer_payout(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: bigint;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): Promise<Payout>;
    nft_transfer_payoutRaw(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: bigint;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_payoutTx(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: bigint;
        memo?: string;
        balance: U128;
        max_len_payout?: number;
    }, options?: ChangeMethodOptions): transactions.Action;
    token_storage_cost(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
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
    remaining_allowance(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<number>;
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
    tokens_left(args?: {}, options?: ViewFunctionOptions): Promise<number>;
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
    check_key(args: {
        public_key: PublicKey;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    discount(args: {
        num: number;
    }, options?: ViewFunctionOptions): Promise<U128>;
    nft_total_supply(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
    nft_supply_for_owner(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    nft_transfer(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_transferRaw(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
        memo?: string;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transferTx(args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: bigint;
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
    cost_per_token(args: {
        num: number;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    nft_metadata(args?: {}, options?: ViewFunctionOptions): Promise<NftContractMetadata>;
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
    /**
    * Returns the balance associated with given key.
    */
    get_key_balance(args?: {}, options?: ViewFunctionOptions): Promise<U128>;
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
    nft_is_approved(args: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: bigint;
    }, options?: ViewFunctionOptions): Promise<boolean>;
    get_linkdrop_contract(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
    cost_of_linkdrop(args: {
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
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
    nft_token(args: {
        token_id: TokenId;
    }, options?: ViewFunctionOptions): Promise<Token | null>;
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
    nft_mint_one(args?: {}, options?: ChangeMethodOptions): Promise<Token>;
    nft_mint_oneRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_oneTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
}
