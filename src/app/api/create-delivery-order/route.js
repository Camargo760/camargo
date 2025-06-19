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
      designImageId,
      category,
      couponCode,
      // Handle both old and new format
      customerDetails,
      selectedColor,
      selectedSize,
      finalDesignImage,
    } = requestData

    // FIXED: Handle customer details from multiple sources
    const customerInfo = {
      name: name || customerDetails?.name || "",
      email: email || customerDetails?.email || "",
      phone: phone || customerDetails?.phone || "",
      address: address || customerDetails?.address || "",
    }

    // Validate required fields
    if (!productId || !customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      console.log("Missing required fields:", {
        productId: !!productId,
        email: !!customerInfo.email,
        name: !!customerInfo.name,
        phone: !!customerInfo.phone,
        address: !!customerInfo.address,
      })
      return NextResponse.json({ error: "Missing required customer information" }, { status: 400 })
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

      let product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

      if (!product) {
        // If not found in the specified collection, try the other collection
        const alternativeCollection = isCustomProduct ? "products" : "customProducts"
        console.log(`Product not found in ${collection}, trying ${alternativeCollection}`)

        product = await db.collection(alternativeCollection).findOne({ _id: new ObjectId(productId) })

        if (!product) {
          console.log("Product not found in either collection:", productId)
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }

        console.log(`Product found in ${alternativeCollection} instead of ${collection}`)
      }

      // FIXED: Convert payment method ID to readable name
      const getPaymentMethodName = (methodId) => {
        if (!methodId) return "Cash"

        // If it's already a readable name, return as is
        if (["cash", "venmo", "cashapp", "zelle", "paypal"].includes(methodId.toLowerCase())) {
          return methodId.charAt(0).toUpperCase() + methodId.slice(1).toLowerCase()
        }

        // If it's a method ID (contains "method_"), extract the actual method
        if (methodId.includes("method_")) {
          const methodMap = {
            cash: "Cash",
            venmo: "Venmo",
            cashapp: "CashApp",
            zelle: "Zelle",
            paypal: "PayPal",
          }

          // Check if the ID contains any known method names
          for (const [key, value] of Object.entries(methodMap)) {
            if (methodId.toLowerCase().includes(key)) {
              return value
            }
          }

          // Fallback: return "Cash" for unknown method IDs
          return "Cash"
        }

        // Default fallback
        return methodId.charAt(0).toUpperCase() + methodId.slice(1).toLowerCase()
      }

      // Validate and apply coupon if provided
      let finalPrice = product.price
      let discountPercentage = 0
      const originalPrice = product.price

      if (couponCode) {
        try {
          const coupon = await db.collection("coupons").findOne({
            code: couponCode.trim().toUpperCase(),
            isActive: true,
          })

          if (coupon) {
            discountPercentage = coupon.discountPercentage
            finalPrice = product.price * (1 - discountPercentage / 100)
            console.log("Coupon applied:", { couponCode, discountPercentage, originalPrice, finalPrice })
          } else {
            console.log("Invalid or inactive coupon:", couponCode)
          }
        } catch (couponError) {
          console.error("Error validating coupon:", couponError)
          // Continue without discount if coupon validation fails
        }
      }

      // Calculate the total price based on quantity and final price
      const totalPrice = finalPrice * quantity

      // Create an order record
      const orderRecord = {
        paymentMethod: "delivery",
        preferredMethod: getPaymentMethodName(preferredMethod) || "Cash",
        additionalNotes: additionalNotes || "",
        customer: {
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
        },
        product: {
          id: productId,
          name: product.name,
          price: product.price,
          category: category || product.category || "N/A",
          isCustomProduct: isCustomProduct || false,
          customText: customText || "",
          customImage: product.customImage || null,
          designImageId: designImageId || product.finalDesignImageId || null,
          selectedColor: selectedColor || color || null,
          selectedSize: selectedSize || size || null,
        },
        selectedColor: selectedColor || color || null,
        selectedSize: selectedSize || size || null,
        quantity,
        amount_total: totalPrice * 100, // Store in cents like Stripe does
        created: Math.floor(Date.now() / 1000), // Unix timestamp for compatibility
        createdAt: new Date(),
        timestamp: Date.now(),
        status: "pending",
        // Add coupon information
        couponCode: couponCode || null,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        discountPercentage: discountPercentage,
      }

      console.log("Creating order record:", JSON.stringify(orderRecord))

      // Save the order to the database
      const result = await db.collection("orders").insertOne(orderRecord)
      console.log("Order created with ID:", result.insertedId.toString())

      return NextResponse.json({
        id: result.insertedId.toString(),
        status: "success",
        orderData: {
          ...orderRecord,
          id: result.insertedId.toString(),
        },
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
