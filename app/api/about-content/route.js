import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get the about content from the database
    const content = await db.collection("siteContent").findOne({ type: "about" })

    if (!content) {
      return NextResponse.json({
        description: "",
        textStyles: {
          textSize: "text-lg",
          textColor: "text-gray-700",
          textFont: "font-normal",
        },
      })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching about content:", error)
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { description, textStyles } = await request.json()
    
    console.log("Saving about content with text styles:", textStyles) // Debug log

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Update or insert the about content
    const result = await db.collection("siteContent").updateOne(
      { type: "about" },
      {
        $set: {
          type: "about", // Ensure type is set
          description,
          textStyles,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "About content updated successfully",
    })
  } catch (error) {
    console.error("Error updating about content:", error)
    return NextResponse.json({ error: "Failed to update about content" }, { status: 500 })
  }
}
