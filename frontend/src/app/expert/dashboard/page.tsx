import { getExpertAccuracy } from "@/app/_actions/dashboard"
import { AssessmentDistributionChart } from "@/app/_components/expert/accuracy"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ChartColumnIncreasing } from "lucide-react"

export default async function Dashboardpage() {
  const result = await getExpertAccuracy()
  if (!result.status) {
    throw new Error(result.error)
  }
  return (
    <div className="container mx-auto px-5 py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-[#1F2937]"><h2>Distribution Guidelines</h2></CardTitle>
          <CardDescription>How to effectively distribute your assessment percentages</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-lg border p-4 bg-slate-50">
              <h4 className="font-medium text-[#1F2937] mb-2">Assessment Distribution Process</h4>
              <p className="text-sm text-muted-foreground">
                For each project, you'll distribute percentages across four recommendation levels. The sum must equal
                100%. Your distribution represents your confidence in each recommendation level.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-[#1F2937] mb-2 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FCA5A5] mr-2"></div>
                  Highly Not Recommended
                </h4>
                <p className="text-sm text-muted-foreground">
                  Projects with significant flaws, unrealistic goals, or ethical concerns. Assign higher percentages
                  when you have strong evidence against the project.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-[#1F2937] mb-2 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#ffb55b] mr-2"></div>
                  Not Recommended
                </h4>
                <p className="text-sm text-muted-foreground">
                  Projects with notable concerns or weaknesses, but not fundamentally flawed. Use when you have moderate
                  evidence against the project.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-[#1F2937] mb-2 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#a1f070] mr-2"></div>
                  Recommended
                </h4>
                <p className="text-sm text-muted-foreground">
                  Solid projects with good potential and manageable risks. Assign higher percentages when evidence
                  supports the project's success.
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <h4 className="font-medium text-[#1F2937] mb-2 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-[#FCD34D] mr-2"></div>
                  Highly Recommended
                </h4>
                <p className="text-sm text-muted-foreground">
                  Exceptional projects with strong evidence of success, innovation, and impact. Use when you have strong
                  evidence supporting the project.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-5">
        <AssessmentDistributionChart projectAssessments={result["accuracy"]} />
      </Card>
    </div>
  )
}

