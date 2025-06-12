import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request, context) {
  try {
    const { id } = context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const customProduct = await db.collection("customProducts").findOne({ _id: new ObjectId(id) })

    if (!customProduct) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    customProduct._id = customProduct._id.toString()

    return NextResponse.json(customProduct)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch custom product" }, { status: 500 })
  }
}

export async function PUT(request, context) {
  try {
    const { id } = context.params
    const updates = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("customProducts").updateOne(
      { _id: new ObjectId(id) },
      { $set: updates }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Custom product updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update custom product" }, { status: 500 })
  }
}

export async function DELETE(request, context) {
  try {
    const { id } = context.params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("customProducts").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Custom product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Custom product deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete custom product" }, { status: 500 })
  }
}
