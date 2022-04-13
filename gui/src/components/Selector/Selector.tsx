import * as React from "react";
import snake from "to-snake-case";
import { MethodName, changeMethods, viewMethods } from "../../near/methods";
import { Dropdown } from ".."

export const Selector: React.FC<React.PropsWithChildren<{
  value?: string
  onSelected: (method: MethodName) => void
}>> = ({ value, onSelected }) => {
  const toItem = (method: MethodName) => ({
    children: snake(method),
    onSelect: () => {
      onSelected(method);
    },
  })

  return (
    <Dropdown
      trigger={value ?? "Select contract method"}
      items={{
        'Change Methods': changeMethods.map(toItem),
        'View Methods': viewMethods.map(toItem),
      }}
    />
  )
}