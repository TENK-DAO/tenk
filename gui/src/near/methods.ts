import topLevelSchema from "./contracts/tenk/index.schema.json";
import { init } from '.'
import { JSONSchema7 } from "json-schema";

export type MethodName = keyof typeof topLevelSchema.definitions
export type Schema = { schema: { $ref: string } & JSONSchema7 }

function hasContractMethodProperty(obj: {}): obj is {contractMethod: "change" | "view"} {
  return 'contractMethod' in obj
}

function hasAllowProperty(obj: {}): obj is { allow: string[] } {
  return 'allow' in obj
}

function hasContractMethod(m: MethodName, equalTo?: "change" | "view"): boolean {
  const def = topLevelSchema.definitions[m]
  const hasField = hasContractMethodProperty(def)
  if (!hasField) return false
  if (!equalTo) return true
  return def.contractMethod === equalTo
}

/**
 * Check if a given contract method can be called by an account.
 * 
 * Assumes the method has an `allow` field specifying accounts and methods in
 * the following format:
 * 
 *     allow: [
 *       'ahalabs.near',
 *       '::owner',
 *       '::admins',
 *       '::dao.ahalabs.near::council'
 *     ]
 * 
 * Someday there will be an SDK macro that makes adding this easy. For now,
 * contracts can include comments above the method in the proper format, and
 * witme will generate the schema with the above `allow` structure. Here's the
 * proper comment format for a Rust contract:
 * 
 *     /// @allow ["::admins", "::owner"]
 *     pub fn some_method(&mut self, ...)
 * 
 * @param contract string Name of contract to check permissions for
 * @param method string Method of contract to check permissions for
 * @param account string Account name that may or may not be allowed to call `method` on `contract`
 * @returns boolean true of `account` can call `method` on `contract`, false if not
 */
export async function allows(contract: string, method: MethodName, account: string): Promise<boolean> {
  const def = topLevelSchema.definitions[method]
  const hasField = hasAllowProperty(def)

  // if no `allows` field, then anyone can call this method; return true
  if (!hasField) return true

  return (await Promise.all(def.allow.map(async accountOrMethod => {
    // if `allow` value doesn't start with `::`, then it's a literal account name
    if (accountOrMethod.slice(0, 2) !== '::') {
      return accountOrMethod === account
    }
    // if only has a `::` at beginning, is the name of a method in `contract`
    if (accountOrMethod.split('::').length === 2) {
      const { near } = init(contract)
      const [, method] = accountOrMethod.split('::')
      const accountObj = await near.account(contract);
      const accounts = Array.from(await accountObj.viewFunction(contract, method))
      return accounts.includes(account)
    }
    const [, contractName, method] = accountOrMethod.split('::')
    const { near } = init(contract)
    const accountObj = await near.account(contractName);
    const accounts = Array.from(await accountObj.viewFunction(contract, method))
    return accounts.includes(account)
  }))).reduce((acc, inGroup) => acc || inGroup, false)
}

export const changeMethods = Object.keys(topLevelSchema.definitions).filter(m =>
  hasContractMethod(m as MethodName, "change")
) as MethodName[]

export const viewMethods = Object.keys(topLevelSchema.definitions).filter(m =>
  hasContractMethod(m as MethodName, "view")
) as MethodName[]

export const methods = Object.keys(topLevelSchema.definitions).filter(
  m => hasContractMethod(m as MethodName)
).reduce(
  (all, methodName) => ({ ...all,
    [methodName]: {
      schema: {
        $ref: `#/definitions/${methodName}`,
        ...topLevelSchema,
      }
    }
  }),
  {} as Record<MethodName, Schema>
)

export function getMethod(m?: string | null): Schema | undefined {
  if (!m) return undefined
  if (!hasContractMethod(m as MethodName)) return undefined
  return methods[m as MethodName]
}

type MethodDefinition = {
  additionalProperties?: boolean
  contractMethod?: "view" | "change"
  properties?: {
    args: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema7>
      required?: string[]
      type?: string
    }
    options?: {
      additionalProperties: boolean
      properties: Record<string, JSONSchema7>
      required?: string[]
      type?: string
    }
  },
  required?: string[]
  type?: string
}

export function getDefinition(m?: string): MethodDefinition | undefined {
  if (!m) return undefined
  const def = topLevelSchema.definitions[m as MethodName]
  if (!def) return undefined
  if (!hasContractMethodProperty(def)) return undefined
  return def as MethodDefinition
}