import { getCreatedProjectsTable, getProjectsTable } from "@/app/_actions/dashboard";
import { CreatedProjectManagement } from "@/app/_components/project/tables/userProjects";

export default async function ProjectsPage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  const result = await getCreatedProjectsTable(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }
  return (
    <CreatedProjectManagement projects={result["table"]} meta={result["metadata"]}/>
  )
}


