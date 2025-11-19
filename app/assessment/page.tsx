"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Heart, MapPin, ArrowLeft, Save } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/lib/auth-context"
import { createClient } from "@/lib/supabase/client"

const QUESTIONS = [
  "Over the past two weeks, how often have you been bothered by feeling down, depressed, or hopeless?",
  "How often have you had little interest or pleasure in doing things?",
  "How often have you had trouble falling or staying asleep, or sleeping too much?",
  "How often have you felt tired or had little energy?",
  "How often have you had poor appetite or overeating?",
  "How often have you felt bad about yourself or that you are a failure?",
  "How often have you had trouble concentrating on things?",
  "How often have you moved or spoken so slowly that others noticed?",
  "How often have you had thoughts that you would be better off dead?",
  "How often have you felt nervous, anxious, or on edge?",
  "How often have you been unable to stop or control worrying?",
  "How often have you worried too much about different things?",
  "How often have you had trouble relaxing?",
  "How often have you been restless or unable to sit still?",
  "How often have you become easily annoyed or irritable?",
  "How often have you felt afraid something awful might happen?",
  "How well have you been able to handle stress in your daily life?",
  "How satisfied are you with your relationships with family and friends?",
  "How would you rate your overall physical health?",
  "How optimistic do you feel about your future?",
]

const RESPONSE_OPTIONS = [
  { value: 0, label: "Not at all" },
  { value: 1, label: "Several days" },
  { value: 2, label: "More than half the days" },
  { value: 3, label: "Nearly every day" },
]

