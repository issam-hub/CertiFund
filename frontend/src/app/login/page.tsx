import { Suspense } from 'react'
import LoginPage from '../_components/auth/login'
import Loading from '../_components/global/loading'

export default function page() {
  return (
    <Suspense fallback={<Loading/>}>
      <LoginPage/>
    </Suspense>
  )
}
