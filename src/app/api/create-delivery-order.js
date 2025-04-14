import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

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
      preferredMethod,
      additionalNotes,
      price,
    } = requestData

    // Validate required fields
    if (!productId || !email || !name || !phone || !address) {
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

    // Create an order record
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
        isCustomProduct,
        customText,
        customImage: product.customImage || null,
      },
      selectedColor: color,
      selectedSize: size,
      quantity,
      amount_total: totalPrice * 100, // Store in cents like Stripe does
      created: new Date(),
      status: "pending",
    }

    // Save the order to the database
    const result = await db.collection("orders").insertOne(orderRecord)

    return NextResponse.json({
      id: result.insertedId.toString(),
      status: "success",
    })
  } catch (error) {
    console.error("Error creating delivery order:", error)
    return NextResponse.json(
      {
        error: error.message || "An error occurred while creating the delivery order",
      },
      { status: 500 },
    )
  }
}

