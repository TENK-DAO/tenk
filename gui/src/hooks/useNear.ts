import { useParams } from "react-router-dom"
import { ContractInterface, init, UnknownNetworkError } from "../near"

/**
 * Get `contract` from url params and use it to initialize near connection.
 *
 * If no `contract` in url params, returns blanks
 */
export default function useNear(): Partial<ContractInterface> {
  const { contract } = useParams<{contract: string }>()

  if (!contract) return {}

  try {
    return init(contract)
  } catch (e: unknown) {
    if (e instanceof UnknownNetworkError) {
      return { contract }
    }
    throw e
  }
}