import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "../../../../lib/mongodb"

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get all orders
    const orders = await db.collection("orders").find({}).toArray()

    // Get existing notifications
    const existingNotifications = await db.collection("notifications").find({}).toArray()
    const existingOrderIds = new Set(existingNotifications.map((n) => n.orderId))

    // Create notifications for orders that don't have them
    const newNotifications = []

    for (const order of orders) {
      const orderId = order._id ? order._id.toString() : order.stripeSessionId

      if (!existingOrderIds.has(orderId)) {
        const notification = {
          orderId,
          message: `New order #${orderId.substring(0, 5)} - $${(order.amount_total / 100).toFixed(2)}`,
          customerName: order.customer?.name || "Unknown",
          amount: order.amount_total,
          orderDate: order.created || Date.now() / 1000,
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
    })
  } catch (error) {
    console.error("Error creating notifications for orders:", error)
    return NextResponse.json({ error: "Failed to create notifications" }, { status: 500 })
  }
}
