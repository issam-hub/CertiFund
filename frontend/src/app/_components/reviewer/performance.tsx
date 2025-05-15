"use client"

import React from 'react'
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function Performance({weeklyReviewData}:{weeklyReviewData:any[]}) {
  return (
    <Card>
    <CardHeader>
      <CardTitle><h2>Review Performance</h2></CardTitle>
      <CardDescription>Weekly review activity</CardDescription>
    </CardHeader>
    <CardContent className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyReviewData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="approved" name="Approved" fill="#5d9bfd" radius={[4, 4, 0, 0]} />
          <Bar dataKey="rejected" name="Rejected" fill="#e96363" radius={[4, 4, 0, 0]} />
          <Bar dataKey="flagged" name="Flagged" fill="#f2934f" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
  )
}
