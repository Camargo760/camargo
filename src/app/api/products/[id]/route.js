import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "../../../../lib/mongodb"

export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const product = await db.collection("products").findOne({ _id: new ObjectId(id) })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Convert ObjectId to string
    product._id = product._id.toString()

    return NextResponse.json(product)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Remove _id from update data if present
    delete updateData._id

    const result = await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const updateData = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("products").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("products").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
