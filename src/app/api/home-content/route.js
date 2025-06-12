import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const content = await db.collection("siteContent").findOne({ type: "home" })

    if (!content) {
      return NextResponse.json({
        backgroundImage: null,
        backgroundImageMobile: null,
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
    return NextResponse.json({ error: "Failed to fetch home content" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { backgroundImage, backgroundImageMobile, mainText, subText, textStyles } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("siteContent").updateOne(
      { type: "home" },
      {
        $set: {
          backgroundImage,
          backgroundImageMobile,
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
    return NextResponse.json({ error: "Failed to update home content" }, { status: 500 })
  }
}
