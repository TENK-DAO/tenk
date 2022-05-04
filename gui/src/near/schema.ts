import * as naj from "near-api-js"
import { init } from "."
import { readCustomSection } from "wasm-walrus-tools"
import { ContractCodeView } from "near-api-js/lib/providers/provider"
import { JSONSchema7 } from "json-schema"

export async function fetchSchema(contract: string, near: naj.Near): Promise<JSONSchema7> {
  // TODO handle either HTTP endpoint or IPFS hash
  const url = await fetchJsonAddress(contract, near)

  // TODO cache schema JSON in localeStorage, return early here if available

  const schema = fetch(url)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`)
      return response.json()
    })

  // TODO validate schema adheres to JSONSchema7
  return schema
}

class NoCustomSectionError extends Error {
  constructor() {
    super("Contract Wasm does not have a custom section called \"json\"")
  }
}

async function fetchJsonAddress(contract: string, near: naj.Near): Promise<string> {
  const code = await near.connection.provider.query({
    account_id: contract,
    finality: 'final',
    request_type: 'view_code',
  }) as ContractCodeView
  const wasm = Buffer.from(code.code_base64, "base64")
  const jsonCustomSection = await readCustomSection(wasm, "json")

  if (!jsonCustomSection) {
    throw new NoCustomSectionError()
  }

  return jsonCustomSection
}

export type Schema = { schema: { $ref: string } & JSONSchema7 }

function hasContractMethodProperty(obj: {}): obj is { contractMethod: "change" | "view" } {
  return 'contractMethod' in obj
}

function hasAllowProperty(obj: {}): obj is { allow: string[] } {
  return 'allow' in obj
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

export interface SchemaInterface {
  schema: JSONSchema7
  changeMethods: string[]
  viewMethods: string[]
  methods: Record<string, Schema>
  getMethod: (methodName: string) => Schema | undefined
  getDefinition: (methodName: string) => MethodDefinition | undefined
  /**
   * Check if given method can be called by an account.
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
   * @param method string Method of contract to check permissions for
   * @param account string Account name that may or may not be allowed to call `method` on `contract`
   * @returns boolean true of `account` can call `method` on `contract`, false if not
   */
  canCall: (method: string, account: string) => Promise<boolean>
}

type ContractName = string
const parsedSchemaCache: Record<ContractName, SchemaInterface> = {}

export async function getSchema(contract: string): Promise<SchemaInterface> {
  if (parsedSchemaCache[contract]) return parsedSchemaCache[contract]

  const { near } = init(contract)
  const schema = await fetchSchema(contract, near)

  function hasContractMethod(m: string, equalTo?: "change" | "view"): boolean {
    const def = schema?.definitions?.[m]
    if (!def) return false
    const hasField = hasContractMethodProperty(def)
    if (!hasField) return false
    if (!equalTo) return true
    return def.contractMethod === equalTo
  }

  const changeMethods = Object.keys(schema?.definitions ?? {}).filter(m =>
    hasContractMethod(m, "change")
  ) as string[]

  const viewMethods = Object.keys(schema?.definitions ?? {}).filter(m =>
    hasContractMethod(m, "view")
  ) as string[]

  const methods = Object.keys(schema?.definitions ?? {}).filter(
    m => hasContractMethod(m)
  ).reduce(
    (all, methodName) => ({
      ...all,
      [methodName]: {
        schema: {
          $ref: `#/definitions/${methodName}`,
          ...schema,
        }
      }
    }),
    {} as Record<string, Schema>
  )

  function getMethod(m?: string | null): Schema | undefined {
    if (!m) return undefined
    if (!hasContractMethod(m)) return undefined
    return methods[m]
  }

  function getDefinition(m?: string): MethodDefinition | undefined {
    if (!m) return undefined
    const def = schema?.definitions?.[m]
    if (!def) return undefined
    if (!hasContractMethodProperty(def)) return undefined
    return def as MethodDefinition
  }

  async function canCall(method: string, account: string): Promise<boolean> {
    const def = schema.definitions?.[method]

    // if no definition found for `method` in `schema`, then it is never callable
    if (!def) return false

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
        const [, method] = accountOrMethod.split('::')
        const accountObj = await near.account(contract);
        const accounts = Array.from(await accountObj.viewFunction(contract, method))
        return accounts.includes(account)
      }
      const [, contractName, method] = accountOrMethod.split('::')
      const accountObj = await near.account(contractName);
      const accounts = Array.from(await accountObj.viewFunction(contract, method))
      return accounts.includes(account)
    }))).reduce((acc, inGroup) => acc || inGroup, false)
  }

  return {
    schema,
    viewMethods,
    changeMethods,
    methods,
    getMethod,
    getDefinition,
    canCall,
  }
}