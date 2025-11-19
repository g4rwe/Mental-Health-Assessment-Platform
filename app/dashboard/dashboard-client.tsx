"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Heart,
  Brain,
  TrendingUp,
  MapPin,
  Settings,
  LogOut,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
  created_at: string
  updated_at: string
}

interface Assessment {
  id: string
  user_id: string
  assessment_type: string
  responses: any
  scores: any
  severity_level: string
  recommendations: string | null
  created_at: string
}

interface DashboardClientProps {
  user: User
  profile: Profile | null
  assessments: Assessment[]
}

export default function DashboardClient({ user, profile, assessments }: DashboardClientProps) {
  const [savedProgress, setSavedProgress] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const startNewAssessment = () => {
    router.push("/assessment")
  }

  const resumeAssessment = () => {
    router.push("/assessment")
  }

  const getSeverityColor = (severityLevel: string) => {
    switch (severityLevel.toLowerCase()) {
      case "minimal":
        return "bg-green-100 text-green-800 border-green-200"
      case "mild":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "moderate":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "moderately severe":
        return "bg-red-100 text-red-800 border-red-200"
      case "severe":
        return "bg-red-200 text-red-900 border-red-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getProgressPercentage = () => {
    if (!savedProgress) return 0
    const answered = savedProgress.responses.filter((r: number) => r !== -1).length
    return (answered / 20) * 100
  }

  const getRecentTrend = () => {
    if (assessments.length < 2) return null

    const recent = assessments.slice(0, 2) // Already ordered by created_at desc
    const severityMap = { minimal: 1, mild: 2, moderate: 3, "moderately severe": 4, severe: 5 }

    const newScore = severityMap[recent[0].severity_level.toLowerCase() as keyof typeof severityMap] || 0
    const oldScore = severityMap[recent[1].severity_level.toLowerCase() as keyof typeof severityMap] || 0

    if (newScore < oldScore) return "improving"
    if (newScore > oldScore) return "worsening"
    return "stable"
  }

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-card-foreground">Welcome back, {displayName}</h1>
                <p className="text-muted-foreground">Track your mental health journey</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                Take Assessment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Complete a new mental health screening</p>
              <Button onClick={startNewAssessment} className="w-full gap-2">
                <Plus className="h-4 w-4" />
                Start New Assessment
              </Button>
            </CardContent>
          </Card>

          {savedProgress && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Resume Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm mb-2">Continue your saved assessment</p>
                <Progress value={getProgressPercentage()} className="mb-4" />
                <Button onClick={resumeAssessment} variant="outline" className="w-full bg-transparent">
                  Resume Assessment
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Find Support
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm mb-4">Locate mental health resources nearby</p>
              <Button
                variant="outline"
                className="w-full gap-2 bg-transparent"
                onClick={() => router.push("/resources")}
              >
                <MapPin className="h-4 w-4" />
                Find Resources
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="assessments">Assessments</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Overview Stats */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Assessments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-card-foreground">{assessments.length}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Latest Result</CardTitle>
                </CardHeader>
                <CardContent>
                  {assessments.length > 0 ? (
                    <Badge className={getSeverityColor(assessments[0].severity_level)}>
                      {assessments[0].severity_level}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">No assessments yet</span>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const trend = getRecentTrend()
                    if (!trend) return <span className="text-muted-foreground">Need more data</span>

                    return (
                      <div className="flex items-center gap-2">
                        <TrendingUp
                          className={`h-4 w-4 ${
                            trend === "improving"
                              ? "text-green-500"
                              : trend === "worsening"
                                ? "text-red-500"
                                : "text-gray-500"
                          }`}
                        />
                        <span className="capitalize">{trend}</span>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            </div>

            {/* Recent Assessment */}
            {assessments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Latest Assessment Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {(() => {
                    const latest = assessments[0]
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">
                            Completed {new Date(latest.created_at).toLocaleDateString()}
                          </span>
                          <Badge className={getSeverityColor(latest.severity_level)}>
                            {latest.severity_level} Depression
                          </Badge>
                        </div>

                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {latest.recommendations || "No specific recommendations available."}
                          </AlertDescription>
                        </Alert>

                        {latest.scores && typeof latest.scores === "object" && (
                          <div className="space-y-2">
                            <h4 className="font-medium">Assessment Scores:</h4>
                            {Object.entries(latest.scores).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="text-sm text-muted-foreground">{key}</span>
                                <span className="text-sm font-medium">{String(value)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="assessments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Assessment History</CardTitle>
                <CardDescription>View all your completed mental health assessments</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">No assessments completed yet</p>
                    <Button onClick={startNewAssessment}>Take Your First Assessment</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {assessments.map((assessment) => (
                      <Card key={assessment.id} className="border-l-4 border-l-primary">
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm text-muted-foreground">
                              {new Date(assessment.created_at).toLocaleDateString()} at{" "}
                              {new Date(assessment.created_at).toLocaleTimeString()}
                            </span>
                            <Badge className={getSeverityColor(assessment.severity_level)}>
                              {assessment.severity_level}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {assessment.recommendations || "No recommendations available."}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <CardDescription>Based on your assessment results and mental health journey</CardDescription>
              </CardHeader>
              <CardContent>
                {assessments.length === 0 ? (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Complete an assessment to get personalized recommendations
                    </p>
                    <Button onClick={startNewAssessment}>Take Assessment</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* General recommendations based on latest assessment */}
                    <Alert>
                      <Heart className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Daily Wellness:</strong> Maintain a regular sleep schedule, engage in physical activity,
                        and practice mindfulness or meditation.
                      </AlertDescription>
                    </Alert>

                    <Alert>
                      <Brain className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Mental Health:</strong> Consider keeping a mood journal and connecting with supportive
                        friends or family members regularly.
                      </AlertDescription>
                    </Alert>

                    {assessments.length > 0 && assessments[0].severity_level !== "Minimal" && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Professional Support:</strong> Based on your recent assessment, consider speaking with
                          a mental health professional for personalized guidance.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Mental Health Resources</CardTitle>
                <CardDescription>Find support services and resources in your area</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Crisis Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">24/7 crisis support and suicide prevention</p>
                        <div className="space-y-2 text-sm">
                          <div>
                            <strong>National Suicide Prevention Lifeline:</strong>
                            <br />
                            <a href="tel:988" className="text-primary hover:underline">
                              988
                            </a>
                          </div>
                          <div>
                            <strong>Crisis Text Line:</strong>
                            <br />
                            Text HOME to{" "}
                            <a href="sms:741741" className="text-primary hover:underline">
                              741741
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg">Find Local Support</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">
                          Locate mental health professionals and facilities near you
                        </p>
                        <Button className="w-full gap-2" onClick={() => router.push("/resources")}>
                          <MapPin className="h-4 w-4" />
                          Find Nearby Resources
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Online Resources</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <h4 className="font-medium mb-2">Educational Resources</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• National Institute of Mental Health (NIMH)</li>
                            <li>• Mental Health America</li>
                            <li>• American Psychological Association</li>
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Support Communities</h4>
                          <ul className="space-y-1 text-muted-foreground">
                            <li>• NAMI Support Groups</li>
                            <li>• Depression and Bipolar Support Alliance</li>
                            <li>• Anxiety and Depression Association</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
