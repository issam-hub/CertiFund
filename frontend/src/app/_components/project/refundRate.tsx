"use client"
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function RefundRate({monthlyData}:{monthlyData:any[]}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
    <LineChart
      data={monthlyData.map((item) => ({
        ...item,
        refundRate: item.refunds === 0 && item.backings === 0 ? "0.0" : ((item.refunds / item.backings) * 100).toFixed(1),
      }))}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="month" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
      <YAxis
        stroke="#888888"
        fontSize={12}
        tickLine={false}
        axisLine={false}
        tickFormatter={(value) => `${value}%`}
      />
      <Tooltip formatter={(value) => [`${value}%`, "Refund Rate"]} />
      <Line
        type="monotone"
        dataKey="refundRate"
        stroke="hsl(var(--destructive))"
        strokeWidth={2}
        activeDot={{ r: 8 }}
      />
    </LineChart>
  </ResponsiveContainer>
  )
}
