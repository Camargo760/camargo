// api/customProducts/route.js
import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    // Parse the request body
    const customProduct = await request.json()

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db()

    // Create a new document in the customProducts collection
    const result = await db.collection("customProducts").insertOne({
      ...customProduct,
      createdAt: new Date(),
    })

    // Return the created product with its ID
    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: "Custom product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating custom product:", error)
    return NextResponse.json({ error: "Failed to create custom product" }, { status: 500 })
  }
}
