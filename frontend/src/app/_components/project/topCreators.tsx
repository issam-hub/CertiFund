import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopCreators({creators}:{creators: any[]}) {
  return (
    <div className="space-y-4">
      {creators.map((creator,index) => (
        <div key={creator} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={creator.image_url} alt="Avatar" />
            <AvatarFallback>{creator.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{creator.username}</p>
            <p className="text-sm text-muted-foreground">{creator.project_count} projects</p>
          </div>
          <div className="ml-auto text-sm font-medium">{creator.total_raised.toLocaleString()}DA</div>
        </div>
      ))}
    </div>
  )
}
