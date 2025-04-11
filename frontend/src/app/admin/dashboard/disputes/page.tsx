import { getDisputesTable } from '@/app/_actions/dashboard'
import { DisputeManagement } from '@/app/_components/project/tables/disputes'
import React from 'react'

export default async function Disputespage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  const result = await getDisputesTable(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }

  return (
    <DisputeManagement disputes={result["table"]} meta={result["metadata"]}/>
  )
}