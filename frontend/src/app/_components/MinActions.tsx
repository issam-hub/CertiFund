"use client"

import React, { useEffect } from 'react'
import MinLikeButton from './project/minLikeButton'
import MinSaveButton from './project/MinSaveButton'
import { didILikeThis, didISaveThis } from '../_actions/projects'
import { useAtomValue } from 'jotai'
import { userAtom } from '../_store/shared'

export default function MinActions({projectId}:{projectId:number}) {
    const [didILikeResult, setDidILikeResult] = React.useState<boolean>(false)
    const [didISaveResult, setDidISaveResult] = React.useState<boolean>(false)

    const user = useAtomValue(userAtom)

    useEffect(()=>{
        const fetchData = async () => {
            if (!user) return

            const didILikeResult = await didILikeThis(projectId)
            if (!didILikeResult.status){
                throw new Error(didILikeResult.error)
            }
            const didISaveResult = await didISaveThis(projectId)
            if (!didISaveResult.status){
                throw new Error(didISaveResult.error)
            }
            setDidILikeResult(didILikeResult["did_i"])

            setDidISaveResult(didISaveResult["did_i"])
        }
        fetchData()
    })
    return (
        <div className="flex gap-2">
            <MinLikeButton projectId={Number(projectId)} didILikeIt={didILikeResult} />
            <MinSaveButton projectId={Number(projectId)} didISaveIt={didISaveResult}/>
        </div>
    )
}
