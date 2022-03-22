import topLevelSchema from "./contracts/tenk/index.schema.json";
import { JSONSchema7 } from "json-schema";

export type MethodName = keyof typeof topLevelSchema.definitions
export type Schema = { schema: { $ref: string } & JSONSchema7 }

function hasContractMethodProperty(obj: {}): obj is {contractMethod: "change" | "view"} {
  return 'contractMethod' in obj
}

function hasContractMethod(m: MethodName, equalTo?: "change" | "view") {
  const def = topLevelSchema.definitions[m]
  const hasField = hasContractMethodProperty(def)
  if (!hasField) return false
  if (!equalTo) return true
  return def.contractMethod === equalTo
}

export const changeMethods = Object.keys(topLevelSchema.definitions).filter(
  m => hasContractMethod(m as MethodName, "change")
) as MethodName[]

export const viewMethods = Object.keys(topLevelSchema.definitions).filter(
  m => hasContractMethod(m as MethodName, "view")
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

export function methodType(m: MethodName): "change" | "view" {
  if (changeMethods.includes(m)) { return "change" }
  return "view";
}