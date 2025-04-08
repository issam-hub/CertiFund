import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function TopBackers({backers}:{backers: any[]}) {
  return (
    <div className="space-y-4">
      {backers.map((backer, index) => (
        <div key={index} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={backer.image_url} alt="Avatar" />
            <AvatarFallback>{backer.username.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{backer.username}</p>
            <p className="text-sm text-muted-foreground">{backer.project_count} projects</p>
          </div>
          <div className="ml-auto text-sm font-medium">{backer.total_raised.toLocaleString()}DA</div>
        </div>
      ))}
    </div>
  )
}

const backers = [
  {
    id: "1",
    name: "Emily Parker",
    avatar: "/placeholder.svg",
    projectsBacked: 35,
    totalContributed: 75000,
  },
  {
    id: "2",
    name: "Michael Brown",
    avatar: "/placeholder.svg",
    projectsBacked: 28,
    totalContributed: 62000,
  },
  {
    id: "3",
    name: "Sarah Thompson",
    avatar: "/placeholder.svg",
    projectsBacked: 24,
    totalContributed: 48000,
  },
  {
    id: "4",
    name: "Robert Garcia",
    avatar: "/placeholder.svg",
    projectsBacked: 20,
    totalContributed: 42000,
  },
  {
    id: "5",
    name: "Jennifer Kim",
    avatar: "/placeholder.svg",
    projectsBacked: 18,
    totalContributed: 36000,
  },
]

