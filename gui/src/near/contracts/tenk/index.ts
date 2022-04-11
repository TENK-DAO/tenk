import {
  Account,
  transactions,
  providers,
  DEFAULT_FUNCTION_CALL_GAS,
  u8,
  i8,
  u16,
  i16,
  u32,
  i32,
  u64,
  i64,
  f32,
  f64,
  BN,
  ChangeMethodOptions,
  ViewFunctionOptions,
} from './helper';

/**
* milliseconds elapsed since the UNIX epoch
*/
export type TimestampMs = u64;
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
export type BasisPoint = u16;
export interface Royalties {
  accounts: Record<AccountId, BasisPoint>;
  percent: BasisPoint;
}
/**
* String of yocto NEAR; 1N = 1000000000000000000000000 yN
*/
export type YoctoNear = U128;
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
  allowance?: u32;
  presale_price?: U128;
  price: U128;
  mint_rate_limit?: u32;
}
/**
* Current state of contract
*/
export enum Status {
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
  SoldOut = "SoldOut",
}
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
  sale_info: SaleInfo;
  is_vip: boolean;
  remaining_allowance?: u32;
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
* StorageUsage is used to count the amount of storage used by a contract.
*/
export type StorageUsage = u64;
/**
* Balance is a type for storing amounts of tokens, specified in yoctoNEAR.
*/
export type Balance = U128;
/**
* Represents the amount of NEAR tokens in "gas units" which are used to fund transactions.
*/
export type Gas = u64;
/**
* base64 string.
*/
export type Base64VecU8 = string;
/**
* Raw type for duration in nanoseconds
*/
export type Duration = u64;
/**
* @minLength 2
* @maxLength 64
* @pattern ^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$
*/
export type AccountId = string;
/**
* String representation of a u128-bit integer
* @pattern ^[0-9]+$
*/
export type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
* 
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export type PublicKey = string;
/**
* Raw type for timestamp in nanoseconds
*/
export type Timestamp = u64;
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
export type TokenId = string;
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
export type WrappedDuration = string;

export class Contract {
  
