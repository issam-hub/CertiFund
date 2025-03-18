"use client"
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import React from 'react'
import { BackProjectForm } from './backProjectForm'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/app/_store/auth'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string)

export default function BackProjectButton({ projectId,creatorId }: { projectId: number, creatorId:number }) {
  const user = useAtomValue(userAtom)
  if(Number(user?.id) !== creatorId){
    return (
      <Elements stripe={stripePromise}>
          <BackProjectForm projectId={projectId}/>
      </Elements>
    )
  }
}
