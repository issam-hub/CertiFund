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

// Mock function to simulate fetching projects
// In a real app, this would be a server action or API call
async function getProjects({
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
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  // Mock backend response matching the provided format
  const mockResponse = {
    message: "Projects returned successfully",
    metadata: {
      current_page: page,
      page_size: 2,
      first_page: 1,
      last_page: 3,
      total_records: 5,
    },
    projects: [
      {
        project_id: 1,
        title: "EcoSmart: Sustainable Smart Home System",
        description: "A fully integrated smart home system focused on energy efficiency and sustainability.",
        funding_goal: 50000,
        current_funding: 42500,
        categories: ["tech", "design"],
        deadline: "2025-03-23T16:30:00+02:00",
        status: "Live",
        project_img: "/placeholder.svg?height=200&width=350",
        campaign: "Green Living",
        version: 1,
        creator_id: 101,
      },
      {
        project_id: 2,
        title: "Pixel Pals: Retro Gaming Mini-Console",
        description: "A handheld console packed with 500+ retro games for nostalgic gamers.",
        funding_goal: 5000,
        current_funding: 3000,
        categories: ["games"],
        deadline: "2025-04-04T16:30:00+02:00",
        status: "Live",
        project_img: "/placeholder.svg?height=200&width=350",
        campaign: "Gaming Revolution",
        version: 11,
        creator_id: 2,
      },
      // {
      //   project_id: 3,
      //   title: "Melodica: AI-Powered Music Composition Tool",
      //   description: "Create professional music with the help of advanced AI algorithms tailored to your style.",
      //   funding_goal: 30000,
      //   current_funding: 18600,
      //   categories: ["tech", "music"],
      //   deadline: "2025-03-30T16:30:00+02:00",
      //   status: "Live",
      //   project_img: "/placeholder.svg?height=200&width=350",
      //   campaign: "Future of Music",
      //   version: 2,
      //   creator_id: 103,
      // },
      // {
      //   project_id: 4,
      //   title: "Urban Oasis: Vertical Garden Solutions",
      //   description: "Modular vertical gardens designed for urban spaces with automated irrigation systems.",
      //   funding_goal: 25000,
      //   current_funding: 10250,
      //   categories: ["design", "food"],
      //   deadline: "2025-04-08T16:30:00+02:00",
      //   status: "Live",
      //   project_img: "/placeholder.svg?height=200&width=350",
      //   campaign: "Urban Farming",
      //   version: 3,
      //   creator_id: 104,
      // },
      // {
      //   project_id: 5,
      //   title: "Quantum Comics: Interactive Graphic Novel",
      //   description: "A groundbreaking graphic novel with AR integration for an immersive storytelling experience.",
      //   funding_goal: 15000,
      //   current_funding: 14250,
      //   categories: ["publishing", "art"],
      //   deadline: "2025-03-13T16:30:00+02:00",
      //   status: "Live",
      //   project_img: "/placeholder.svg?height=200&width=350",
      //   campaign: "Next-Gen Storytelling",
      //   version: 5,
      //   creator_id: 105,
      // },
    ],
  }

  // Apply client-side filtering if needed (in a real app, this would be handled by the backend)
  let filteredProjects = [...mockResponse.projects]

  // Filter by category if provided
  if (category) {
    const categories = category.split(",")
    filteredProjects = filteredProjects.filter((project) => categories.some((cat) => project.categories.includes(cat)))
  }

  // Filter by search query if provided
  if (query) {
    const lowerQuery = query.toLowerCase()
    filteredProjects = filteredProjects.filter(
      (project) =>
        project.title.toLowerCase().includes(lowerQuery)
    )
  }

  const metadata = {
    ...mockResponse.metadata
  }


  return {
    projects: filteredProjects,
    totalProjects: metadata.total_records,
    totalPages: metadata.last_page,
    currentPage: metadata.current_page,
  }
}

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
  const { projects, totalProjects, totalPages, currentPage } = await getProjects({
    query,
    category,
    sort,
    page,
    validatedOnly,
  })

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
          {totalProjects} {totalProjects === 1 ? "Project" : "Projects"} Found
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectComp key={project.project_id} project={project} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href={`/search?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "newest" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(Math.max(1, currentPage - 1)),
                  })}`}
                  className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>

              {/* First page */}
              {currentPage > 2 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/search?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: "1",
                    })}`}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Previous page if not on first page */}
              {currentPage > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/search?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(currentPage - 1),
                    })}`}
                  >
                    {currentPage - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Current page */}
              <PaginationItem>
                <PaginationLink
                  href={`/search?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "newest" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(currentPage),
                  })}`}
                  isActive
                >
                  {currentPage}
                </PaginationLink>
              </PaginationItem>

              {/* Next page if not on last page */}
              {currentPage < totalPages && (
                <PaginationItem>
                  <PaginationLink
                    href={`/search?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(currentPage + 1),
                    })}`}
                  >
                    {currentPage + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Ellipsis if needed */}
              {currentPage < totalPages - 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last page if not already shown */}
              {currentPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/search?${new URLSearchParams({
                      ...(query ? { q: query } : {}),
                      ...(category ? { category } : {}),
                      ...(sort !== "newest" ? { sort } : {}),
                      ...(validatedOnly ? { validated: "true" } : {}),
                      page: String(totalPages),
                    })}`}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationNext
                  href={`/search?${new URLSearchParams({
                    ...(query ? { q: query } : {}),
                    ...(category ? { category } : {}),
                    ...(sort !== "newest" ? { sort } : {}),
                    ...(validatedOnly ? { validated: "true" } : {}),
                    page: String(Math.min(totalPages, currentPage + 1)),
                  })}`}
                  className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  )
}

