import React from "react"
import { Nav } from ".."
import "./layout.scss"

export const Layout: React.FC<React.PropsWithChildren<unknown>> = ({ children }) => {
  return (
    <div className="container">
      <Nav />
      {children}
    </div>
  )
}