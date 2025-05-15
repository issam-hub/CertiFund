import { DashSidebar } from '@/app/_components/project/dashSidebar';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import React from 'react';
import DashHeader from '../_components/dashboard/dashHeader';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <SidebarProvider>
            <DashSidebar />
            <main className='w-full'>
                <DashHeader/>
                {children}
            </main>
      </SidebarProvider>
    );
}