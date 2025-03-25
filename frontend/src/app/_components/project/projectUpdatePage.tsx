import { getUpdates } from "@/app/_actions/projects"
import { Update } from "@/app/_lib/types"
import { formatRelativeTime } from "@/app/_lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"


export async function ProjectUpdates({ projectId }: { projectId: string }) {

    const result = await getUpdates(projectId)
    if(!result.status){
        throw new Error(result.error)
    }

    const updates = result["updates"]

//   if (loading) {
//     return (
//       <div className="space-y-4">
//         {[1, 2, 3].map((i) => (
//           <Card key={i} className="mb-4">
//             <CardHeader className="pb-2">
//               <Skeleton className="h-6 w-3/4 mb-2" />
//               <Skeleton className="h-4 w-1/4" />
//             </CardHeader>
//             <CardContent>
//               <Skeleton className="h-4 w-full mb-2" />
//               <Skeleton className="h-4 w-full mb-2" />
//               <Skeleton className="h-4 w-3/4" />
//             </CardContent>
//           </Card>
//         ))}
//       </div>
//     )
//   }

  return (
    <div>

      {updates.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-500">No updates have been posted yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {updates.map((update:Update) => (
            <Card key={update.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle><h2 className="text-2xl">{update.title}</h2></CardTitle>
                    <CardDescription>{formatRelativeTime(update.created_at)}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line">{update.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

