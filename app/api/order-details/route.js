// api/order-details/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  const { searchParams } = new URL(request.url, `https://${request.headers.host}`)
  const sessionId = searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json({ error: 'No session ID provided' }, { status: 400 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items', 'customer_details']
    })

    const client = await clientPromise
    const db = client.db("ecommerce")

    const product = await db.collection("products").findOne({ _id: new ObjectId(session.metadata.productId) })

    const orderDetails = {
      id: session.id,
      customer_details: session.customer_details,
      product: {
        name: product.name,
        description: product.description,
        category: product.category,
        selectedColor: session.metadata.color,
        selectedSize: session.metadata.size,
        price: product.price, // Ensure the correct price is set
      },
      line_items: session.line_items.data,
      amount_total: session.amount_total,
    }

    return NextResponse.json(orderDetails)
  } catch (error) {
    console.error('Error fetching order details:', error)
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 })
  }
}
