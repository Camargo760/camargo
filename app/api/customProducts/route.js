import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    const customProduct = await request.json()

    // Validate required fields
    if (!customProduct.name || !customProduct.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Add timestamp
    customProduct.uploadTime = new Date()

    // Insert the custom product
    const result = await db.collection("customProducts").insertOne(customProduct)

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

export async function GET(request) {
  try {
    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get all custom products
    const customProducts = await db.collection("customProducts").find({}).toArray()

    // Convert ObjectId to string
    const formattedProducts = customProducts.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching custom products:", error)
    return NextResponse.json({ error: "Failed to fetch custom products" }, { status: 500 })
  }
}

