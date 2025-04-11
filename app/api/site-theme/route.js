import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get the site theme from the database
    const themeData = await db.collection("siteContent").findOne({ type: "theme" })

    if (!themeData) {
      return NextResponse.json({
        theme: {
          bgColor: "#0a0a0a",
          cardBgColor: "#1a1a1a",
          accentColor: "#ff3e00",
          textColor: "#f0f0f0",
          secondaryBgColor: "#2a2a2a",
          borderColor: "#333",
        },
      })
    }

    return NextResponse.json({ theme: themeData.theme })
  } catch (error) {
    console.error("Error fetching site theme:", error)
    return NextResponse.json({ error: "Failed to fetch site theme" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { theme } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Update or insert the site theme
    const result = await db.collection("siteContent").updateOne(
      { type: "theme" },
      {
        $set: {
          theme,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Site theme updated successfully",
    })
  } catch (error) {
    console.error("Error updating site theme:", error)
    return NextResponse.json({ error: "Failed to update site theme" }, { status: 500 })
  }
}
