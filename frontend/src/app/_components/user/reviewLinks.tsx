import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import { Clock, Flag, Folder, HandCoins, LayoutDashboard, ScanSearch, TriangleAlert, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

export default function ReviewerLinks() {
  return (
    <SidebarGroup>
    <SidebarGroupLabel>Platform</SidebarGroupLabel>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/reviewer/dashboard"}>
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/reviewer/dashboard/pending"}>
              <Clock className="h-5 w-5" />
              <span>Pending Reviews</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/reviewer/dashboard/reviewed"}>
              <ScanSearch className="h-5 w-5" />
              <span>Reviewed Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
        <SidebarMenuItem>
          <SidebarMenuButton asChild>
            <Link href={"/reviewer/dashboard/flagged"}>
              <TriangleAlert className="h-5 w-5" />
              <span>Flagged Projects</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
  )
}
