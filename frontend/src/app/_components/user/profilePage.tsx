"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Edit, Globe, HandCoins, Heart, Sparkle } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"
import { UpdateProjectSchema } from "@/app/_lib/schemas/project"
import { formatTwitterHandle, formatWebsiteUrl, getTwitterUrl } from "@/app/_lib/utils"
import LoadingProfilePage from "./loadingProfile"
import { BLUR_IMAGE_URL } from "@/app/_lib/constants"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import { ProfileType } from "@/app/_lib/types"

export default function ProfilePage({createdProjects, backedProjects, stats, savedProjects}: ProfileType) {
    const user = useAtomValue(userAtom)
    if(!user){
      return (
        <LoadingProfilePage/>
      )
    }
  return (
    <div>
      <div className="bg-mainColor text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <Link href="profile/edit"> 
              <Button size="sm" className="bg-white text-mainColor hover:bg-white hover:text-mainColor">
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-accentColor">
                <AvatarImage src={user?.image_url ? user?.image_url : undefined} alt="User profile" />
                <AvatarFallback className="bg-secondaryColor text-white text-2xl">{user?.username[0].toUpperCase()}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-grow">
              <h1 className="text-3xl font-bold mb-2">{user?.username}</h1>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-sm text-gray-300">Member since {user?.created_at.split("-")[0]}</span>
              </div>
              
              <p className="text-gray-300 mb-4 max-w-2xl">
                {user?.bio ? user?.bio : <span className="italic text-sm">Write something to describe yourself</span>}
              </p>

              {(user?.website || user?.twitter) && (
                <div className="flex flex-wrap gap-4 mb-6">
                  {user.website && (
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-gray-300 hover:text-lightAccentColor transition-colors"
                    >
                      <Globe className="h-4 w-4" />
                      <span className="text-sm">{formatWebsiteUrl(user.website)}</span>
                    </a>
                  )}
                  {user.twitter && (
                    <a
                      href={getTwitterUrl(user.twitter)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center gap-2 text-gray-300 hover:text-lightAccentColor transition-colors"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_172_2)">
                      <path d="M9.39701 6.87767L14.8576 0.666687H13.5638L8.82021 6.05848L5.0343 0.666687H0.666687L6.39301 8.82075L0.666687 15.3334H1.9605L6.96675 9.63811L10.9657 15.3334H15.3334L9.39701 6.87767ZM7.62437 8.89233L7.04329 8.07986L2.42708 1.62109H4.41464L8.14116 6.83546L8.71979 7.64793L13.5632 14.4254H11.5756L7.62437 8.89233Z" className="fill-[#D1D5DB] group-hover:fill-lightAccentColor"/>
                      </g>
                      <defs>
                      <clipPath id="clip0_172_2">
                      <rect width="16" height="16" fill="white"/>
                      </clipPath>
                      </defs>
                      </svg>
                      <span className="text-sm">{formatTwitterHandle(user.twitter)}</span>
                    </a>
                  )}
                </div>
              )}
              
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-2">
                  <HandCoins className="h-5 w-5 text-lightAccentColor" />
                  <span>{stats.backed_projects} Projects Backed</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sparkle className="h-5 w-5 text-lightAccentColor" />
                  <span>{stats.created_projects} Projects Created</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12">
            <TabsTrigger value="created" className="text-base h-10">Created Projects</TabsTrigger>
            <TabsTrigger value="backed" className="text-base h-10">Backed Projects</TabsTrigger>
            <TabsTrigger value="saved" className="text-base h-10">Saved Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            <div className="mx-auto max-w-6xl px-8">
              <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {createdProjects.map((project) => (
                    <CarouselItem key={project.project_id} className="basis-1/3 self-stretch">
                      <ProjectCard project={project} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious className="relative -left-4" />
                  <CarouselNext className="relative -right-4" />
                </div>
              </Carousel>
            </div>
          </TabsContent>
          
          {/* Backed Projects Tab */}
          <TabsContent value="backed" className="space-y-6">
            <div className="mx-auto max-w-6xl px-8">
              <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {backedProjects.map((project) => (
                    <CarouselItem key={project.project_id} className="basis-1/3 self-stretch">
                      <ProjectCard project={project} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious className="relative -left-4" />
                  <CarouselNext className="relative -right-4" />
                </div>
              </Carousel>
            </div>
          </TabsContent>

          <TabsContent value="saved" className="space-y-6">
            <div className="mx-auto max-w-6xl px-8">
              <Carousel opts={{ align: "start", loop: true }}>
                <CarouselContent>
                  {savedProjects?.map((project) => (
                    <CarouselItem key={project.project_id} className="basis-1/3 self-stretch">
                      <ProjectCard project={project} />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <div className="hidden md:flex">
                  <CarouselPrevious className="relative -left-4" />
                  <CarouselNext className="relative -right-4" />
                </div>
              </Carousel>
            </div>
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  )
}

function ProjectCard({ project } :{project:UpdateProjectSchema}) {
  let currentFund = ((project.current_funding * 100) / project.funding_goal).toFixed(2)
  let displayedCurrentFund = parseFloat(currentFund) > 100 ? "100" : currentFund
  let statusColor;
  switch(project.status){
    case "Pending Review":
      statusColor = "bg-orange-400"
      break;
    case "Rejected":
      statusColor = "bg-red-500"
      break;
    case "Approved":
      statusColor = "bg-green-500"
      break;
    case "Live":
      statusColor = "bg-green-500"
      break;
    case "Live":
      statusColor = "bg-green-500"
      break;
  }
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
      <div className="relative h-48">
        <Image 
          src={project.project_img || "/placeholder.svg"} 
          alt={project.title}
          placeholder="blur"
          blurDataURL={BLUR_IMAGE_URL}
          fill
          className="object-cover"
        />
        <div className="absolute top-2 right-2">
        <Badge className={`${statusColor ? statusColor : "bg-secondaryColor"} rounded-full hover:${statusColor ? statusColor : "bg-secondaryColor"}`}>{project.status}</Badge>
        </div>
      </div>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{project.title}</CardTitle>
        <CardDescription className="line-clamp-2">{project.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">${project.current_funding.toLocaleString()}</span>
            <span className="text-gray-500">of ${project.funding_goal.toLocaleString()}</span>
          </div>
          {/* <Progress value={(project.raised / project.goal) * 100} className="h-2 bg-gray-200" /> */}
        </div>
        <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
          <div style={{width:`${displayedCurrentFund}%`}} className='h-2 rounded-full bg-accentColor absolute top-0 left-0'></div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex-row-reverse">
        <Link href={`/projects/${project.project_id}`} className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground shadow h-8 rounded-md px-3 text-xs bg-secondaryColor self-end">
          View Project
        </Link>
      </CardFooter>
    </Card>
  )
}

