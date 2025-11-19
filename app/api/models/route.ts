import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    const response = await fetch(`${flaskUrl}/models`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MentalHealthApp/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Flask backend models endpoint failed: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      available_models: result,
      backend_status: "connected",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Flask backend models check failed:", error)

    return NextResponse.json({
      available_models: {
        phq9_classifier: {
          name: "PHQ-9 Depression Classifier",
          version: "1.0.0",
          status: "fallback",
          description: "Fallback rule-based classifier for PHQ-9 assessment",
        },
      },
      backend_status: "disconnected",
      fallback_mode: true,
      timestamp: new Date().toISOString(),
    })
  }
}
