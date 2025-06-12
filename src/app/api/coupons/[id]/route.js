import { NextResponse } from "next/server"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("coupons").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const { isActive } = await request.json()

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid coupon ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("coupons").updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isActive: isActive,
          updatedAt: new Date(),
        },
      },
    )

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Coupon updated successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 })
  }
}
