"use client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
  } from "@/components/ui/sidebar"
import { ChevronsUpDown, ChevronUp, Flag, Folder, HandCoins, HelpCircle, LayoutDashboard, Settings, User2, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import DashUser from "./dashUser"
import AdminLinks from "../user/adminLinks"
import { useAtomValue } from "jotai"
import { userAtom } from "@/app/_store/shared"
import ReviewerLinks from "../user/reviewLinks"
import ExpertLinks from "../user/expertLinks"
import UserLinks from "../user/userLinks"
  
  export function DashSidebar() {
    const sidebarState = useSidebar()
    const user = useAtomValue(userAtom)

    return (
      <Sidebar collapsible="icon" isUser={true}>
        <SidebarHeader>
          <SidebarMenu className="flex flex-row justify-between items-center">
            <SidebarMenuItem>
              <Link href={"/"}><Image src={"/dash-logo.svg"} alt="logo" width={120} height={100} className={`mt-2 h-auto ${!sidebarState.open && "hidden"}`} /></Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          {
            user?.role === "admin" ? (
              <AdminLinks/>
            ): user?.role === "reviewer" ? (
              <ReviewerLinks/>
            ): user?.role === "user" ?(
              <UserLinks/>
            ):(
              <ExpertLinks/>
            )
          }
          <SidebarSeparator className="h-[1px] bg-slate-500"/>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={user?.role === "user" ? `/settings/profile` : `/${user?.role}/dashboard/settings`}>
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {
                  user?.role !== "user" && (
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <Link href={`/${user?.role}/dashboard/help`}>
                          <HelpCircle className="h-5 w-5" />
                          <span>Help & Support</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator className="h-[1px] bg-slate-500"/>
        <SidebarFooter>
          <DashUser/>
        </SidebarFooter>
        <SidebarFooter />
      </Sidebar>
    )
  }
  