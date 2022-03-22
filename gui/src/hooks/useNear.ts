import { useParams } from "react-router-dom"
import { ContractInterface, init, UnknownNetworkError } from "../near"

/**
 * Get `contract` from url params and use it to initialize near connection.
 *
 * If no `contract` in url params, returns blanks
 */
export default function useNear(): Partial<ContractInterface> {
  const { contractName } = useParams<{contractName: string }>()

  if (!contractName) return {}

  try {
    return init(contractName)
  } catch (e: unknown) {
    if (e instanceof UnknownNetworkError) {
      return { contract: contractName }
    }
    throw e
  }
}