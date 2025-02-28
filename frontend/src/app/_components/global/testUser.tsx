"use client"
import { userAtom } from '@/app/_store/auth'
import { useAtomValue } from 'jotai'
import React from 'react'

export default function TestUser() {
    const user = useAtomValue(userAtom)
  return (
    <h1>current user username: {user?.username}</h1>
  )
}
