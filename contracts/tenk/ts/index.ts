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
/**
* Note that token IDs for NFTs are strings on NEAR. It's still fine to use autoincrementing numbers as unique IDs if desired, but they should be stringified. This is to make IDs more future-proof as chain-agnostic conventions and standards arise, and allows for more flexibility with considerations like bridging NFTs across chains, etc.
*/
export type TokenId = string;
export type AccountId = string;
export type Base64VecU8 = string;
export type U128 = string;
export interface Token {
  token_id: TokenId,
  owner_id: AccountId,
  metadata?: TokenMetadata,
  approved_account_ids?: Record<AccountId, bigint>,
}
/**
* Metadata on the individual token level.
*/
export interface TokenMetadata {
  title?: string,
  description?: string,
  media?: string,
  media_hash?: Base64VecU8,
  copies?: bigint,
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
export type PublicKey = string;
export interface InitialMetadata {
  name: string,
  symbol: string,
  uri: string,
  icon?: string,
  spec?: string,
  reference?: string,
  reference_hash?: Base64VecU8,
}
export interface Sale {
  royalties?: Royalties,
  initial_royalties?: Royalties,
  is_premint?: boolean,
  is_premint_over?: boolean,
  allowance?: number,
}
export type BasisPoint = number;
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
export interface PriceStructure {
  base_cost: U128,
  min_cost?: U128,
  percent_off?: number,
}
export interface Royalties {
  accounts: Record<AccountId, BasisPoint>,
  percent: BasisPoint,
}

export class Contract {
  
  constructor(public account: Account, public readonly contractId: string){}
  
  async update_allowance(args: {allowance: number}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.update_allowanceRaw(args, options));
  }
  update_allowanceRaw(args: {allowance: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "update_allowance", args, ...options});
  }
  update_allowanceTx(args: {allowance: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("update_allowance", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
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
  async nft_approve(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_approveRaw(args, options));
  }
  nft_approveRaw(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_approve", args, ...options});
  }
  nft_approveTx(args: {token_id: TokenId, account_id: AccountId, msg?: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_approve", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  whitelisted(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "whitelisted", args, options);
  }
  total_cost(args: {num: number, minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "total_cost", args, options);
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
  async start_premint(args: {duration: bigint}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.start_premintRaw(args, options));
  }
  start_premintRaw(args: {duration: bigint}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "start_premint", args, ...options});
  }
  start_premintTx(args: {duration: bigint}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("start_premint", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  nft_payout(args: {token_id: string, balance: U128, max_len_payout?: number}, options?: ViewFunctionOptions): Promise<Payout> {
    return this.account.viewFunction(this.contractId, "nft_payout", args, options);
  }
  async nft_transfer_call(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string, msg: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transfer_callRaw(args, options));
  }
  nft_transfer_callRaw(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string, msg: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_call", args, ...options});
  }
  nft_transfer_callTx(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string, msg: string}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_transfer_call", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  async nft_transfer_payout(args: {receiver_id: AccountId, token_id: string, approval_id?: bigint, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions): Promise<Payout> {
    return providers.getTransactionLastResult(await this.nft_transfer_payoutRaw(args, options));
  }
  nft_transfer_payoutRaw(args: {receiver_id: AccountId, token_id: string, approval_id?: bigint, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer_payout", args, ...options});
  }
  nft_transfer_payoutTx(args: {receiver_id: AccountId, token_id: string, approval_id?: bigint, memo?: string, balance: U128, max_len_payout?: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("nft_transfer_payout", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  token_storage_cost(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "token_storage_cost", args, options);
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
  remaining_allowance(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<number> {
    return this.account.viewFunction(this.contractId, "remaining_allowance", args, options);
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
  tokens_left(args: {} = {}, options?: ViewFunctionOptions): Promise<number> {
    return this.account.viewFunction(this.contractId, "tokens_left", args, options);
  }
  async end_premint(args: {base_cost: U128, min_cost: U128, percent_off?: number}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.end_premintRaw(args, options));
  }
  end_premintRaw(args: {base_cost: U128, min_cost: U128, percent_off?: number}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "end_premint", args, ...options});
  }
  end_premintTx(args: {base_cost: U128, min_cost: U128, percent_off?: number}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("end_premint", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  check_key(args: {public_key: PublicKey}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "check_key", args, options);
  }
  discount(args: {num: number}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "discount", args, options);
  }
  nft_total_supply(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_total_supply", args, options);
  }
  nft_supply_for_owner(args: {account_id: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "nft_supply_for_owner", args, options);
  }
  async nft_transfer(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.nft_transferRaw(args, options));
  }
  nft_transferRaw(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "nft_transfer", args, ...options});
  }
  nft_transferTx(args: {receiver_id: AccountId, token_id: TokenId, approval_id?: bigint, memo?: string}, options?: ChangeMethodOptions):  transactions.Action {
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
  cost_per_token(args: {num: number, minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_per_token", args, options);
  }
  nft_metadata(args: {} = {}, options?: ViewFunctionOptions): Promise<NftContractMetadata> {
    return this.account.viewFunction(this.contractId, "nft_metadata", args, options);
  }
  async new(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price_structure: PriceStructure, sale: Sale}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.newRaw(args, options));
  }
  newRaw(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price_structure: PriceStructure, sale: Sale}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new", args, ...options});
  }
  newTx(args: {owner_id: AccountId, metadata: NftContractMetadata, size: number, price_structure: PriceStructure, sale: Sale}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("new", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
  }
  /**
  * Returns the balance associated with given key.
  */
  get_key_balance(args: {} = {}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "get_key_balance", args, options);
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
  nft_is_approved(args: {token_id: TokenId, approved_account_id: AccountId, approval_id?: bigint}, options?: ViewFunctionOptions): Promise<boolean> {
    return this.account.viewFunction(this.contractId, "nft_is_approved", args, options);
  }
  get_linkdrop_contract(args: {} = {}, options?: ViewFunctionOptions): Promise<AccountId> {
    return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
  }
  cost_of_linkdrop(args: {minter: AccountId}, options?: ViewFunctionOptions): Promise<U128> {
    return this.account.viewFunction(this.contractId, "cost_of_linkdrop", args, options);
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
  nft_token(args: {token_id: TokenId}, options?: ViewFunctionOptions): Promise<Token | null> {
    return this.account.viewFunction(this.contractId, "nft_token", args, options);
  }
  async new_default_meta(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price_structure: PriceStructure, sale?: Sale}, options?: ChangeMethodOptions): Promise<void> {
    return providers.getTransactionLastResult(await this.new_default_metaRaw(args, options));
  }
  new_default_metaRaw(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price_structure: PriceStructure, sale?: Sale}, options?: ChangeMethodOptions):  Promise<providers.FinalExecutionOutcome> {
    return this.account.functionCall({contractId: this.contractId, methodName: "new_default_meta", args, ...options});
  }
  new_default_metaTx(args: {owner_id: AccountId, metadata: InitialMetadata, size: number, price_structure: PriceStructure, sale?: Sale}, options?: ChangeMethodOptions):  transactions.Action {
    return transactions.functionCall("new_default_meta", args, options?.gas ?? DEFAULT_FUNCTION_CALL_GAS, options?.attachedDeposit ?? new BN(0))
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
