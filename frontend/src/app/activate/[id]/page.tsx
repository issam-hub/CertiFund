import React from 'react'
import ActivatePage from '../../_components/auth/activate'
import { activateUser } from '@/app/_actions/auth'

export default async function page({params,searchParams}:{params: Promise<{id: string}>, searchParams: Promise<{token:string|undefined}>}) {
  const {id} = await params
  const {token} = await searchParams

  return (
    <ActivatePage id={id} activationToken={token}/>
  )
}
