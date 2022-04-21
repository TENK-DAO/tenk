import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import {
  ContractInterface,
  init,
  getSchema,
  SchemaInterface,
} from "../near"

type ContractName = string

const stub = {
  contract: undefined,
  config: undefined,
  near: undefined,
  wallet: undefined,
  signIn: () => { },
  signOut: () => { },
  schema: undefined,
  changeMethods: [] as string[],
  viewMethods: [] as string[],
  methods: {},
  getMethod: () => undefined,
  getDefinition: () => undefined,
  canCall: () => false,
} as const

type NearInterface = ContractInterface & SchemaInterface

/**
 * Get `contract` from url params and use it to initialize near connection.
 *
 * If no `contract` in url params, returns blanks
 */
export default function useNear(): NearInterface | typeof stub {
  const { contract } = useParams<{ contract: ContractName }>()
  const [cache, setCache] = useState<Record<ContractName, NearInterface>>({})

  useEffect(() => {
    if (!contract || cache[contract]) return

    (async () => {
      setCache({
        ...cache,
        [contract]: {
          ...init(contract),
          ...await getSchema(contract),
        }
      })
    })()
  }, [cache, contract])

  if (!contract) return stub
  return cache[contract] ?? stub
}