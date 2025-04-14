// api/create-delivery-order/route.js
import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {
    console.log("Received delivery order request")

    // Parse the request body
    const requestData = await request.json()

    if (!requestData) {
      console.log("Missing request body")
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }

    console.log("Request data:", JSON.stringify(requestData))

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
      designImageId, // New parameter for the image ID
    } = requestData

    // Validate required fields
    if (!productId || !email || !name || !phone || !address) {
      console.log("Missing required fields:", { productId, email, name, phone, address })
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    try {
      const client = await clientPromise
      const db = client.db("ecommerce")

      // Validate ObjectId format
      if (!ObjectId.isValid(productId)) {
        console.log("Invalid product ID:", productId)
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
      }

      // Determine which collection to query based on isCustomProduct flag
      const collection = isCustomProduct ? "customProducts" : "products"
      console.log(`Looking for product in ${collection} collection with ID: ${productId}`)

      const product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

      if (!product) {
        // If not found in the specified collection, try the other collection
        const alternativeCollection = isCustomProduct ? "products" : "customProducts"
        console.log(`Product not found in ${collection}, trying ${alternativeCollection}`)

        const alternativeProduct = await db.collection(alternativeCollection).findOne({ _id: new ObjectId(productId) })

        if (!alternativeProduct) {
          console.log("Product not found in either collection:", productId)
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        console.log(`Product found in ${alternativeCollection} instead of ${collection}`)
        const product = alternativeProduct
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
          isCustomProduct: isCustomProduct || false,
          customText: customText || "",
          customImage: product.customImage || null,
          designImageId: designImageId || product.finalDesignImageId || null, // Store the image ID reference
        },
        selectedColor: color,
        selectedSize: size,
        quantity,
        amount_total: totalPrice * 100, // Store in cents like Stripe does
        created: new Date(),
        status: "pending",
      }

      console.log("Creating order record:", JSON.stringify(orderRecord))

      // Save the order to the database
      const result = await db.collection("orders").insertOne(orderRecord)
      console.log("Order created with ID:", result.insertedId.toString())

      return NextResponse.json({
        id: result.insertedId.toString(),
        status: "success",
      })
    } catch (dbError) {
      console.error("Database error:", dbError)
      return NextResponse.json(
        {
          error: "Database error: " + dbError.message,
        },
        { status: 500 },
      )
    }
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

