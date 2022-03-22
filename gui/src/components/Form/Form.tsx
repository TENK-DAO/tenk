import React, { useState } from "react";
import { withTheme } from "@rjsf/core";
import snake from "to-snake-case";
import { useLocation } from "react-router-dom"
import useNear from "../../hooks/useNear"
import { Selector } from ".."
import { getMethod, MethodName, methodType } from "../../near/methods"

import css from "./form.module.css"

const FormComponent = withTheme({})

function setUrl(params: URLSearchParams) {
  window.history.replaceState({}, '',
    window.location.href.replace(window.location.search, '?' + params)
  )
}

function resetUrlParams(method: MethodName) {
  const oldParams = new URLSearchParams(window.location.search)
  const newParams = new URLSearchParams({})
  newParams.set('name', oldParams.get('name')!)
  newParams.set('method', method)
  setUrl(newParams)
}

const Display: React.FC<{
  result?: string
  error?: string
}> = ({ result, error }) => {
  if (!result && !error) return null

  return (
    <>
      <strong style={{ paddingBottom: 5 }}>
        {result ? "Result" : "Error"}:
      </strong>
      <pre className={error && css.error}>
        <code className={css.result}>
          {result ?? error}
        </code>
      </pre>
    </>
  )
}

export function Form() {
  const location = useLocation()
  const urlParams = new URLSearchParams(location.search)
  const [method, setMethod] = useState<string | undefined>(urlParams.get('method') ?? undefined)
  const schema = method && getMethod(method)?.schema

  const { TenK } = useNear()
  const [liveValidate, setLiveValidate] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()

  return (
    <>
      <div className="columns">
        <Selector
          value={method && snake(method)}
          onSelected={(newMethod: MethodName) => {
            if (newMethod === method) return
            setResult(undefined)
            setError(undefined)
            setFormData(undefined)
            resetUrlParams(newMethod)
            setMethod(newMethod)
          }}
        />
        <label>
          <input
            type="checkbox"
            onChange={e => setLiveValidate(e.target.checked)}
          />
          Live Validation
        </label>
      </div>
      {schema && (
        <div className="columns" style={{ alignItems: 'flex-start' }}>
          <FormComponent
            liveValidate={liveValidate}
            schema={schema}
            formData={formData}
            onChange={({ formData }: { formData: FormData }) => setFormData(formData)}
            onSubmit={async ({ formData }: any) => {
              setLoading(true)
              setError(undefined)
              try {
                let ty = methodType(method as MethodName);
                let realName = snake(method);
                let res;
                if (ty === "view") {
                  //@ts-expect-error can't see final method name
                  res = await TenK[realName](formData)
                } else {
                  //@ts-expect-error can't see final method name
                  res = await TenK[realName](formData.args, formData.options);
                }
                setResult(JSON.stringify(res, null, 2));
              } catch (e: unknown) {
                if (e instanceof Error) {
                  setError(JSON.stringify(e.message, null, 2))
                } else {
                  setError(JSON.stringify(e))
                }
              } finally {
                setLoading(false)
              }
            }}
          />
          <div>
            {loading
              ? <div className={css.loader} />
              : <Display result={result} error={error} />
            }
          </div>
        </div>
      )}
    </>
  );
}