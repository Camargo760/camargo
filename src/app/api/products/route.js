// api/products/route.js
import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  try {
    const url = new URL(request.url)
    const sort = url.searchParams.get("sort") || "desc"
    const publishedParam = url.searchParams.get("published")

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Build query based on parameters
    const query = {}

    // Filter by published status if specified
    if (publishedParam === "true") {
      query.published = true
    }

    // Get products with sorting
    const products = await db
      .collection("products")
      .find(query)
      .sort({ uploadTime: sort === "desc" ? -1 : 1 })
      .toArray()

    // Convert ObjectId to string
    const formattedProducts = products.map((product) => ({
      ...product,
      _id: product._id.toString(),
    }))

    return NextResponse.json(formattedProducts)
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}


export async function POST(request) {
  const client = await clientPromise
  const db = client.db("ecommerce")
  const product = await request.json()
  const result = await db.collection("products").insertOne({
    ...product,
    uploadTime: new Date(),
  })
  return NextResponse.json({ message: 'Product added successfully', id: result.insertedId })
}

