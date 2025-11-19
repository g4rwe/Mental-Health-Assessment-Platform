"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Brain, Shield, Users } from "lucide-react"

export default function HomePage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Redirect authenticated users to dashboard
      if (user) {
        router.push("/dashboard")
      } else {
        // Redirect unauthenticated users to auth page
        router.push("/auth")
      }
    }
  }, [user, isLoading, router])

  // Show loading or landing content while redirecting
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Landing page content (shown briefly before redirect)
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <Heart className="h-16 w-16 text-primary mx-auto mb-6" />
          <h1 className="text-4xl lg:text-6xl font-bold text-foreground mb-6 text-balance">
            Your Mental Health Journey Starts Here
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Take evidence-based assessments, track your progress, and find support resources near you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" onClick={() => router.push("/auth")} className="gap-2">
              <Heart className="h-4 w-4" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push("/assessment")} className="gap-2">
              <Brain className="h-4 w-4" />
              Take Assessment
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Evidence-Based Assessments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Take validated mental health screenings including PHQ-9 depression assessment with AI-powered insights.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Shield className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Secure & Private</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your data is protected with enterprise-grade security. Take assessments anonymously or create an account
                to track progress.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-12 w-12 text-primary mx-auto mb-4" />
              <CardTitle>Find Support</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Locate mental health resources and support services in your area with our integrated location services.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
