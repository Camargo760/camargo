import { NextResponse } from "next/server"
import Stripe from "stripe"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("session_id")
    const orderId = searchParams.get("order_id")
    const paymentMethod = searchParams.get("payment_method")

    const client = await clientPromise
    const db = client.db("ecommerce")

    if (orderId && paymentMethod === "delivery") {
      try {

        if (!ObjectId.isValid(orderId)) {
          return NextResponse.json({ error: "Invalid order ID format" }, { status: 400 })
        }

        const order = await db.collection("orders").findOne({ _id: new ObjectId(orderId) })

        if (!order) {
          return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        let finalDesignImage = null
        if (order.product.designImageId && ObjectId.isValid(order.product.designImageId)) {
          const imageDoc = await db.collection("customProductImages").findOne({
            _id: new ObjectId(order.product.designImageId),
          })
          if (imageDoc && imageDoc.imageData) {
            finalDesignImage = imageDoc.imageData
          }
        }

        return NextResponse.json({
          id: order._id.toString(),
          paymentMethod: "delivery",
          preferredMethod: order.preferredMethod,
          additionalNotes: order.additionalNotes,
          customer_details: {
            name: order.customer.name,
            email: order.customer.email,
            phone: order.customer.phone,
            address: order.customer.address,
          },
          amount_total: order.amount_total,
          quantity: order.quantity,
          isCustomProduct: order.product.isCustomProduct,
          product: {
            name: order.product.name,
            description: order.product.description || "Product description",
            category: order.product.category || "N/A",
            selectedColor: order.selectedColor,
            selectedSize: order.selectedSize,
            customText: order.product.customText || "",
            customImage: order.product.customImage || null,
            finalDesignImage: finalDesignImage, 
            price: order.product.price,
          },
          status: order.status || "pending",
          originalPrice: order.originalPrice || order.product.price,
          finalPrice: order.finalPrice || order.product.price,
          discountPercentage: order.discountPercentage || 0,
          couponCode: order.couponCode || null,
        })
      } catch (error) {
        return NextResponse.json(
          {
            error: "Failed to fetch delivery order details",
            details: error.message,
          },
          { status: 500 },
        )
      }
    }

    if (!sessionId) {
      return NextResponse.json({ error: "No session ID provided" }, { status: 400 })
    }


    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    })

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }
    
    if (!session.metadata?.productId) {
      return NextResponse.json({
        id: session.id,
        paymentMethod: "stripe",
        customer_details: session.customer_details,
        line_items: session.line_items?.data || [],
        amount_total: session.amount_total,
        product: {
          name: "Product information unavailable",
          description: "Product details could not be retrieved",
          category: "Unknown",
          selectedColor: session.metadata?.color || "N/A",
          selectedSize: session.metadata?.size || "N/A",
          price: session.amount_total / 100 || 0,
        },
      })
    }

    if (!ObjectId.isValid(session.metadata.productId)) {
      return NextResponse.json({ error: "Invalid product ID format" }, { status: 400 })
    }

    const isCustomProduct = session.metadata.isCustomProduct === "true"
    const collection = isCustomProduct ? "customProducts" : "products"

    const product = await db.collection(collection).findOne({
      _id: new ObjectId(session.metadata.productId),
    })

    let finalDesignImage = null
    const designImageId = session.metadata.designImageId || (product ? product.finalDesignImageId : null)

    if (designImageId && ObjectId.isValid(designImageId)) {
      const imageDoc = await db.collection("customProductImages").findOne({
        _id: new ObjectId(designImageId),
      })
      if (imageDoc && imageDoc.imageData) {
        finalDesignImage = imageDoc.imageData
      }
    }

    const quantity = Number.parseInt(session.metadata.quantity || "1", 10)

    const order = await db.collection("orders").findOne({ stripeSessionId: session.id })
    const orderStatus = order ? order.status : "pending"

    const orderDetails = {
      id: session.id,
      paymentMethod: "stripe",
      customer_details: session.customer_details,
      line_items: session.line_items?.data || [],
      amount_total: session.amount_total,
      quantity: quantity,
      isCustomProduct: isCustomProduct,
      status: orderStatus,
      couponCode: session.metadata?.coupon || null,
      originalPrice: session.metadata?.originalPrice ? parseFloat(session.metadata.originalPrice) : null,
      finalPrice: session.metadata?.finalPrice ? parseFloat(session.metadata.finalPrice) : null,
      discountPercentage: session.metadata?.discountPercentage ? parseFloat(session.metadata.discountPercentage) : 0,
      product: product
        ? {
          name: product.name,
          description: product.description,
          category: product.category || "Custom",
          selectedColor: session.metadata.color || "N/A",
          selectedSize: session.metadata.size || "N/A",
          customText: session.metadata.customText || "",
          customImage: product.customImage || null,
          finalDesignImage: finalDesignImage, 
          price: product.price || 0,
        }
        : {
          name: "Product not found",
          description: "Product details could not be retrieved",
          category: "Unknown",
          selectedColor: session.metadata.color || "N/A",
          selectedSize: session.metadata.size || "N/A",
          customText: session.metadata.customText || "",
          price: session.amount_total / 100 || 0,
        },
    }

    return NextResponse.json(orderDetails)
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to fetch order details",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
