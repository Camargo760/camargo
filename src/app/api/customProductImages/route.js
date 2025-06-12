import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    const { imageData, productId } = await request.json()

    if (!imageData) {
      return NextResponse.json({ error: "Missing image data" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const imageRecord = {
      imageData,
      productId: productId || null,
      createdAt: new Date(),
    }

    const result = await db.collection("customProductImages").insertOne(imageRecord)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: "Image stored successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to store image" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Missing image ID" }, { status: 400 })
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid image ID format" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

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
    return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
  }
}