  constructor(public account: Account, public readonly contractId: string){}
  
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  async create_linkdrop(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.create_linkdropRaw(args, options));
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  create_linkdropRaw(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "create_linkdrop", args, ...options});
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  create_linkdropTx(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("create_linkdrop", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Allows given public key to claim sent balance.
  * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
  * Claim tokens for specific account that are attached to the public key this tx is signed with.
  */
  async claim(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.claimRaw(args, options));
  }
  /**
  * Allows given public key to claim sent balance.
  * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
  * Claim tokens for specific account that are attached to the public key this tx is signed with.
  */
  claimRaw(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "claim", args, ...options});
  }
  /**
  * Allows given public key to claim sent balance.
  * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
  * Claim tokens for specific account that are attached to the public key this tx is signed with.
  */
  claimTx(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("claim", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Create new account and and claim tokens to it.
  */
  async create_account_and_claim(args: {
    new_account_id: AccountId;
    new_public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.create_account_and_claimRaw(args, options));
  }
  /**
  * Create new account and and claim tokens to it.
  */
  create_account_and_claimRaw(args: {
    new_account_id: AccountId;
    new_public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "create_account_and_claim", args, ...options});
  }
  /**
  * Create new account and and claim tokens to it.
  */
  create_account_and_claimTx(args: {
    new_account_id: AccountId;
    new_public_key: PublicKey;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("create_account_and_claim", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the balance associated with given key.
  */
  get_key_balance(args = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "get_key_balance", args, options);
  }
  check_key(args: {
    public_key: PublicKey;
  }, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "check_key", args, options);
  }
  async on_create_and_claim(args: {
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.on_create_and_claimRaw(args, options));
  }
  on_create_and_claimRaw(args: {
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "on_create_and_claim", args, ...options});
  }
  on_create_and_claimTx(args: {
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("on_create_and_claim", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  get_linkdrop_contract(args = {}, options?: ViewFunctionOptions): Promise<AccountId> {
    return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
  }
  async transfer_ownership(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.transfer_ownershipRaw(args, options));
  }
  transfer_ownershipRaw(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "transfer_ownership", args, ...options});
  }
  transfer_ownershipTx(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("transfer_ownership", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_initial_royalties(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_initial_royaltiesRaw(args, options));
  }
  update_initial_royaltiesRaw(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_initial_royalties", args, ...options});
  }
  update_initial_royaltiesTx(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_initial_royalties", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_royalties(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_royaltiesRaw(args, options));
  }
  update_royaltiesRaw(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_royalties", args, ...options});
  }
  update_royaltiesTx(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_royalties", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_allowance(args: {
    allowance: u32;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_allowanceRaw(args, options));
  }
  update_allowanceRaw(args: {
    allowance: u32;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_allowance", args, ...options});
  }
  update_allowanceTx(args: {
    allowance: u32;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_allowance", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_uri(args: {
    uri: string;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_uriRaw(args, options));
  }
  update_uriRaw(args: {
    uri: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_uri", args, ...options});
  }
  update_uriTx(args: {
    uri: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_uri", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async add_whitelist_accounts(args: {
    accounts: AccountId[];
    allowance?: u32;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.add_whitelist_accountsRaw(args, options));
  }
  add_whitelist_accountsRaw(args: {
    accounts: AccountId[];
    allowance?: u32;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_whitelist_accounts", args, ...options});
  }
  add_whitelist_accountsTx(args: {
    accounts: AccountId[];
    allowance?: u32;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("add_whitelist_accounts", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_whitelist_accounts(args: {
    accounts: AccountId[];
    allowance_increase: u32;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_whitelist_accountsRaw(args, options));
  }
  update_whitelist_accountsRaw(args: {
    accounts: AccountId[];
    allowance_increase: u32;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_whitelist_accounts", args, ...options});
  }
  update_whitelist_accountsTx(args: {
    accounts: AccountId[];
    allowance_increase: u32;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_whitelist_accounts", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Contract wwill
  */
  async close_contract(args = {}, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.close_contractRaw(args, options));
  }
  /**
  * Contract wwill
  */
  close_contractRaw(args = {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "close_contract", args, ...options});
  }
  /**
  * Contract wwill
  */
  close_contractTx(args = {}, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("close_contract", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Override the current presale start time to start presale now.
  * Most provide when public sale starts. None, means never.
  * Can provide new presale price.
  * Note: you most likely won't need to call this since the presale
  * starts automatically based on time.
  */
  async start_presale(args: {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.start_presaleRaw(args, options));
  }
  /**
  * Override the current presale start time to start presale now.
  * Most provide when public sale starts. None, means never.
  * Can provide new presale price.
  * Note: you most likely won't need to call this since the presale
  * starts automatically based on time.
  */
  start_presaleRaw(args: {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_presale", args, ...options});
  }
  /**
  * Override the current presale start time to start presale now.
  * Most provide when public sale starts. None, means never.
  * Can provide new presale price.
  * Note: you most likely won't need to call this since the presale
  * starts automatically based on time.
  */
  start_presaleTx(args: {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("start_presale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async start_sale(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.start_saleRaw(args, options));
  }
  start_saleRaw(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_sale", args, ...options});
  }
  start_saleTx(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("start_sale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Add a new admin. Careful who you add!
  */
  async add_admin(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.add_adminRaw(args, options));
  }
  /**
  * Add a new admin. Careful who you add!
  */
  add_adminRaw(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_admin", args, ...options});
  }
  /**
  * Add a new admin. Careful who you add!
  */
  add_adminTx(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("add_admin", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  async update_price(args: {
    price: U128;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_priceRaw(args, options));
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  update_priceRaw(args: {
    price: U128;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_price", args, ...options});
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  update_priceTx(args: {
    price: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_price", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  async update_presale_price(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_presale_priceRaw(args, options));
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  update_presale_priceRaw(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_presale_price", args, ...options});
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  */
  update_presale_priceTx(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_presale_price", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Check whether an account is allowed to mint during the presale
  */
  whitelisted(args: {
    account_id: AccountId;
  }, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "whitelisted", args, options);
  }
  /**
  * Cost of NFT + fees for linkdrop
  */
  cost_of_linkdrop(args: {
    minter: AccountId;
  }, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_of_linkdrop", args, options);
  }
  total_cost(args: {
    num: u32;
    minter: AccountId;
  }, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "total_cost", args, options);
  }
  /**
  * Flat cost of one token
  */
  cost_per_token(args: {
    minter: AccountId;
  }, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_per_token", args, options);
  }
  /**
  * Current cost in NEAR to store one NFT
  */
  token_storage_cost(args = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "token_storage_cost", args, options);
  }
  /**
  * Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
  */
  tokens_left(args = {}, options?: ViewFunctionOptions): Promise<u32> {
    return this.account.viewFunction(this.contractId, "tokens_left", args, options);
  }
  /**
  * Part of the NFT metadata standard. Returns the contract's metadata
  */
  nft_metadata(args = {}, options?: ViewFunctionOptions): Promise<NftContractMetadata> {
    return this.account.viewFunction(this.contractId, "nft_metadata", args, options);
  }
  /**
  * How many tokens an account is still allowed to mint. None, means unlimited
  */
  remaining_allowance(args: {
    account_id: AccountId;
  }, options?: ViewFunctionOptions): Promise<u32 | null> {
    return this.account.viewFunction(this.contractId, "remaining_allowance", args, options);
  }
  /**
  * Max number of mints in one transaction. None, means unlimited
  */
  mint_rate_limit(args = {}, options?: ViewFunctionOptions): Promise<u32 | null> {
    return this.account.viewFunction(this.contractId, "mint_rate_limit", args, options);
  }
  /**
  * Information about the current sale. When in starts, status, price, and how many could be minted.
  */
  get_sale_info(args = {}, options?: ViewFunctionOptions): Promise<SaleInfo> {
    return this.account.viewFunction(this.contractId, "get_sale_info", args, options);
  }
  /**
  * Information about a current user. Whether they are VIP and how many tokens left in their allowance.
  */
  get_user_sale_info(args: {
    account_id: AccountId;
  }, options?: ViewFunctionOptions): Promise<UserSaleInfo> {
    return this.account.viewFunction(this.contractId, "get_user_sale_info", args, options);
  }
  /**
  * Initial size of collection. Number left to raffle + current total supply
  */
  initial(args = {}, options?: ViewFunctionOptions): Promise<u64> {
    return this.account.viewFunction(this.contractId, "initial", args, options);
  }
  /**
  * Current set of admins
  */
  admins(args = {}, options?: ViewFunctionOptions): Promise<AccountId[]> {
    return this.account.viewFunction(this.contractId, "admins", args, options);
  }
  async new_default_meta(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.new_default_metaRaw(args, options));
  }
  new_default_metaRaw(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new_default_meta", args, ...options});
  }
  new_default_metaTx(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("new_default_meta", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async new(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new", args, ...options});
  }
  newTx(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("new", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_mint(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mintRaw(args, options));
  }
  nft_mintRaw(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint", args, ...options});
  }
  nft_mintTx(args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_mint_one(args = {}, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mint_oneRaw(args, options));
  }
  nft_mint_oneRaw(args = {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_one", args, ...options});
  }
  nft_mint_oneTx(args = {}, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint_one", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_mint_many(args: {
    num: u32;
  }, options?: ChangeMethodOptions): Promise<Token[]> {
    return providers.getTransactionLastResult(await this.nft_mint_manyRaw(args, options));
  }
  nft_mint_manyRaw(args: {
    num: u32;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_many", args, ...options});
  }
  nft_mint_manyTx(args: {
    num: u32;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint_many", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async on_send_with_callback(args = {}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.on_send_with_callbackRaw(args, options));
  }
  on_send_with_callbackRaw(args = {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "on_send_with_callback", args, ...options});
  }
  on_send_with_callbackTx(args = {}, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("on_send_with_callback", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async link_callback(args: {
    account_id: AccountId;
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.link_callbackRaw(args, options));
  }
  link_callbackRaw(args: {
    account_id: AccountId;
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "link_callback", args, ...options});
  }
  link_callbackTx(args: {
    account_id: AccountId;
    mint_for_free: boolean;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("link_callback", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
}
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type CreateLinkdrop__Result = void;
/**
* Allows given public key to claim sent balance.
* Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
* Claim tokens for specific account that are attached to the public key this tx is signed with.
* 
* @contractMethod change
*/
export interface Claim {
  args: {
    account_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type Claim__Result = void;
/**
* Create new account and and claim tokens to it.
* 
* @contractMethod change
*/
export interface CreateAccountAndClaim {
  args: {
    new_account_id: AccountId;
    new_public_key: PublicKey;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type CreateAccountAndClaim__Result = void;
/**
* Returns the balance associated with given key.
* 
* @contractMethod view
*/
export interface GetKeyBalance {
  args: {};
  
}
export type GetKeyBalance__Result = U128;
/**
* 
* @contractMethod view
*/
export interface CheckKey {
  args: {
    public_key: PublicKey;
  };
  
}
export type CheckKey__Result = boolean;
/**
* 
* @contractMethod change
*/
export interface OnCreateAndClaim {
  args: {
    mint_for_free: boolean;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type OnCreateAndClaim__Result = void;
/**
* 
* @contractMethod view
*/
export interface GetLinkdropContract {
  args: {};
  
}
export type GetLinkdropContract__Result = AccountId;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type TransferOwnership__Result = boolean;
/**
* 
* @contractMethod change
*/
export interface UpdateInitialRoyalties {
  args: {
    initial_royalties: Royalties;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdateInitialRoyalties__Result = boolean;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdateRoyalties__Result = boolean;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdateAllowance__Result = boolean;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdateUri__Result = boolean;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type AddWhitelistAccounts__Result = boolean;
/**
* 
* @contractMethod change
*/
export interface UpdateWhitelistAccounts {
  args: {
    accounts: AccountId[];
    allowance_increase: u32;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdateWhitelistAccounts__Result = boolean;
/**
* Contract wwill
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type CloseContract__Result = boolean;
/**
* Override the current presale start time to start presale now.
* Most provide when public sale starts. None, means never.
* Can provide new presale price.
* Note: you most likely won't need to call this since the presale
* starts automatically based on time.
* 
* @contractMethod change
*/
export interface StartPresale {
  args: {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type StartPresale__Result = boolean;
/**
* 
* @contractMethod change
*/
export interface StartSale {
  args: {
    price?: YoctoNear;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type StartSale__Result = boolean;
/**
* Add a new admin. Careful who you add!
* 
* @contractMethod change
*/
export interface AddAdmin {
  args: {
    account_id: AccountId;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type AddAdmin__Result = boolean;
/**
* Update public sale price.
* Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
* 
* @contractMethod change
*/
export interface UpdatePrice {
  args: {
    price: U128;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdatePrice__Result = boolean;
/**
* Update the presale price
* Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
* 
* @contractMethod change
*/
export interface UpdatePresalePrice {
  args: {
    presale_price?: U128;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type UpdatePresalePrice__Result = boolean;
/**
* Check whether an account is allowed to mint during the presale
* 
* @contractMethod view
*/
export interface Whitelisted {
  args: {
    account_id: AccountId;
  };
  
}
export type Whitelisted__Result = boolean;
/**
* Cost of NFT + fees for linkdrop
* 
* @contractMethod view
*/
export interface CostOfLinkdrop {
  args: {
    minter: AccountId;
  };
  
}
export type CostOfLinkdrop__Result = U128;
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
export type TotalCost__Result = U128;
/**
* Flat cost of one token
* 
* @contractMethod view
*/
export interface CostPerToken {
  args: {
    minter: AccountId;
  };
  
}
export type CostPerToken__Result = U128;
/**
* Current cost in NEAR to store one NFT
* 
* @contractMethod view
*/
export interface TokenStorageCost {
  args: {};
  
}
export type TokenStorageCost__Result = U128;
/**
* Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
* 
* @contractMethod view
*/
export interface TokensLeft {
  args: {};
  
}
export type TokensLeft__Result = u32;
/**
* Part of the NFT metadata standard. Returns the contract's metadata
* 
* @contractMethod view
*/
export interface NftMetadata {
  args: {};
  
}
export type NftMetadata__Result = NftContractMetadata;
/**
* How many tokens an account is still allowed to mint. None, means unlimited
* 
* @contractMethod view
*/
export interface RemainingAllowance {
  args: {
    account_id: AccountId;
  };
  
}
export type RemainingAllowance__Result = u32 | null;
/**
* Max number of mints in one transaction. None, means unlimited
* 
* @contractMethod view
*/
export interface MintRateLimit {
  args: {};
  
}
export type MintRateLimit__Result = u32 | null;
/**
* Information about the current sale. When in starts, status, price, and how many could be minted.
* 
* @contractMethod view
*/
export interface GetSaleInfo {
  args: {};
  
}
export type GetSaleInfo__Result = SaleInfo;
/**
* Information about a current user. Whether they are VIP and how many tokens left in their allowance.
* 
* @contractMethod view
*/
export interface GetUserSaleInfo {
  args: {
    account_id: AccountId;
  };
  
}
export type GetUserSaleInfo__Result = UserSaleInfo;
/**
* Initial size of collection. Number left to raffle + current total supply
* 
* @contractMethod view
*/
export interface Initial {
  args: {};
  
}
export type Initial__Result = u64;
/**
* Current set of admins
* 
* @contractMethod view
*/
export interface Admins {
  args: {};
  
}
export type Admins__Result = AccountId[];
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NewDefaultMeta__Result = void;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type New__Result = void;
/**
* 
* @contractMethod change
*/
export interface NftMint {
  args: {
    token_id: TokenId;
    token_owner_id: AccountId;
    token_metadata: TokenMetadata;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMint__Result = Token;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMintOne__Result = Token;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftMintMany__Result = Token[];
/**
* 
* @contractMethod change
*/
export interface OnSendWithCallback {
  args: {};
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type OnSendWithCallback__Result = void;
/**
* 
* @contractMethod change
*/
export interface LinkCallback {
  args: {
    account_id: AccountId;
    mint_for_free: boolean;
  };
  options: {
    /** Units in gas
    * @pattern [0-9]+
    * @default "30000000000000"
    */
    gas?: string;
    /** Units in yoctoNear
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type LinkCallback__Result = Token;
