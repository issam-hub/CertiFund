import React from 'react'
import { healthCheck } from '../_actions/matric/healthCheck'

import { CheckCircle, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function healthStatus() {
    const data = await healthCheck()
    
  const isHealthy = data === "OK"

  return (
    <Card className="w-[500px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
      <CardHeader>
        <CardTitle>Website Health Status</CardTitle>
        <CardDescription>ProjectX</CardDescription>
      </CardHeader>
      <CardContent>
        {isHealthy ? (
          <Alert variant="default" className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">All Systems Operational</AlertTitle>
            <AlertDescription className="text-green-700">The website is running smoothly.</AlertDescription>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Service Disruption</AlertTitle>
            <AlertDescription>
              We're experiencing some issues. Our team has been notified and is working on a resolution.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

