import { getUsersTable } from '@/app/_actions/dashboard'
import { UserManagement } from '@/app/_components/project/tables/users'
import React from 'react'

export default async function Userspage({searchParams}:{searchParams: Promise<{page: number}>}) {
  const {page} = await searchParams

  const result = await getUsersTable(Number(page?page:1))
  if(!result.status){
    throw new Error(result.error)
  }
  return (
    <UserManagement users={result["table"]} meta={result["metadata"]}/>
  )
}
