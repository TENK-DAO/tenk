import { Account, transactions, providers, DEFAULT_FUNCTION_CALL_GAS } from 'near-api-js';


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
type u64 = number;
/** 64 bit signed integer less than 2^53 -1 */
type i64 = number;
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
export type U128 = string;
/**
* Public key in a binary format with base58 string serialization with human-readable curve.
* The key types currently supported are `secp256k1` and `ed25519`.
* 
* Ed25519 public keys accepted are 32 bytes and secp256k1 keys are the uncompressed 64 format.
*/
export type PublicKey = string;
export type AccountId = string;
/**
* Raw type for timestamp in nanoseconds
*/
export type Timestamp = u64;
export interface StorageBalanceBounds {
  min: U128,
  max?: U128,
}
export interface FungibleTokenMetadata {
  spec: string,
  name: string,
  symbol: string,
  icon?: string,
  reference?: string,
  reference_hash?: Base64VecU8,
  decimals: number,
}
/**
* In this implementation, the Token struct takes two extensions standards (metadata and approval) as optional fields, as they are frequently used in modern NFTs.
*/
export interface Token {
  token_id: TokenId,
  owner_id: AccountId,
  metadata?: TokenMetadata,
  approved_account_ids?: Record<AccountId, u64>,
}
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export type TokenId = string;
export interface StorageBalance {
  total: U128,
  available: U128,
}
export type WrappedDuration = string;
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
  title?: string,
  description?: string,
  media?: string,
  media_hash?: Base64VecU8,
  copies?: u64,
  issued_at?: string,
  expires_at?: string,
  starts_at?: string,
  updated_at?: string,
  extra?: string,
  reference?: string,
  reference_hash?: Base64VecU8,
}
/**
* Metadata for the NFT contract itself.
*/
export interface NftContractMetadata {
  spec: string,
  name: string,
  symbol: string,
  icon?: string,
  base_uri?: string,
  reference?: string,
  reference_hash?: Base64VecU8,
}
/**
* Current state of contract
*/
export enum Status {
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
  SoldOut = 3,
}
export interface InitialMetadata {
  name: string,
  symbol: string,
  uri: string,
  icon?: string,
  spec?: string,
  reference?: string,
  reference_hash?: Base64VecU8,
}
/**
* Information about the current sale
*/
export interface SaleInfo {
  /**
  * Current state of contract
  */
  status: Status,
  /**
  * Start of the VIP sale
  */
  pre_sale_start?: Duration,
  /**
  * Start of public sale
  */
  sale_start?: Duration,
  /**
  * Total tokens that could be minted
  */
  token_final_supply: u64,
  /**
  * Current price for one token
  */
  price: U128,
}
export type BasisPoint = number;
export interface Sale {
  royalties?: Royalties,
  initial_royalties?: Royalties,
  pre_sale_start?: Duration,
  public_sale_start?: Duration,
  allowance?: number,
}
/**
* Information about the current sale from user perspective
*/
export interface UserSaleInfo {
  sale_info: SaleInfo,
  is_vip: boolean,
  remaining_allowance?: number,
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
  payout: Record<AccountId, U128>,
}
export interface Royalties {
  accounts: Record<AccountId, BasisPoint>,
  percent: BasisPoint,
}

export class Contract {
  
  constructor(public account: Account, public readonly contractId: string){}
  
