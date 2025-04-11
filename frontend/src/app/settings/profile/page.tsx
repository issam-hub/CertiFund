import { getProjectByBacker, getProjectByCurrUser } from '@/app/_actions/projects'
import { getCreatedBackedCount } from '@/app/_actions/user'
import ProfilePage from '@/app/_components/user/profilePage'
import React, { Suspense } from 'react'

export default async function page() {
  const projects = await getProjectByCurrUser()
  if(!projects.status){
    throw new Error(projects.error)
  }
  const projects2 = await getProjectByBacker(projects["projects"][0].creator_id)
  if(!projects2.status){
    throw new Error(projects2.error)
  }
    const stats = await getCreatedBackedCount(projects["projects"][0].creator_id)
    if(!stats.status){
      throw new Error(stats.error)
    }
  return (
    <ProfilePage createdProjects={projects["projects"]} backedProjects={projects2["projects"]} stats={stats["profile_stats"]}/>
  )
}
