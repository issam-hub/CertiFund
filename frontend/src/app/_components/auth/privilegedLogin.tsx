"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowRight, Award, CheckCircle, ClipboardCheck, Eye, EyeOff, Github, KeyRound, Loader2, Shield, Star } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { formSchema, FormSchema, loginFormSchema, LoginFormSchema } from "@/app/_lib/schemas/auth"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { useAtom } from "jotai"
import { isAuthenticatedAtom, userAtom } from "@/app/_store/shared"
import { useRouter, useSearchParams } from "next/navigation"
import { login, privilegedLogin } from "@/app/_actions/auth"


export default function PrivilegedLoginPage({role}:{role:string}) {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setUser] = useAtom(userAtom);

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const router = useRouter();

  const {toast} = useToast()

  async function onSubmit(values: LoginFormSchema) {
    setIsLoading(true)
    const result = await privilegedLogin(values, role)
    if(result.status) {
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "You are signed in successfully",
        variant: "default",
      });
      
      setIsAuthenticated(true);
      setUser(result["user"])
      router.push(`/${role}/dashboard`)
    } else {
      toast({
        title: TOAST_ERROR_TITLE,
        description: result.error,
        variant: "destructive",
      });
    }
    setIsLoading(false)

  }

  return (
    <div className="grid min-h-full md:grid-cols-2">
      {/* Left Side - Hero Section */}
      {
        role === "admin" ? (
          <div className="relative hidden md:flex flex-col justify-between p-10 bg-[url('/signup-2.jpeg')] bg-cover before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:bg-[rgb(30_58_138/90%)] before:block text-white">
            <div>
            </div>
            <div className="space-y-6 relative">
              <h2 className="text-4xl font-bold leading-tight">
              Welcome to the Admin Dashboard
              </h2>
              <p className="text-lg text-blue-200">
              Manage your platform, monitor projects, and support your community.
              </p>
            </div>
            <div className="relative flex gap-3">
                <KeyRound className="h-5 w-5 text-lightAccentColor" />
                <p className="text-sm text-blue-200">Secure administrator access only</p>
            </div>
          </div>
        ): role === "reviewer" ? (
          (
            <div className="relative hidden md:flex flex-col justify-between p-10 bg-[url('/signup-2.jpeg')] bg-cover before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:bg-[rgb(30_58_138/90%)] before:block text-white">
              <div>
              </div>
              <div className="space-y-6 relative">
                <h2 className="text-4xl font-bold leading-tight">
                Welcome to the Review Panel
                </h2>
                <p className="text-lg text-blue-200">
                Evaluate projects, provide feedback, and help maintain quality standards.
                </p>
              </div>
              <div className="relative flex gap-3">
                  <CheckCircle className="h-5 w-5 text-lightAccentColor" />
                  <p className="text-sm text-blue-200">Your expertise makes a difference</p>
              </div>
            </div>
          )
        ):(
          <div className="relative hidden md:flex flex-col justify-between p-10 bg-[url('/signup-2.jpeg')] bg-cover before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:bg-[rgb(30_58_138/90%)] before:block text-white">
          <div>
          </div>
          <div className="space-y-6 relative">
            <h2 className="text-4xl font-bold leading-tight">
            Welcome to the Expert Panel
            </h2>
            <p className="text-lg text-blue-200">
            Provide objective, specialized assessments based on your field(s) of expertise.
            </p>
          </div>
          <div className="relative flex gap-3">
              <Star className="h-5 w-5 text-lightAccentColor" />
              <p className="text-sm text-blue-200">Your expertise shapes the future of innovation</p>
          </div>
        </div>
        )
      }

      {/* Right Side - Sign Up Form */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          {
            role === "admin" ? (
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A]">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-primaryColor">Administrator Access</h2>
              <p className="text-muted-foreground">Sign in to access the administration dashboard</p>
            </div>
            ): role === "reviewer" ? (
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A]">
                <ClipboardCheck className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-primaryColor">Reviewer Access</h2>
              <p className="text-muted-foreground">Sign in to access your review dashboard</p>
            </div>
            ):(
            <div className="space-y-2 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E3A8A]">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-primaryColor">Expert Access</h2>
              <p className="text-muted-foreground">Sign in to provide specialized project assessments</p>
            </div>
            )
          }

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Email:</FormLabel>
                    <FormControl>
                      <Input placeholder="john@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold">Password:</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPassword?"text":"password"} {...field} />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`absolute top-1/2 -translate-y-1/2 h-fit p-0 hover:bg-transparent right-5`}
                          onClick={() => setShowPassword(!showPassword)}
                          >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accentColor hover:bg-secondaryColor" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  )
}

