
// api/orders/route.js
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import Stripe from "stripe"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

// Helper function to safely convert date to timestamp
function getTimestamp(dateValue) {
  if (!dateValue) {
    return Date.now() / 1000;
  }
  
  // If it's already a timestamp (number)
  if (typeof dateValue === 'number') {
    return dateValue > 1000000000000 ? dateValue / 1000 : dateValue; // Convert from milliseconds if needed
  }
  
  // If it's a Date object
  if (dateValue instanceof Date) {
    return dateValue.getTime() / 1000;
  }
  
  // If it's a string, try to parse it
  if (typeof dateValue === 'string') {
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.getTime() / 1000;
    }
  }
  
  // Fallback to current time
  return Date.now() / 1000;
}

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get orders from MongoDB (delivery orders)
    const deliveryOrders = await db.collection("orders").find({ paymentMethod: "delivery" }).toArray()

    // Format delivery orders to match the structure of Stripe orders
    const formattedDeliveryOrders = await Promise.all(
      deliveryOrders.map(async (order) => {
        // Check if there's a design image ID and fetch the image data
        let finalDesignImage = null
        if (order.product.designImageId && ObjectId.isValid(order.product.designImageId)) {
          const imageDoc = await db.collection("customProductImages").findOne({
            _id: new ObjectId(order.product.designImageId),
          })
          if (imageDoc && imageDoc.imageData) {
            finalDesignImage = imageDoc.imageData
          }
        }

        return {
          id: order._id.toString(),
          paymentMethod: "delivery",
          preferredMethod: order.preferredMethod || "cash",
          additionalNotes: order.additionalNotes || "",
          customer: {
            name: order.customer.name || "N/A",
            email: order.customer.email || "N/A",
            phone: order.customer.phone || "N/A",
            address: order.customer.address || "N/A",
          },
          product: {
            name: order.product.name || "N/A",
            category: order.product.category || "N/A",
            price: order.product.price || "N/A",
            isCustomProduct: order.product.isCustomProduct || false,
            customText: order.product.customText || "N/A",
            // customImage: order.product.customImage || null,
            finalDesignImage: finalDesignImage, // Include the actual image data
          },
          selectedColor: order.selectedColor || "N/A",
          selectedSize: order.selectedSize || "N/A",
          quantity: order.quantity || 1,
          coupon: order.couponCode || "N/A",
          originalPrice: order.originalPrice || order.product.price,
          finalPrice: order.finalPrice || order.product.price,
          discountPercentage: order.discountPercentage || 0,
          amount_total: order.amount_total || 0,
          created: getTimestamp(order.created),
        }
      }),
    )

    // Get orders from Stripe
    const stripeOrders = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.line_items", "data.customer"],
    })

    const formattedStripeOrders = []

    for (const order of stripeOrders.data) {
      try {
        let product = null
        const isCustomProduct = order.metadata?.isCustomProduct === "true"

        if (order.metadata && order.metadata.productId && ObjectId.isValid(order.metadata.productId)) {
          // Determine which collection to query based on isCustomProduct flag
          const collection = isCustomProduct ? "customProducts" : "products"
          product = await db.collection(collection).findOne({ _id: new ObjectId(order.metadata.productId) })
        }

        // Check if there's a design image ID and fetch the image data
        let finalDesignImage = null
        const designImageId = order.metadata?.designImageId || (product ? product.finalDesignImageId : null)

        if (designImageId && ObjectId.isValid(designImageId)) {
          const imageDoc = await db.collection("customProductImages").findOne({
            _id: new ObjectId(designImageId),
          })
          if (imageDoc && imageDoc.imageData) {
            finalDesignImage = imageDoc.imageData
          }
        }

        formattedStripeOrders.push({
          id: order.id,
          paymentMethod: "stripe",
          coupon: order.metadata?.coupon || "N/A",
          discountPercentage: order.metadata?.discountPercentage || 0,
          originalPrice: order.metadata?.originalPrice ? parseFloat(order.metadata.originalPrice) : null,
          finalPrice: order.metadata?.finalPrice ? parseFloat(order.metadata.finalPrice) : null,
          customer: {
            name: order.customer_details?.name || "N/A",
            email: order.customer_details?.email || "N/A",
            address: order.customer_details?.address
              ? `${order.customer_details.address.line1 || ""}, ${order.customer_details.address.city || ""}, ${order.customer_details.address.state || ""}, ${order.customer_details.address.postal_code || ""}, ${order.customer_details.address.country || ""}`.trim()
              : "N/A",
            phone: order.metadata?.phone || "N/A",
          },
          product: {
            name: product ? product.name : "N/A",
            category: product ? product.category : "N/A",
            price: product ? product.price : "N/A",
            isCustomProduct: isCustomProduct,
            customText: order.metadata?.customText || "N/A",
            // customImage: product && isCustomProduct ? product.customImage : null,
            finalDesignImage: finalDesignImage, // Include the actual image data
          },
          selectedColor: order.metadata?.color || "N/A",
          selectedSize: order.metadata?.size || "N/A",
          quantity: Number.parseInt(order.metadata?.quantity || "1", 10),
          amount_total: order.amount_total || 0,
          created: getTimestamp(order.created),
        })
      } catch (itemError) {
        console.error("Error processing individual order:", itemError, order.id)
        // Continue processing other orders instead of failing completely
      }
    }

    // Combine and sort all orders by creation date (newest first)
    const allOrders = [...formattedStripeOrders, ...formattedDeliveryOrders].sort((a, b) => b.created - a.created)

    return NextResponse.json(allOrders)
  } catch (error) {
    console.error("Error fetching orders:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
