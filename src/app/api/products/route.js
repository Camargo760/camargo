// api/products/route.js
import { NextResponse } from 'next/server'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

export async function GET(request) {
  const { searchParams } = new URL(request.url, `https://${request.headers.host}`)
  const published = searchParams.get('published')
  const category = searchParams.get('category')
  const sort = searchParams.get('sort')

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")
    const collection = db.collection("products")

    let query = {}
    if (published !== null) {
      query.published = published === 'true'
    }
    if (category) {
      query.category = category
    }

    let sortOrder = { uploadTime: -1 } // Default to descending order (newest first)
    if (sort === 'asc') {
      sortOrder = { uploadTime: 1 }
    }

    const products = await collection.find(query).sort(sortOrder).toArray()
    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
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

