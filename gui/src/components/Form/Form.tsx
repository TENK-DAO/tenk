import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import snake from "to-snake-case";
import { useNavigate, useParams } from "react-router-dom"
import useNear from "../../hooks/useNear"
import { Selector } from ".."
import { getMethod, MethodName, methodType } from "../../near/methods"

import css from "./form.module.css"

const FormComponent = withTheme({})

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
  const { TenK } = useNear()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  const [liveValidate, setLiveValidate] = useState<boolean>(false)
  const [formData, setFormData] = useState<FormData>()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const schema = method && getMethod(method)?.schema
  const navigate = useNavigate()

  useEffect(() => {
    setResult(undefined)
    setError(undefined)
    setFormData(undefined)
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ TenK Admin`
    return function onUnmount() {
      document.title = 'TenK Admin'
    }
  }, [contract, method])

  return (
    <>
      <div className="columns">
        <Selector
          value={method && snake(method)}
          onSelected={method => navigate(`/${contract}/${method}`)}
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