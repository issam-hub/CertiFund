import { Suspense } from 'react'
import LoginPage from '../_components/auth/login'
import LoadingComponent from '../_components/global/loading'

export default function page() {
  return (
    <Suspense fallback={<LoadingComponent/>}>
      <LoginPage/>
    </Suspense>
  )
}
