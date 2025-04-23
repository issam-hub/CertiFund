import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Clock, Flag, Folder, Glasses, HandCoins, LayoutDashboard, ScanSearch, TriangleAlert, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ExpertLinks() {
  return (
    <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/expert/dashboard"}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/expert/dashboard/pending"}>
              <Clock className="h-5 w-5" />
              <span>Pending Assessements</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/expert/dashboard/assessed"}>
              <Glasses className="h-5 w-5" />
              <span>Assessed Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  )
}
