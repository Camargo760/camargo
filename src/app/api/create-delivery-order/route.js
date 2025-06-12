import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

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
      color,
      size,
      isCustomProduct,
      customText,
      quantity = 1,
      preferredMethod,
      additionalNotes,
      price,
      designImageId,
      category,
      originalPrice,
      finalPrice,
      couponCode,
      discountPercentage,
    } = requestData

    if (!productId || !email || !name || !phone || !address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const client = await clientPromise
      const db = client.db("ecommerce")

      if (!ObjectId.isValid(productId)) {
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
      }

      const collection = isCustomProduct ? "customProducts" : "products"

      const product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

      if (!product) {
        const alternativeCollection = isCustomProduct ? "products" : "customProducts"

        const alternativeProduct = await db.collection(alternativeCollection).findOne({ _id: new ObjectId(productId) })

        if (!alternativeProduct) {
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        const product = alternativeProduct
      }

      const totalPrice = product.price * quantity

      const orderRecord = {
        paymentMethod: "delivery",
        preferredMethod: preferredMethod || "cash",
        additionalNotes: additionalNotes || "",
        customer: {
          name,
          email,
          phone,
          address,
        },
        product: {
          id: productId,
          name: product.name,
          price: product.price,
          category: category || product.category || "N/A",
          isCustomProduct: isCustomProduct || false,
          customText: customText || "",
          customImage: product.customImage || null,
          designImageId: designImageId || product.finalDesignImageId || null,
        },
        selectedColor: color,
        selectedSize: size,
        quantity,
        originalPrice: originalPrice || product.price,
        finalPrice: finalPrice || product.price,
        couponCode: couponCode || null,
        discountPercentage: discountPercentage || 0,
        amount_total: (finalPrice || product.price) * quantity * 100,
        created: new Date(),
        status: "pending",
        isOrderReceived: true, 
      }

      const result = await db.collection("orders").insertOne(orderRecord)

      return NextResponse.json({
        id: result.insertedId.toString(),
        status: "success",
      })
    } catch (dbError) {
      return NextResponse.json(
        {
          error: "Database error: " + dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "An error occurred while creating the delivery order",
      },
      { status: 500 },
    )
  }
}
