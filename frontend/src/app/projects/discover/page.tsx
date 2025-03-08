import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { SearchBar } from "@/app/_components/project/searchBar"
import { SearchFilters } from "@/app/_components/project/searchFilters"
import { SearchResults } from "@/app/_components/project/searchResults"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const search = await searchParams
  const query = typeof search.q === "string" ? search.q : ""
  const category = typeof search.category === "string" ? search.category : ""
  const sort = typeof search.sort === "string" ? search.sort : "newest"
  const page = typeof search.page === "string" ? Number.parseInt(search.page) : 1

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-mainColor">Discover Projects</h1>
        <p className="text-muted-foreground">Find innovative projects validated by experts in their fields</p>
      </div>

      <SearchBar initialQuery={query} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mt-8">
        <div className="lg:col-span-1">
          <SearchFilters selectedCategory={category} sort={sort} />
        </div>

        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-mainColor" />
                <span className="ml-2">Loading results...</span>
              </div>
            }
          >
            <SearchResults query={query} category={category} sort={sort} page={page} />
          </Suspense>
        </div>
      </div>
    </main>
  )
}

