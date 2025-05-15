"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

// Define TypeScript interfaces
interface ExpertVote {
  highly_not_recommended: number;
  not_recommended: number;
  recommended: number;
  highly_recommended: number;
}

interface ProjectAssessment {
  title?: string;
  expert_vote?: ExpertVote;
  final_result?: string;
}

interface ChartDataItem {
  name: string;
  projectName: string;
  "Highly Not Recommended": number;
  "Not Recommended": number;
  "Recommended": number;
  "Highly Recommended": number;
  finalResult: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function AssessmentDistributionChart({ projectAssessments }: { projectAssessments: ProjectAssessment[] }) {
  // Early return for empty data with a message
  if (!projectAssessments || projectAssessments.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-[#1F2937]">Assessment Distributions</CardTitle>
          <CardDescription>Your distribution percentages for projects (hover on the votes for more details)</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[400px]">
          <p className="text-gray-500">No assessment data available</p>
        </CardContent>
      </Card>
    )
  }

  // Create chart data safely with only available projects
  const chartData: ChartDataItem[] = projectAssessments.map((project, index) => {
    // Ensure expert_vote exists and has all required properties
    const expertVote = project.expert_vote || {
      highly_not_recommended: 0,
      not_recommended: 0,
      recommended: 0,
      highly_recommended: 0
    }
    
    return {
      name: `Project ${index + 1}`,
      projectName: project.title || `Unnamed Project ${index + 1}`,
      "Highly Not Recommended": (expertVote.highly_not_recommended || 0) * 100,
      "Not Recommended": (expertVote.not_recommended || 0) * 100,
      "Recommended": (expertVote.recommended || 0) * 100,
      "Highly Recommended": (expertVote.highly_recommended || 0) * 100,
      finalResult: project.final_result || "unknown"
    }
  }).slice(0, 5) // Limit to 5 projects max, as per the original design

  // Define colors for each category
  const categoryColors: Record<string, string> = {
    "Highly Not Recommended": "#FCA5A5",
    "Not Recommended": "#ffb55b",
    "Recommended": "#a1f070",
    "Highly Recommended": "#FCD34D",
  }

  // Custom tooltip to show project name and winner status
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const projectData = chartData.find((p) => p.name === label)
      if (!projectData) return null
      
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{projectData.projectName}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toFixed(0)}%
              {entry.name.replace(/ /g, "_").toLowerCase() === projectData.finalResult && (
                <span className="text-green-600 ml-2">• Final Result</span>
              )}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-[#1F2937]">Assessment Distributions</CardTitle>
        <CardDescription>
          Your distribution percentages for the {chartData.length > 1 
            ? `last ${chartData.length} projects` 
            : 'last project'} (hover on the votes for more details)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value: number) => `${value}%`} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />

              {Object.entries(categoryColors).map(([key, color]) => (
                <Bar key={key} dataKey={key} name={key} fill={color} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}