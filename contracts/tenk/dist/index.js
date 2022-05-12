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
    * Returns the balance associated with given key.
    */
    Contract.prototype.get_key_balance = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "get_key_balance", args, options);
    };
    Contract.prototype.check_key = function (args, options) {
        return this.account.viewFunction(this.contractId, "check_key", args, options);
    };
    Contract.prototype.get_linkdrop_contract = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "get_linkdrop_contract", args, options);
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.transfer_ownershipRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "transfer_ownership", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.transfer_ownershipTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("transfer_ownership", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_initial_royaltiesRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_initial_royalties", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_initial_royaltiesTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_initial_royalties", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_royaltiesRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_royalties", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_royaltiesTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_royalties", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_allowanceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_allowance", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_allowanceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_allowance", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_uriRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_uri", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_uriTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_uri", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Add whitelist accounts at a given max allowance
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * Add whitelist accounts at a given max allowance
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.add_whitelist_accountsRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "add_whitelist_accounts", args: args }, options));
    };
    /**
    * Add whitelist accounts at a given max allowance
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.add_whitelist_accountsTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("add_whitelist_accounts", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Increases allowance for whitelist accounts
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * Increases allowance for whitelist accounts
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_whitelist_accountsRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_whitelist_accounts", args: args }, options));
    };
    /**
    * Increases allowance for whitelist accounts
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_whitelist_accountsTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_whitelist_accounts", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.close_sale = function (args, options) {
        if (args === void 0) { args = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.close_saleRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.close_saleRaw = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "close_sale", args: args }, options));
    };
    /**
    * End public sale/minting, going back to the pre-presale state in which no one can mint.
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.close_saleTx = function (args, options) {
        var _a, _b;
        if (args === void 0) { args = {}; }
        return helper_1.transactions.functionCall("close_sale", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Override the current presale start time to start presale now.
    * Most provide when public sale starts. None, means never.
    * Can provide new presale price.
    * Note: you most likely won't need to call this since the presale
    * starts automatically based on time.
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.start_presaleTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("start_presale", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
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
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.start_saleRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "start_sale", args: args }, options));
    };
    /**
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.start_saleTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("start_sale", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Add a new admin. Careful who you add!
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.add_adminRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "add_admin", args: args }, options));
    };
    /**
    * Add a new admin. Careful who you add!
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.add_adminTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("add_admin", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_priceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_price", args: args }, options));
    };
    /**
    * Update public sale price.
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_priceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_price", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_presale_priceRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_presale_price", args: args }, options));
    };
    /**
    * Update the presale price
    * Careful this is in yoctoNear: 1N = 1000000000000000000000000 yN
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_presale_priceTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_presale_price", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update the presale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_presale_start = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_presale_startRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Update the presale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_presale_startRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_presale_start", args: args }, options));
    };
    /**
    * Update the presale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_presale_startTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_presale_start", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Update the public sale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_public_sale_start = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.update_public_sale_startRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    /**
    * Update the public sale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_public_sale_startRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "update_public_sale_start", args: args }, options));
    };
    /**
    * Update the public sale start
    * Careful this is in ms since 1970
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.update_public_sale_startTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("update_public_sale_start", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Create a pending token that can be claimed with corresponding private key
    * @allow ["::admins", "::owner"]
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
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.create_linkdropRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "create_linkdrop", args: args }, options));
    };
    /**
    * Create a pending token that can be claimed with corresponding private key
    * @allow ["::admins", "::owner"]
    */
    Contract.prototype.create_linkdropTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("create_linkdrop", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    Contract.prototype.nft_payout = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_payout", args, options);
    };
    Contract.prototype.nft_transfer_payout = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_transfer_payoutRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
    Contract.prototype.nft_transfer_payoutRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_transfer_payout", args: args }, options));
    };
    Contract.prototype.nft_transfer_payoutTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_transfer_payout", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
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
    Contract.prototype.nft_transfer = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_transferRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
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
    Contract.prototype.nft_transferRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_transfer", args: args }, options));
    };
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
    Contract.prototype.nft_transferTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_transfer", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
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
    Contract.prototype.nft_transfer_call = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_transfer_callRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
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
    Contract.prototype.nft_transfer_callRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_transfer_call", args: args }, options));
    };
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
    Contract.prototype.nft_transfer_callTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_transfer_call", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
    /**
    * Returns the token with the given `token_id` or `null` if no such token.
    */
    Contract.prototype.nft_token = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_token", args, options);
    };
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
    Contract.prototype.nft_approve = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_approveRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
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
    Contract.prototype.nft_approveRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_approve", args: args }, options));
    };
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
    Contract.prototype.nft_approveTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_approve", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
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
    Contract.prototype.nft_revoke = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_revokeRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
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
    Contract.prototype.nft_revokeRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_revoke", args: args }, options));
    };
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
    Contract.prototype.nft_revokeTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_revoke", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
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
    Contract.prototype.nft_revoke_all = function (args, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = helper_1.providers).getTransactionLastResult;
                        return [4 /*yield*/, this.nft_revoke_allRaw(args, options)];
                    case 1: return [2 /*return*/, _b.apply(_a, [_c.sent()])];
                }
            });
        });
    };
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
    Contract.prototype.nft_revoke_allRaw = function (args, options) {
        return this.account.functionCall(__assign({ contractId: this.contractId, methodName: "nft_revoke_all", args: args }, options));
    };
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
    Contract.prototype.nft_revoke_allTx = function (args, options) {
        var _a, _b;
        return helper_1.transactions.functionCall("nft_revoke_all", args, (_a = options === null || options === void 0 ? void 0 : options.gas) !== null && _a !== void 0 ? _a : helper_1.DEFAULT_FUNCTION_CALL_GAS, (_b = options === null || options === void 0 ? void 0 : options.attachedDeposit) !== null && _b !== void 0 ? _b : new helper_1.BN(0));
    };
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
    Contract.prototype.nft_is_approved = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_is_approved", args, options);
    };
    /**
    * Returns the total supply of non-fungible tokens as a string representing an
    * unsigned 128-bit integer to avoid JSON number limit of 2^53.
    */
    Contract.prototype.nft_total_supply = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "nft_total_supply", args, options);
    };
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
    Contract.prototype.nft_tokens = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_tokens", args, options);
    };
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
    Contract.prototype.nft_supply_for_owner = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_supply_for_owner", args, options);
    };
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
    Contract.prototype.nft_tokens_for_owner = function (args, options) {
        return this.account.viewFunction(this.contractId, "nft_tokens_for_owner", args, options);
    };
    /**
    * Current contract owner
    */
    Contract.prototype.owner = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "owner", args, options);
    };
    /**
    * Current set of admins
    */
    Contract.prototype.admins = function (args, options) {
        if (args === void 0) { args = {}; }
        return this.account.viewFunction(this.contractId, "admins", args, options);
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
    return Contract;
}());
exports.Contract = Contract;
