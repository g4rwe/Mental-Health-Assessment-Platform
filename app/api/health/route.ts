import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const flaskUrl = process.env.FLASK_BACKEND_URL || "http://localhost:5000"

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(`${flaskUrl}/health`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": "MentalHealthApp/1.0",
      },
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Flask backend health check failed: ${response.status}`)
    }

    const result = await response.json()

    return NextResponse.json({
      status: "healthy",
      flask_backend: "connected",
      flask_response: result,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Flask backend health check failed:", error)

    return NextResponse.json(
      {
        status: "degraded",
        flask_backend: "disconnected",
        error: error instanceof Error ? error.message : "Unknown error",
        fallback_mode: true,
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
