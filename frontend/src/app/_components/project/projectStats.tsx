"use client"

import { Overview } from "@/app/_lib/types"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

export function ProjectStats({data}:{data:Overview[]}) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="project_month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="successful_projects"
          name="Successful"
          stroke="#3B82F6"
          strokeWidth={2}
          activeDot={{ r: 8 }}
        />
        <Line type="monotone" dataKey="failed_projects" name="Failed" stroke="#93C5FD" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  )
}

