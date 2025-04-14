import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get the home content from the database
    const content = await db.collection("siteContent").findOne({ type: "home" })

    if (!content) {
      return NextResponse.json({
        backgroundImage: null,
        mainText: "",
        subText: "",
        textStyles: {
          mainTextSize: "text-4xl md:text-6xl",
          mainTextColor: "text-white",
          mainTextFont: "font-bold",
          subtextSize: "text-xl md:text-2xl",
          subtextColor: "text-white",
          subtextFont: "font-normal",
        },
      })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("Error fetching home content:", error)
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { backgroundImage, mainText, subText, textStyles } = await request.json()
    
    console.log("Saving home content with text styles:", textStyles) // Debug log

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Update or insert the home content
    const result = await db.collection("siteContent").updateOne(
      { type: "home" },
      {
        $set: {
          type: "home", // Ensure type is set
          backgroundImage,
          mainText,
          subText,
          textStyles,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    )

    return NextResponse.json({
      success: true,
      message: "Home content updated successfully",
    })
  } catch (error) {
    console.error("Error updating home content:", error)
    return NextResponse.json({ error: "Failed to update home content" }, { status: 500 })
  }
}
