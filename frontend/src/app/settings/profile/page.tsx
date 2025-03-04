import { getProjectByCurrUser } from '@/app/_actions/projects'
import ProfilePage from '@/app/_components/user/profilePage'
import React, { Suspense } from 'react'

export default async function page() {
  const projects = await getProjectByCurrUser()
  if(!projects.status){
    throw new Error(projects.error)
  }
  return (
    <ProfilePage projects={projects["projects"]} />
  )
}
