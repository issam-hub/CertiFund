import { getProjectByBacker, getProjectByCurrUser, getProjectByUser } from '@/app/_actions/projects'
import { getCreatedBackedCount, getUser } from '@/app/_actions/user'
import UserPage from '@/app/_components/user/userPage'
import React, { Suspense } from 'react'

export default async function page({params}:{params: Promise<{id:string}>}) {
  const {id} = await params
  const projects = await getProjectByUser(id as unknown as number)
  if(!projects.status){
    throw new Error(projects.error)
  }

  const projects2 = await getProjectByBacker(id as unknown as number)
  if(!projects2.status){
    throw new Error(projects2.error)
  }
  const user = await getUser(id)
  if(!user.status){
    throw new Error(user.error)
  }

  const stats = await getCreatedBackedCount(id)
  if(!stats.status){
    throw new Error(stats.error)
  }
  return (
    <UserPage createdProjects={projects["projects"]} user={user['user']} backedProjects={projects2["projects"]} stats={stats['profile_stats']}/>
  )
}