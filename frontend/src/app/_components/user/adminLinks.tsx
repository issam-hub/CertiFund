import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Flag, Folder, HandCoins, LayoutDashboard, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function AdminLinks() {
  return (
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
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/admin/dashboard/disputes"}>
              <Flag className="h-5 w-5" />
              <span>Disputes</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  )
}