  check_key(args: {public_key: PublicKey}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "check_key", args, options);
  }
  async update_allowance(args: {allowance: number}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.update_allowanceRaw(args, options));
  }
  update_allowanceRaw(args: {allowance: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_allowance", args, ...options});
  }
  update_allowanceTx(args: {allowance: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("update_allowance", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  whitelisted(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "whitelisted", args, options);
  }
  get_sale_info(args: {} = {}, options?: ViewFunctionOptions): Promise<SaleInfo> {
    return this.account.viewFunction(this.contractId, "get_sale_info", args, options);
  }
  cost_per_token(args: {minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_per_token", args, options);
  }
  async transfer_ownership(args: {new_owner: AccountId}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.transfer_ownershipRaw(args, options));
  }
  transfer_ownershipRaw(args: {new_owner: AccountId}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "transfer_ownership", args, ...options});
  }
  transfer_ownershipTx(args: {new_owner: AccountId}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("transfer_ownership", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_total_supply(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_total_supply", args, options);
  }
  async start_presale(args: {public_sale_start?: Duration}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.start_presaleRaw(args, options));
  }
  start_presaleRaw(args: {public_sale_start?: Duration}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_presale", args, ...options});
  }
  start_presaleTx(args: {public_sale_start?: Duration}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("start_presale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_tokens(args: {from_index?: U128, limit?: u64}, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens", args, options);
  }
  async new(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price: U128, sale: Sale}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price: U128, sale: Sale}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new", args, ...options});
  }
  newTx(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price: U128, sale: Sale}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("new", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_token(args: {token_id: TokenId}, options?: ViewFunctionOptions): Promise<Token | null> {
    return this.account.viewFunction(this.contractId, "nft_token", args, options);
  }
  async close_contract(args: {} = {}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.close_contractRaw(args, options));
  }
  close_contractRaw(args: {} = {}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "close_contract", args, ...options});
  }
  close_contractTx(args: {} = {}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("close_contract", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_approve(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_approveRaw(args, options));
  }
  nft_approveRaw(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_approve", args, ...options});
  }
  nft_approveTx(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_approve", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_mint_many(args: {num: number}, options?: ChangeMethodOptions): Promise<Token[]> {
    return providers.getTransactionLastResult(await this.nft_mint_manyRaw(args, options));
  }
  nft_mint_manyRaw(args: {num: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_many", args, ...options});
  }
  nft_mint_manyTx(args: {num: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_mint_many", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_uri(args: {uri: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.update_uriRaw(args, options));
  }
  update_uriRaw(args: {uri: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_uri", args, ...options});
  }
  update_uriTx(args: {uri: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("update_uri", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_transfer_call(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string, msg: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transfer_callRaw(args, options));
  }
  nft_transfer_callRaw(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string, msg: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_call", args, ...options});
  }
  nft_transfer_callTx(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string, msg: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_transfer_call", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_payout(args: {token_id: string, balance: U128, max_len_payout?: number}, options?: ViewFunctionOptions): Promise<Payout> {
    return this.account.viewFunction(this.contractId, "nft_payout", args, options);
  }
  async nft_transfer_payout(args: {receiver_id: AccountId, token_id: string, approval_id?: u64, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions): Promise<Payout> {
    return providers.getTransactionLastResult(await this.nft_transfer_payoutRaw(args, options));
  }
  nft_transfer_payoutRaw(args: {receiver_id: AccountId, token_id: string, approval_id?: u64, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_payout", args, ...options});
  }
  nft_transfer_payoutTx(args: {receiver_id: AccountId, token_id: string, approval_id?: u64, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_transfer_payout", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the balance associated with given key.
  */
  get_key_balance(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "get_key_balance", args, options);
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  async create_linkdrop(args: {public_key: PublicKey}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.create_linkdropRaw(args, options));
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  create_linkdropRaw(args: {public_key: PublicKey}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "create_linkdrop", args, ...options});
  }
  /**
  * Create a pending token that can be claimed with corresponding private key
  */
  create_linkdropTx(args: {public_key: PublicKey}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("create_linkdrop", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async add_whitelist_accounts(args: {accounts: AccountId[], allowance?: number}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.add_whitelist_accountsRaw(args, options));
  }
  add_whitelist_accountsRaw(args: {accounts: AccountId[], allowance?: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_whitelist_accounts", args, ...options});
  }
  add_whitelist_accountsTx(args: {accounts: AccountId[], allowance?: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("add_whitelist_accounts", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async new_default_meta(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price: U128, sale?: Sale}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.new_default_metaRaw(args, options));
  }
  new_default_metaRaw(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price: U128, sale?: Sale}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new_default_meta", args, ...options});
  }
  new_default_metaTx(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price: U128, sale?: Sale}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("new_default_meta", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async start_sale(args: {} = {}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.start_saleRaw(args, options));
  }
  start_saleRaw(args: {} = {}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_sale", args, ...options});
  }
  start_saleTx(args: {} = {}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("start_sale", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  token_storage_cost(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "token_storage_cost", args, options);
  }
  async nft_transfer(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transferRaw(args, options));
  }
  nft_transferRaw(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer", args, ...options});
  }
  nft_transferTx(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: u64, memo?: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_transfer", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_revoke_all(args: {token_id: TokenId}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revoke_allRaw(args, options));
  }
  nft_revoke_allRaw(args: {token_id: TokenId}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke_all", args, ...options});
  }
  nft_revoke_allTx(args: {token_id: TokenId}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_revoke_all", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async update_royalties(args: {royalties: Royalties}, options?: ChangeMethodOptions): Promise<Royalties | null> {
    return providers.getTransactionLastResult(await this.update_royaltiesRaw(args, options));
  }
  update_royaltiesRaw(args: {royalties: Royalties}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_royalties", args, ...options});
  }
  update_royaltiesTx(args: {royalties: Royalties}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("update_royalties", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  cost_of_linkdrop(args: {minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_of_linkdrop", args, options);
  }
  total_cost(args: {num: number, minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "total_cost", args, options);
  }
  get_linkdrop_contract(args: {} = {}, options?: ViewFunctionOptions): Promise<AccountId> {
    return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
  }
  async nft_revoke(args: {token_id: TokenId, account_id: AccountId}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_revokeRaw(args, options));
  }
  nft_revokeRaw(args: {token_id: TokenId, account_id: AccountId}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_revoke", args, ...options});
  }
  nft_revokeTx(args: {token_id: TokenId, account_id: AccountId}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_revoke", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_metadata(args: {} = {}, options?: ViewFunctionOptions): Promise<NftContractMetadata> {
    return this.account.viewFunction(this.contractId, "nft_metadata", args, options);
  }
  nft_is_approved(args: {token_id: TokenId, approved_account_id: AccountId, approval_id?: u64}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "nft_is_approved", args, options);
  }
  remaining_allowance(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<number | null> {
    return this.account.viewFunction(this.contractId, "remaining_allowance", args, options);
  }
  async nft_mint(args: {token_id: TokenId, token_owner_id: AccountId, token_metadata: TokenMetadata}, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mintRaw(args, options));
  }
  nft_mintRaw(args: {token_id: TokenId, token_owner_id: AccountId, token_metadata: TokenMetadata}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint", args, ...options});
  }
  nft_mintTx(args: {token_id: TokenId, token_owner_id: AccountId, token_metadata: TokenMetadata}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_mint", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  get_user_sale_info(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<UserSaleInfo> {
    return this.account.viewFunction(this.contractId, "get_user_sale_info", args, options);
  }
  nft_tokens_for_owner(args: {account_id: AccountId, from_index?: U128, limit?: u64}, options?: ViewFunctionOptions): Promise<Token[]> {
    return this.account.viewFunction(this.contractId, "nft_tokens_for_owner", args, options);
  }
  async add_whitelist_account_ungaurded(args: {account_id: AccountId, allowance: number}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.add_whitelist_account_ungaurdedRaw(args, options));
  }
  add_whitelist_account_ungaurdedRaw(args: {account_id: AccountId, allowance: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "add_whitelist_account_ungaurded", args, ...options});
  }
  add_whitelist_account_ungaurdedTx(args: {account_id: AccountId, allowance: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("add_whitelist_account_ungaurded", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  tokens_left(args: {} = {}, options?: ViewFunctionOptions): Promise<number> {
    return this.account.viewFunction(this.contractId, "tokens_left", args, options);
  }
  nft_supply_for_owner(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_supply_for_owner", args, options);
  }
  async nft_mint_one(args: {} = {}, options?: ChangeMethodOptions): Promise<Token> {
    return providers.getTransactionLastResult(await this.nft_mint_oneRaw(args, options));
  }
  nft_mint_oneRaw(args: {} = {}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_mint_one", args, ...options});
  }
  nft_mint_oneTx(args: {} = {}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_mint_one", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
}
