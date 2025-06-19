import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

export async function POST(request) {
  try {

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
      preferredMethod,
      additionalNotes,
      price,
      designImageId,
      category,
      couponCode,
      customerDetails,
      selectedColor,
      selectedSize,
      finalDesignImage,
    } = requestData

    const customerInfo = {
      name: name || customerDetails?.name || "",
      email: email || customerDetails?.email || "",
      phone: phone || customerDetails?.phone || "",
      address: address || customerDetails?.address || "",
    }

    if (!productId || !customerInfo.email || !customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      return NextResponse.json({ error: "Missing required customer information" }, { status: 400 })
    }

    try {
      const client = await clientPromise
      const db = client.db("ecommerce")

      if (!ObjectId.isValid(productId)) {
        return NextResponse.json({ error: "Invalid product ID" }, { status: 400 })
      }

      const getPaymentMethodName = async (methodId) => {
        if (!methodId) {
          return "Cash"
        }


        try {
          const paymentSettingsDoc = await db.collection("paymentSettings").findOne({})

          if (paymentSettingsDoc) {
            let methods = []

            if (paymentSettingsDoc.settings?.cashOnDelivery?.methods) {
              methods = paymentSettingsDoc.settings.cashOnDelivery.methods
            } else if (paymentSettingsDoc.cashOnDelivery?.methods) {
              methods = paymentSettingsDoc.cashOnDelivery.methods
            } else if (Array.isArray(paymentSettingsDoc.methods)) {
              methods = paymentSettingsDoc.methods
            } else {
            }

            if (methods && methods.length > 0) {

              let method = methods.find((m) => m.id === methodId)

              if (!method) {
                method = methods.find((m) => m.id?.toLowerCase() === methodId?.toLowerCase())
              }

              if (method) {
                console.log(`Found matching method:`, method)
                if (method.enabled !== false) {
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

          const fallbackMap = {
            cash: "Cash",
            venmo: "Venmo",
            cashapp: "CashApp",
            zelle: "Zelle",
            paypal: "PayPal",
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

      const collection = isCustomProduct ? "customProducts" : "products"
      console.log(`Looking for product in ${collection} collection with ID: ${productId}`)

      let product = await db.collection(collection).findOne({ _id: new ObjectId(productId) })

      if (!product) {
        const alternativeCollection = isCustomProduct ? "products" : "customProducts"
        console.log(`Product not found in ${collection}, trying ${alternativeCollection}`)

        product = await db.collection(alternativeCollection).findOne({ _id: new ObjectId(productId) })

        if (!product) {
          console.log("Product not found in either collection:", productId)
          return NextResponse.json({ error: "Product not found" }, { status: 404 })
        }
      }

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
          } else {
          }
        } catch (couponError) {
        }
      }

      const totalPrice = finalPrice * quantity

      const readablePreferredMethod = await getPaymentMethodName(preferredMethod)

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
        amount_total: totalPrice * 100, 
        created: Math.floor(Date.now() / 1000), 
        createdAt: new Date(),
        timestamp: Date.now(),
        status: "pending",
        couponCode: couponCode || null,
        originalPrice: originalPrice,
        finalPrice: finalPrice,
        discountPercentage: discountPercentage,
      }

      const result = await db.collection("orders").insertOne(orderRecord)

      return NextResponse.json({
        id: result.insertedId.toString(),
        status: "success",
        orderData: {
          ...orderRecord,
          id: result.insertedId.toString(),
        },
      })
    } catch (dbError) {
      return NextResponse.json(
        {
          error: "Database error: " + dbError.message,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    return NextResponse.json(
      {
        error: error.message || "An error occurred while creating the delivery order",
      },
      { status: 500 },
    )
  }
}
