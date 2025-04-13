import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Overview } from "@/app/_components/project/dashOverview"
import { RecentProjects } from "@/app/_components/project/recentProjects"
import { TopCreators } from "@/app/_components/project/topCreators"
import { ProjectStats } from "@/app/_components/project/projectStats"
import { TopBackers } from "@/app/_components/project/topBackers"
import { CircleX, HandCoins, PartyPopper, Rocket, Sparkle, Undo2, Users, Wallet } from "lucide-react"
import { getGeneralStats, getProjectsOverview, getTopFiveUsers, getTopFiveProjects, getCategoriesDistribution, getCreatorsAndBackers, getBackingsAndRefunds } from "@/app/_actions/dashboard"
import CategoriesDistribution from "@/app/_components/project/categoriesDistribution"
import CreatorsBackers from "@/app/_components/project/creatorsBackers"
import RefundRate from "@/app/_components/project/refundRate"
import BackingsRefunds from "@/app/_components/project/backingsRefunds"

export default async function Dashboardpage() {
  const generalStatsResult = await getGeneralStats()
  if(!generalStatsResult.status){
    throw new Error(generalStatsResult.error)
  }
  const generalStats = generalStatsResult["stats"]

  const overviewResult = await getProjectsOverview()
  if(!overviewResult.status){
    throw new Error(overviewResult.error)
  }
  const overview = overviewResult["overview"]
  
  const categoriesResult = await getCategoriesDistribution()
  if(!categoriesResult.status){
    throw new Error(categoriesResult.error)
  }
  const categoriesDist = categoriesResult["data"]

  const topProjectsResult = await getTopFiveProjects()
  if(!topProjectsResult.status){
    throw new Error(topProjectsResult.error)
  }
  const topProjects = topProjectsResult["projects"]

  const topCreatorsResult = await getTopFiveUsers("topCreators")
  if(!topCreatorsResult.status){
    throw new Error(topCreatorsResult.error)
  }
  const topCreators = topCreatorsResult["creators"]

  const topBackersResult = await getTopFiveUsers("topBackers")
  if(!topBackersResult.status){
    throw new Error(topBackersResult.error)
  }
  const topBackers = topBackersResult["backers"]
  
  const creatorsBackersResult = await getCreatorsAndBackers()
  if(!creatorsBackersResult.status){
    throw new Error(creatorsBackersResult.error)
  }
  const creatorsBackers = creatorsBackersResult["growth"]

  const backingsRefundsResult = await getBackingsAndRefunds()
  if(!backingsRefundsResult.status){
    throw new Error(backingsRefundsResult.error)
  }
  const backingsRefunds = backingsRefundsResult["data"]
  
  return (
    <div className="container mx-auto px-5 py-10">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Projects</h2></CardTitle>
            <Rocket className="text-accentColor h-6 w-6"/>
          </CardHeader> 
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Money Raised</h2></CardTitle>
            <Wallet className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_money_raised}DA</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Successful Projects</h2></CardTitle>
            <PartyPopper className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.successful_projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Failed Projects</h2></CardTitle>
            <CircleX className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.failed_projects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total backers</h2></CardTitle>
            <Users className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_backers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total creators</h2></CardTitle>
            <Sparkle className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_creators}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total Backings</h2></CardTitle>
            <HandCoins className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_backings}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium"><h2>Total refunds</h2></CardTitle>
            <Undo2 className="text-accentColor h-6 w-6"/>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{generalStats.total_refunds}</div>
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle><h2>Overview</h2></CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={overview} />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Top 5 Projects</h2></CardTitle>
            <CardDescription>Projects with the highest funding received</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentProjects projects={topProjects} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><h2>Top 5 Creators</h2></CardTitle>
            <CardDescription>Ranked by number of projects created</CardDescription>
          </CardHeader>
          <CardContent>
            <TopCreators creators={topCreators} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle><h2>Top 5 Backers</h2></CardTitle>
            <CardDescription>Ranked by total amount contributed</CardDescription>
          </CardHeader>
          <CardContent>
            <TopBackers backers={topBackers} />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Project Success Rate</h2></CardTitle>
            <CardDescription>Monthly success vs. failure rate</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectStats data={overview} />
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Categories Distribution</h2></CardTitle>
            <CardDescription>The distribution of trending categories in created projects</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriesDistribution data={categoriesDist} />
          </CardContent>
        </Card>
        <Card className="col-span-full">
          <CardHeader>
            <CardTitle><h2>Backings vs Refunds</h2></CardTitle>
            <CardDescription>Monthly comparison of backings and refunds</CardDescription>
          </CardHeader>
          <CardContent>
            <BackingsRefunds monthlyData={backingsRefunds}/>
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Creators & Backers Growth</h2></CardTitle>
            <CardDescription>Monthly growth of creators and backers</CardDescription>
          </CardHeader>
          <CardContent>
            <CreatorsBackers monthlyData={creatorsBackers}/>
          </CardContent>
        </Card>
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle><h2>Refund Rate Trend</h2></CardTitle>
            <CardDescription>Monthly refund rate as percentage of backings</CardDescription>
          </CardHeader>
          <CardContent>
            <RefundRate monthlyData={backingsRefunds}/>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

