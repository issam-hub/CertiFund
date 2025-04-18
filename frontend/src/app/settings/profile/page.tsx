import { getCurrentUser } from '@/app/_actions/auth'
import { getProjectByBacker, getProjectByCurrUser, getSavedProjects } from '@/app/_actions/projects'
import { getCreatedBackedCount } from '@/app/_actions/user'
import ProfilePage from '@/app/_components/user/profilePage'
import React, { Suspense } from 'react'

export default async function page() {
  const currentUser = await getCurrentUser()
  if (!currentUser.status){
    throw new Error(currentUser.error)
  }
  const projects = await getProjectByCurrUser()
  if(!projects.status){
    throw new Error(projects.error)
  }
  const savedProjects = await getSavedProjects()
  if(!savedProjects.status){
    throw new Error(savedProjects.error)
  }
  const projects2 = await getProjectByBacker(currentUser["user"].user_id)
  if(!projects2.status){
    throw new Error(projects2.error)
  }
    const stats = await getCreatedBackedCount(currentUser["user"].user_id)
    if(!stats.status){
      throw new Error(stats.error)
    }
  return (
    <ProfilePage savedProjects={savedProjects["projects"]} createdProjects={projects["projects"]} backedProjects={projects2["projects"]} stats={stats["profile_stats"]}/>
  )
}
