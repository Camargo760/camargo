import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
    }

    // Prevent verifying admin through this endpoint
    if (email.toLowerCase() === "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Cannot reset admin password through this endpoint" }, { status: 403 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if user exists with the provided name and email
    const user = await db.collection("users").findOne({
      name: name,
      email: email.toLowerCase(),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User verified successfully",
    })
  } catch (error) {
    console.error("Error verifying user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
