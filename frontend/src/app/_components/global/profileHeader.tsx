"use client"
import { logout } from "@/app/_actions/auth"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { userAtom } from "@/app/_store/auth"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"
import { useAtomValue } from "jotai"
import { CircleUserRound, LogOut, Settings, UserRoundPen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
  
export default function ProfileHeader() {
    const user = useAtomValue(userAtom)
    const {toast} = useToast()
    const router = useRouter()
    const pathname = usePathname()
    if(user){
        return (
          <div>
              <DropdownMenu>
                  <DropdownMenuTrigger className="rounded-full">
                      {
                          user?.imageUrl ? (
                              <Image src={user?.imageUrl} alt="profile" height={28} width={28} />
                          ):(
                              <CircleUserRound className="h-9 w-9 text-mainColor" />
                          )
                      }
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="mr-10">
                      <DropdownMenuLabel>
                          <div className="flex items-center gap-2">
                              <CircleUserRound className="h-9 w-9 text-mainColor" />
                              <div className="flex flex-col">
                                  <span className="text-base">{user?.username}</span>
                                  <span className="text-slate-500 text-xs">{user?.email}</span>
                              </div>
                          </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                          <UserRoundPen style={{height:"18px", width:"18px"}} className="text-slate-500" />
                          Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer">
                          <Settings style={{height:"18px", width:"18px"}} className="text-slate-500" />
                          Settings
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer" onClick={async()=>{
                          const result = await logout(user?.id as string)
                          if(!result.error){
                              toast({
                              title: TOAST_SUCCESS_TITLE,
                              description: "You logged out successfully",
                              variant: "default",
                              });
                              router.push("/login")
                          }else{
                              toast({
                              title: TOAST_ERROR_TITLE,
                              description: result.error,
                              variant: "destructive",
                              });
                          }
                      }}>
                          <LogOut style={{height:"18px", width:"18px"}} className="text-slate-500" />
                          Logout
                      </DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
          </div>
        )
    }else if(!pathname.match(/(\/login|\/signup)/)){
        return <Link href={"/login"} className="transition-colors ease-in duration-100 hover:text-accentColor">Login</Link>
    }else{
        return <div></div>
    }
}
