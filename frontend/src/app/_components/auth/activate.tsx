"use client"
import { activateUser, reactivateUser } from '@/app/_actions/auth'
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from '@/app/_lib/constants'
import { isAuthenticatedAtom, userAtom } from '@/app/_store/auth'
import { useToast } from '@/hooks/use-toast'
import { useAtom } from 'jotai'
import { ArrowRight, Mail } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

export default function ActivatePage({id, activationToken}:{id:string, activationToken?:string}) {
    const [emailSent, setEmailSent] = useState(false)
    const [loading, setLoading] = useState(false)
    const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
    const [, setUser] = useAtom(userAtom);

    const {toast} = useToast()
    const router = useRouter()

    useEffect(()=>{
      (async()=>{
        if(activationToken){
          const result = await activateUser(activationToken);
          if(!result.error) {
            toast({
              title: TOAST_SUCCESS_TITLE,
              description: "User is activated successfully",
              variant: "default",
            });

            setIsAuthenticated(true);
            setUser(result["user"])
      
            router.push('/', {scroll:true})
            
          } else {
            toast({
              title: TOAST_ERROR_TITLE,
              description: result.error,
              variant: "destructive",
            });
          }
        }
      })()
    },[activationToken])

    const handleResendEmail = async () => {
        setLoading(true)
        
        const result = await reactivateUser(id)
        if(!result.error) {
          setEmailSent(true)
        }else{
          toast({
            title: TOAST_ERROR_TITLE,
            description: result.error,
            variant: "destructive",
          });
        }
        setLoading(false)
    }
  return (
    <div className='container mx-auto'>
      <div className="w-full lg:w-1/2 p-6 flex items-center justify-center mx-auto">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1F2937]">Verify your email</h2>
            <p className="mt-2 text-[#6B7280]">Start your crowdfunding journey today</p>
          </div>

          <div className="bg-blue-50 border border-lightAccentColor rounded-lg p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-accentColor rounded-full flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-white" />
            </div>

            <h3 className="text-xl font-semibold text-[#1F2937] mb-2">Check your inbox</h3>
            <p className="text-[#4B5563] mb-4">
              We've sent a verification link to your email address. Please check your inbox and click the link to
              activate your account.
            </p>

            <p className="text-sm text-[#6B7280] mb-6">
              If you don't see the email, check your spam folder or try resending the verification email.
            </p>

            {emailSent && <div className="text-green-600 text-sm mb-4">Verification email has been resent!</div>}

            <button
              onClick={handleResendEmail}
              disabled={loading || emailSent}
              className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-white bg-accentColor hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accentColor disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : emailSent ? "Email Sent" : "Resend Verification Email"}
              {!loading && !emailSent && <ArrowRight className="ml-2 h-4 w-4" />}
            </button>
          </div>

          <div className="text-center">
            <p className="text-[#6B7280]">
              Already activated your account?{" "}
              <Link href="/login" className="text-accentColor hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
