import React, { useEffect, useMemo, useState } from "react";
import { withTheme } from "@rjsf/core";
import snake from "to-snake-case";
import { useNavigate, useParams, useSearchParams } from "react-router-dom"
import useNear from "../../hooks/useNear"
import { Selector } from ".."
import { getMethod, getDefinition } from "../../near/methods"

import css from "./form.module.css"

type Data = Record<string, any>

type FormData = {
  args: Data
  options?: Data
}

type WrappedFormData = {
  formData?: FormData
}

const FormComponent = withTheme({})

const Display: React.FC<React.PropsWithChildren<{
  result?: string
  error?: string
}>> = ({ result, error }) => {
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

function encodeData(formData: FormData): { data: string } {
  const data = encodeURIComponent(JSON.stringify(formData))
  return { data }
}

const decodeDataCache: [string | undefined, FormData | undefined] = [undefined, undefined]

/**
 * Parse URL search params for `data` param and decode it using `decodeURIComponent` and `JSON.parse`.
 * @param searchParams URLSearchParams object from `useSearchParams` from `react-router-dom`
 * @returns value of decoded `data` param with exact same object identity as long as param has not changed. This allows using it in React effect dependencies without infinite loops.
 */
function decodeData(searchParams: URLSearchParams): undefined | FormData {
  const entries = Object.fromEntries(searchParams.entries())
  const { data } = entries ?? '{}' as { data?: string }
  if (!data) return undefined
  if (decodeDataCache[0] === data) return decodeDataCache[1]
  decodeDataCache[0] = data
  decodeDataCache[1] = JSON.parse(decodeURIComponent(data))
  return decodeDataCache[1]
}

function allFilled(formData?: FormData, required?: string[]) {
  if (!required) return true
  if (!formData) return false
  return required.reduce(
    (acc, field) => acc && ![undefined, null, ''].includes(formData.args[field]),
    true
  )
}

export function Form() {
  const { TenK } = useNear()
  const { contract, method } = useParams<{ contract: string, method: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const formData = decodeData(searchParams)
  const [liveValidate, setLiveValidate] = useState<boolean>(false)
  const [result, setResult] = useState<any>()
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<any>()
  const schema = method && getMethod(method)?.schema
  const navigateRaw = useNavigate()

  const setFormData = useMemo(() => ({ formData: newFormData }: WrappedFormData) => {
    setSearchParams(
      newFormData ? encodeData(newFormData) : '',
      { replace: true }
    )
  }, [setSearchParams])

  const navigate = useMemo(() => (path: string) => {
    setResult(undefined)
    setError(undefined)
    navigateRaw(path)
  }, [navigateRaw])


  const onSubmit = useMemo(() => async ({ formData }: WrappedFormData) => {
    setLoading(true)
    setError(undefined)
    try {
      // @ts-expect-error can't see final method name
      const res = await TenK[snake(method)](formData?.args, formData?.options)
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

  // update page title based on current contract & method; reset on component unmount
  useEffect(() => {
    document.title = `${method ? `${snake(method)} ‹ ` : ''}${contract} ‹ TenK Admin`
    return () => { document.title = 'TenK Admin' }
  }, [contract, method])

  // at first load, auto-submit if required arguments are fill in
  useEffect(() => {
    const def = getDefinition(method)
    if (def?.contractMethod === 'view' && allFilled(formData, def?.properties?.args?.required)) {
      setTimeout(() => onSubmit({ formData }), 100)
    }
    // purposely only re-check this when method changes;
    // don't want to auto-submit while filling in form, but do when changing methods
  }, [method]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <div className="columns">
        <Selector
          value={method && snake(method)}
          onSelected={newMethod => {
            if (method !== newMethod) {
              navigate(`/${contract}/${newMethod}`)
            }
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
            key={method /* re-initialize form when method changes */}
            liveValidate={liveValidate}
            schema={schema}
            formData={formData}
            onChange={setFormData}
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