interface PredictionResult {
  prediction: string
  probabilities?: Record<string, number>
  recommendation: string
  maps_link?: string
}

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [responses, setResponses] = useState<number[]>(new Array(20).fill(-1))
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<PredictionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const { user } = useAuth()
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      const savedProgress = localStorage.getItem(`assessment_progress_${user.id}`)
      if (savedProgress) {
        try {
          const { responses: savedResponses, currentQuestion: savedQuestion } = JSON.parse(savedProgress)
          setResponses(savedResponses)
          setCurrentQuestion(savedQuestion)
        } catch (error) {
          console.error("Failed to load saved progress:", error)
        }
      }
    }
  }, [user])

  const saveProgress = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const progressData = { responses, currentQuestion, timestamp: new Date().toISOString() }
      localStorage.setItem(`assessment_progress_${user.id}`, JSON.stringify(progressData))
    } catch (error) {
      console.error("Failed to save progress:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResponse = (value: number) => {
    const newResponses = [...responses]
    newResponses[currentQuestion] = value
    setResponses(newResponses)

    if (user) {
      setTimeout(saveProgress, 500)
    }
  }

  const nextQuestion = () => {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const submitAssessment = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses }),
      })

      if (!response.ok) {
        throw new Error("Failed to get prediction")
      }

      const data = await response.json()
      setResult(data)

      if (user) {
        try {
          const { error: insertError } = await supabase.from("assessments").insert({
            user_id: user.id,
            assessment_type: "phq9",
            responses: responses,
            scores: data.probabilities || {},
            severity_level: data.prediction,
            recommendations: data.recommendation,
          })

          if (insertError) {
            console.error("Failed to save assessment to database:", insertError)
            const assessments = JSON.parse(localStorage.getItem(`assessments_${user.id}`) || "[]")
            assessments.push({
              responses,
              result: data,
              completedAt: new Date().toISOString(),
            })
            localStorage.setItem(`assessments_${user.id}`, JSON.stringify(assessments))
          }

          localStorage.removeItem(`assessment_progress_${user.id}`)
        } catch (dbError) {
          console.error("Database error:", dbError)
          const assessments = JSON.parse(localStorage.getItem(`assessments_${user.id}`) || "[]")
          assessments.push({
            responses,
            result: data,
            completedAt: new Date().toISOString(),
          })
          localStorage.setItem(`assessments_${user.id}`, JSON.stringify(assessments))
          localStorage.removeItem(`assessment_progress_${user.id}`)
        }
      }
    } catch (err) {
      setError("Unable to process assessment. Please try again.")
      console.error("Prediction error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetAssessment = () => {
    setCurrentQuestion(0)
    setResponses(new Array(20).fill(-1))
    setResult(null)
    setError(null)

    if (user) {
      localStorage.removeItem(`assessment_progress_${user.id}`)
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  const goBack = () => {
    router.back()
  }

  const progress = ((currentQuestion + 1) / QUESTIONS.length) * 100
  const isCurrentAnswered = responses[currentQuestion] !== -1
  const phq9Answered = responses.slice(0, 9).every((r) => r !== -1)
  const allAnswered = responses.every((r) => r !== -1)

  if (result) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-accent" />
              </div>
              <CardTitle className="text-2xl font-bold text-card-foreground">Assessment Complete</CardTitle>
              <CardDescription className="text-muted-foreground">Your mental health screening results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge
                  variant={
                    result.prediction === "Minimal"
                      ? "secondary"
                      : result.prediction === "Mild"
                        ? "outline"
                        : "destructive"
                  }
                  className="text-lg px-4 py-2"
                >
                  {result.prediction} Depression
                </Badge>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm leading-relaxed">{result.recommendation}</AlertDescription>
              </Alert>

              {result.maps_link && (
                <div className="text-center">
                  <Button variant="outline" onClick={() => window.open(result.maps_link, "_blank")} className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Find Nearby Help
                  </Button>
                </div>
              )}

              {result.probabilities && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-card-foreground">Confidence Levels:</h4>
                  {Object.entries(result.probabilities).map(([severity, probability]) => (
                    <div key={severity} className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">{severity}</span>
                      <span className="text-sm font-medium">{(probability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 pt-4">
                {user && (
                  <Button onClick={goToDashboard} className="flex-1">
                    View Dashboard
                  </Button>
                )}
                <Button onClick={resetAssessment} variant="outline" className="flex-1 bg-transparent">
                  Take Again
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={goBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          {user && (
            <Button variant="ghost" size="sm" onClick={saveProgress} disabled={isSaving} className="gap-2 ml-auto">
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Progress"}
            </Button>
          )}
        </div>

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mental Health Assessment</h1>
          <p className="text-muted-foreground text-balance">
            This confidential assessment includes PHQ-9 depression screening and additional wellness questions. Please
            answer honestly based on how you've felt over the past two weeks.
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>
              Question {currentQuestion + 1} of {QUESTIONS.length}
            </span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />

          {currentQuestion < 9 && (
            <p className="text-xs text-muted-foreground mt-1">
              PHQ-9 Core Questions (1-9) - Required for depression screening
            </p>
          )}
        </div>

        <Card className="bg-card border-border mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-card-foreground text-pretty">{QUESTIONS[currentQuestion]}</CardTitle>
            {currentQuestion >= 9 && (
              <CardDescription className="text-muted-foreground">
                Additional wellness question - helps provide more comprehensive insights
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {RESPONSE_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={responses[currentQuestion] === option.value ? "default" : "outline"}
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => handleResponse(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between gap-4">
          <Button
            variant="outline"
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="flex-1 bg-transparent"
          >
            Previous
          </Button>

          {currentQuestion === QUESTIONS.length - 1 ? (
            <Button onClick={submitAssessment} disabled={!phq9Answered || isSubmitting} className="flex-1">
              {isSubmitting ? "Processing..." : "Complete Assessment"}
            </Button>
          ) : currentQuestion === 8 ? (
            <div className="flex-1 space-y-2">
              <Button onClick={submitAssessment} disabled={!phq9Answered || isSubmitting} className="w-full">
                {isSubmitting ? "Processing..." : "Submit PHQ-9 Only"}
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!isCurrentAnswered}
                variant="outline"
                className="w-full bg-transparent"
              >
                Continue to Additional Questions
              </Button>
            </div>
          ) : (
            <Button onClick={nextQuestion} disabled={!isCurrentAnswered} className="flex-1">
              Next
            </Button>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-muted-foreground text-pretty">
            This screening is not a substitute for professional medical advice. If you're experiencing thoughts of
            self-harm, please contact emergency services immediately.
          </p>
        </div>
      </div>
    </div>
  )
}
