"use client"
import { logout } from "@/app/_actions/auth"
import { TOAST_ERROR_TITLE, TOAST_SUCCESS_TITLE } from "@/app/_lib/constants"
import { userAtom } from "@/app/_store/shared"
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
import { CircleUserRound, LogOut, Settings, UserRoundPen, WandSparkles } from "lucide-react"
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
          <div className="flex items-center place-self-end self-center">
            <DropdownMenu>
                <DropdownMenuTrigger className="rounded-full">
                    {
                        user?.image_url ? (
                            <Image src={user?.image_url} alt="profile" height={36} width={36} className="rounded-full" />
                        ):(
                            <CircleUserRound className="h-9 w-9 text-mainColor" />
                        )
                    }
                </DropdownMenuTrigger>
                <DropdownMenuContent className="mr-10">
                    <DropdownMenuLabel>
                        <div className="flex items-center gap-2">
                            {
                                user?.image_url ? (
                                    <Image src={user?.image_url} alt="profile" height={36} width={36} className="rounded-full" />
                                ):(
                                    <CircleUserRound className="h-9 w-9 text-mainColor" />
                                )
                            }
                            <div className="flex flex-col">
                                <span className="text-base">{user?.username}</span>
                                <span className="text-slate-500 text-xs">{user?.email}</span>
                            </div>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="px-0 py-0">
                        <Link href={"/projects/new"} className="px-2 py-1.5 flex gap-2 items-center w-full">
                            <WandSparkles style={{height:"18px", width:"18px"}} className="text-slate-500"/>
                            Create project
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="px-0 py-0">
                        <Link href={`/settings/profile`} className="px-2 py-1.5 flex gap-2 items-center w-full">
                            <UserRoundPen style={{height:"18px", width:"18px"}} className="text-slate-500" />
                            Profile
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer px-0 py-0">
                        <Link href={`/settings`} className="px-2 py-1.5 flex gap-2 items-center w-full">
                            <Settings style={{height:"18px", width:"18px"}} className="text-slate-500" />
                            Settings
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="cursor-pointer" onClick={async()=>{
                        const result = await logout()
                        if(result.status){
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
    }else if(!pathname.match(/(\/login|\/signup|\/activate\/\w+)/)){
        return <Link href={"/login"} className="place-self-end self-center transition-colors ease-in duration-100 text-accentColor py-1 px-4 border-2 border-accentColor rounded-md hover:text-secondaryColor hover:border-secondaryColor">Login</Link>
    }else{
        return <div className="place-self-end self-center"></div>
    }
}
