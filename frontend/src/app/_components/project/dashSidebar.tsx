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
import { ChevronsUpDown, ChevronUp, Folder, HandCoins, HelpCircle, LayoutDashboard, Settings, User2, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import DashUser from "./dashUser"
  
  export function DashSidebar() {
    const sidebarState = useSidebar()

    return (
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <SidebarMenu className="flex flex-row justify-between items-center">
            <SidebarMenuItem>
              <Image src={"/dash-logo.svg"} alt="logo" width={120} height={100} className={`mt-2 h-auto ${!sidebarState.open && "hidden"}`} />
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard"}>
                      <LayoutDashboard className="h-5 w-5" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard/projects"}>
                      <Folder className="h-5 w-5" />
                      <span>Projects</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard/backings"}>
                      <HandCoins className="h-5 w-5" />
                      <span>Backings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard/users"}>
                      <Users className="h-5 w-5" />
                      <span>Users</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
          <SidebarSeparator className="h-[1px] bg-slate-500"/>
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard/settings"}>
                      <Settings className="h-5 w-5" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href={"/admin/dashboard/help"}>
                      <HelpCircle className="h-5 w-5" />
                      <span>Help & Support</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
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
  