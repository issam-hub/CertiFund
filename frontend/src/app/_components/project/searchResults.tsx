import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import ProjectComp from "./project"
import Link from "next/link"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { getProjects } from "@/app/_actions/projects"
import { UpdateProjectSchema } from "@/app/_lib/schemas/project"

export async function SearchResults({
  query,
  category,
  sort,
  page,
  validatedOnly,
}: {
  query: string
  category: string
  sort: string
  page: number
  validatedOnly?: boolean
}) {
  const result = await getProjects(page, query, category.split(","), "9", sort)
  if(!result.status){
    throw new Error(result.error)
  }
  const projects = result["projects"]
  const metadata = result["metadata"]


  // If no results found
  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold mb-2 text-mainColor">No projects found</h3>
        <p className="text-muted-foreground mb-6">
          Try adjusting your search or filters to find what you're looking for.
        </p>
        <Button asChild variant="outline" className="border-secondaryColor text-secondaryColor hover:bg-secondaryColor hover:text-white">
          <a href="/projects/discover">Clear all filters</a>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-mainColor">
          {metadata.total_records} {metadata.total_records === 1 ? "Project" : "Projects"} Found
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project:UpdateProjectSchema) => (
          <ProjectComp key={project.project_id} project={project} />
        ))}
      </div>

      {metadata.last_page > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/projects/discover?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "-launched_at" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(Math.max(1, metadata.current_page - 1)),
                  })}`}
                  className={metadata.current_page <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* First page */}
              {metadata.current_page > 2 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/projects/discover?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "-launched_at" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: "1",
                    })}`}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {metadata.current_page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Previous page if not on first page */}
              {metadata.current_page > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/projects/discover?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "-launched_at" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(metadata.current_page - 1),
                    })}`}
                  >
                    {metadata.current_page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink
                  href={`/projects/discover?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "-launched_at" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(metadata.current_page),
                  })}`}
                  isActive
                >
                  {metadata.current_page}
                </PaginationLink>
              </PaginationItem>

              {/* Next page if not on last page */}
              {metadata.current_page < metadata.last_page && (
                <PaginationItem>
                  <PaginationLink
                    href={`/projects/discover?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "-launched_at" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(metadata.current_page + 1),
                    })}`}
                  >
                    {metadata.current_page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {metadata.current_page < metadata.last_page - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page if not already shown */}
              {metadata.current_page < metadata.last_page - 1 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/projects/discover?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "-launched_at" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(metadata.last_page),
                    })}`}
                  >
                    {metadata.last_page}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href={`/projects/discover?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "-launched_at" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(Math.min(metadata.last_page, metadata.current_page + 1)),
                  })}`}
                  className={metadata.current_page === metadata.last_page ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

