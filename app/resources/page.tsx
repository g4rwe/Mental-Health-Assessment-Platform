"use client"

import { LocationFinder } from "@/components/location/location-finder"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Phone, MessageSquare, Globe, Heart, Users, BookOpen, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

export default function ResourcesPage() {
  const router = useRouter()

  const emergencyResources = [
    {
      name: "National Suicide Prevention Lifeline",
      description: "24/7 crisis support and suicide prevention",
      contact: "988",
      type: "phone",
      icon: Phone,
    },
    {
      name: "Crisis Text Line",
      description: "Text-based crisis support",
      contact: "Text HOME to 741741",
      type: "text",
      icon: MessageSquare,
    },
    {
      name: "National Domestic Violence Hotline",
      description: "Support for domestic violence situations",
      contact: "1-800-799-7233",
      type: "phone",
      icon: Phone,
    },
  ]

  const onlineResources = [
    {
      name: "National Institute of Mental Health (NIMH)",
      description: "Comprehensive mental health information and research",
      url: "https://www.nimh.nih.gov",
      category: "Education",
    },
    {
      name: "Mental Health America",
      description: "Mental health advocacy and resources",
      url: "https://www.mhanational.org",
      category: "Support",
    },
    {
      name: "NAMI (National Alliance on Mental Illness)",
      description: "Support groups and educational programs",
      url: "https://www.nami.org",
      category: "Support",
    },
    {
      name: "Anxiety and Depression Association of America",
      description: "Resources for anxiety and depression",
      url: "https://adaa.org",
      category: "Education",
    },
    {
      name: "Depression and Bipolar Support Alliance",
      description: "Peer support and wellness tools",
      url: "https://www.dbsalliance.org",
      category: "Support",
    },
    {
      name: "Substance Abuse and Mental Health Services Administration",
      description: "Treatment locator and resources",
      url: "https://www.samhsa.gov",
      category: "Treatment",
    },
  ]

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
              <h1 className="text-2xl font-bold text-card-foreground">Mental Health Resources</h1>
              <p className="text-muted-foreground">Find support services and professional help</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Emergency Resources */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Crisis & Emergency Support
            </CardTitle>
            <CardDescription className="text-red-700">
              If you're in crisis or having thoughts of self-harm, reach out immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {emergencyResources.map((resource, index) => (
                <Card key={index} className="border-red-200">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <resource.icon className="h-5 w-5 text-red-600 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-800">{resource.name}</h4>
                        <p className="text-sm text-red-700 mb-2">{resource.description}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-100 bg-transparent"
                          onClick={() => {
                            if (resource.type === "phone") {
                              window.location.href = `tel:${resource.contact.replace(/\D/g, "")}`
                            }
                          }}
                        >
                          {resource.contact}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Location Finder */}
        <LocationFinder />

        {/* Online Resources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Online Resources & Support
            </CardTitle>
            <CardDescription>
              Educational materials, support communities, and professional organizations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {onlineResources.map((resource, index) => (
                <Card key={index} className="border-l-4 border-l-primary">
                  <CardContent className="pt-4">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold text-card-foreground">{resource.name}</h4>
                        <span className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground">
                          {resource.category}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{resource.description}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(resource.url, "_blank")}
                        className="gap-2 bg-transparent"
                      >
                        <Globe className="h-3 w-3" />
                        Visit Website
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Self-Care Resources */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-primary" />
                Self-Care & Wellness
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Daily Wellness Practices</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Maintain regular sleep schedule (7-9 hours)</li>
                    <li>• Engage in physical activity (30 min/day)</li>
                    <li>• Practice mindfulness or meditation</li>
                    <li>• Stay connected with supportive people</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Stress Management</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• Deep breathing exercises</li>
                    <li>• Progressive muscle relaxation</li>
                    <li>• Journaling or expressive writing</li>
                    <li>• Limit caffeine and alcohol</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Support Groups & Communities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Local Support Groups</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• NAMI support groups</li>
                    <li>• Depression and Bipolar Support Alliance</li>
                    <li>• Anxiety support groups</li>
                    <li>• Grief and loss support</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Online Communities</h4>
                  <ul className="text-muted-foreground space-y-1">
                    <li>• 7 Cups (free emotional support)</li>
                    <li>• Reddit mental health communities</li>
                    <li>• Facebook support groups</li>
                    <li>• Mental Health America online groups</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <Alert>
          <BookOpen className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> These resources are for informational purposes and do not replace professional
            medical advice. Always consult with qualified healthcare providers for diagnosis and treatment of mental
            health conditions.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
