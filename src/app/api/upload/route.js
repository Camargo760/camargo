import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString("base64")
    const fileType = file.type
    const dataUrl = `data:${fileType};base64,${base64}`

    const client = await clientPromise
    const db = client.db("ecommerce")

    const result = await db.collection("uploads").insertOne({
      data: dataUrl,
      type: fileType,
      name: file.name,
      uploadedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      url: dataUrl,
      id: result.insertedId.toString(),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to upload file" }, { status: 500 })
  }
}
