import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

// Initialize PayPal client
import paypal from "@paypal/checkout-server-sdk"

// Creating an environment
function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID || 'ATnIsZ3BHOlr5UNLhFkLBUr0FSEXfroBkznO3bOoR7tXV6LATNwTXFdX6PsjE2x3CMp1HUKn_a9isbp0'
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || 'EAy_IIXT7Bdxo6YXRtNIGEL4GYfUesnYZwrc8T1A3MSiaH1aq0Q6lWLMArY1bcZukBSOrLtIoIpnsp2y'

  return new paypal.core.SandboxEnvironment(clientId, clientSecret)
}

// Creating a client
function client() {
  return new paypal.core.PayPalHttpClient(environment())
}

export async function POST(request) {
  try {
    // Parse the request body
    const requestData = await request.json()

    if (!requestData) {
      return NextResponse.json({ error: "Missing request body" }, { status: 400 })
    }

    const {
      orderID,
      paypalOrderDetails,
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
    if (!orderID || !productId || !email) {
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

    // Get the PayPal order details from PayPal API to verify
    const paypalClient = client()
    const requestOrder = new paypal.orders.OrdersGetRequest(orderID)
    const response = await paypalClient.execute(requestOrder)

    // Verify the order is completed or at least approved
    if (response.result.status !== "COMPLETED" && response.result.status !== "APPROVED") {
      return NextResponse.json(
        { error: `PayPal order not completed. Status: ${response.result.status}` },
        { status: 400 },
      )
    }

    // Calculate the total amount
    const totalAmount = Number.parseFloat(response.result.purchase_units[0].amount.value)

    // Create an order record
    const orderRecord = {
      paymentMethod: "paypal",
      paypalOrderId: orderID,
      paypalDetails: paypalOrderDetails,
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
      amount_total: totalAmount * 100, // Store in cents like Stripe does
      created: new Date(),
      status: "completed",
    }

    // Save the order to the database
    const result = await db.collection("orders").insertOne(orderRecord)

    // Remove from pending orders if it exists
    await db.collection("pendingOrders").deleteOne({ paypalOrderId: orderID })

    return NextResponse.json({
      id: result.insertedId.toString(),
      status: "success",
    })
  } catch (error) {
    console.error("Error completing PayPal order:", error)
    return NextResponse.json(
      {
        error: error.message || "An error occurred while completing the PayPal order",
      },
      { status: 500 },
    )
  }
}

