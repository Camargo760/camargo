import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const coupons = await db.collection("coupons").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Error fetching coupons:", error)
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { code, discountPercentage, description, isActive } = await request.json()

    if (!code || !discountPercentage) {
      return NextResponse.json({ error: "Code and discount percentage are required" }, { status: 400 })
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      return NextResponse.json({ error: "Discount percentage must be between 1 and 100" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if coupon code already exists
    const existingCoupon = await db.collection("coupons").findOne({ code: code.toUpperCase() })
    if (existingCoupon) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 })
    }

    const coupon = {
      code: code.toUpperCase(),
      discountPercentage: Number.parseFloat(discountPercentage),
      description: description || "",
      isActive: isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("coupons").insertOne(coupon)

    return NextResponse.json({
      _id: result.insertedId,
      ...coupon,
    })
  } catch (error) {
    console.error("Error creating coupon:", error)
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 })
  }
}
