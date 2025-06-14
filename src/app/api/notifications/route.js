import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const notifications = await db.collection("notifications").find({}).sort({ createdAt: -1 }).toArray()

    return NextResponse.json(notifications)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}

export async function POST(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const { orderId, message, customerName, amount, orderDate } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    const existingNotification = await db.collection("notifications").findOne({ orderId })

    if (existingNotification) {
      return NextResponse.json({ message: "Notification already exists" }, { status: 200 })
    }

    const notification = {
      orderId,
      message,
      customerName,
      amount,
      orderDate,
      isRead: false,
      isDeleted: false,
      createdAt: new Date(),
    }

    const result = await db.collection("notifications").insertOne(notification)

    return NextResponse.json({ success: true, id: result.insertedId })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create notification" }, { status: 500 })
  }
}

export async function PATCH(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const { action, notificationId, notificationIds } = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    if (action === "markAsRead" && notificationId) {
      await db
        .collection("notifications")
        .updateOne({ _id: new ObjectId(notificationId) }, { $set: { isRead: true, updatedAt: new Date() } })
    } else if (action === "delete" && notificationId) {
      await db
        .collection("notifications")
        .updateOne(
          { _id: new ObjectId(notificationId) },
          { $set: { isRead: true, isDeleted: true, updatedAt: new Date() } },
        )
    } else if (action === "markAllAsRead") {
      await db
        .collection("notifications")
        .updateMany({ isDeleted: false }, { $set: { isRead: true, updatedAt: new Date() } })
    } else if (action === "deleteAll") {
      await db
        .collection("notifications")
        .updateMany({ isDeleted: false }, { $set: { isRead: true, isDeleted: true, updatedAt: new Date() } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update notifications" }, { status: 500 })
  }
}
