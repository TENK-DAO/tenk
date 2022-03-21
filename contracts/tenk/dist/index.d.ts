import { Account, transactions, providers, u8, u16, u32, u64, ChangeMethodOptions, ViewFunctionOptions } from './helper';
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
export interface Sale {
    royalties?: Royalties;
    initial_royalties?: Royalties;
    presale_start?: Duration;
    public_sale_start?: Duration;
    allowance?: u32;
    presale_price?: U128;
    price: U128;
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
    presale_start: Duration;
    /**
    * Start of public sale
    */
    sale_start: Duration;
    /**
    * Total tokens that could be minted
    */
    token_final_supply: u64;
    /**
    * Current price for one token
    */
    price: U128;
}
export declare type BasisPoint = u16;
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
    sale_info: SaleInfo;
    is_vip: boolean;
    remaining_allowance?: u32;
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
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<void>;
    update_allowanceRaw(args: {
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    update_allowanceTx(args: {
        allowance: u32;
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
        num: u32;
    }, options?: ChangeMethodOptions): Promise<Token[]>;
    nft_mint_manyRaw(args: {
        num: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mint_manyTx(args: {
        num: u32;
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
    mint_special(args?: {}, options?: ChangeMethodOptions): Promise<Token[] | null>;
    mint_specialRaw(args?: {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    mint_specialTx(args?: {}, options?: ChangeMethodOptions): transactions.Action;
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
        max_len_payout?: u32;
    }, options?: ViewFunctionOptions): Promise<Payout>;
    nft_transfer_payout(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ChangeMethodOptions): Promise<Payout>;
    nft_transfer_payoutRaw(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_transfer_payoutTx(args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
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
    nft_mint(args: {
        num: u32;
        token_owner_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<Token>;
    nft_mintRaw(args: {
        num: u32;
        token_owner_id: AccountId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_mintTx(args: {
        num: u32;
        token_owner_id: AccountId;
    }, options?: ChangeMethodOptions): transactions.Action;
    add_whitelist_accounts(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): Promise<void>;
    add_whitelist_accountsRaw(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    add_whitelist_accountsTx(args: {
        accounts: AccountId[];
        allowance?: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    new(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    newRaw(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    newTx(args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    }, options?: ChangeMethodOptions): transactions.Action;
    start_presale(args: {
        public_sale_start?: Duration;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<void>;
    start_presaleRaw(args: {
        public_sale_start?: Duration;
        presale_price?: U128;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    start_presaleTx(args: {
        public_sale_start?: Duration;
        presale_price?: U128;
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
        num: u32;
        minter: AccountId;
    }, options?: ViewFunctionOptions): Promise<U128>;
    get_linkdrop_contract(args?: {}, options?: ViewFunctionOptions): Promise<AccountId>;
    new_default_meta(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<void>;
    new_default_metaRaw(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    new_default_metaTx(args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
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
    nft_burn(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<void>;
    nft_burnRaw(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    nft_burnTx(args: {
        token_id: TokenId;
    }, options?: ChangeMethodOptions): transactions.Action;
    remaining_allowance(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<u32 | null>;
    get_user_sale_info(args: {
        account_id: AccountId;
    }, options?: ViewFunctionOptions): Promise<UserSaleInfo>;
    initial(args?: {}, options?: ViewFunctionOptions): Promise<u64>;
    nft_tokens_for_owner(args: {
        account_id: AccountId;
        from_index?: U128;
        limit?: u64;
    }, options?: ViewFunctionOptions): Promise<Token[]>;
    add_whitelist_account_ungaurded(args: {
        account_id: AccountId;
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<void>;
    add_whitelist_account_ungaurdedRaw(args: {
        account_id: AccountId;
        allowance: u32;
    }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome>;
    add_whitelist_account_ungaurdedTx(args: {
        account_id: AccountId;
        allowance: u32;
    }, options?: ChangeMethodOptions): transactions.Action;
    tokens_left(args?: {}, options?: ViewFunctionOptions): Promise<u32>;
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
/**
*
* @contractMethod view
*/
export interface CheckKey {
    args: {
        public_key: PublicKey;
    };
}
export declare type CheckKey__Result = boolean;
/**
*
* @contractMethod change
*/
export interface UpdateAllowance {
    args: {
        allowance: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateAllowance__Result = void;
/**
*
* @contractMethod view
*/
export interface Whitelisted {
    args: {
        account_id: AccountId;
    };
}
export declare type Whitelisted__Result = boolean;
/**
*
* @contractMethod view
*/
export interface GetSaleInfo {
    args: {};
}
export declare type GetSaleInfo__Result = SaleInfo;
/**
*
* @contractMethod view
*/
export interface CostPerToken {
    args: {
        minter: AccountId;
    };
}
export declare type CostPerToken__Result = U128;
/**
*
* @contractMethod change
*/
export interface TransferOwnership {
    args: {
        new_owner: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type TransferOwnership__Result = void;
/**
*
* @contractMethod view
*/
export interface NftTotalSupply {
    args: {};
}
export declare type NftTotalSupply__Result = U128;
/**
*
* @contractMethod view
*/
export interface NftTokens {
    args: {
        from_index?: U128;
        limit?: u64;
    };
}
export declare type NftTokens__Result = Token[];
/**
*
* @contractMethod view
*/
export interface NftToken {
    args: {
        token_id: TokenId;
    };
}
export declare type NftToken__Result = Token | null;
/**
*
* @contractMethod change
*/
export interface CloseContract {
    args: {};
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type CloseContract__Result = void;
/**
*
* @contractMethod change
*/
export interface NftApprove {
    args: {
        token_id: TokenId;
        account_id: AccountId;
        msg?: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftApprove__Result = void;
/**
*
* @contractMethod change
*/
export interface StartSale {
    args: {
        price?: U128;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type StartSale__Result = void;
/**
*
* @contractMethod change
*/
export interface NftMintMany {
    args: {
        num: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMintMany__Result = Token[];
/**
*
* @contractMethod change
*/
export interface UpdateUri {
    args: {
        uri: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateUri__Result = void;
/**
*
* @contractMethod change
*/
export interface MintSpecial {
    args: {};
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type MintSpecial__Result = Token[] | null;
/**
*
* @contractMethod change
*/
export interface NftTransferCall {
    args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
        msg: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransferCall__Result = void;
/**
*
* @contractMethod view
*/
export interface NftPayout {
    args: {
        token_id: string;
        balance: U128;
        max_len_payout?: u32;
    };
}
export declare type NftPayout__Result = Payout;
/**
*
* @contractMethod change
*/
export interface NftTransferPayout {
    args: {
        receiver_id: AccountId;
        token_id: string;
        approval_id?: u64;
        memo?: string;
        balance: U128;
        max_len_payout?: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransferPayout__Result = Payout;
/**
* Returns the balance associated with given key.
*
* @contractMethod view
*/
export interface GetKeyBalance {
    args: {};
}
export declare type GetKeyBalance__Result = U128;
/**
* Create a pending token that can be claimed with corresponding private key
*
* @contractMethod change
*/
export interface CreateLinkdrop {
    args: {
        public_key: PublicKey;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type CreateLinkdrop__Result = void;
/**
*
* @contractMethod change
*/
export interface NftMint {
    args: {
        num: u32;
        token_owner_id: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMint__Result = Token;
/**
*
* @contractMethod change
*/
export interface AddWhitelistAccounts {
    args: {
        accounts: AccountId[];
        allowance?: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type AddWhitelistAccounts__Result = void;
/**
*
* @contractMethod change
*/
export interface New {
    args: {
        owner_id: AccountId;
        metadata: NftContractMetadata;
        size: u32;
        sale: Sale;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type New__Result = void;
/**
*
* @contractMethod change
*/
export interface StartPresale {
    args: {
        public_sale_start?: Duration;
        presale_price?: U128;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type StartPresale__Result = void;
/**
*
* @contractMethod view
*/
export interface TokenStorageCost {
    args: {};
}
export declare type TokenStorageCost__Result = U128;
/**
*
* @contractMethod change
*/
export interface NftTransfer {
    args: {
        receiver_id: AccountId;
        token_id: TokenId;
        approval_id?: u64;
        memo?: string;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftTransfer__Result = void;
/**
*
* @contractMethod change
*/
export interface NftRevokeAll {
    args: {
        token_id: TokenId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftRevokeAll__Result = void;
/**
*
* @contractMethod view
*/
export interface CostOfLinkdrop {
    args: {
        minter: AccountId;
    };
}
export declare type CostOfLinkdrop__Result = U128;
/**
*
* @contractMethod view
*/
export interface TotalCost {
    args: {
        num: u32;
        minter: AccountId;
    };
}
export declare type TotalCost__Result = U128;
/**
*
* @contractMethod view
*/
export interface GetLinkdropContract {
    args: {};
}
export declare type GetLinkdropContract__Result = AccountId;
/**
*
* @contractMethod change
*/
export interface NewDefaultMeta {
    args: {
        owner_id: AccountId;
        metadata: InitialMetadata;
        size: u32;
        sale?: Sale;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NewDefaultMeta__Result = void;
/**
*
* @contractMethod change
*/
export interface NftRevoke {
    args: {
        token_id: TokenId;
        account_id: AccountId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftRevoke__Result = void;
/**
*
* @contractMethod view
*/
export interface NftMetadata {
    args: {};
}
export declare type NftMetadata__Result = NftContractMetadata;
/**
*
* @contractMethod view
*/
export interface NftIsApproved {
    args: {
        token_id: TokenId;
        approved_account_id: AccountId;
        approval_id?: u64;
    };
}
export declare type NftIsApproved__Result = boolean;
/**
*
* @contractMethod change
*/
export interface NftBurn {
    args: {
        token_id: TokenId;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftBurn__Result = void;
/**
*
* @contractMethod view
*/
export interface RemainingAllowance {
    args: {
        account_id: AccountId;
    };
}
export declare type RemainingAllowance__Result = u32 | null;
/**
*
* @contractMethod view
*/
export interface GetUserSaleInfo {
    args: {
        account_id: AccountId;
    };
}
export declare type GetUserSaleInfo__Result = UserSaleInfo;
/**
*
* @contractMethod view
*/
export interface Initial {
    args: {};
}
export declare type Initial__Result = u64;
/**
*
* @contractMethod view
*/
export interface NftTokensForOwner {
    args: {
        account_id: AccountId;
        from_index?: U128;
        limit?: u64;
    };
}
export declare type NftTokensForOwner__Result = Token[];
/**
*
* @contractMethod change
*/
export interface AddWhitelistAccountUngaurded {
    args: {
        account_id: AccountId;
        allowance: u32;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type AddWhitelistAccountUngaurded__Result = void;
/**
*
* @contractMethod view
*/
export interface TokensLeft {
    args: {};
}
export declare type TokensLeft__Result = u32;
/**
*
* @contractMethod view
*/
export interface NftSupplyForOwner {
    args: {
        account_id: AccountId;
    };
}
export declare type NftSupplyForOwner__Result = U128;
/**
*
* @contractMethod change
*/
export interface UpdateRoyalties {
    args: {
        royalties: Royalties;
    };
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type UpdateRoyalties__Result = void;
/**
*
* @contractMethod change
*/
export interface NftMintOne {
    args: {};
    options: {
        /** Units in gas
        * @pattern [0-9]+
        * @default "30000000000000"
        */
        gas?: string;
        /** Units in yoctoNear
        * @default 0
        */
        attachedDeposit?: Balance;
    };
}
export declare type NftMintOne__Result = Token;
