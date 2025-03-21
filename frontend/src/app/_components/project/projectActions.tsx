"use client"
import { userAtom } from '@/app/_store/shared'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { Bookmark, Heart } from 'lucide-react'
import React from 'react'

export default function ProjectActions({creatorId}:{creatorId: number}) {
    const user = useAtomValue(userAtom)
    if(Number(user?.id) !== creatorId){
        return (
            <div className="flex justify-between mt-6">
            <Button variant="outline" size="sm" className="flex-1 mr-2">
            <Heart className="h-4 w-4 mr-2" />
            Like
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
            <Bookmark className="h-4 w-4 mr-2" />
            Save
            </Button>
            </div>
        )
    }
}
