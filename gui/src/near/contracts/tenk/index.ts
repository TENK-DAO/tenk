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
  allowance?: u16;
  presale_price?: U128;
  price: U128;
  mint_rate_limit?: u16;
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
  get_linkdrop_contract(args = {}, options?: ViewFunctionOptions): Promise<AccountId> {
    return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async transfer_ownership(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.transfer_ownershipRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  transfer_ownershipRaw(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "transfer_ownership", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  transfer_ownershipTx(args: {
    new_owner: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("transfer_ownership", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async update_initial_royalties(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_initial_royaltiesRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_initial_royaltiesRaw(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_initial_royalties", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_initial_royaltiesTx(args: {
    initial_royalties: Royalties;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_initial_royalties", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async update_royalties(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_royaltiesRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_royaltiesRaw(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_royalties", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_royaltiesTx(args: {
    royalties: Royalties;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_royalties", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async update_allowance(args: {
    allowance: u16;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_allowanceRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_allowanceRaw(args: {
    allowance: u16;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_allowance", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_allowanceTx(args: {
    allowance: u16;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_allowance", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async update_uri(args: {
    uri: string;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_uriRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_uriRaw(args: {
    uri: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_uri", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  update_uriTx(args: {
    uri: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_uri", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Add whitelist accounts at a given max allowance
  * @allow ["::admins", "::owner"]
  */
  async add_whitelist_accounts(args: {
    accounts: AccountId[];
    max_allowance?: u16;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.add_whitelist_accountsRaw(args, options));
  }
  /**
  * Add whitelist accounts at a given max allowance
  * @allow ["::admins", "::owner"]
  */
  add_whitelist_accountsRaw(args: {
    accounts: AccountId[];
    max_allowance?: u16;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_whitelist_accounts", args, ...options});
  }
  /**
  * Add whitelist accounts at a given max allowance
  * @allow ["::admins", "::owner"]
  */
  add_whitelist_accountsTx(args: {
    accounts: AccountId[];
    max_allowance?: u16;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("add_whitelist_accounts", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Increases allowance for whitelist accounts
  * @allow ["::admins", "::owner"]
  */
  async update_whitelist_accounts(args: {
    accounts: AccountId[];
    allowance_increase: u16;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_whitelist_accountsRaw(args, options));
  }
  /**
  * Increases allowance for whitelist accounts
  * @allow ["::admins", "::owner"]
  */
  update_whitelist_accountsRaw(args: {
    accounts: AccountId[];
    allowance_increase: u16;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_whitelist_accounts", args, ...options});
  }
  /**
  * Increases allowance for whitelist accounts
  * @allow ["::admins", "::owner"]
  */
  update_whitelist_accountsTx(args: {
    accounts: AccountId[];
    allowance_increase: u16;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_whitelist_accounts", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * End public sale/minting, going back to the pre-presale state in which no one can mint.
  * @allow ["::admins", "::owner"]
  */
  async close_sale(args = {}, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.close_saleRaw(args, options));
  }
  /**
  * End public sale/minting, going back to the pre-presale state in which no one can mint.
  * @allow ["::admins", "::owner"]
  */
  close_saleRaw(args = {}, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "close_sale", args, ...options});
  }
  /**
  * End public sale/minting, going back to the pre-presale state in which no one can mint.
  * @allow ["::admins", "::owner"]
  */
  close_saleTx(args = {}, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("close_sale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Override the current presale start time to start presale now.
  * Most provide when public sale starts. None, means never.
  * Can provide new presale price.
  * Note: you most likely won't need to call this since the presale
  * starts automatically based on time.
  * @allow ["::admins", "::owner"]
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
  * @allow ["::admins", "::owner"]
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
  * @allow ["::admins", "::owner"]
  */
  start_presaleTx(args: {
    public_sale_start?: TimestampMs;
    presale_price?: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("start_presale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  async start_sale(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.start_saleRaw(args, options));
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  start_saleRaw(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_sale", args, ...options});
  }
  /**
  * @allow ["::admins", "::owner"]
  */
  start_saleTx(args: {
    price?: YoctoNear;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("start_sale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Add a new admin. Careful who you add!
  * @allow ["::admins", "::owner"]
  */
  async add_admin(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.add_adminRaw(args, options));
  }
  /**
  * Add a new admin. Careful who you add!
  * @allow ["::admins", "::owner"]
  */
  add_adminRaw(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_admin", args, ...options});
  }
  /**
  * Add a new admin. Careful who you add!
  * @allow ["::admins", "::owner"]
  */
  add_adminTx(args: {
    account_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("add_admin", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  async update_price(args: {
    price: U128;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_priceRaw(args, options));
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  update_priceRaw(args: {
    price: U128;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_price", args, ...options});
  }
  /**
  * Update public sale price.
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  update_priceTx(args: {
    price: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_price", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  async update_presale_price(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_presale_priceRaw(args, options));
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  update_presale_priceRaw(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_presale_price", args, ...options});
  }
  /**
  * Update the presale price
  * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
  * @allow ["::admins", "::owner"]
  */
  update_presale_priceTx(args: {
    presale_price?: U128;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_presale_price", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update the presale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  async update_presale_start(args: {
    presale_start: TimestampMs;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_presale_startRaw(args, options));
  }
  /**
  * Update the presale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  update_presale_startRaw(args: {
    presale_start: TimestampMs;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_presale_start", args, ...options});
  }
  /**
  * Update the presale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  update_presale_startTx(args: {
    presale_start: TimestampMs;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_presale_start", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Update the public sale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  async update_public_sale_start(args: {
    public_sale_start: TimestampMs;
  }, options?: ChangeMethodOptions): Promise<boolean> {
    return providers.getTransactionLastResult(await this.update_public_sale_startRaw(args, options));
  }
  /**
  * Update the public sale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  update_public_sale_startRaw(args: {
    public_sale_start: TimestampMs;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_public_sale_start", args, ...options});
  }
  /**
  * Update the public sale start
  * Careful this is in ms since 1970
  * @allow ["::admins", "::owner"]
  */
  update_public_sale_startTx(args: {
    public_sale_start: TimestampMs;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("update_public_sale_start", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  * @allow ["::admins", "::owner"]
  */
  async create_linkdrop(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.create_linkdropRaw(args, options));
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  * @allow ["::admins", "::owner"]
  */
  create_linkdropRaw(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "create_linkdrop", args, ...options});
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  * @allow ["::admins", "::owner"]
  */
  create_linkdropTx(args: {
    public_key: PublicKey;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("create_linkdrop", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_payout(args: {
    token_id: string;
    balance: U128;
    max_len_payout?: u32;
  }, options?: ViewFunctionOptions): Promise<Payout> {
    return this.account.viewFunction(this.contractId, "nft_payout", args, options);
  }
  async nft_transfer_payout(args: {
    receiver_id: AccountId;
    token_id: string;
    approval_id?: u64;
    memo?: string;
    balance: U128;
    max_len_payout?: u32;
  }, options?: ChangeMethodOptions): Promise<Payout> {
    return providers.getTransactionLastResult(await this.nft_transfer_payoutRaw(args, options));
  }
  nft_transfer_payoutRaw(args: {
    receiver_id: AccountId;
    token_id: string;
    approval_id?: u64;
    memo?: string;
    balance: U128;
    max_len_payout?: u32;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_payout", args, ...options});
  }
  nft_transfer_payoutTx(args: {
    receiver_id: AccountId;
    token_id: string;
    approval_id?: u64;
    memo?: string;
    balance: U128;
    max_len_payout?: u32;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_transfer_payout", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  async nft_transfer(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transferRaw(args, options));
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  nft_transferRaw(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer", args, ...options});
  }
  /**
  * Simple transfer. Transfer a given `token_id` from current owner to
  * `receiver_id`.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * `approval_id` is for use with Approval Management,
  * see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * * TODO: needed? Both accounts must be registered with the contract for transfer to
  * succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token
  * * `token_id`: the token to transfer
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer
  */
  nft_transferTx(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_transfer", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  async nft_transfer_call(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transfer_callRaw(args, options));
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  nft_transfer_callRaw(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_call", args, ...options});
  }
  /**
  * Transfer token and call a method on a receiver contract. A successful
  * workflow will end in a success execution outcome to the callback on the NFT
  * contract at the method `nft_resolve_transfer`.
  * 
  * You can think of this as being similar to attaching native NEAR tokens to a
  * function call. It allows you to attach any Non-Fungible Token in a call to a
  * receiver contract.
  * 
  * Requirements:
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * Contract MUST panic if called by someone other than token owner or,
  * if using Approval Management, one of the approved accounts
  * * The receiving contract must implement `ft_on_transfer` according to the
  * standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
  * with the resulting failed cross-contract call and roll back the transfer.
  * * Contract MUST implement the behavior described in `ft_resolve_transfer`
  * * `approval_id` is for use with Approval Management extension, see
  * that document for full explanation.
  * * If using Approval Management, contract MUST nullify approved accounts on
  * successful transfer.
  * 
  * Arguments:
  * * `receiver_id`: the valid NEAR account receiving the token.
  * * `token_id`: the token to send.
  * * `approval_id`: expected approval ID. A number smaller than
  * 2^53, and therefore representable as JSON. See Approval Management
  * standard for full explanation.
  * * `memo` (optional): for use cases that may benefit from indexing or
  * providing information for a transfer.
  * * `msg`: specifies information needed by the receiving contract in
  * order to properly handle the transfer. Can indicate both a function to
  * call and the parameters to pass to that function.
  */
  nft_transfer_callTx(args: {
    receiver_id: AccountId;
    token_id: TokenId;
    approval_id?: u64;
    memo?: string;
    msg: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_transfer_call", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the token with the given `token_id` or `null` if no such token.
  */
  nft_token(args: {
    token_id: TokenId;
  }, options?: ViewFunctionOptions): Promise<Token | null> {
    return this.account.viewFunction(this.contractId, "nft_token", args, options);
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  async nft_approve(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_approveRaw(args, options));
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  nft_approveRaw(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_approve", args, ...options});
  }
  /**
  * Add an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
  * security purposes
  * * Contract MAY require caller to attach larger deposit, to cover cost of
  * storing approver data
  * * Contract MUST panic if called by someone other than token owner
  * * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
  * single-block gas limit
  * * Contract MUST increment approval ID even if re-approving an account
  * * If successfully approved or if had already been approved, and if `msg` is
  * present, contract MUST call `nft_on_approve` on `account_id`. See
  * `nft_on_approve` description below for details.
  * 
  * Arguments:
  * * `token_id`: the token for which to add an approval
  * * `account_id`: the account to add to `approvals`
  * * `msg`: optional string to be passed to `nft_on_approve`
  * 
  * Returns void, if no `msg` given. Otherwise, returns promise call to
  * `nft_on_approve`, which can resolve with whatever it wants.
  */
  nft_approveTx(args: {
    token_id: TokenId;
    account_id: AccountId;
    msg?: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_approve", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  async nft_revoke(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revokeRaw(args, options));
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  nft_revokeRaw(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke", args, ...options});
  }
  /**
  * Revoke an approved account for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund associated storage deposit when owner revokes approval
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `account_id`: the account to remove from `approvals`
  */
  nft_revokeTx(args: {
    token_id: TokenId;
    account_id: AccountId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_revoke", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  async nft_revoke_all(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revoke_allRaw(args, options));
  }
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  nft_revoke_allRaw(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke_all", args, ...options});
  }
  /**
  * Revoke all approved accounts for a specific token.
  * 
  * Requirements
  * * Caller of the method must attach a deposit of 1 yoctoⓃ for security
  * purposes
  * * If contract requires >1yN deposit on `nft_approve`, contract
  * MUST refund all associated storage deposit when owner revokes approvals
  * * Contract MUST panic if called by someone other than token owner
  * 
  * Arguments:
  * * `token_id`: the token with approvals to revoke
  */
  nft_revoke_allTx(args: {
    token_id: TokenId;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_revoke_all", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Check if a token is approved for transfer by a given account, optionally
  * checking an approval_id
  * 
  * Arguments:
  * * `token_id`: the token for which to revoke an approval
  * * `approved_account_id`: the account to check the existence of in `approvals`
  * * `approval_id`: an optional approval ID to check against current approval ID for given account
  * 
  * Returns:
  * if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
  * otherwise, `true` if `approved_account_id` is in list of approved accounts
  */
  nft_is_approved(args: {
    token_id: TokenId;
    approved_account_id: AccountId;
    approval_id?: u64;
  }, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "nft_is_approved", args, options);
  }
  /**
  * Returns the total supply of non-fungible tokens as a string representing an
  * unsigned 128-bit integer to avoid JSON number limit of 2^53.
  */
  nft_total_supply(args = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_total_supply", args, options);
  }
  /**
  * Get a list of all tokens
  * 
  * Arguments:
  * * `from_index`: a string representing an unsigned 128-bit integer,
  * representing the starting index of tokens to return. (default 0)
  * * `limit`: the maximum number of tokens to return (default total supply)
  * Could fail on gas
  * 
  * Returns an array of Token objects, as described in Core standard
  */
  nft_tokens(args: {
    from_index?: U128;
    limit?: u64;
  }, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens", args, options);
  }
  /**
  * Get number of tokens owned by a given account
  * 
  * Arguments:
  * * `account_id`: a valid NEAR account
  * 
  * Returns the number of non-fungible tokens owned by given `account_id` as
  * a string representing the value as an unsigned 128-bit integer to avoid JSON
  * number limit of 2^53.
  */
  nft_supply_for_owner(args: {
    account_id: AccountId;
  }, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_supply_for_owner", args, options);
  }
  /**
  * Get list of all tokens owned by a given account
  * 
  * Arguments:
  * * `account_id`: a valid NEAR account
  * * `from_index`: a string representing an unsigned 128-bit integer,
  * representing the starting index of tokens to return. (default 0)
  * * `limit`: the maximum number of tokens to return. (default unlimited)
  * Could fail on gas
  * 
  * Returns a paginated list of all tokens owned by this account
  */
  nft_tokens_for_owner(args: {
    account_id: AccountId;
    from_index?: U128;
    limit?: u64;
  }, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens_for_owner", args, options);
  }
  /**
  * Current contract owner
  */
  owner(args = {}, options?: ViewFunctionOptions): Promise<AccountId> {
    return this.account.viewFunction(this.contractId, "owner", args, options);
  }
  /**
  * Current set of admins
  */
  admins(args = {}, options?: ViewFunctionOptions): Promise<AccountId[]> {
    return this.account.viewFunction(this.contractId, "admins", args, options);
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
    num: u16;
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
    new_max: u16;
  }, options?: ViewFunctionOptions): Promise<u16 | null> {
    return this.account.viewFunction(this.contractId, "remaining_allowance", args, options);
  }
  /**
  * Max number of mints in one transaction. None, means unlimited
  */
  mint_rate_limit(args = {}, options?: ViewFunctionOptions): Promise<u16 | null> {
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
  async new_default_meta(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
    media_extension?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.new_default_metaRaw(args, options));
  }
  new_default_metaRaw(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
    media_extension?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new_default_meta", args, ...options});
  }
  new_default_metaTx(args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
    media_extension?: string;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("new_default_meta", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async new(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
    media_extension?: string;
  }, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
    media_extension?: string;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new", args, ...options});
  }
  newTx(args: {
    owner_id: AccountId;
    metadata: NftContractMetadata;
    size: u32;
    sale: Sale;
    media_extension?: string;
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
    num: u16;
  }, options?: ChangeMethodOptions): Promise<Token[]> {
    return providers.getTransactionLastResult(await this.nft_mint_manyRaw(args, options));
  }
  nft_mint_manyRaw(args: {
    num: u16;
  }, options?: ChangeMethodOptions): Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_many", args, ...options});
  }
  nft_mint_manyTx(args: {
    num: u16;
  }, options?: ChangeMethodOptions): transactions.Action {
    return transactions.functionCall("nft_mint_many", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
}
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
* @contractMethod view
*/
export interface GetLinkdropContract {
  args: {};
  
}
export type GetLinkdropContract__Result = AccountId;
/**
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface UpdateAllowance {
  args: {
    allowance: u16;
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
* @allow ["::admins", "::owner"]
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
* Add whitelist accounts at a given max allowance
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface AddWhitelistAccounts {
  args: {
    accounts: AccountId[];
    max_allowance?: u16;
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
* Increases allowance for whitelist accounts
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface UpdateWhitelistAccounts {
  args: {
    accounts: AccountId[];
    allowance_increase: u16;
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
* End public sale/minting, going back to the pre-presale state in which no one can mint.
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface CloseSale {
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
export type CloseSale__Result = boolean;
/**
* Override the current presale start time to start presale now.
* Most provide when public sale starts. None, means never.
* Can provide new presale price.
* Note: you most likely won't need to call this since the presale
* starts automatically based on time.
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* @allow ["::admins", "::owner"]
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
* Update the presale start
* Careful this is in ms since 1970
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface UpdatePresaleStart {
  args: {
    presale_start: TimestampMs;
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
export type UpdatePresaleStart__Result = boolean;
/**
* Update the public sale start
* Careful this is in ms since 1970
* @allow ["::admins", "::owner"]
* 
* @contractMethod change
*/
export interface UpdatePublicSaleStart {
  args: {
    public_sale_start: TimestampMs;
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
export type UpdatePublicSaleStart__Result = boolean;
/**
* Create a pending token that can be claimed with corresponding private key
* @allow ["::admins", "::owner"]
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
export type NftPayout__Result = Payout;
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftTransferPayout__Result = Payout;
/**
* Simple transfer. Transfer a given `token_id` from current owner to
* `receiver_id`.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * `approval_id` is for use with Approval Management,
* see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
* * TODO: needed? Both accounts must be registered with the contract for transfer to
* succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
* 
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token
* * `token_id`: the token to transfer
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftTransfer__Result = void;
/**
* Transfer token and call a method on a receiver contract. A successful
* workflow will end in a success execution outcome to the callback on the NFT
* contract at the method `nft_resolve_transfer`.
* 
* You can think of this as being similar to attaching native NEAR tokens to a
* function call. It allows you to attach any Non-Fungible Token in a call to a
* receiver contract.
* 
* Requirements:
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * Contract MUST panic if called by someone other than token owner or,
* if using Approval Management, one of the approved accounts
* * The receiving contract must implement `ft_on_transfer` according to the
* standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
* with the resulting failed cross-contract call and roll back the transfer.
* * Contract MUST implement the behavior described in `ft_resolve_transfer`
* * `approval_id` is for use with Approval Management extension, see
* that document for full explanation.
* * If using Approval Management, contract MUST nullify approved accounts on
* successful transfer.
* 
* Arguments:
* * `receiver_id`: the valid NEAR account receiving the token.
* * `token_id`: the token to send.
* * `approval_id`: expected approval ID. A number smaller than
* 2^53, and therefore representable as JSON. See Approval Management
* standard for full explanation.
* * `memo` (optional): for use cases that may benefit from indexing or
* providing information for a transfer.
* * `msg`: specifies information needed by the receiving contract in
* order to properly handle the transfer. Can indicate both a function to
* call and the parameters to pass to that function.
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftTransferCall__Result = void;
/**
* Returns the token with the given `token_id` or `null` if no such token.
* 
* @contractMethod view
*/
export interface NftToken {
  args: {
    token_id: TokenId;
  };
  
}
export type NftToken__Result = Token | null;
/**
* Add an approved account for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
* security purposes
* * Contract MAY require caller to attach larger deposit, to cover cost of
* storing approver data
* * Contract MUST panic if called by someone other than token owner
* * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
* single-block gas limit
* * Contract MUST increment approval ID even if re-approving an account
* * If successfully approved or if had already been approved, and if `msg` is
* present, contract MUST call `nft_on_approve` on `account_id`. See
* `nft_on_approve` description below for details.
* 
* Arguments:
* * `token_id`: the token for which to add an approval
* * `account_id`: the account to add to `approvals`
* * `msg`: optional string to be passed to `nft_on_approve`
* 
* Returns void, if no `msg` given. Otherwise, returns promise call to
* `nft_on_approve`, which can resolve with whatever it wants.
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftApprove__Result = void;
/**
* Revoke an approved account for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund associated storage deposit when owner revokes approval
* * Contract MUST panic if called by someone other than token owner
* 
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `account_id`: the account to remove from `approvals`
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftRevoke__Result = void;
/**
* Revoke all approved accounts for a specific token.
* 
* Requirements
* * Caller of the method must attach a deposit of 1 yoctoⓃ for security
* purposes
* * If contract requires >1yN deposit on `nft_approve`, contract
* MUST refund all associated storage deposit when owner revokes approvals
* * Contract MUST panic if called by someone other than token owner
* 
* Arguments:
* * `token_id`: the token with approvals to revoke
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
    * @default "0"
    */
    attachedDeposit?: Balance;
  }
  
}
export type NftRevokeAll__Result = void;
/**
* Check if a token is approved for transfer by a given account, optionally
* checking an approval_id
* 
* Arguments:
* * `token_id`: the token for which to revoke an approval
* * `approved_account_id`: the account to check the existence of in `approvals`
* * `approval_id`: an optional approval ID to check against current approval ID for given account
* 
* Returns:
* if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
* otherwise, `true` if `approved_account_id` is in list of approved accounts
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
export type NftIsApproved__Result = boolean;
/**
* Returns the total supply of non-fungible tokens as a string representing an
* unsigned 128-bit integer to avoid JSON number limit of 2^53.
* 
* @contractMethod view
*/
export interface NftTotalSupply {
  args: {};
  
}
export type NftTotalSupply__Result = U128;
/**
* Get a list of all tokens
* 
* Arguments:
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return (default total supply)
* Could fail on gas
* 
* Returns an array of Token objects, as described in Core standard
* 
* @contractMethod view
*/
export interface NftTokens {
  args: {
    from_index?: U128;
    limit?: u64;
  };
  
}
export type NftTokens__Result = Token[];
/**
* Get number of tokens owned by a given account
* 
* Arguments:
* * `account_id`: a valid NEAR account
* 
* Returns the number of non-fungible tokens owned by given `account_id` as
* a string representing the value as an unsigned 128-bit integer to avoid JSON
* number limit of 2^53.
* 
* @contractMethod view
*/
export interface NftSupplyForOwner {
  args: {
    account_id: AccountId;
  };
  
}
export type NftSupplyForOwner__Result = U128;
/**
* Get list of all tokens owned by a given account
* 
* Arguments:
* * `account_id`: a valid NEAR account
* * `from_index`: a string representing an unsigned 128-bit integer,
* representing the starting index of tokens to return. (default 0)
* * `limit`: the maximum number of tokens to return. (default unlimited)
* Could fail on gas
* 
* Returns a paginated list of all tokens owned by this account
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
export type NftTokensForOwner__Result = Token[];
/**
* Current contract owner
* 
* @contractMethod view
*/
export interface Owner {
  args: {};
  
}
export type Owner__Result = AccountId;
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
    num: u16;
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
    new_max: u16;
  };
  
}
export type RemainingAllowance__Result = u16 | null;
/**
* Max number of mints in one transaction. None, means unlimited
* 
* @contractMethod view
*/
export interface MintRateLimit {
  args: {};
  
}
export type MintRateLimit__Result = u16 | null;
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
* 
* @contractMethod change
*/
export interface NewDefaultMeta {
  args: {
    owner_id: AccountId;
    metadata: InitialMetadata;
    size: u32;
    sale?: Sale;
    media_extension?: string;
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
    media_extension?: string;
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
    num: u16;
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
