import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Flag, Folder, HandCoins, LayoutDashboard, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function UserLinks() {
  return (
    <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/user/dashboard"}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/user/dashboard/projects"}>
              <Folder className="h-5 w-5" />
              <span>My projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/user/dashboard/backings"}>
              <HandCoins className="h-5 w-5" />
              <span>My backings</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  )
}
