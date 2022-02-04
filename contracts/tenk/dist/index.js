"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var near_api_js_1 = require("near-api-js");
/**
* Inializing the contract with `contractId`, the accountId of the contract,
* and the `account` that will sign change calls.
*/
function init(account, contractId) {
    return new near_api_js_1.Contract(account, contractId, { viewMethods: ["whitelisted", "total_cost", "nft_payout", "token_storage_cost", "remaining_allowance", "tokens_left", "check_key", "discount", "nft_total_supply", "nft_supply_for_owner", "cost_per_token", "nft_metadata", "get_key_balance", "nft_is_approved", "get_linkdrop_contract", "cost_of_linkdrop", "nft_token"], changeMethods: ["update_allowance", "transfer_ownership", "nft_approve", "nft_mint_many", "start_premint", "nft_transfer_call", "nft_transfer_payout", "create_linkdrop", "add_whitelist_accounts", "end_premint", "nft_transfer", "nft_revoke_all", "update_royalties", "new", "nft_revoke", "nft_mint", "new_default_meta", "add_whitelist_account_ungaurded", "nft_mint_one"] });
}
exports.init = init;
