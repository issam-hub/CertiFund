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
import { ArrowLeft, BadgeCheck, Bookmark, Calendar, Clock, Heart, Share2, Target, Users } from "lucide-react"
import { BackProjectButton } from "./back-project-button"
import { getProject } from "@/app/_actions/projects"
import { UpdateProjectSchema } from "@/app/_lib/schemas/project"
import { Separator } from "@/components/ui/separator"
import parse from 'html-react-parser';
import { calculateDateDifferenceJSON } from "@/app/_lib/utils"
import { getUser } from "@/app/_actions/user"

export default async function ProjectDetailsPage({params}:{params: Promise<{id:string}>}) {
    const {id} = await params
  const result = await getProject(id)

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

  // Calculate funding percentage
  const fundingPercentage = Math.min(Math.round((project.current_funding / project.funding_goal) * 100), 100)

  // Calculate days left
  const {months, days} = calculateDateDifferenceJSON(project.deadline)

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
                  <span className="text-sm">Created 25 jan 2025</span>
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
                      <span className="text-2xl font-bold">${project.current_funding}</span>
                      <span className="text-gray-600">of ${project.funding_goal}</span>
                    </div>
                    {/* <Progress value={fundingPercentage} className="h-2 mb-1" /> */}
                    <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
                        <div style={{width:`${fundingPercentage}%`}} className='h-2 rounded-full bg-accentColor absolute top-0 left-0'></div>
                      </div>
                    <div className="text-sm text-gray-600 text-right">{fundingPercentage}% funded</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Users className="h-4 w-4 text-gray-600" />
                        <span className="font-bold">0</span>
                      </div>
                      <div className="text-sm text-gray-600">Backers</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-bold">{months}|{days}</span>
                      </div>
                      <div className="text-sm text-gray-600">Months|Days Left</div>
                    </div>
                  </div>

                  <BackProjectButton projectId={Number(project.project_id)} />

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" size="sm" className="flex-1 mr-2">
                      <Heart className="h-4 w-4 mr-2" />
                      Like
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 mr-2">
                      <Bookmark className="h-4 w-4 mr-2" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Reward Tiers</CardTitle>
                  <CardDescription>Select a reward to back this project</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* {project.rewards.map((reward, index) => (
                    <Card key={index} className={`border ${reward.popular ? "border-[#3B82F6]" : "border-gray-200"}`}>
                      <CardContent className="p-4">
                        {reward.popular && <Badge className="bg-[#3B82F6] mb-2">Most Popular</Badge>}
                        <h4 className="font-bold text-lg mb-1">${reward.amount}</h4>
                        <h5 className="font-medium mb-2">{reward.title}</h5>
                        <p className="text-sm text-gray-600 mb-3">{reward.description}</p>

                        {reward.includes && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Includes:</p>
                            <ul className="text-sm text-gray-600 space-y-1">
                              {reward.includes.map((item, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-[#3B82F6]">•</span>
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <div className="text-sm text-gray-600 mb-3">Estimated delivery: {reward.estimatedDelivery}</div>

                        <Button className="w-full bg-[#3B82F6] hover:bg-[#1E3A8A]">Select Reward</Button>
                      </CardContent>
                    </Card>
                  ))} */}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// // Sample data
// const projects = [
//   {
//     id: 1,
//     title: "EcoSmart Home Energy System",
//     description:
//       "A revolutionary smart home system that reduces energy consumption by up to 40% through AI-powered optimization.",
//     longDescription: `
//       <p>The EcoSmart Home Energy System is a comprehensive solution designed to transform how homes consume and manage energy. By leveraging cutting-edge artificial intelligence and machine learning algorithms, our system continuously analyzes your home's energy usage patterns and automatically optimizes consumption to reduce waste and lower utility bills.</p>
      
//       <p>Unlike traditional smart home systems that simply allow remote control of devices, EcoSmart takes a proactive approach by learning from your habits and preferences to make intelligent decisions about energy usage throughout your home. The system integrates seamlessly with existing appliances and utilities, requiring minimal setup while delivering maximum impact.</p>
      
//       <p>Our proprietary AI engine can predict optimal times for energy usage based on factors such as weather forecasts, time-of-use electricity rates, and historical consumption patterns. This allows the system to automatically shift energy-intensive tasks to times when electricity is cheaper or when your solar panels (if installed) are generating maximum output.</p>
//     `,
//     image: "/placeholder.svg?height=400&width=1200",
//     images: [
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//     ],
//     raised: 85000,
//     goal: 100000,
//     backers: 342,
//     daysLeft: 15,
//     categories: ["Technology", "Smart Home", "Sustainability"],
//     expertValidated: true,
//     createdAt: "January 15, 2024",
//     creator: {
//       id: "creator1",
//       name: "Jane Doe",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     goals: [
//       "Reduce home energy consumption by up to 40%",
//       "Simplify energy management through an intuitive mobile app",
//       "Integrate with existing smart home devices and appliances",
//       "Provide detailed analytics on energy usage and savings",
//       "Contribute to global carbon emission reduction efforts",
//     ],
//     features: [
//       {
//         title: "AI-Powered Optimization",
//         description: "Machine learning algorithms that continuously analyze and optimize your home's energy usage.",
//       },
//       {
//         title: "Real-time Monitoring",
//         description: "Track energy consumption across all connected devices from anywhere using our mobile app.",
//       },
//       {
//         title: "Automated Scheduling",
//         description: "Intelligent scheduling of high-energy tasks during off-peak hours to reduce utility costs.",
//       },
//       {
//         title: "Seamless Integration",
//         description:
//           "Works with existing smart home ecosystems including Google Home, Amazon Alexa, and Apple HomeKit.",
//       },
//     ],
//     rewards: [
//       {
//         amount: 50,
//         title: "Early Supporter",
//         description: "Be among the first to support EcoSmart and receive exclusive updates throughout our journey.",
//         includes: ["Digital thank you certificate", "Exclusive backer updates", "Name listed on our website"],
//         estimatedDelivery: "Immediate",
//         popular: false,
//       },
//       {
//         amount: 199,
//         title: "EcoSmart Starter Kit",
//         description: "Get started with the essential components of the EcoSmart system at a special backer price.",
//         includes: ["EcoSmart Hub", "2 Smart Plugs", "Mobile App Access", "1-year subscription to EcoSmart Analytics"],
//         estimatedDelivery: "March 2025",
//         popular: true,
//       },
//       {
//         amount: 349,
//         title: "EcoSmart Complete Home",
//         description: "The comprehensive package for full home energy management and optimization.",
//         includes: [
//           "EcoSmart Hub",
//           "5 Smart Plugs",
//           "3 Smart Switches",
//           "Energy Monitoring Sensors",
//           "Mobile App Access",
//           "Lifetime subscription to EcoSmart Analytics",
//           "Priority Customer Support",
//         ],
//         estimatedDelivery: "April 2025",
//         popular: false,
//       },
//     ],
//   },
//   {
//     id: 2,
//     title: "Ocean Plastic Recycler",
//     description:
//       "An innovative device that collects and processes ocean plastic into reusable materials for manufacturing.",
//     longDescription: `
//       <p>The Ocean Plastic Recycler represents a breakthrough in addressing the global crisis of ocean plastic pollution. Our device is designed to be deployed on coastlines, river mouths, and directly in ocean environments to efficiently collect plastic waste before it can break down into harmful microplastics.</p>
      
//       <p>What sets our solution apart is the integrated processing capability. Rather than simply collecting plastic for traditional recycling (which often ends up in landfills anyway), our system incorporates advanced sorting and processing technology that can transform collected plastics into high-quality raw materials ready for manufacturing new products.</p>
      
//       <p>The system uses a combination of mechanical filtration, optical sorting, and innovative chemical processes to break down various types of plastics into their base components. These can then be reformed into pellets or filaments suitable for industrial manufacturing or 3D printing applications.</p>
//     `,
//     image: "/placeholder.svg?height=400&width=1200",
//     images: [
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//       "/placeholder.svg?height=160&width=240",
//     ],
//     raised: 120000,
//     goal: 150000,
//     backers: 523,
//     daysLeft: 8,
//     categories: ["Technology", "Environment", "Manufacturing"],
//     expertValidated: true,
//     createdAt: "February 3, 2024",
//     creator: {
//       id: "creator2",
//       name: "Alex Johnson",
//       avatar: "/placeholder.svg?height=40&width=40",
//     },
//     goals: [
//       "Collect up to 1 ton of ocean plastic per day",
//       "Process collected plastic into reusable manufacturing materials",
//       "Deploy units in the 10 most polluted coastal areas globally",
//       "Create a sustainable business model for ongoing operations",
//       "Reduce ocean plastic pollution by 5% in deployment areas",
//     ],
//     features: [
//       {
//         title: "Autonomous Collection",
//         description: "Solar-powered autonomous operation with AI-guided collection patterns.",
//       },
//       {
//         title: "Multi-stage Filtration",
//         description: "Captures plastics of various sizes while allowing marine life to pass through safely.",
//       },
//       {
//         title: "Onboard Processing",
//         description: "Sorts, cleans, and processes plastic into usable raw materials right on the device.",
//       },
//       {
//         title: "Remote Monitoring",
//         description: "Satellite connectivity provides real-time data on collection volumes and maintenance needs.",
//       },
//     ],
//     rewards: [
//       {
//         amount: 25,
//         title: "Ocean Advocate",
//         description: "Support our mission to clean the oceans and receive updates on our progress.",
//         includes: ["Digital certificate of impact", "Monthly impact reports", "Name listed on our website"],
//         estimatedDelivery: "Immediate",
//         popular: false,
//       },
//       {
//         amount: 150,
//         title: "Recycled Product Pack",
//         description: "Receive a collection of products made from ocean plastic collected by our systems.",
//         includes: [
//           "Recycled plastic water bottle",
//           "Recycled plastic sunglasses",
//           "Recycled plastic phone case",
//           "Certificate of impact with collection data",
//         ],
//         estimatedDelivery: "June 2025",
//         popular: true,
//       },
//       {
//         amount: 5000,
//         title: "Sponsor a Deployment",
//         description: "Fund a complete deployment of an Ocean Plastic Recycler in a high-impact location.",
//         includes: [
//           "Your name/logo on the deployed unit",
//           "Quarterly impact reports specific to your unit",
//           "VIP invitation to deployment ceremony",
//           "Complete set of products made from collected plastic",
//           "Feature in our documentary film",
//         ],
//         estimatedDelivery: "December 2025",
//         popular: false,
//       },
//     ],
//   },
// ]

