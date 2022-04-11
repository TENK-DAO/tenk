"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Contract = exports.Status = void 0;
var helper_1 = require("./helper");
/**
* Current state of contract
*/
var Status;
(function (Status) {
    /**
    * Not open for any sales
    */
    Status["Closed"] = "Closed";
    /**
    * VIP accounts can mint
    */
    Status["Presale"] = "Presale";
    /**
    * Any account can mint
    */
    Status["Open"] = "Open";
    /**
    * No more tokens to be minted
    */
    Status["SoldOut"] = "SoldOut";
})(Status = exports.Status || (exports.Status = {}));
var Contract = /** @class */ (function () {
    function Contract(account, contractId) {
        this.account = account;
        this.contractId = contractId;
    }
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    Contract.prototype.create_linkdrop = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.create_linkdropRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    Contract.prototype.create_linkdropRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "create_linkdrop", args: args }, options));
    };
    /**
    * Create a pending token that can be claimed with corresponding private key
    */
    Contract.prototype.create_linkdropTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("create_linkdrop", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Allows given public key to claim sent balance.
    * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
    * Claim tokens for specific account that are attached to the public key this tx is signed with.
    */
    Contract.prototype.claim = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.claimRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Allows given public key to claim sent balance.
    * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
    * Claim tokens for specific account that are attached to the public key this tx is signed with.
    */
    Contract.prototype.claimRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "claim", args: args }, options));
    };
    /**
    * Allows given public key to claim sent balance.
    * Takes ACCESS_KEY_ALLOWANCE as fee from deposit to cover account creation via an access key.
    * Claim tokens for specific account that are attached to the public key this tx is signed with.
    */
    Contract.prototype.claimTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("claim", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Create new account and and claim tokens to it.
    */
    Contract.prototype.create_account_and_claim = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.create_account_and_claimRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Create new account and and claim tokens to it.
    */
    Contract.prototype.create_account_and_claimRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "create_account_and_claim", args: args }, options));
    };
    /**
    * Create new account and and claim tokens to it.
    */
    Contract.prototype.create_account_and_claimTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("create_account_and_claim", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Returns the balance associated with given key.
    */
    Contract.prototype.get_key_balance = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "get_key_balance", args, options);
    };
    Contract.prototype.check_key = function (args, options) {
        return this.account.viewFunction(this.contractId, "check_key", args, options);
    };
    Contract.prototype.on_create_and_claim = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.on_create_and_claimRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.on_create_and_claimRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "on_create_and_claim", args: args }, options));
    };
    Contract.prototype.on_create_and_claimTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("on_create_and_claim", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.get_linkdrop_contract = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
    };
    Contract.prototype.transfer_ownership = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.transfer_ownershipRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.transfer_ownershipRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "transfer_ownership", args: args }, options));
    };
    Contract.prototype.transfer_ownershipTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("transfer_ownership", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.update_initial_royalties = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_initial_royaltiesRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.update_initial_royaltiesRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_initial_royalties", args: args }, options));
    };
    Contract.prototype.update_initial_royaltiesTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_initial_royalties", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.update_royalties = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_royaltiesRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.update_royaltiesRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_royalties", args: args }, options));
    };
    Contract.prototype.update_royaltiesTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_royalties", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.update_allowance = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_allowanceRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.update_allowanceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_allowance", args: args }, options));
    };
    Contract.prototype.update_allowanceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_allowance", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.update_uri = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_uriRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.update_uriRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_uri", args: args }, options));
    };
    Contract.prototype.update_uriTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_uri", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.add_whitelist_accounts = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.add_whitelist_accountsRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.add_whitelist_accountsRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "add_whitelist_accounts", args: args }, options));
    };
    Contract.prototype.add_whitelist_accountsTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("add_whitelist_accounts", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.update_whitelist_accounts = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_whitelist_accountsRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.update_whitelist_accountsRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_whitelist_accounts", args: args }, options));
    };
    Contract.prototype.update_whitelist_accountsTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_whitelist_accounts", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Contract wwill
    */
    Contract.prototype.close_contract = function (args, options) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.close_contractRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Contract wwill
    */
    Contract.prototype.close_contractRaw = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "close_contract", args: args }, options));
    };
    /**
    * Contract wwill
    */
    Contract.prototype.close_contractTx = function (args, options) {
        var _a, _b;
        if (args === void 0) { args = {}; }
        return helper_1.transactions.functionCall("close_contract", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    */
    Contract.prototype.start_presale = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.start_presaleRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    */
    Contract.prototype.start_presaleRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "start_presale", args: args }, options));
    };
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    */
    Contract.prototype.start_presaleTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("start_presale", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.start_sale = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.start_saleRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.start_saleRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "start_sale", args: args }, options));
    };
    Contract.prototype.start_saleTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("start_sale", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Add a new admin. Careful who you add!
    */
    Contract.prototype.add_admin = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.add_adminRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Add a new admin. Careful who you add!
    */
    Contract.prototype.add_adminRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "add_admin", args: args }, options));
    };
    /**
    * Add a new admin. Careful who you add!
    */
    Contract.prototype.add_adminTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("add_admin", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_price = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_priceRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_priceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_price", args: args }, options));
    };
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_priceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_price", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_presale_price = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_presale_priceRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_presale_priceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_presale_price", args: args }, options));
    };
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    */
    Contract.prototype.update_presale_priceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_presale_price", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Check whether an account is allowed to mint during the presale
    */
    Contract.prototype.whitelisted = function (args, options) {
        return this.account.viewFunction(this.contractId, "whitelisted", args, options);
    };
    /**
    * Cost of NFT + fees for linkdrop
    */
    Contract.prototype.cost_of_linkdrop = function (args, options) {
        return this.account.viewFunction(this.contractId, "cost_of_linkdrop", args, options);
    };
    Contract.prototype.total_cost = function (args, options) {
        return this.account.viewFunction(this.contractId, "total_cost", args, options);
    };
    /**
    * Flat cost of one token
    */
    Contract.prototype.cost_per_token = function (args, options) {
        return this.account.viewFunction(this.contractId, "cost_per_token", args, options);
    };
    /**
    * Current cost in NEAR to store one NFT
    */
    Contract.prototype.token_storage_cost = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "token_storage_cost", args, options);
    };
    /**
    * Tokens left to be minted.  This includes those left to be raffled minus any pending linkdrops
    */
    Contract.prototype.tokens_left = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "tokens_left", args, options);
    };
    /**
    * Part of the NFT metadata standard. Returns the contract's metadata
    */
    Contract.prototype.nft_metadata = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "nft_metadata", args, options);
    };
    /**
    * How many tokens an account is still allowed to mint. None, means unlimited
    */
    Contract.prototype.remaining_allowance = function (args, options) {
        return this.account.viewFunction(this.contractId, "remaining_allowance", args, options);
    };
    /**
    * Max number of mints in one transaction. None, means unlimited
    */
    Contract.prototype.mint_rate_limit = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "mint_rate_limit", args, options);
    };
    /**
    * Information about the current sale. When in starts, status, price, and how many could be minted.
    */
    Contract.prototype.get_sale_info = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "get_sale_info", args, options);
    };
    /**
    * Information about a current user. Whether they are VIP and how many tokens left in their allowance.
    */
    Contract.prototype.get_user_sale_info = function (args, options) {
        return this.account.viewFunction(this.contractId, "get_user_sale_info", args, options);
    };
    /**
    * Initial size of collection. Number left to raffle + current total supply
    */
    Contract.prototype.initial = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "initial", args, options);
    };
    /**
    * Current set of admins
    */
    Contract.prototype.admins = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "admins", args, options);
    };
    Contract.prototype.new_default_meta = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.new_default_metaRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.new_default_metaRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "new_default_meta", args: args }, options));
    };
    Contract.prototype.new_default_metaTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("new_default_meta", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.new = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.newRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.newRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "new", args: args }, options));
    };
    Contract.prototype.newTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("new", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.nft_mint = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_mintRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.nft_mintRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_mint", args: args }, options));
    };
    Contract.prototype.nft_mintTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_mint", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.nft_mint_one = function (args, options) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_mint_oneRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.nft_mint_oneRaw = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_mint_one", args: args }, options));
    };
    Contract.prototype.nft_mint_oneTx = function (args, options) {
        var _a, _b;
        if (args === void 0) { args = {}; }
        return helper_1.transactions.functionCall("nft_mint_one", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.nft_mint_many = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_mint_manyRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.nft_mint_manyRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_mint_many", args: args }, options));
    };
    Contract.prototype.nft_mint_manyTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_mint_many", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.on_send_with_callback = function (args, options) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.on_send_with_callbackRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.on_send_with_callbackRaw = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "on_send_with_callback", args: args }, options));
    };
    Contract.prototype.on_send_with_callbackTx = function (args, options) {
        var _a, _b;
        if (args === void 0) { args = {}; }
        return helper_1.transactions.functionCall("on_send_with_callback", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.link_callback = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.link_callbackRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.link_callbackRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "link_callback", args: args }, options));
    };
    Contract.prototype.link_callbackTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("link_callback", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    return Contract;
}());
exports.Contract = Contract;
