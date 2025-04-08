"use client"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { usePathname } from 'next/navigation'
import React from 'react'

export default function DashHeader() {
    const pathname = usePathname()
    const realPath = pathname.split("/admin")[1]
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b font-[family-name:--font-montserrat]">
        <SidebarTrigger className='ml-2'/>
        <Separator orientation='vertical' className='h-5'/>
        <Breadcrumb className='p-5'>
            <BreadcrumbList className='text-[17px]'>
                {
                    realPath.split("/").slice(1).map((path, index) => {
                        const isLast = index === realPath.split("/").slice(1).length - 1
                        const href = realPath.includes("profile") ? "/admin/profile" : `/admin${realPath}`
                        const capitalizedPath = path.charAt(0).toUpperCase() + path.slice(1)
                        return (
                            <React.Fragment key={index}>
                                <BreadcrumbItem>
                                    {isLast ? (
                                        <BreadcrumbPage className='font-semibold'>{capitalizedPath}</BreadcrumbPage>
                                    ) : (
                                        <BreadcrumbLink href={href} className='text-gray-400 hover:text-gray-600'>
                                            {capitalizedPath}
                                        </BreadcrumbLink>
                                    )}
                                </BreadcrumbItem>
                                {!isLast && <BreadcrumbSeparator className='text-gray-400' />}
                            </React.Fragment>
                        )
                    })
                }
            </BreadcrumbList>
        </Breadcrumb>
    </header>
  )
}
