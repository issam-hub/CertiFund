import { Suspense } from 'react'
import LoginPage from '../_components/auth/login'

export default function page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPage/>
    </Suspense>
  )
}
