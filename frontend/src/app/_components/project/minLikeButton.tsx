"use client"

import { likeProject, unlikeProject } from '@/app/_actions/projects'
import { TOAST_ERROR_TITLE } from '@/app/_lib/constants'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import React, { useEffect, useState } from 'react'

export default function MinLikeButton({projectId, didILikeIt}:{projectId: number, didILikeIt: boolean}) {
    const [isLiked, setIsLiked] = useState(didILikeIt)
    const {toast} = useToast()

    useEffect(()=>{
        setIsLiked(didILikeIt)
    },[didILikeIt])

    const handleLike = async() => {
        const wasLiked = isLiked
        if(!wasLiked){
            const result = await likeProject(projectId)
            if(!result.status){
                toast({
                    title:TOAST_ERROR_TITLE,
                    description:result.error,
                    variant:"destructive"
                })
                return
            }
        }else{
            const result = await unlikeProject(projectId)
            if(!result.status){
                toast({
                    title:TOAST_ERROR_TITLE,
                    description:result.error,
                    variant:"destructive"
                })
                return
            }
        }
        setIsLiked(!wasLiked)
    }

  return (
    <Button
        onClick={handleLike}
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 rounded-full"
        aria-label="Like project"
    >
        <Heart className={`h-5 w-5 transition-all duration-300 ${isLiked ? "fill-accentColor text-accentColor animate-heartbeat" : "fill-none"}`} />
    </Button>
  )
}
