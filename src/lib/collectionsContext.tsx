"use client"

import React, { createContext, useContext } from "react"
import { supabase } from "./supabase"
import { useQuery } from "@tanstack/react-query"

type Collection = {
  id: string
  theme?: string | null
  description?: string | null
  name?: string | null
  ordinal?: number | null
}

type CollectionsState = {
  collectionsById: Record<string, Collection>
  list: Collection[]
  getTheme: (id?: string | null) => string | null
  isLoading: boolean
}

const CollectionsContext = createContext<CollectionsState | undefined>(undefined)

export function CollectionsProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading } = useQuery({
    queryKey: ["collections"],
    queryFn: async () => {
      const { data, error } = await supabase.from("collections").select("*").order("ordinal", { ascending: true })
      if (error) throw error
      return (data ?? []) as Collection[]
    },
    staleTime: 5 * 60 * 1000,
  })

  const list = data ?? []
  const collectionsById: Record<string, Collection> = {}
  list.forEach((c) => (collectionsById[c.id] = c))

  function getTheme(id?: string | null) {
    if (!id) return null
    const c = collectionsById[id]
    if (!c) return null
    return c.theme ?? c.description ?? c.name ?? null
  }

  const value: CollectionsState = {
    collectionsById,
    list,
    getTheme,
    isLoading: !!isLoading,
  }

  return <CollectionsContext.Provider value={value}>{children}</CollectionsContext.Provider>
}

export function useCollections() {
  const ctx = useContext(CollectionsContext)
  if (!ctx) throw new Error("useCollections must be used within CollectionsProvider")
  return ctx
}
