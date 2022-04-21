import * as React from "react"
import featuredContracts from "./featured-contracts.json"
import { Layout } from ".."
import { init } from "../../near"
import { Link, useNavigate } from "react-router-dom";

export function Home() {
  const [custom, setCustom] = React.useState<string>()
  const [error, setError] = React.useState<string>()
  const navigate = useNavigate()
  return (
    <Layout>
      <h2>Inspect a contract</h2>
      <p>
        This admin panel currently supports contracts with a Wasm Custom Section containing a <code>json</code> field pointed at a URL where the contract's JSON Schema file can be downloaded. This Schema is assumed to be generated from contract Rust code using <code>witme</code>.
      </p>
      <p><a href="./docs" target="_blank">TenK Contract docs</a>.</p>
      <form onSubmit={e => {
        e.preventDefault()

        if (!custom) return

        try {
          navigate(init(custom).contract)
        } catch (e: unknown) {
          if (e instanceof Error) {
            setError(e.message)
          } else {
            setError(String(e))
          }
        }
      }}>
        <label>
          Enter a contract name:
          <br />
          <input value={custom} onChange={e => setCustom(e.target.value)} />
          {error && (
            <div style={{ backgroundColor: "var(--bg-red)" }}>{error}</div>
          )}
        </label>
      </form>
      <p>Or select one from below:</p>
      <ul>
        {featuredContracts.map(contract => (
          <li key={contract}>
            <Link to={contract}>{contract}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}