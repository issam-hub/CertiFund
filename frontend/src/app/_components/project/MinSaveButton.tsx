"use client"

import { saveProject, unsaveProject } from '@/app/_actions/projects'
import { TOAST_ERROR_TITLE } from '@/app/_lib/constants'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Bookmark } from 'lucide-react'
import React, { useState } from 'react'

export default function MinSaveButton({projectId, didISaveIt}:{projectId: number, didISaveIt: boolean}) {
    const [isSaved, setIsSaved] = useState(didISaveIt)
    const {toast} = useToast()

    const handleSave = async() => {
        const wasSaved = isSaved
        if(!wasSaved){
            const result = await saveProject(projectId)
            if(!result.status){
                toast({
                    title:TOAST_ERROR_TITLE,
                    description:result.error,
                    variant:"destructive"
                })
                return
            }
        }else{
            const result = await unsaveProject(projectId)
            if(!result.status){
                toast({
                    title:TOAST_ERROR_TITLE,
                    description:result.error,
                    variant:"destructive"
                })
                return
            }
        }
        setIsSaved(!wasSaved)
    }

  return (
    <Button
        onClick={handleSave}
        variant="ghost"
        size="sm"
        className="h-9 w-9 p-0 rounded-full"
        aria-label="Save project"
    >
        <Bookmark className={`h-5 w-5 transition-all duration-300 ${isSaved ? "fill-accentColor text-accentColor animate-save" : "fill-none"}`} />
    </Button>
  )
}
