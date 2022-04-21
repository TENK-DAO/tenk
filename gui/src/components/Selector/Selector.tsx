import React, { useEffect, useMemo, useState } from "react";
import snake from "to-snake-case";
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
  onSelected: (method: string) => void
}> = ({ value, onSelected }) => {
  const { wallet, contract, viewMethods, changeMethods, canCall } = useNear()
  const [items, setItems] = useState<Items>()
  const user = wallet?.getAccountId() as string

  const toItem = useMemo(() => (method: string) => ({
    children: snake(method),
    onSelect: () => {
      onSelected(method);
    },
  }), [onSelected])

  useEffect(() => {
    (async () => {
      const itemsPartial: Items = { 'View Methods': viewMethods.map(toItem) }

      if (contract && user) {
        const allowed = await Promise.all(
          changeMethods.map(method => canCall(method, user))
        )

        const filteredChangeMethods = changeMethods.filter((_, i) => allowed[i])

        if (filteredChangeMethods.length > 0) {
          itemsPartial['Change Methods'] = filteredChangeMethods.map(toItem)
        }
      }

      setItems(itemsPartial)
    })()
  }, [contract, canCall, viewMethods, changeMethods, user, toItem])

  return (
    <Dropdown
      trigger={value ?? "Select contract method"}
      items={!items ? [] : Object.keys(items).length === 1
        ? items['View Methods']
        : items
      }
    />
  )
}