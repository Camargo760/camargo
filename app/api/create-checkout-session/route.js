import { NextResponse } from "next/server"
import Stripe from "stripe"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json()

    if (!requestData) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }

    const {
      productId,
      name,
      email,
      phone,
      address,
      color,
      size,
      isCustomProduct,
      customText,
      quantity = 1,
    } = requestData

    // Validate required fields
    if (!productId || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Validate ObjectId format
    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    // Determine which collection to query based on isCustomProduct flag
    const collection = isCustomProduct ? "customProducts" : "products"
    const product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Calculate the total price based on quantity
    const totalPrice = product.price * quantity

    // Create line items for Stripe
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} ${color ? `(${color}` : ""}${size ? ` - ${size})` : color ? ")" : ""}`,
            metadata: {
              productId,
              color,
              size,
              isCustomProduct: isCustomProduct ? "true" : "false",
              customText: customText || "",
            },
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: Number.parseInt(quantity, 10),
      },
    ]

    // Create metadata for the session
    const metadata = {
      userId: name,
      phone: phone || "",
      address: address || "",
      productId,
      color: color || "",
      size: size || "",
      isCustomProduct: isCustomProduct ? "true" : "false",
      quantity: quantity.toString(),
    }

    // Add customText to metadata if it exists
    if (customText) {
      metadata.customText = customText
    }

    // Add customImage to metadata if it exists (for custom products)
    if (isCustomProduct && product.customImage) {
      metadata.customImage = "true" // Just indicate it exists, we'll fetch from DB
    }

    // Create the Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/product/${productId}`,
      customer_email: email,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: metadata,
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    console.error("Error details:", error)
    return NextResponse.json(
      {
        error: error.message || "An error occurred while processing your request",
        code: error.code,
      },
      { status: error.statusCode || 500 },
    )
  }
}

