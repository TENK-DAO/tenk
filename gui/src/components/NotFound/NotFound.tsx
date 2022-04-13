import * as React from "react"
import { Link } from "react-router-dom"

export const NotFound: React.FC<React.PropsWithChildren<unknown>> = ({ children = "Oops" }) => (
  <>
    <h1>404: Not Found</h1>
    <p>{children}</p>
    <p><Link to="/">Go back home</Link></p>
  </>
)
