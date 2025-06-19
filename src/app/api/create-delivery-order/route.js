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

      // FIXED: Enhanced payment method lookup with better debugging
      const getPaymentMethodName = async (methodId) => {
        if (!methodId) {
          console.log("No method ID provided")
          return "Cash"
        }

        console.log(`Looking up payment method for ID: "${methodId}"`)

        try {
          // Fetch payment settings from database
          const paymentSettingsDoc = await db.collection("paymentSettings").findOne({})
          console.log("Payment settings document:", JSON.stringify(paymentSettingsDoc, null, 2))

          if (paymentSettingsDoc) {
            // Check different possible structures
            let methods = []

            // Try different possible paths in the document
            if (paymentSettingsDoc.settings?.cashOnDelivery?.methods) {
              methods = paymentSettingsDoc.settings.cashOnDelivery.methods
              console.log("Found methods in settings.cashOnDelivery.methods:", methods)
            } else if (paymentSettingsDoc.cashOnDelivery?.methods) {
              methods = paymentSettingsDoc.cashOnDelivery.methods
              console.log("Found methods in cashOnDelivery.methods:", methods)
            } else if (Array.isArray(paymentSettingsDoc.methods)) {
              methods = paymentSettingsDoc.methods
              console.log("Found methods in root methods:", methods)
            } else {
              console.log("No methods array found in payment settings")
            }

            if (methods && methods.length > 0) {
              console.log(`Searching for method ID "${methodId}" in ${methods.length} methods`)

              // Find the method by ID (try exact match first, then case-insensitive)
              let method = methods.find((m) => m.id === methodId)

              if (!method) {
                // Try case-insensitive match
                method = methods.find((m) => m.id?.toLowerCase() === methodId?.toLowerCase())
              }

              if (method) {
                console.log(`Found matching method:`, method)
                if (method.enabled !== false) {
                  // Consider enabled if not explicitly false
                  console.log(`Returning method name: "${method.name}"`)
                  return method.name
                } else {
                  console.log(`Method "${methodId}" is disabled`)
                }
              } else {
                console.log(`Method "${methodId}" not found in methods array`)
                console.log(
                  "Available method IDs:",
                  methods.map((m) => m.id),
                )
              }
            }
          } else {
            console.log("No payment settings document found in database")
          }

          console.log(`Payment method "${methodId}" not found in settings, using fallback`)

          // Enhanced fallback mapping
          const fallbackMap = {
            cash: "Cash",
            venmo: "Venmo",
            cashapp: "CashApp",
            zelle: "Zelle",
            paypal: "PayPal",
            // Add more common variations
            "cash-on-delivery": "Cash",
            cod: "Cash",
          }

          const fallbackResult = fallbackMap[methodId?.toLowerCase()] || methodId || "Cash"
          console.log(`Using fallback result: "${fallbackResult}"`)
          return fallbackResult
        } catch (error) {
          console.error("Error fetching payment method name:", error)
          return methodId || "Cash" // Return the original ID if available, otherwise "Cash"
        }
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

      // Get the actual payment method name from settings
      const readablePreferredMethod = await getPaymentMethodName(preferredMethod)
      console.log(`Final payment method result: "${readablePreferredMethod}"`)

      // Create an order record
      const orderRecord = {
        paymentMethod: "delivery",
        preferredMethod: readablePreferredMethod,
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
