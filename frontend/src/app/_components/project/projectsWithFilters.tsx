import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'
import { Bookmark, Clock, Heart, Users } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import { Button } from '@/components/ui/button'
import { getProjects } from '@/app/_actions/projects'
import { UpdateProjectSchema } from '@/app/_lib/schemas/project'
import { BLUR_IMAGE_URL } from '@/app/_lib/constants'
import { ProjectsFilters } from '@/app/_lib/types'
import { calculateDateDifference } from '@/app/_lib/utils'
import Link from 'next/link'
import ProjectComp from './project'

export default async function ProjectsWithFilters({page, search, categories, limit, sort}:ProjectsFilters) {
    const result = await getProjects(page ? Number(page) : 1, search, categories, limit, sort)
    if(!result.status){
        throw new Error(result.error)
    }
    
  return (
    <div className="mx-auto max-w-6xl px-8">
    <Carousel opts={{ align: "start", loop: true }}>
      <CarouselContent>
        {result["projects"].map((project:UpdateProjectSchema, index:number) => {
          return (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <ProjectComp project={project} />
            </CarouselItem>
          )
        })}
      </CarouselContent>
      <div className="hidden md:flex">
        <CarouselPrevious className="relative -left-4" />
        <CarouselNext className="relative -right-4" />
      </div>
    </Carousel>
  </div>
  )
}
