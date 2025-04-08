import { getBackingsTable } from '@/app/_actions/dashboard'
import { BackingManagement } from '@/app/_components/project/tables/backings'
import React from 'react'

export default async function Backingspage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  const result = await getBackingsTable(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }
  return (
    <BackingManagement backings={result["table"]} meta={result["metadata"]}/>
  )
}
