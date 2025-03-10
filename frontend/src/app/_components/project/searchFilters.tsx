"use client"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"

// Categories for the crowdfunding platform
const categories = [
  { id: "technology", name: "Technology" },
  { id: "design", name: "Design" },
  { id: "art", name: "Art" },
  { id: "film-video", name: "Film & Video" },
  { id: "music", name: "Music" },
  { id: "games", name: "Games" },
  { id: "publishing-writing", name: "Publishing & Writing" },
  { id: "food-craft", name: "Food & Craft" },
  { id: "socialGood", name: "Social Good" },
  { id: "miscellaneous", name: "Miscellaneous" },
]

// Sorting options
const sortOptions = [
  { value: "-created_at", label: "Newest" },
  { value: "most_funded", label: "Most Funded" },
  { value: "deadline", label: "Ending Soon" },
  { value: "-funding_goal", label: "Highest Goal" },
  { value: "funding_goal", label: "Lowest Goal" },
  { value: "title", label: "A-Z" },
  { value: "-title", label: "Z-A" },
]

export function SearchFilters({
  selectedCategory = "",
  validatedOnly = false,
  sort = "-created_at",
}: {
  selectedCategory?: string
  validatedOnly?: boolean
  sort?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedSort, setSelectedSort] = useState(sort)
  const [isValidatedOnly, setIsValidatedOnly] = useState(validatedOnly)
  const [selectedCategories, setSelectedCategories] = useState<string[]>(selectedCategory ? [selectedCategory] : [])

  // Update the URL when filters change
  const updateFilters = () => {
    const params = new URLSearchParams(window.location.search)

    // Handle categories
    if (selectedCategories.length > 0) {
      params.set("categories", selectedCategories.join(","))
    } else {
      params.delete("categories")
    }

    // // Handle validation filter
    // if (isValidatedOnly) {
    //   params.set("validated", "true")
    // } else {
    //   params.delete("validated")
    // }

    // Handle sort
    if (selectedSort !== "-created_at") {
      params.set("sort", selectedSort)
    } else {
      params.delete("sort")
    }

    // Reset to page 1 when filters change
    params.delete("page")

    router.push(`${pathname}?${params.toString()}`)
  }

  // Apply filters when they change
  useEffect(() => {
    updateFilters()
  }, [selectedCategories, isValidatedOnly, selectedSort])

  // Toggle a category selection
  const toggleCategory = (categoryId: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId)
      } else {
        return [...prev, categoryId]
      }
    })
  }

  // Clear all filters
  const clearFilters = () => {
    setSelectedCategories([])
    setIsValidatedOnly(false)
    setSelectedSort("-created_at")
  }

  return (
    <div className="bg-white dark:bg-dark rounded-lg p-4 border border-accent/30 sticky top-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Clear all
        </Button>
      </div>

      {/* Selected filters */}
      {(selectedCategories.length > 0 || isValidatedOnly) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {selectedCategories.map((categoryId) => (
            <Badge key={categoryId} variant="secondary" className="bg-accentColor hover:bg-secondaryColor text-secondary flex items-center gap-1">
              {categories.find((c) => c.id === categoryId)?.name}
              <button onClick={() => toggleCategory(categoryId)} className="ml-1 rounded-full hover:bg-accentColor/80 p-0.5">
                <span className="sr-only">Remove</span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </Badge>
          ))}

        </div>
      )}

      {/* Sort dropdown */}
      <div className="mb-6">
        <Label htmlFor="sort-by" className="mb-2 block">
          Sort by
        </Label>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              {sortOptions.find((option) => option.value === selectedSort)?.label || "Newest"}
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full" align="start">
            <DropdownMenuRadioGroup value={selectedSort} onValueChange={setSelectedSort}>
              {sortOptions.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Categories */}
      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <span className="text-base font-medium">Categories</span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-2 mt-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                    className="border-accentColor"
                  />
                  <Label htmlFor={`category-${category.id}`} className="cursor-pointer text-sm font-normal">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

