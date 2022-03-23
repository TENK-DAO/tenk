import * as React from "react";
import { useParams } from "react-router-dom"
import { init } from "../../near"
import { Form, Layout, NotFound } from ".."

export function Contract() {
  const { contract } = useParams<{ contract: string }>()
  let errorMessage: string | null = null

  if (!contract) {
    errorMessage = "No `contract` param provided; how is this possible?"
  } else {
    try {
      init(contract)
    } catch (e: unknown) {
      if (e instanceof Error) {
        errorMessage = e.message
      } else {
        errorMessage = String(e)
      }
    }
  }

  return (
    <Layout>
      {errorMessage
        ? <NotFound>{errorMessage}</NotFound>
        : <Form />
      }
    </Layout>
  )
}