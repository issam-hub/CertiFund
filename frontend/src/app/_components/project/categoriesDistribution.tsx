"use client"

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

const COLORS = [
    "#1DB954",
    "#FF6B6B",
    "#6C757D",
    "#28A745",
    "#6F42C1",
    "#007BFF",
    "#FFC107",
    "#17A2B8",
    "#DC3545",
    "#343A40",
    "#6610F2"
]


export default function CategoriesDistribution({data}:{data: any[]}) {
  return (
    <ResponsiveContainer width="100%" height={300}>
    <PieChart>
        <Pie
        data={data}
        cx="50%"
        cy="50%"
        labelLine={false}
        outerRadius={100}
        fill="#8884d8"
        dataKey="count"
        nameKey={"category"}
        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
        >
        {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
        </Pie>
        <Tooltip label={"category"}/>
    </PieChart>
    </ResponsiveContainer>
  )
}
