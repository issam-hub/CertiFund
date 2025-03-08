"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    // Create the search URL with the query
    const searchParams = new URLSearchParams()
    if (query) searchParams.set("q", query)

    // Navigate to the search page with the query
    router.push(`/projects/discover?${searchParams.toString()}`)
  }

  return (
    <form onSubmit={handleSearch} className="relative">
      <div className="relative flex items-center">
        <Input
          type="text"
          placeholder="Search by title"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-4 pr-12 py-6 text-lg rounded-lg border-2 border-accent focus-visible:ring-primary"
        />
        <Button type="submit" size="icon" className="absolute right-2 bg-accentColor hover:bg-secondaryColor text-white">
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </form>
  )
}

