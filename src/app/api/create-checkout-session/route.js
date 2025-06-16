import { NextResponse } from "next/server"
import Stripe from "stripe"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(request) {
  try {
    const requestData = await request.json()

    if (!requestData) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }

    const {
      productId,
      name,
      phone,
      address,
      color,
      size,
      isCustomProduct,
      customText,
      quantity = 1,
      designImageId,
      category,
      couponCode,
      discountedPrice,
    } = requestData

    if (!productId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    if (!ObjectId.isValid(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
    }

    const collection = isCustomProduct ? "customProducts" : "products"
    const product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const finalPrice = discountedPrice || product.price
    const originalPrice = product.price

    console.log("Price calculation:", {
      originalPrice,
      discountedPrice,
      finalPrice,
      couponCode,
    })

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
              category: category || product.category || "N/A",
            },
          },
          unit_amount: Math.round(finalPrice * 100),
        },
        quantity: Number.parseInt(quantity, 10),
      },
    ]

    const metadata = {
      userId: name,
      phone: phone || "",
      address: address || "",
      productId,
      color: color || "",
      size: size || "",
      isCustomProduct: isCustomProduct ? "true" : "false",
      quantity: quantity.toString(),
      category: category || product.category || "N/A",
      originalPrice: originalPrice.toString(),
      finalPrice: finalPrice.toString(),
    }

    if (couponCode) {
      metadata.coupon = couponCode
      const discountPercentage = ((originalPrice - finalPrice) / originalPrice) * 100
      metadata.discountPercentage = Number(discountPercentage.toFixed(2)).toString()
    }

    if (customText) {
      metadata.customText = customText
    }

    if (designImageId) {
      metadata.designImageId = designImageId
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/product/${productId}`,
      billing_address_collection: "required",
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: metadata,
    })

    return NextResponse.json({ id: session.id })
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "An error occurred while processing your request",
        code: error.code,
      },
      { status: error.statusCode || 500 },
    )
  }
}
