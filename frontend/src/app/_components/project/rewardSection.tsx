"use client"
import { BLUR_IMAGE_URL } from '@/app/_lib/constants'
import { Reward } from '@/app/_lib/types'
import { selectedRewardsAtom, userAtom } from '@/app/_store/shared'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useAtom, useAtomValue } from 'jotai'
import { Check } from 'lucide-react'
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

export default function RewardsSection({rewards, didIBackit, creatorId}:{rewards:Reward[], didIBackit:boolean, creatorId: number}) {
    const [sharedSelectedRewards, setSharedSelectedRewards] = useAtom(selectedRewardsAtom)
    const user = useAtomValue(userAtom)

    const toggleReward = (rewardId: number) => {
      setSharedSelectedRewards((prev) => (prev.includes(rewardId) ? prev.filter((id) => id !== rewardId) : [...prev, rewardId]))
    }

  return (
    rewards.map((reward, index) => (
        <Card key={index} className={`transition-colors ease-out duration-200 border-2 border-gray-200 ${sharedSelectedRewards.includes(reward.id) && "border-accentColor"}`}>
          <CardContent className="p-4">
            {
              reward.image_url && (
                <Image src={''} placeholder='blur' blurDataURL={BLUR_IMAGE_URL} overrideSrc={reward.image_url} alt="reward-img" width={100} height={100} className="w-full h-[250px] mb-1 object-cover rounded-t-md"/>
              )
            }
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-medium">{reward.title}</h5>
              <h4 className="font-bold text-lg">{reward.amount/100}DA</h4>
            </div>
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

            <div className="text-sm text-gray-600 mb-3">Estimated delivery: {new Date(reward.estimated_delivery).getMonth()}/{new Date(reward.estimated_delivery).getFullYear()}</div>

            {
              (!didIBackit && (creatorId !== Number(user?.user_id))) && (
                <Button onClick={()=>toggleReward(reward.id)} className="w-full bg-[#3B82F6] hover:bg-[#1E3A8A]">{sharedSelectedRewards.includes(reward.id) ? (<div className='flex items-center gap-2'><Check className="h-3 w-3 text-white"/>Selected</div>) : "Select Reward"}</Button>
              )
            }
          </CardContent>
        </Card>
      ))
  )
}
