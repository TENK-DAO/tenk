
//@ts-ignore for ts-json-schema-generator
export { Account, transactions, providers, DEFAULT_FUNCTION_CALL_GAS } from 'near-api-js';
//@ts-ignore for ts-json-schema-generator
import BN from 'bn.js';
export {BN};

export interface ChangeMethodOptions {
  gas?: BN;
  attachedDeposit?: BN;
  walletMeta?: string;
  walletCallbackUrl?: string;
}
/**
 * Options for view contract calls
 */ 
export interface ViewFunctionOptions {
  parse?: (response: Uint8Array) => any;
  stringify?: (input: any) => any;
}

/** 
* @minimum 0
* @maximum 18446744073709551615
* @asType integer
*/
export type u64 = number;
/** 
* @minimum -9223372036854775808
* @maximum 9223372036854775807
* @asType integer
*/
export type i64 = number;

/**
* @minimum  0 
* @maximum 255
* @asType integer
* */
export type u8 = number;
/**
* @minimum  -128 
* @maximum 127
* @asType integer
* */
export type i8 = number;
/**
* @minimum  0 
* @maximum 65535
* @asType integer
* */
export type u16 = number;
/**
* @minimum -32768 
* @maximum 32767
* @asType integer
* */
export type i16 = number;
/**
* @minimum 0 
* @maximum 4294967295
* @asType integer
* */
export type u32 = number;
/**
* @minimum 0 
* @maximum 4294967295
* @asType integer
* */
export type usize = number;
/**
* @minimum  -2147483648 
* @maximum 2147483647
* @asType integer
* */
export type i32 = number;

/**
* @minimum -3.40282347E+38
* @maximum 3.40282347E+38
*/
export type f32 = number;

/**
* @minimum -1.7976931348623157E+308
* @maximum 1.7976931348623157E+308
*/
export type f64 = number;