"use client"

import { saveProject, unsaveProject } from '@/app/_actions/projects'
import { TOAST_ERROR_TITLE } from '@/app/_lib/constants'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Bookmark } from 'lucide-react'
import React, { useState } from 'react'

export default function SaveButton({projectId, didISaveIt}:{projectId: number, didISaveIt: boolean}) {
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
    <Button variant="outline" size="sm" className="flex-1" onClick={handleSave}>
        <Bookmark className={`h-4 w-4 mr-2 transition-all duration-300 ${isSaved ? "fill-accentColor text-accentColor animate-save" : "fill-none"}`} />
        Save
    </Button>
  )
}
