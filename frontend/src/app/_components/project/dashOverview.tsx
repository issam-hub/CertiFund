"use client"

import type { Overview } from "@/app/_lib/types"
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"


export function Overview({data}:{data: Overview[]}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="project_month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip/>
        <Legend/>
        <Bar dataKey="successful_projects" name="Successful" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="failed_projects" name="Failed" fill="#93C5FD" radius={[4, 4, 0, 0]} />
        <Bar dataKey="total_projects" name="Total" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

