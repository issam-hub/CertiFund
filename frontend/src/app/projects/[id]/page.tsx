import { getProject } from "@/app/actions/projects"
import ProjectOverview from "@/app/components/project/projectOverview"
import { notFound} from "next/navigation"

export default async function page({params}:{params: Promise<{id: string}>}) {
    const id = (await params).id

    const result = await getProject(id)

  if(result.error && result.error === "Project not found"){
    return (
      notFound()
    )
  }
  return (
    <ProjectOverview data={result["project"]}/>
  )
}
