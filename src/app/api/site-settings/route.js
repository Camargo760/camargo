import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get the site settings from the database
    const settings = await db.collection("siteContent").findOne({ type: "settings" })

    if (!settings) {
      return NextResponse.json({
        logoUrl: "/assets/logo.png",
      })
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching site settings:", error)
    return NextResponse.json({ error: "Failed to fetch site settings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { logoUrl } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Update or insert the site settings
    const result = await db.collection("siteContent").updateOne(
      { type: "settings" },
      {
        $set: {
          logoUrl,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Site settings updated successfully",
    })
  } catch (error) {
    console.error("Error updating site settings:", error)
    return NextResponse.json({ error: "Failed to update site settings" }, { status: 500 })
  }
}
