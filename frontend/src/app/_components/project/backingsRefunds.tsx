"use client"

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

export default function BackingsRefunds({monthlyData}:{monthlyData:any[]}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
    <BarChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip />
      <Legend />
      <Bar dataKey="backings" fill="#1E3A8A" radius={[4, 4, 0, 0]} />
      <Bar dataKey="refunds" fill="#ef4444" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
  )
}
