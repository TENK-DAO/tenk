use crate::*;
pub(crate) use near_contract_standards::non_fungible_token::{
    approval::NonFungibleTokenApproval,
    core::{NonFungibleTokenCore, NonFungibleTokenResolver},
    enumeration::NonFungibleTokenEnumeration,
};

#[near_bindgen]
impl NonFungibleTokenCore for Contract {
    /// Simple transfer. Transfer a given `token_id` from current owner to
    /// `receiver_id`.
    ///
    /// Requirements
    /// * Caller of the method must attach a deposit of 1 yoctoⓃ for security purposes
    /// * Contract MUST panic if called by someone other than token owner or,
    ///   if using Approval Management, one of the approved accounts
    /// * `approval_id` is for use with Approval Management,
    ///   see <https://nomicon.io/Standards/NonFungibleToken/ApprovalManagement.html>
    /// * If using Approval Management, contract MUST nullify approved accounts on
    ///   successful transfer.
    /// * TODO: needed? Both accounts must be registered with the contract for transfer to
    ///   succeed. See see <https://nomicon.io/Standards/StorageManagement.html>
    ///
    /// Arguments:
    /// * `receiver_id`: the valid NEAR account receiving the token
    /// * `token_id`: the token to transfer
    /// * `approval_id`: expected approval ID. A number smaller than
    ///    2^53, and therefore representable as JSON. See Approval Management
    ///    standard for full explanation.
    /// * `memo` (optional): for use cases that may benefit from indexing or
    ///    providing information for a transfer
    #[payable]
    fn nft_transfer(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        self.tokens
            .nft_transfer(receiver_id, token_id, approval_id, memo)
    }

    /// Transfer token and call a method on a receiver contract. A successful
    /// workflow will end in a success execution outcome to the callback on the NFT
    /// contract at the method `nft_resolve_transfer`.
    ///
    /// You can think of this as being similar to attaching native NEAR tokens to a
    /// function call. It allows you to attach any Non-Fungible Token in a call to a
    /// receiver contract.
    ///
    /// Requirements:
    /// * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    ///   purposes
    /// * Contract MUST panic if called by someone other than token owner or,
    ///   if using Approval Management, one of the approved accounts
    /// * The receiving contract must implement `ft_on_transfer` according to the
    ///   standard. If it does not, FT contract's `ft_resolve_transfer` MUST deal
    ///   with the resulting failed cross-contract call and roll back the transfer.
    /// * Contract MUST implement the behavior described in `ft_resolve_transfer`
    /// * `approval_id` is for use with Approval Management extension, see
    ///   that document for full explanation.
    /// * If using Approval Management, contract MUST nullify approved accounts on
    ///   successful transfer.
    ///
    /// Arguments:
    /// * `receiver_id`: the valid NEAR account receiving the token.
    /// * `token_id`: the token to send.
    /// * `approval_id`: expected approval ID. A number smaller than
    ///    2^53, and therefore representable as JSON. See Approval Management
    ///    standard for full explanation.
    /// * `memo` (optional): for use cases that may benefit from indexing or
    ///    providing information for a transfer.
    /// * `msg`: specifies information needed by the receiving contract in
    ///    order to properly handle the transfer. Can indicate both a function to
    ///    call and the parameters to pass to that function.
    #[payable]
    fn nft_transfer_call(
        &mut self,
        receiver_id: AccountId,
        token_id: TokenId,
        approval_id: Option<u64>,
        memo: Option<String>,
        msg: String,
    ) -> PromiseOrValue<bool> {
        self.tokens
            .nft_transfer_call(receiver_id, token_id, approval_id, memo, msg)
    }

    /// Returns the token with the given `token_id` or `null` if no such token.
    fn nft_token(&self, token_id: TokenId) -> Option<Token> {
        self.tokens.nft_token(token_id)
    }
}

#[near_bindgen]
impl NonFungibleTokenResolver for Contract {
    #[private]
    fn nft_resolve_transfer(
        &mut self,
        previous_owner_id: AccountId,
        receiver_id: AccountId,
        token_id: TokenId,
        approved_account_ids: Option<std::collections::HashMap<AccountId, u64>>,
    ) -> bool {
        self.tokens.nft_resolve_transfer(
            previous_owner_id,
            receiver_id,
            token_id,
            approved_account_ids,
        )
    }
}

