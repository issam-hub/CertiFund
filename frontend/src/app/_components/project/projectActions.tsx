"use client"
import { userAtom } from '@/app/_store/shared'
import { Button } from '@/components/ui/button'
import { useAtomValue } from 'jotai'
import { Bookmark, Flag, Heart } from 'lucide-react'
import React from 'react'
import { ReportButton } from './reportButton'

export default function ProjectActions({creatorId, projectId, projectTitle}:{creatorId: number, projectId: number, projectTitle: string}) {
    const user = useAtomValue(userAtom)
    const reportTypes = [
      { value: "fraud", label: "Fraudulent Project" },
      { value: "inappropriate", label: "Inappropriate Content" },
      { value: "copyright", label: "Copyright Violation" },
      { value: "misrepresentation", label: "Misrepresentation" },
      { value: "scam", label: "Potential Scam" },
      { value: "other", label: "Other Issue" },
    ]
    if(Number(user?.user_id) !== creatorId){
        return (
            <div className="flex justify-between gap-3 mt-6 flex-wrap">
                <Button variant="outline" size="sm" className="flex-1">
                    <Heart className="h-4 w-4 mr-2" />
                    Like
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                    <Bookmark className="h-4 w-4 mr-2" />
                    Save
                </Button>
                <ReportButton resourceId={projectId} title={projectTitle} context='project' reportTypes={reportTypes} buttonTrigger={
                    <Button variant="outline" size="sm" className="flex-1">
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                    </Button>
                }/>
            </div>
        )
    }
}
