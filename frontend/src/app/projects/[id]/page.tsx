import { getProject, getUpdates } from "@/app/_actions/projects"
import ProjectOverview from "@/app/_components/project/projectOverview"
import { redirect } from "next/navigation"

export default async function page({params}:{params: Promise<{id: string}>}) {
    const id = (await params).id

    const result = await getProject(id)
    if(!result.status){
      if(result.error === "You don't have ownership over this ressource"){
        throw new Error("forbidden")
      }else{
        throw new Error(result.error)
      }
    }

    const updateResult = await getUpdates(id)
    if(!updateResult.status){
        throw new Error(updateResult.error)
    }

    const updates = updateResult["updates"].reverse()

  return (
    <ProjectOverview data={result["project"]} updates={updates}/>
  )
}
