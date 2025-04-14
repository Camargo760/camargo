import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, context) {
  try {
    const { id } = context.params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Find the custom product
    const customProduct = await db.collection("customProducts").findOne({ _id: new ObjectId(id) })

    if (!customProduct) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    // Convert ObjectId to string
    customProduct._id = customProduct._id.toString()

    return NextResponse.json(customProduct)
  } catch (error) {
    console.error("Error fetching custom product:", error)
    return NextResponse.json({ error: "Failed to fetch custom product" }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const { id } = context.params
    const updates = await request.json()

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Update the custom product
    const result = await db.collection("customProducts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Custom product updated successfully" })
  } catch (error) {
    console.error("Error updating custom product:", error)
    return NextResponse.json({ error: "Failed to update custom product" }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = context.params

    // Validate ObjectId format
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Delete the custom product
    const result = await db.collection("customProducts").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Custom product deleted successfully" })
  } catch (error) {
    console.error("Error deleting custom product:", error)
    return NextResponse.json({ error: "Failed to delete custom product" }, { status: 500 })
  }
}
