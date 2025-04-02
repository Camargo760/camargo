// api/create-paypal-order/route.js
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
function createClient() {
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
            price,
            productName,
        } = requestData

        // Validate required fields
        if (!productId || !email || !price) {
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

        // Create a PayPal order
        const requestPaypal = new paypal.orders.OrdersCreateRequest()
        requestPaypal.prefer("return=representation")
        requestPaypal.requestBody({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: totalPrice.toFixed(2),
                        breakdown: {
                            item_total: {
                                currency_code: "USD",
                                value: totalPrice.toFixed(2),
                            },
                        },
                    },
                    items: [
                        {
                            name: `${product.name} ${color ? `(${color}` : ""}${size ? ` - ${size})` : color ? ")" : ""}`,
                            unit_amount: {
                                currency_code: "USD",
                                value: product.price.toFixed(2),
                            },
                            quantity: quantity.toString(),
                        },
                    ],
                    description: `Order for ${name} - ${email}`,
                    custom_id: productId,
                    soft_descriptor: "ECOMMERCE",
                },
            ],
            application_context: {
                brand_name: "Your E-commerce Store",
                shipping_preference: "NO_SHIPPING",
                user_action: "PAY_NOW",
            },
        })

        // Call PayPal to create the order - FIX: Use createClient() instead of client()
        const paypalClient = createClient()
        const response = await paypalClient.execute(requestPaypal)

        // Store the pending order in the database
        await db.collection("pendingOrders").insertOne({
            paypalOrderId: response.result.id,
            productId,
            name,
            email,
            phone,
            address,
            color,
            size,
            isCustomProduct,
            customText,
            quantity,
            price: totalPrice,
            status: "CREATED",
            createdAt: new Date(),
        })

        return NextResponse.json({
            id: response.result.id,
            status: response.result.status,
        })
    } catch (error) {
        console.error("Error creating PayPal order:", error)
        return NextResponse.json(
            {
                error: error.message || "An error occurred while creating the PayPal order",
            },
            { status: 500 },
        )
    }
}