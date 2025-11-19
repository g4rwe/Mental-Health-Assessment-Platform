"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Navigation, Phone, Clock, Star, ExternalLink, Search, Loader2, AlertCircle } from "lucide-react"

interface MentalHealthFacility {
  id: string
  name: string
  address: string
  phone?: string
  rating?: number
  distance?: number
  type: string
  isOpen?: boolean
  website?: string
  placeId?: string
}

interface LocationFinderProps {
  className?: string
}

export function LocationFinder({ className }: LocationFinderProps) {
  const [location, setLocation] = useState("")
  const [facilities, setFacilities] = useState<MentalHealthFacility[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Mock data for demonstration - replace with actual Google Places API
  const mockFacilities: MentalHealthFacility[] = [
    {
      id: "1",
      name: "Community Mental Health Center",
      address: "123 Main St, Your City, State 12345",
      phone: "(555) 123-4567",
      rating: 4.5,
      distance: 0.8,
      type: "Community Health Center",
      isOpen: true,
      website: "https://example.com",
    },
    {
      id: "2",
      name: "Wellness Psychology Group",
      address: "456 Oak Ave, Your City, State 12345",
      phone: "(555) 987-6543",
      rating: 4.8,
      distance: 1.2,
      type: "Private Practice",
      isOpen: true,
    },
    {
      id: "3",
      name: "Regional Medical Center - Behavioral Health",
      address: "789 Hospital Dr, Your City, State 12345",
      phone: "(555) 555-0123",
      rating: 4.2,
      distance: 2.1,
      type: "Hospital",
      isOpen: true,
      website: "https://example.com",
    },
    {
      id: "4",
      name: "Crisis Support Center",
      address: "321 Support Blvd, Your City, State 12345",
      phone: "(555) 911-HELP",
      rating: 4.7,
      distance: 1.5,
      type: "Crisis Center",
      isOpen: true,
    },
    {
      id: "5",
      name: "Mindful Therapy Associates",
      address: "654 Peaceful Way, Your City, State 12345",
      phone: "(555) 246-8135",
      rating: 4.6,
      distance: 3.2,
      type: "Private Practice",
      isOpen: false,
    },
  ]

  const getCurrentLocation = () => {
    setIsLoading(true)
    setError("")

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser")
      setIsLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ lat: latitude, lng: longitude })
        setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`)

        // Simulate API call delay
        setTimeout(() => {
          setFacilities(mockFacilities)
          setIsLoading(false)
        }, 1500)
      },
      (error) => {
        setError("Unable to retrieve your location. Please enter your address manually.")
        setIsLoading(false)
      },
    )
  }

  const searchByAddress = async () => {
    if (!location.trim()) {
      setError("Please enter a location")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      // In a real implementation, you would:
      // 1. Geocode the address using Google Geocoding API
      // 2. Use Google Places API to find nearby mental health facilities
      // 3. Filter and sort results by distance and rating

      // Simulate API call
      setTimeout(() => {
        setFacilities(mockFacilities)
        setIsLoading(false)
      }, 1500)
    } catch (err) {
      setError("Failed to search for facilities. Please try again.")
      setIsLoading(false)
    }
  }

  const openInMaps = (facility: MentalHealthFacility) => {
    const query = encodeURIComponent(facility.address)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(mapsUrl, "_blank")
  }

  const callFacility = (phone: string) => {
    window.location.href = `tel:${phone}`
  }

  const getFacilityTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "crisis center":
        return "bg-red-100 text-red-800 border-red-200"
      case "hospital":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "community health center":
        return "bg-green-100 text-green-800 border-green-200"
      case "private practice":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Find Mental Health Resources
          </CardTitle>
          <CardDescription>Locate mental health professionals and support services in your area</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Location Input */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="location">Enter your location</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder="Enter city, state, or zip code"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && searchByAddress()}
                  className="flex-1"
                />
                <Button onClick={searchByAddress} disabled={isLoading} className="gap-2">
                  <Search className="h-4 w-4" />
                  Search
                </Button>
              </div>
            </div>

            <div className="text-center">
              <span className="text-muted-foreground text-sm">or</span>
            </div>

            <Button
              onClick={getCurrentLocation}
              disabled={isLoading}
              variant="outline"
              className="w-full gap-2 bg-transparent"
            >
              <Navigation className="h-4 w-4" />
              Use My Current Location
            </Button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Finding mental health resources near you...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results */}
          {facilities.length > 0 && !isLoading && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Found {facilities.length} facilities nearby</h3>
                <Badge variant="outline">{userLocation ? "Using GPS location" : "Using search location"}</Badge>
              </div>

              <div className="space-y-4">
                {facilities.map((facility) => (
                  <Card key={facility.id} className="border-l-4 border-l-primary">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-card-foreground">{facility.name}</h4>
                            <p className="text-sm text-muted-foreground">{facility.address}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {facility.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{facility.rating}</span>
                              </div>
                            )}
                            {facility.distance && <Badge variant="outline">{facility.distance} mi</Badge>}
                          </div>
                        </div>

                        {/* Facility Info */}
                        <div className="flex items-center gap-4 text-sm">
                          <Badge className={getFacilityTypeColor(facility.type)}>{facility.type}</Badge>

                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className={facility.isOpen ? "text-green-600" : "text-red-600"}>
                              {facility.isOpen ? "Open" : "Closed"}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" onClick={() => openInMaps(facility)} className="gap-2">
                            <MapPin className="h-3 w-3" />
                            Directions
                          </Button>

                          {facility.phone && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => callFacility(facility.phone!)}
                              className="gap-2 bg-transparent"
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </Button>
                          )}

                          {facility.website && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(facility.website, "_blank")}
                              className="gap-2 bg-transparent"
                            >
                              <ExternalLink className="h-3 w-3" />
                              Website
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Additional Resources */}
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Need immediate help?</strong> Call 988 for the Suicide & Crisis Lifeline or text HOME to
                  741741 for the Crisis Text Line.
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Empty State */}
          {facilities.length === 0 && !isLoading && !error && location && (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No facilities found in this area. Try expanding your search radius.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
