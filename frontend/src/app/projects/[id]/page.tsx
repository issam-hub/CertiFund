import { getProject } from "@/app/_actions/projects"
import ProjectOverview from "@/app/_components/project/projectOverview"

export default async function page({params}:{params: Promise<{id: string}>}) {
    const id = (await params).id

    const result = await getProject(id)

  return (
    <ProjectOverview data={result["project"]}/>
  )
}
