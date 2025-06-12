import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const settings = await db.collection("paymentSettings").findOne({})

    if (!settings) {
      const defaultSettings = {
        stripe: {
          enabled: true,
          displayName: "Credit/Debit Card",
          description: "Pay securely with your credit or debit card",
        },
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
    return NextResponse.json({ error: "Failed to fetch payment settings" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const settings = await request.json()

    const client = await clientPromise
    const db = client.db("ecommerce")

    const { _id, ...settingsWithoutId } = settings

    await db.collection("paymentSettings").updateOne({}, { $set: settingsWithoutId }, { upsert: true })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: "Failed to save payment settings" }, { status: 500 })
  }
}
