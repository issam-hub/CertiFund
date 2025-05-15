import { getReviewerPerformance, getReviewerStats } from "@/app/_actions/dashboard"
import Performance from "@/app/_components/reviewer/performance"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CircleCheckBig, CircleX, Clock3, TriangleAlert } from "lucide-react"


export default async function Dashboardpage() {
  const performance = await getReviewerPerformance()
  if (!performance.status){
    throw new Error(performance.error)
  }
  const result = await getReviewerStats()
  if (!result.status){
    throw new Error(result.error)
  }
  return (
    <div className="container mx-auto px-5 py-10">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium"><h2>Pending Reviews</h2></CardTitle>
          <Clock3 className="text-accentColor h-6 w-6"/>
        </CardHeader> 
        <CardContent>
          <div className="text-2xl font-bold">{result["stats"]["pending_reviews"]}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium"><h2>Approved Projects</h2></CardTitle>
          <CircleCheckBig className="text-accentColor h-6 w-6"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{result["stats"]["approved_reviews"]}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium"><h2>Rejected Projects</h2></CardTitle>
          <CircleX className="text-accentColor h-6 w-6"/>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{result["stats"]["rejected_reviews"]}</div>
        </CardContent>
      </Card>
    </div>
    <div className="mt-10">
      <Performance weeklyReviewData={performance["performance"]} />
    </div>
  </div>
  )
}

