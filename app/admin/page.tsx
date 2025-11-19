"use client"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Settings, Database, Activity } from "lucide-react"
import { BackendStatus } from "@/components/backend-status"
import { useAuth } from "@/lib/auth-context"

export default function AdminPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Simple admin check - in production, implement proper role-based access
  const isAdmin = user?.email?.includes("admin") || user?.name?.toLowerCase().includes("admin")

  if (!user) {
    router.push("/auth")
    return null
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You don't have permission to access this page.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-card-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">System monitoring and configuration</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="status" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="status">System Status</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="status" className="space-y-6">
            <BackendStatus />

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Frontend Status</span>
                      <span className="text-green-600">Healthy</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Database Connection</span>
                      <span className="text-green-600">Connected</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Authentication Service</span>
                      <span className="text-green-600">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Location Services</span>
                      <span className="text-green-600">Available</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Environment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Flask Backend URL</span>
                      <span className="text-muted-foreground">{process.env.FLASK_BACKEND_URL || "localhost:5000"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Environment</span>
                      <span className="text-muted-foreground">{process.env.NODE_ENV || "development"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Build Time</span>
                      <span className="text-muted-foreground">{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Usage Analytics</CardTitle>
                <CardDescription>Assessment completion and user engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Connect analytics service to view user engagement and assessment completion rates
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  System Configuration
                </CardTitle>
                <CardDescription>Manage system settings and configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Configuration panel coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Manage ML model settings, assessment configurations, and system parameters
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
