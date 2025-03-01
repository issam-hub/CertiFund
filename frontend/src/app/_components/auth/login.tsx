"use client"

import { useState } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowRight, Eye, EyeOff, Github, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { formSchema, FormSchema, loginFormSchema, LoginFormSchema } from "@/app/_lib/schemas/auth"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { useAtom } from "jotai"
import { isAuthenticatedAtom, userAtom } from "@/app/_store/auth"
import { useRouter, useSearchParams } from "next/navigation"
import { login } from "@/app/_actions/auth"


export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [, setIsAuthenticated] = useAtom(isAuthenticatedAtom);
  const [, setUser] = useAtom(userAtom);

  const form = useForm<LoginFormSchema>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false
    },
  })

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('from') || '/';

  const {toast} = useToast()

  async function onSubmit(values: LoginFormSchema) {
    setIsLoading(true)
    const result = await login(values)
    if(result.status) {
      toast({
        title: TOAST_SUCCESS_TITLE,
        description: "You are signed in successfully",
        variant: "default",
      });
      
      setIsAuthenticated(true);
      setUser(result["user"])
      router.push(redirectPath)
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
    <div className="grid min-h-[calc(100vh-85px)] md:grid-cols-2">
      {/* Left Side - Hero Section */}
      <div className="relative hidden md:flex flex-col justify-between p-10 bg-[url('/signup-2.jpeg')] bg-cover before:content-[''] before:absolute before:top-0 before:left-0 before:h-full before:w-full before:bg-[rgb(30_58_138/90%)] before:block text-white">
        <div>
        </div>
        <div className="space-y-6 relative">
          <h2 className="text-4xl font-bold leading-tight">
          Welcome back to your crowdfunding journey
          </h2>
          <p className="text-lg text-blue-200">
          Continue making a difference and bringing innovative projects to life.
          </p>
        </div>
        <div className="space-y-4 relative">
          <p className="text-sm text-blue-200">Trusted by innovators worldwide</p>
        </div>
      </div>

      {/* Right Side - Sign Up Form */}
      <div className="flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-primaryColor">Welcome back</h2>
            <p className="text-muted-foreground">Sign in to continue to your dashboard</p>
          </div>

          {/* <Button variant="outline" className="w-full" onClick={() => console.log("GitHub sign up")}>
            <Github className="mr-2 h-4 w-4" />
            Sign up with GitHub
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div> */}

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

                <div className="flex items-center justify-between">
                    <FormField
                    control={form.control}
                    name="rememberMe"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                        <FormControl>
                            <Checkbox  checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">Remember me</FormLabel>
                        </FormItem>
                    )}
                    />
                    <Link href="/forgot-password" className="text-sm text-accentColor hover:underline">
                        Forgot password?
                    </Link>
                </div>
              <Button type="submit" className="w-full bg-accentColor hover:bg-accentColor" disabled={isLoading}>
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

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/signup" className="text-accentColor hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

