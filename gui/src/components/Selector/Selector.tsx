import React, { useEffect, useMemo, useState } from "react";
import snake from "to-snake-case";
import {
  MethodName,
  adminMethods,
  changeMethods,
  viewMethods
} from "../../near/methods";
import { Dropdown } from ".."
import useNear from '../../hooks/useNear'

type Item = {
  children: string
  onSelect: () => void
}

type Items = {
  'Admin Methods'?: Item[]
  'Change Methods'?: Item[]
  'View Methods': Item[]
}

export const Selector: React.FC<{
  value?: string
  onSelected: (method: MethodName) => void
}> = ({ value, onSelected }) => {
  const { wallet, TenK } = useNear()
  const [admins, setAdmins] = useState<string[]>()

  useEffect(() => {
    TenK?.admins().then(setAdmins)
  }, [wallet, TenK])

  const toItem = useMemo(() => (method: MethodName) => ({
    children: snake(method),
    onSelect: () => {
      onSelected(method);
    },
  }), [onSelected])

  const items: Items = useMemo(() => {
    const user = wallet?.getAccountId() as string
    const isAdmin = admins?.includes(user)

    const ret: Items = { 'View Methods': viewMethods.map(toItem) }
    if (user) ret['Change Methods'] = changeMethods.map(toItem)
    if (isAdmin) ret['Admin Methods'] = adminMethods.map(toItem)

    return ret
  }, [wallet, toItem, admins])

  return (
    <Dropdown
      trigger={value ?? "Select contract method"}
      items={Object.keys(items).length === 1
        ? items['View Methods']
        : items
      }
    />
  )
}