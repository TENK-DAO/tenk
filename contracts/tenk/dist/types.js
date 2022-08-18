"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Status = void 0;
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
