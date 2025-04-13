import { getBackingsTable } from '@/app/_actions/dashboard'
import { BackingManagement } from '@/app/_components/project/tables/backings'
import { format } from 'date-fns'
import React from 'react'

export default async function Backingspage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  let result = await getBackingsTable(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }

  result["table"] = result["table"].map((entry:any)=>({...entry, created_at: format(entry.created_at, "MMMM d, yyyy 'at' h:mm a")}))
  return (
    <BackingManagement backings={result["table"]} meta={result["metadata"]}/>
  )
}