#[near_bindgen]
impl NonFungibleTokenApproval for Contract {
    /// Add an approved account for a specific token.
    ///
    /// Requirements
    /// * Caller of the method must attach a deposit of at least 1 yoctoⓃ for
    ///   security purposes
    /// * Contract MAY require caller to attach larger deposit, to cover cost of
    ///   storing approver data
    /// * Contract MUST panic if called by someone other than token owner
    /// * Contract MUST panic if addition would cause `nft_revoke_all` to exceed
    ///   single-block gas limit
    /// * Contract MUST increment approval ID even if re-approving an account
    /// * If successfully approved or if had already been approved, and if `msg` is
    ///   present, contract MUST call `nft_on_approve` on `account_id`. See
    ///   `nft_on_approve` description below for details.
    ///
    /// Arguments:
    /// * `token_id`: the token for which to add an approval
    /// * `account_id`: the account to add to `approvals`
    /// * `msg`: optional string to be passed to `nft_on_approve`
    ///
    /// Returns void, if no `msg` given. Otherwise, returns promise call to
    /// `nft_on_approve`, which can resolve with whatever it wants.
    #[payable]
    fn nft_approve(
        &mut self,
        token_id: TokenId,
        account_id: AccountId,
        msg: Option<String>,
    ) -> Option<Promise> {
        self.tokens.nft_approve(token_id, account_id, msg)
    }

    /// Revoke an approved account for a specific token.
    ///
    /// Requirements
    /// * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    ///   purposes
    /// * If contract requires >1yN deposit on `nft_approve`, contract
    ///   MUST refund associated storage deposit when owner revokes approval
    /// * Contract MUST panic if called by someone other than token owner
    ///
    /// Arguments:
    /// * `token_id`: the token for which to revoke an approval
    /// * `account_id`: the account to remove from `approvals`
    #[payable]
    fn nft_revoke(&mut self, token_id: TokenId, account_id: AccountId) {
        self.tokens.nft_revoke(token_id, account_id)
    }

    /// Revoke all approved accounts for a specific token.
    ///
    /// Requirements
    /// * Caller of the method must attach a deposit of 1 yoctoⓃ for security
    ///   purposes
    /// * If contract requires >1yN deposit on `nft_approve`, contract
    ///   MUST refund all associated storage deposit when owner revokes approvals
    /// * Contract MUST panic if called by someone other than token owner
    ///
    /// Arguments:
    /// * `token_id`: the token with approvals to revoke
    #[payable]
    fn nft_revoke_all(&mut self, token_id: TokenId) {
        self.tokens.nft_revoke_all(token_id)
    }

    /// Check if a token is approved for transfer by a given account, optionally
    /// checking an approval_id
    ///
    /// Arguments:
    /// * `token_id`: the token for which to revoke an approval
    /// * `approved_account_id`: the account to check the existence of in `approvals`
    /// * `approval_id`: an optional approval ID to check against current approval ID for given account
    ///
    /// Returns:
    /// if `approval_id` given, `true` if `approved_account_id` is approved with given `approval_id`
    /// otherwise, `true` if `approved_account_id` is in list of approved accounts
    fn nft_is_approved(
        &self,
        token_id: TokenId,
        approved_account_id: AccountId,
        approval_id: Option<u64>,
    ) -> bool {
        self.tokens
            .nft_is_approved(token_id, approved_account_id, approval_id)
    }
}

#[near_bindgen]
impl NonFungibleTokenEnumeration for Contract {
    /// Returns the total supply of non-fungible tokens as a string representing an
    /// unsigned 128-bit integer to avoid JSON number limit of 2^53.
    fn nft_total_supply(&self) -> near_sdk::json_types::U128 {
        self.tokens.nft_total_supply()
    }

    /// Get a list of all tokens
    ///
    /// Arguments:
    /// * `from_index`: a string representing an unsigned 128-bit integer,
    ///    representing the starting index of tokens to return. (default 0)
    /// * `limit`: the maximum number of tokens to return (default total supply)
    ///            Could fail on gas
    ///
    /// Returns an array of Token objects, as described in Core standard
    fn nft_tokens(
        &self,
        from_index: Option<near_sdk::json_types::U128>,
        limit: Option<u64>,
    ) -> Vec<Token> {
        self.tokens.nft_tokens(from_index, limit)
    }

    /// Get number of tokens owned by a given account
    ///
    /// Arguments:
    /// * `account_id`: a valid NEAR account
    ///
    /// Returns the number of non-fungible tokens owned by given `account_id` as
    /// a string representing the value as an unsigned 128-bit integer to avoid JSON
    /// number limit of 2^53.
    fn nft_supply_for_owner(&self, account_id: AccountId) -> near_sdk::json_types::U128 {
        self.tokens.nft_supply_for_owner(account_id)
    }

    /// Get list of all tokens owned by a given account
    ///
    /// Arguments:
    /// * `account_id`: a valid NEAR account
    /// * `from_index`: a string representing an unsigned 128-bit integer,
    ///    representing the starting index of tokens to return. (default 0)
    /// * `limit`: the maximum number of tokens to return. (default unlimited)
    ///            Could fail on gas
    ///
    /// Returns a paginated list of all tokens owned by this account
    fn nft_tokens_for_owner(
        &self,
        account_id: AccountId,
        from_index: Option<near_sdk::json_types::U128>,
        limit: Option<u64>,
    ) -> Vec<Token> {
        self.tokens
            .nft_tokens_for_owner(account_id, from_index, limit)
    }
}
