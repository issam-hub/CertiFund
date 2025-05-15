import { calculateDateDifference } from "@/app/_lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"

export function ProjectStatistics({ projectStats }:any) {
  return (
    <div className="space-y-4">
      {projectStats.length > 0 ? (projectStats.map((project:any, index: number) => {
        const fundingPercentage = Math.min(Math.round((project.current_funding / project.funding_goal)*100), 100)
        const isFundingOver = new Date().toISOString() > project.deadline
        const didProjectMakeIt = project.current_funding >= project.funding_goal
        return(
            <Card key={index} className="overflow-hidden">
            <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                <div>
                    <p className="font-medium">{project.title}</p>
                    <div className="flex flex-wrap gap-2">
                        {project.categories.map((category:string, index:number) => (
                        <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                            {category}
                        </Badge>
                        ))}
                    </div>
                </div>
                <div className="text-right">
                    <p className="font-medium">{project.current_funding.toLocaleString()}DA</p>
                    <p className="text-xs text-muted-foreground">
                    {Math.round((project.current_funding / project.funding_goal) * 100)}% of {project.funding_goal.toLocaleString()}DA
                    </p>
                </div>
                </div>
                <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
                    <div style={{width:`${fundingPercentage}%`}} className={`h-2 rounded-full ${(isFundingOver && didProjectMakeIt) ? "bg-[#047857]" : (isFundingOver && !didProjectMakeIt) ? "bg-red-500" : "bg-accentColor"} absolute top-0 left-0`}></div>
                    </div>
                <div className="text-sm text-gray-600 text-right">{fundingPercentage}% funded</div>
                <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{project.backers} backers</span>
                <span>{calculateDateDifference(project.deadline)}</span>
                </div>
            </CardContent>
            </Card>
        )   
      })) : (
        <div className="text-center text-gray-500 my-20">
          <p>No projects found.</p>
        </div>
      )}
    </div>
  )
}

