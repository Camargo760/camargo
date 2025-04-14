import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

// Store a custom product image
export async function POST(request) {
  try {
    const { imageData, productId } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Create the image record
    const imageRecord = {
      imageData,
      productId: productId || null,
      createdAt: new Date(),
    }

    // Insert the image into the database
    const result = await db.collection("customProductImages").insertOne(imageRecord)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: "Image stored successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error storing custom product image:", error)
    return NextResponse.json({ error: "Failed to store image" }, { status: 500 })
  }
}

// Get a custom product image by ID
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing image ID" }, { status: 400 })
    }

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid image ID format" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Find the image
    const image = await db.collection("customProductImages").findOne({ _id: new ObjectId(id) })

    if (!image) {
      return NextResponse.json({ error: "Image not found" }, { status: 404 })
    }

    return NextResponse.json({
      id: image._id.toString(),
      imageData: image.imageData,
      productId: image.productId,
    })
  } catch (error) {
    console.error("Error fetching custom product image:", error)
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}

