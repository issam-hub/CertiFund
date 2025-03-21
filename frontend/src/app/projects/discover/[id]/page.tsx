import { Suspense } from "react"
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Separator } from "@/components/ui/separator"
import { ArrowLeft, BadgeCheck, Bookmark, Calendar, CalendarDays, Clock, Heart, Share2, Target, Users } from "lucide-react"
import { didIbackThisProject, getBackersCount, getProject, getProjectPublic } from "@/app/_actions/projects"
import { UpdateProjectSchema } from "@/app/_lib/schemas/project"
import { Separator } from "@/components/ui/separator"
import parse from 'html-react-parser';
import { calculateDateDifferenceJSON } from "@/app/_lib/utils"
import { getUser } from "@/app/_actions/user"
import BackProjectButton from "@/app/_components/project/backProjectButton"
import ProjectActions from "@/app/_components/project/projectActions"
import { RefundButton } from "@/app/_components/project/refundButton"
import RewardsSection from "@/app/_components/project/rewardSection"

export default async function ProjectDetailsPage({params}:{params: Promise<{id:string}>}) {
    const {id} = await params
  const result = await getProjectPublic(id)

  if(!result.status){
    if(result.error === "You don't have ownership over this ressource"){
      throw new Error("forbidden")
    }else{
      throw new Error(result.error)
    }
  }

  
  const project = result["project"]

  const userResult = await getUser(project.creator_id)
  if(!result.status){
    throw new Error(result.error)
  }
  const creator = userResult["user"]

  const backersResult = await getBackersCount(project.project_id)
  if(!result.status){
    throw new Error(result.error)
  }

  const didIresult = await didIbackThisProject(project.project_id)
  if(!didIresult.status){
    throw new Error(result.error)
  }

  const backersCount = backersResult["backers_count"]

  // Calculate funding percentage
  const fundingPercentage = Math.min(Math.round((project.current_funding / project.funding_goal) * 100), 100)

  // Calculate days left
  const {months, days} = calculateDateDifferenceJSON(project.deadline)

  const isFundingOver = new Date().toISOString() > project.deadline
  const didProjectMakeIt = project.current_funding >= project.funding_goal

  const rewards = project["rewards"]
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with project image */}
      <div className="relative h-[300px] md:h-[400px] w-full">
        <Image
          src={project.project_img || "/placeholder.svg?height=400&width=1200"}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-white bg-black/30 hover:bg-black/50 px-3 py-2 rounded-md transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{project.title}</h1>

              <div className="flex flex-wrap gap-2 mb-4">
                {project.categories.map((category:string, index:number) => (
                  <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-800 hover:bg-gray-300">
                    {category}
                  </Badge>
                ))}
              </div>

              <div className="mb-4">
                <p className="text-sm text-slate-600">{project.description}</p>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={creator.image_url ? creator.image_url : "/placeholder.svg"} alt={creator.username} />
                    <AvatarFallback className="bg-[#1E3A8A] text-white">
                      {creator.username}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-sm text-gray-600">By </span>
                    <Link href={`/settings/profile/discover/${creator.id}`} className="font-medium hover:text-[#3B82F6]">
                      {creator.username}
                    </Link>
                  </div>
                </div>

                <Separator orientation="vertical" className="h-6" />

                <div className="flex items-center gap-1 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Launched {new Date(project.launched_at).toUTCString()}</span>
                </div>
              </div>
            </div>

            <Tabs defaultValue="about" className="mb-8">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="about">About</TabsTrigger>
                <TabsTrigger value="updates">Updates</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-6 focus-visible:ring-0 focus-visible:ring-offset-0">
                <div className="prose max-w-none">
                    <h2 className="text-2xl font-bold mb-4">The Campaign</h2>
                    {project.campaign && <div className="[&_h1]:mb-3 [&_h2]:mb-3 [&_h3]:mb-3 [&_h4]:mb-3 [&_h5]:mb-3 [&_hr]:my-5 [&_p]:text-[14px] [&_img]:my-5">{parse(project.campaign)}</div>}
                </div>
              </TabsContent>

              <TabsContent value="updates">
                {/* <Suspense fallback={<div className="py-10 text-center">Loading updates...</div>}>
                  <ProjectUpdates projectId={project.id} />
                </Suspense> */}
              </TabsContent>

              <TabsContent value="comments">
                {/* <Suspense fallback={<div className="py-10 text-center">Loading comments...</div>}>
                  <ProjectComments projectId={project.id} />
                </Suspense> */}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div>
            <div className="sticky top-8">
              <Card className="mb-6">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`text-2xl font-bold ${isFundingOver && didProjectMakeIt  && "text-[#047857]"}`}>{project.current_funding}DA</span>
                      <span className="text-gray-600">of {project.funding_goal}DA</span>
                    </div>
                    {/* <Progress value={fundingPercentage} className="h-2 mb-1" /> */}
                    <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
                        <div style={{width:`${fundingPercentage}%`}} className={`h-2 rounded-full ${(isFundingOver && didProjectMakeIt) ? "bg-[#047857]" : (isFundingOver && !didProjectMakeIt) ? "bg-red-500" : "bg-accentColor"} absolute top-0 left-0`}></div>
                      </div>
                    <div className="text-sm text-gray-600 text-right">{fundingPercentage}% funded</div>
                  </div>

                  <div className={`grid grid-cols-2 grid-rows-2 gap-2 mb-6`}>
                  {
                      !isFundingOver && (
                        <>
                          <div className="text-center p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <CalendarDays className="h-4 w-4 text-gray-600" />
                              <span className="font-bold">{months}</span>
                            </div>
                            <div className="text-sm text-gray-600">Months Left</div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center justify-center gap-1 mb-1">
                              <Clock className="h-4 w-4 text-gray-600" />
                              <span className="font-bold">{days}</span>
                            </div>
                            <div className="text-sm text-gray-600">Days Left</div>
                          </div>
                      </>
                      )
                    }
                    <div className="text-center p-3 bg-gray-50 rounded-md col-span-2">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="font-bold">{backersCount}</span>
                      </div>
                      <div className="text-sm text-gray-600">Backers</div>
                    </div>
                  </div>

                  {
                    !isFundingOver && (
                      didIresult["did_i_back_it"] ? (
                        <RefundButton projectId={Number(project.project_id)}/>
                      )
                      :(
                        <BackProjectButton projectId={Number(project.project_id)} creatorId={Number(project.creator_id)} rewards={rewards}/>
                      )
                    ) 
                  }

                  <ProjectActions creatorId={Number(project.creator_id)}/>
                </CardContent>
              </Card>

              {
                rewards && (
                <Card>
                  <CardHeader>
                    <CardTitle>Reward Tiers</CardTitle>
                    <CardDescription>Select a reward to back this project</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <RewardsSection rewards={rewards} didIBackit={didIresult["did_i_back_it"]} />
                  </CardContent>
                </Card>
                )
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// // Sample data
// const rewards = [
//   {
//     id: 1,
//     image_url: "",
//     amount: 50,
//     title: "Early Supporter",
//     description: "Be among the first to support EcoSmart and receive exclusive updates throughout our journey.",
//     includes: ["Digital thank you certificate", "Exclusive backer updates", "Name listed on our website"],
//     estimatedDelivery: "Immediate",
//     popular: false,
//   },
//   {
//     id: 2,
//     image_url: "",
//     amount: 199,
//     title: "EcoSmart Starter Kit",
//     description: "Get started with the essential components of the EcoSmart system at a special backer price.",
//     includes: ["EcoSmart Hub", "2 Smart Plugs", "Mobile App Access", "1-year subscription to EcoSmart Analytics"],
//     estimatedDelivery: "March 2025",
//     popular: true,
//   },
//   {
//     id: 3,
//     image_url: "jkdjsdfsjdlf",
//     amount: 349,
//     title: "EcoSmart Complete Home",
//     description: "The comprehensive package for full home energy management and optimization.",
//     includes: [
//       "EcoSmart Hub",
//       "5 Smart Plugs",
//       "3 Smart Switches",
//       "Energy Monitoring Sensors",
//       "Mobile App Access",
//       "Lifetime subscription to EcoSmart Analytics",
//       "Priority Customer Support",
//     ],
//     estimatedDelivery: "April 2025",
//     popular: false,
//   },
// ]

