"use client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Bell, Edit, Globe, Heart } from 'lucide-react'
import Image from "next/image"
import Link from "next/link"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"
import { UpdateProjectSchema } from "@/app/_lib/schemas/project"
import { formatTwitterHandle, formatWebsiteUrl, getTwitterUrl } from "@/app/_lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function LoadingProfilePage() {
  return (
    <div>
      <div className="bg-mainColor text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-end mb-4">
            <Link href="profile/edit"> 
              <Button asChild size="sm" className="bg-white text-mainColor hover:bg-white hover:text-mainColor">
                <Skeleton className="rounded-md w-[100px]" />
              </Button>
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-shrink-0">
              <Avatar className="h-32 w-32 border-4 border-accentColor">
                <Skeleton className="h-full w-full rounded-full bg-slate-200"/>
              </Avatar>
            </div>
            
            <div className="flex-grow">
              <Skeleton className="mb-2 w-[250px] h-8 rounded-md bg-slate-200"/>
              <div className="flex items-center gap-4 mb-4">
              <Skeleton className="w-[150px] h-4 rounded-md bg-slate-200 mb-4"/>
              </div>
              
            <Skeleton className="w-[600px] h-4 rounded-md bg-slate-200 mb-4 max-w-2xl"/>
            <div className="flex flex-wrap gap-4 mb-6">
                <Skeleton className="bg-slate-200 h-3 w-[100px] rounded-full"/>
                <Skeleton className="bg-slate-200 h-3 w-[100px] rounded-full"/>
            </div>
              
              <div className="flex flex-wrap gap-6">
                <Skeleton className="w-[150px] h-4 bg-slate-200 rounded-full"/>
                <Skeleton className="w-[150px] h-4 bg-slate-200 rounded-full"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="created" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12">
            <TabsTrigger value="created" className="text-base h-10">Created Projects</TabsTrigger>
            <TabsTrigger value="backed" className="text-base h-10">Backed Projects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="created" className="space-y-6 focus-visible:ring-0 focus-visible:ring-offset-0">
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`}>
              {[1,2,3].map((_, index) => (
                  <ProjectCard key={index}/>
                ))
                }
            </div>
          </TabsContent>
          
          {/* Backed Projects Tab */}
          <TabsContent value="backed" className="space-y-6">
            {
                [].length === 0 && (
                    <div className="text-center text-slate-400">Nothing to be shown here.</div>
                )
            }
            {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            </div> */}
          </TabsContent>
          
        </Tabs>
      </div>
    </div>
  )
}

function ProjectCard() {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Skeleton className="h-full w-full"/>
        <div className="absolute top-2 right-2">
        </div>
      </div>
      <CardHeader className="pb-2">
        <Skeleton className="h-6 w-full rounded-md"/>
        <Skeleton className="h-2 w-full rounded-md"/>
        <Skeleton className="h-2 w-[80%] rounded-md"/>
        <Skeleton className="h-2 w-[40%] rounded-md"/>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <Skeleton className="h-4 w-[30px] rounded-md"/>
            <Skeleton className="h-4 w-[30px] rounded-md"/>
          </div>
          {/* <Progress value={(project.raised / project.goal) * 100} className="h-2 bg-gray-200" /> */}
        </div>
        <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
        </div>
        <Skeleton className="h-2 rounded-full w-full"/>
      </CardContent>
      <CardFooter className="pt-2 flex-row-reverse">
        <Skeleton className="h-7 w-[100px] rounded-md"/>
      </CardFooter>
    </Card>
  )
}