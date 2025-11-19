"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { LoginForm } from "@/components/auth/login-form"
import { SignupForm } from "@/components/auth/signup-form"
import { Button } from "@/components/ui/button"
import { Heart, UserPlus, LogIn } from "lucide-react"

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup" | "guest">("login")
  const router = useRouter()

  const handleAuthSuccess = () => {
    router.push("/dashboard")
  }

  const handleGuestAccess = () => {
    router.push("/assessment")
  }

  if (mode === "guest") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="flex justify-center mb-6">
            <Heart className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Continue as Guest</h1>
          <p className="text-muted-foreground text-balance">
            You can take the assessment without creating an account, but you won't be able to save your results or
            access the dashboard.
          </p>
          <div className="space-y-3">
            <Button onClick={handleGuestAccess} className="w-full" size="lg">
              Take Assessment Now
            </Button>
            <Button variant="outline" onClick={() => setMode("login")} className="w-full">
              Back to Sign In
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex flex-col lg:flex-row items-center gap-8">
        {/* Left side - Branding */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="flex justify-center lg:justify-start">
            <Heart className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-foreground text-balance">
            Your Mental Health Journey Starts Here
          </h1>
          <p className="text-xl text-muted-foreground text-balance">
            Take evidence-based assessments, track your progress, and find support resources near you.
          </p>

          {/* Access Options */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant={mode === "login" ? "default" : "outline"}
              onClick={() => setMode("login")}
              className="flex-1 gap-2"
              size="lg"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Button>
            <Button
              variant={mode === "signup" ? "default" : "outline"}
              onClick={() => setMode("signup")}
              className="flex-1 gap-2"
              size="lg"
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Button>
            <Button variant="ghost" onClick={() => setMode("guest")} className="flex-1" size="lg">
              Continue as Guest
            </Button>
          </div>
        </div>

        {/* Right side - Auth Forms */}
        <div className="flex-1 w-full max-w-md">
          {mode === "login" ? (
            <LoginForm onSuccess={handleAuthSuccess} onSwitchToSignup={() => setMode("signup")} />
          ) : (
            <SignupForm onSuccess={handleAuthSuccess} onSwitchToLogin={() => setMode("login")} />
          )}
        </div>
      </div>
    </div>
  )
}
