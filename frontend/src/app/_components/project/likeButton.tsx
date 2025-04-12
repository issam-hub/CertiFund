"use client"

import { likeProject, unlikeProject } from '@/app/_actions/projects'
import { TOAST_ERROR_TITLE } from '@/app/_lib/constants'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Heart } from 'lucide-react'
import React, { useState } from 'react'

export default function LikeButton({initialLikes, projectId, didILikeIt}:{initialLikes: number, projectId: number, didILikeIt: boolean}) {
    const [isLiked, setIsLiked] = useState(didILikeIt)
    const [likes, setLikes] = useState(initialLikes)
    const {toast} = useToast()

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
        setLikes((prev) => (wasLiked ? prev - 1 : prev + 1))
    }

  return (
    <Button variant="outline" size="sm" className="flex-1" onClick={handleLike}>
        <div className='flex flex-row gap-1 mr-2'>
            <Heart className={`h-4 w-4 transition-all duration-300 ${isLiked ? "fill-accentColor text-accentColor animate-heartbeat" : "fill-none"}`} />
            <span>{likes.toString()}</span>
        </div>
        Like
    </Button>
  )
}
