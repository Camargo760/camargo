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
      email,
      phone,
      address,
      price,
      color,
      size,
      isCustomProduct,
      customText,
      quantity = 1,
      designImageId,
      category,
      coupon, 
    } = requestData

    if (!productId || !email) {
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

    const originalPrice = product.price
    let finalPrice = originalPrice
    let discountPercentage = 0
    let couponCode = null

    if (coupon && coupon.trim()) {
      const couponDoc = await db.collection("coupons").findOne({
        code: coupon.toUpperCase(),
        isActive: true,
      })

      if (couponDoc) {
        discountPercentage = couponDoc.discountPercentage
        couponCode = couponDoc.code
        finalPrice = originalPrice * (1 - discountPercentage / 100)
      }
    }

    const totalPrice = finalPrice * quantity

    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: `${product.name} ${color ? `(${color}` : ""}${size ? ` - ${size})` : color ? ")" : ""}${couponCode ? ` - ${discountPercentage}% OFF` : ""}`,
            metadata: {
              productId,
              price,
              color,
              size,
              isCustomProduct: isCustomProduct ? "true" : "false",
              customText: customText || "",
              category: category || product.category || "N/A",
              originalPrice: originalPrice.toString(),
              finalPrice: finalPrice.toString(),
              coupon: coupon || "",
              discountPercentage: discountPercentage.toString(),
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
      price: price || product.price || "N/A",
      color: color || "",
      size: size || "",
      isCustomProduct: isCustomProduct ? "true" : "false",
      quantity: quantity.toString(),
      category: category || product.category || "N/A",
      originalPrice: originalPrice.toString(),
      finalPrice: finalPrice.toString(),
      coupon: coupon || "",
      discountPercentage: discountPercentage.toString(),
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
      customer_email: email,
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
