import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

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
    return NextResponse.json({ error: "Failed to fetch about content" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { description, textStyles } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("siteContent").updateOne(
      { type: "about" },
      {
        $set: {
          type: "about",
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
    return NextResponse.json({ error: "Failed to update about content" }, { status: 500 })
  }
}
