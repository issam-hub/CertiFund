"use client"
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function CreatorsBackers({monthlyData}:{monthlyData: any[]}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
    <LineChart data={monthlyData}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="creators"
        stroke="#3B82F6"
        strokeWidth={2}
        activeDot={{ r: 8 }}
      />
      <Line type="monotone" dataKey="backers" stroke="#1E3A8A" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
  )
}
