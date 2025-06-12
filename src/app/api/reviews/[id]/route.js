import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

async function imageToBase64(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
    }

    const formData = await request.formData()
    const rating = Number.parseInt(formData.get("rating"), 10)
    const text = formData.get("text")

    let existingImages = []
    try {
      const existingImagesJson = formData.get("existingImages")
      if (existingImagesJson) {
        existingImages = JSON.parse(existingImagesJson)
      }
    } catch (error) {
      
    }

    const imageFiles = formData.getAll("images")

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const review = await db.collection("reviews").findOne({ _id: new ObjectId(id) })
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    if (review.userId && !review.userId.equals(user._id) && session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "You can only edit your own reviews" }, { status: 403 })
    }

    const newImages = []
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file instanceof File) {
          try {
            const base64Image = await imageToBase64(file)
            newImages.push(base64Image)
          } catch (error) {
          }
        }
      }
    }

    const allImages = [...existingImages, ...newImages]

    const updateData = {
      rating,
      text,
      images: allImages,
      updatedAt: new Date(),
    }

    const result = await db.collection("reviews").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const review = await db.collection("reviews").findOne({ _id: new ObjectId(id) })
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    const user = await db.collection("users").findOne({ email: session.user.email })

    const isAdmin = session.user.email === "camargo_co@outlook.com"

    if (!isAdmin && review.userId) {
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }

      if (!review.userId.equals(user._id)) {
        return NextResponse.json({ error: "You can only delete your own reviews" }, { status: 403 })
      }
    }

    const result = await db.collection("reviews").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
