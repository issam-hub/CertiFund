"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useDebounce } from "@/components/ui/multipleSelector"

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const debouncedQuery = useDebounce(query, 500)
  const router = useRouter()

  
  useEffect(()=>{
    const handleSearch = () => {
      // Create the search URL with the query
      const searchParams = new URLSearchParams()
      if (query) searchParams.set("q", query)
  
      // Navigate to the search page with the query
      router.push(`/projects/discover?${searchParams.toString()}`)
    }
    handleSearch()
  },[debouncedQuery])




  return (
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search by title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-4 pr-12 py-6 text-lg rounded-lg border"
        />
        <Search className="h-5 w-5 absolute right-4 text-accentColor bg-transparent hover:bg-transparent hover:text-secondaryColor" />
      </div>
  )
}

