import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import Stripe from "stripe"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  const session = await getServerSession(authOptions)
  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const deliveryOrders = await db.collection("orders").find({ paymentMethod: "delivery" }).toArray()

    const formattedDeliveryOrders = await Promise.all(
      deliveryOrders.map(async (order) => {
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
            finalDesignImage: finalDesignImage, 
          },
          selectedColor: order.selectedColor || "N/A",
          selectedSize: order.selectedSize || "N/A",
          quantity: order.quantity || 1,
          coupon: order.couponCode || "N/A",
          originalPrice: order.originalPrice || order.product.price,
          finalPrice: order.finalPrice || order.product.price,
          discountPercentage: order.discountPercentage || 0,
          amount_total: order.amount_total || 0,
          created: order.created ? order.created.getTime() / 1000 : Date.now() / 1000,
        }
      }),
    )

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
          const collection = isCustomProduct ? "customProducts" : "products"
          product = await db.collection(collection).findOne({ _id: new ObjectId(order.metadata.productId) })
        }

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
            name: order.metadata?.userId || "N/A",
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
            finalDesignImage: finalDesignImage, 
          },
          selectedColor: order.metadata?.color || "N/A",
          selectedSize: order.metadata?.size || "N/A",
          quantity: Number.parseInt(order.metadata?.quantity || "1", 10),
          amount_total: order.amount_total || 0,
          created: order.created || Date.now() / 1000,
        })
      } catch (itemError) {
      }
    }

    const allOrders = [...formattedStripeOrders, ...formattedDeliveryOrders].sort((a, b) => b.created - a.created)

    return NextResponse.json(allOrders)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

