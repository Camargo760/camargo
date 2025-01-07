// api/create-checkout-session/route.js
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import clientPromise from '../../../lib/mongodb'
import { ObjectId } from 'mongodb'

const stripe = new Stripe('sk_test_51QZg9BD8mrcLYX2ej1ccqQNpzzOfbBKQbKjEsMJsXbhglF3mflOy8b8fvokUICannuHbARZ9pvrRyEXzuLZ5KV5e00Q4zzI8bm')

export async function POST(request) {
  try {
    if (!request.body) {
      return NextResponse.json({ error: 'Missing request body' }, { status: 400 })
    }

    const { productId, name, email, phone, address, color, size } = await request.json()

    // Validate required fields
    if (!productId || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 })
    }

    const product = await db.collection("products").findOne({ _id: new ObjectId(productId) })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${product.name} ${color ? `(${color}` : ''}${size ? ` - ${size})` : ')'}`,
              metadata: {
                productId,
                color,
                size
              },
            },
            unit_amount: Math.round(product.price * 100), // Ensure the price is correctly set
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.HOST_DOMAIN}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.HOST_DOMAIN}/product/${productId}`,
      customer_email: email,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['US'],
      },
      metadata: {
        userId: name,
        phone,
        address,
        productId,
        color,
        size
      },
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error('Error details:', error)
    return NextResponse.json({
      error: error.message || 'An error occurred while processing your request',
      code: error.code
    }, { status: error.statusCode || 500 })
  }
}
