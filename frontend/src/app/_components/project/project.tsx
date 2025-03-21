import { Card, CardContent } from '@/components/ui/card'
import { Bookmark, Clock, Heart, Users } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button'
import { BLUR_IMAGE_URL } from '@/app/_lib/constants'
import Link from 'next/link'
import { UpdateProjectSchema } from '@/app/_lib/schemas/project'
import { calculateDateDifference, calculateDateDifferenceJSON } from '@/app/_lib/utils'


export default function ProjectComp({project}:{project:UpdateProjectSchema}) {
    let currentFund = ((project.current_funding * 100) / project.funding_goal).toFixed(2)
    currentFund = (parseFloat(currentFund) > 100) ? "100" : currentFund
    const {months, days} = calculateDateDifferenceJSON(project.deadline)
  return (
    <div className="p-1">
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48">
        <Image
          src={project.project_img as string}
          alt={project.title}
          placeholder="blur"
          blurDataURL={BLUR_IMAGE_URL}
          fill
          className="object-cover"
        />
        {/* <div className="absolute top-2 right-2">
          <Badge className="bg-accentColor">{project.category}</Badge>
        </div> */}
      </div>
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-1">{project.title}</h3>
        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{project.description}</p>

        <div className="mb-2">
          <div className="flex justify-between text-sm mb-1">
            <span className="font-medium">${project.current_funding.toLocaleString()}</span>
            <span className="text-gray-500">of ${project.funding_goal.toLocaleString()}</span>
          </div>
          <div className={`relative h-2 rounded-full bg-slate-200 mt-3`}>
            <div style={{width:`${currentFund}%`}} className='h-2 rounded-full bg-accentColor absolute top-0 left-0'></div>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{months > 0 ? `${months} months` : `${days} days`}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Users className="h-4 w-4" />
            <span>0 backers</span>
          </div>
        </div>

        <div className="flex justify-between items-center mt-4 pt-4 border-t">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
              aria-label="Like project"
            >
              <Heart className="h-5 w-5 text-gray-500 hover:text-red-500 transition-colors" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full"
              aria-label="Save project"
            >
              <Bookmark className="h-5 w-5 text-gray-500 hover:text-accentColor transition-colors" />
            </Button>
          </div>
          <Button asChild size="sm" className="bg-accentColor hover:bg-[#1E3A8A]">
            <Link href={`/projects/discover/${project.project_id}`}>
              View Project
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
  )
}
