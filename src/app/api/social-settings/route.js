import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const settings = await db.collection("socialSettings").findOne({})

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        instagram: {
          enabled: true,
          profileImage: "/assets/camargo-profile.jpg",
          qrImage: "/assets/instagram-qr.png",
          displayName: "Camargo Clothing Co.",
          username: "@CAMARGO_CLOTHING_CO",
          description1: "Follow And Stay Posted!",
          description2: "DM FOR ANY ORDERS.",
          description3: "Zelle: Camargo_co@outlook.com",
          category: "Clothing (Brand)",
          website: "https://www.camargosworld.com",
          instagramUrl: "https://www.instagram.com/camargo_clothing_co/",
        },
        facebook: {
          enabled: true,
          profileImage: "/assets/camargo-profile.jpg",
          bannerImage: "/assets/camargo-banner.png",
          displayName: "Camargo Clothing Co.",
          likes: "102",
          followers: "99",
          location: "Los Angeles, CA",
          phone: "(123) 456-7890",
          email: "Camargo_co@outlook.com",
          website: "https://www.camargosworld.com",
          facebookUrl: "https://www.facebook.com/CamargoClothingCo",
        },
      }

      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching social settings:", error)
    return NextResponse.json({ error: "Failed to fetch social settings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const settings = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Remove _id from settings if it exists to prevent immutable field error
    const { _id, ...settingsWithoutId } = settings

    // Use updateOne with $set instead of replaceOne to avoid _id conflicts
    await db.collection("socialSettings").updateOne({}, { $set: settingsWithoutId }, { upsert: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving social settings:", error)
    return NextResponse.json({ error: "Failed to save social settings" }, { status: 500 })
  }
}
