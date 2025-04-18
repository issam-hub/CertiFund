import { getPendingProjectsTable } from "@/app/_actions/dashboard";
import { getProjectByReviewer } from "@/app/_actions/projects";
import { ProjectManagement } from "@/app/_components/project/tables/projects";

export default async function ProjectsPage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  const result = await getProjectByReviewer(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }
  return (
    <ProjectManagement projects={result["table"]} meta={result["metadata"]}/>
  )
}

