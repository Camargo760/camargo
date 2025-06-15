import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const body = await request.json()
    const { page, sessionId } = body

    // Get IP address from headers
    const forwarded = request.headers.get("x-forwarded-for")
    const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "127.0.0.1"

    // Get user agent
    const userAgent = request.headers.get("user-agent") || "Unknown"

    // Get geolocation data
    let geoData = {
      country: "Unknown",
      countryCode: "XX",
      state: "Unknown",
      stateCode: "XX",
      city: "Unknown",
    }

    // Only get geo data for non-localhost IPs
    if (ip !== "127.0.0.1" && ip !== "::1" && !ip.startsWith("192.168.") && !ip.startsWith("10.")) {
      try {
        // Using ipwho.is for geolocation (free service)
        const geoResponse = await fetch(`https://ipwho.is/${ip}`)
        if (geoResponse.ok) {
          const geoJson = await geoResponse.json()
          if (geoJson.success) {
            geoData = {
              country: geoJson.country || "Unknown",
              countryCode: geoJson.country_code || "XX",
              state: geoJson.region || "Unknown",
              stateCode: geoJson.region_code || "XX",
              city: geoJson.city || "Unknown",
            }
          }
        }
      } catch (geoError) {
        console.error("Error fetching geolocation:", geoError)
        // Keep default values
      }
    } else {
      // For localhost/development, set as US for testing
      geoData = {
        country: "United States",
        countryCode: "US",
        state: "Development",
        stateCode: "DEV",
        city: "Localhost",
      }
    }

    const visit = {
      timestamp: new Date(),
      date: new Date().toISOString().split("T")[0],
      page: page || "/",
      ip,
      userAgent,
      sessionId: sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...geoData,
    }

    await db.collection("visits").insertOne(visit)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking visit:", error)
    return NextResponse.json({ error: "Failed to track visit" }, { status: 500 })
  }
}
