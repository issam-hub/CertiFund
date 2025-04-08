import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function RecentProjects({projects}:{projects: any[]}) {
  return (
    <div className="space-y-8">
      {projects.map((project, index) => (
        <div key={index} className="flex items-center">
          <div className="ml-4 space-y-1">
            <h4 className="text-sm font-medium leading-none">{project.title}</h4>
            <p className="text-sm text-muted-foreground">by {project.creator}</p>
          </div>
          <div className="ml-auto flex flex-col items-end">
            <p className="text-sm font-medium">{project.total_raised.toLocaleString()}DA</p>
            {/* <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span>{Math.round((project.raised / project.goal) * 100)}%</span>
            </div> */}
          </div>
        </div>
      ))}
    </div>
  )
}
