"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BN = exports.DEFAULT_FUNCTION_CALL_GAS = exports.providers = exports.transactions = exports.Account = void 0;
//@ts-ignore for ts-json-schema-generator
var near_api_js_1 = require("near-api-js");
Object.defineProperty(exports, "Account", { enumerable: true, get: function () { return near_api_js_1.Account; } });
Object.defineProperty(exports, "transactions", { enumerable: true, get: function () { return near_api_js_1.transactions; } });
Object.defineProperty(exports, "providers", { enumerable: true, get: function () { return near_api_js_1.providers; } });
Object.defineProperty(exports, "DEFAULT_FUNCTION_CALL_GAS", { enumerable: true, get: function () { return near_api_js_1.DEFAULT_FUNCTION_CALL_GAS; } });
//@ts-ignore for ts-json-schema-generator
var bn_js_1 = __importDefault(require("bn.js"));
exports.BN = bn_js_1.default;
