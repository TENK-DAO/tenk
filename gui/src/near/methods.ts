import topLevelSchema from "./contracts/tenk/index.schema.json";
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

function allowsAdmin(m: MethodName): boolean {
  const def = topLevelSchema.definitions[m]
  const hasField = hasAllowProperty(def)
  if (!hasField) return false
  return def.allow.includes('::admins')
}

export const adminMethods = Object.keys(topLevelSchema.definitions).filter(m =>
  allowsAdmin(m as MethodName)
) as MethodName[]

export const changeMethods = Object.keys(topLevelSchema.definitions).filter(m =>
  hasContractMethod(m as MethodName, "change") &&
    !adminMethods.includes(m as MethodName) &&
    !['New', 'NewDefaultMeta'].includes(m)
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