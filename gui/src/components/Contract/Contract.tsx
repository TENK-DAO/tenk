import * as React from "react";
import { useParams } from "react-router-dom"
import { init } from "../../near"
import { Form, NotFound } from ".."

export function Contract() {
  const { contractName } = useParams<{ contractName: string }>()
  let errorMessage: string | null = null

  if (!contractName) {
    errorMessage = "No `contractName` param provided; you may have typed in this URL manually."
  } else {
    try {
      init(contractName)
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMessage = e.message
      } else {
        errorMessage = String(e)
      }
    }
  }

  if (errorMessage) {
    return (
      <NotFound>
        {errorMessage}
      </NotFound>
    )
  }

  return <Form />
}