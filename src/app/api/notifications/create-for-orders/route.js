
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import Stripe from "stripe"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

function getTimestamp(dateValue) {
  if (!dateValue) {
    return Date.now() / 1000;
  }
  
  if (typeof dateValue === 'number') {
    return dateValue > 1000000000000 ? dateValue / 1000 : dateValue; // Convert from milliseconds if needed
  }
  
  if (dateValue instanceof Date) {
    return dateValue.getTime() / 1000;
  }
  
  if (typeof dateValue === 'string') {
    const parsedDate = new Date(dateValue);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.getTime() / 1000;
    }
  }
  
  return Date.now() / 1000;
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const deliveryOrders = await db.collection("orders").find({ paymentMethod: "delivery" }).toArray()

    const stripeOrders = await stripe.checkout.sessions.list({
      limit: 100,
      expand: ["data.line_items", "data.customer"],
    })

    const allOrders = []

    for (const order of deliveryOrders) {
      allOrders.push({
        id: order._id.toString(),
        paymentMethod: "delivery",
        customer: {
          name: order.customer.name || "N/A",
          email: order.customer.email || "N/A",
        },
        amount_total: order.amount_total || 0,
        created: getTimestamp(order.created),
      })
    }

    for (const order of stripeOrders.data) {
      allOrders.push({
        id: order.id,
        paymentMethod: "stripe",
        customer: {
          name: order.metadata?.userId || "N/A",
          email: order.customer_details?.email || "N/A",
        },
        amount_total: order.amount_total || 0,
        created: getTimestamp(order.created),
      })
    }

    const existingNotifications = await db.collection("notifications").find({}).toArray()
    const existingOrderIds = new Set(existingNotifications.map((n) => n.orderId))

    const newNotifications = []

    for (const order of allOrders) {
      const orderId = order.id

      if (!existingOrderIds.has(orderId)) {
        const notification = {
          orderId,
          message: `New ${order.paymentMethod} order #${orderId.substring(0, 5)} - $${(order.amount_total / 100).toFixed(2)}`,
          customerName: order.customer?.name || "Unknown",
          amount: order.amount_total,
          orderDate: order.created,
          isRead: false,
          isDeleted: false,
          createdAt: new Date(),
        }
        newNotifications.push(notification)
      }
    }

    if (newNotifications.length > 0) {
      await db.collection("notifications").insertMany(newNotifications)
    }

    return NextResponse.json({
      success: true,
      created: newNotifications.length,
      message: `Created ${newNotifications.length} notifications`,
      breakdown: {
        deliveryOrders: deliveryOrders.length,
        stripeOrders: stripeOrders.data.length,
        totalOrders: allOrders.length,
      }
    })
  } catch (error) {
    console.error("Error creating notifications for orders:", error)
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 })
  }
}
