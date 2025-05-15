import {getBackedProjectsStatistics, getFundingProgress, getLiveProjectsStatistics, getUserStats } from "@/app/_actions/dashboard"
import { Overview } from "@/app/_components/project/dashOverview"
import { ProjectStatistics } from "@/app/_components/user/projectStats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Folder, HandCoins, TrendingUp, Wallet } from "lucide-react"

export default async function Dashboardpage() {
  const statsResult = await getUserStats()
  if (!statsResult.status){
    throw new Error(statsResult.error)
  }

  const progressResult = await getFundingProgress()
  if (!progressResult.status){
    throw new Error(progressResult.error)
  }

  const createdProjectsResult = await getLiveProjectsStatistics()
  if (!createdProjectsResult.status){
    throw new Error(createdProjectsResult.error)
  }

  const backedProjectsResult = await getBackedProjectsStatistics()
  if (!backedProjectsResult.status){
    throw new Error(backedProjectsResult.error)
  }

  return (  
    <div className="container mx-auto px-5 py-10">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Projects</h2></CardTitle>
            <Folder className="text-accentColor h-6 w-6"/>
          </CardHeader> 
          <CardContent>
            <div className="text-2xl font-bold">{statsResult["stats"]["total_projects"]}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Raised</h2></CardTitle>
            <Wallet className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResult["stats"]["total_raised"]}DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Projects Backed</h2></CardTitle>
            <HandCoins className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResult["stats"]["projects_backed"]}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Backed</h2></CardTitle>
            <TrendingUp className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResult["stats"]["total_backed"]}DA</div>
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle><h2>Project Performance</h2></CardTitle>
            <CardDescription>View your project funding progress over time</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={progressResult["progress"]} />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Created Projects</h2></CardTitle>
            <CardDescription>Key metrics for your last five live projects</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProjectStatistics projectStats={createdProjectsResult["projects"]} />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Backed Projects</h2></CardTitle>
            <CardDescription>Key metrics for your last five backed projects</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ProjectStatistics projectStats={backedProjectsResult["projects"]} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

