import React, { useEffect, useState } from "react";
import { withTheme } from "@rjsf/core";
import snake from "to-snake-case";
import { useNavigate, useParams } from "react-router-dom"
import useNear from "../../hooks/useNear"
import { Selector } from ".."
import { getMethod, getDefinition } from "../../near/methods"

import css from "./form.module.css"

type Data = Record<string, any>

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
  const [formData, setFormData] = useState<Data>()
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const schema = method && getMethod(method)?.schema
  const navigate = useNavigate()

  const onSubmit = React.useMemo(() => async function onSubmitRaw(
    { formData }: { formData: { args: Data, options?: Data } }
  ) {
    setLoading(true)
    setError(undefined)
    try {
      // @ts-expect-error can't see final method name
      const res = await TenK[snake(method)](formData.args, formData.options)
      setResult(JSON.stringify(res, null, 2));
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? JSON.stringify(e.message, null, 2)
          : JSON.stringify(e)
      )
    } finally {
      setLoading(false)
    }
  }, [TenK, method])

  useEffect(() => {
    setResult(undefined)
    setError(undefined)
    setFormData(undefined)
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ TenK Admin`

    // auto-submit if no arguments to fill in
    const def = getDefinition(method)
    if (def?.contractMethod === 'view' && !def?.properties?.args?.required) {
      onSubmit({ formData: { args: {} } })
    }

    return function onUnmount() {
      document.title = 'TenK Admin'
    }
  }, [contract, method, onSubmit])

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
            onChange={({ formData }: { formData: Data }) => setFormData(formData)}
            onSubmit={onSubmit}
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