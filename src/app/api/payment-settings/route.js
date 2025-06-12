import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const settings = await db.collection("paymentSettings").findOne({})

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        stripe: {
          enabled: true,
          displayName: "Credit/Debit Card",
          description: "Pay securely with your credit or debit card",
        },
        // paypal: {
        //   enabled: true,
        //   displayName: "PayPal",
        //   description: "Pay with your PayPal account",
        //   clientId: process.env.PAYPAL_CLIENT_ID || "",
        //   clientSecret: process.env.PAYPAL_CLIENT_SECRET || "",
        // },
        cashOnDelivery: {
          enabled: true,
          displayName: "Cash on Delivery",
          description: "Pay when you receive your order",
          methods: [
            {
              id: "cash",
              name: "Cash",
              enabled: true,
              details: "Pay with cash upon delivery",
            },
            {
              id: "zelle",
              name: "Zelle",
              enabled: true,
              details: "Camargo_co@outlook.com",
            },
            {
              id: "venmo",
              name: "Venmo",
              enabled: false,
              details: "@camargo-clothing",
            },
          ],
        },
      }

      return NextResponse.json({ settings: defaultSettings })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error("Error fetching payment settings:", error)
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const settings = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Remove _id from settings if it exists to prevent immutable field error
    const { _id, ...settingsWithoutId } = settings

    // Use updateOne with $set instead of replaceOne to avoid _id conflicts
    await db.collection("paymentSettings").updateOne({}, { $set: settingsWithoutId }, { upsert: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving payment settings:", error)
    return NextResponse.json({ error: "Failed to save payment settings" }, { status: 500 })
  }
}
