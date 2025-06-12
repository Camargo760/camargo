import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    const customProduct = await request.json()

    if (!customProduct.name || !customProduct.price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    customProduct.uploadTime = new Date()

    const result = await db.collection("customProducts").insertOne(customProduct)

    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        message: "Custom product created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json({ error: "Failed to create custom product" }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const customProducts = await db.collection("customProducts").find({}).toArray()

    const formattedProducts = customProducts.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch custom products" }, { status: 500 })
  }
}

