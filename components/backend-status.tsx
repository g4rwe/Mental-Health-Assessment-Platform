"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertCircle, RefreshCw, Server, Zap } from "lucide-react"

interface BackendStatus {
  status: string
  flask_backend: string
  flask_response?: any
  error?: string
  fallback_mode?: boolean
  timestamp: string
}

interface ModelInfo {
  available_models: Record<string, any>
  backend_status: string
  fallback_mode?: boolean
  timestamp: string
}

export function BackendStatus() {
  const [status, setStatus] = useState<BackendStatus | null>(null)
  const [models, setModels] = useState<ModelInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkBackendStatus = async () => {
    setIsLoading(true)
    try {
      const [healthResponse, modelsResponse] = await Promise.all([fetch("/api/health"), fetch("/api/models")])

      const healthData = await healthResponse.json()
      const modelsData = await modelsResponse.json()

      setStatus(healthData)
      setModels(modelsData)
    } catch (error) {
      console.error("Failed to check backend status:", error)
      setStatus({
        status: "error",
        flask_backend: "disconnected",
        error: "Failed to connect to backend services",
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkBackendStatus()
    // Check status every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return "bg-green-100 text-green-800 border-green-200"
      case "degraded":
      case "disconnected":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "error":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "connected":
        return <CheckCircle className="h-4 w-4" />
      case "degraded":
      case "disconnected":
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Server className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Status
          <Button variant="ghost" size="sm" onClick={checkBackendStatus} disabled={isLoading} className="ml-auto gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardTitle>
        <CardDescription>Real-time status of Flask ML backend and prediction services</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Flask Backend</span>
              <Badge className={getStatusColor(status.flask_backend)}>
                {getStatusIcon(status.flask_backend)}
                <span className="ml-1 capitalize">{status.flask_backend}</span>
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Status</span>
              <Badge className={getStatusColor(status.status)}>
                {getStatusIcon(status.status)}
                <span className="ml-1 capitalize">{status.status}</span>
              </Badge>
            </div>

            {status.fallback_mode && (
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Fallback Mode:</strong> Using local algorithms. Connect Flask backend for enhanced ML
                  predictions.
                </AlertDescription>
              </Alert>
            )}

            {status.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Error:</strong> {status.error}
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {models && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Available Models</h4>
            <div className="space-y-2">
              {Object.entries(models.available_models).map(([key, model]: [string, any]) => (
                <div key={key} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="text-sm font-medium">{model.name || key}</span>
                    {model.version && <span className="text-xs text-muted-foreground ml-2">v{model.version}</span>}
                  </div>
                  <Badge
                    variant="outline"
                    className={model.status === "fallback" ? "border-yellow-300 text-yellow-700" : ""}
                  >
                    {model.status || "active"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {status && (
          <div className="text-xs text-muted-foreground">
            Last checked: {new Date(status.timestamp).toLocaleString()}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
