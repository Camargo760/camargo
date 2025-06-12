import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb"

export async function POST(request) {
  try {
    const { code } = await request.json()

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const coupon = await db.collection("coupons").findOne({
      code: code.toUpperCase(),
      isActive: true,
    })

    if (!coupon) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 })
    }

    return NextResponse.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      description: coupon.description,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to validate coupon" }, { status: 500 })
  }
}
