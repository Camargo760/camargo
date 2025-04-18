import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../auth/[...nextauth]/route"
import clientPromise from "../../../../lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to convert image to base64
async function imageToBase64(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function PUT(request, { params }) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    const { id } = params
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 })
    }

    // Parse FormData instead of JSON
    const formData = await request.formData()
    const rating = Number.parseInt(formData.get("rating"), 10)
    const text = formData.get("text")

    // Get existing images if any
    let existingImages = []
    try {
      const existingImagesJson = formData.get("existingImages")
      if (existingImagesJson) {
        existingImages = JSON.parse(existingImagesJson)
      }
    } catch (error) {
      console.error("Error parsing existing images:", error)
    }

    // Handle new image files
    const imageFiles = formData.getAll("images")

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    if (!text || text.trim() === "") {
      return NextResponse.json({ error: "Review text is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get user ID
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the review
    const review = await db.collection("reviews").findOne({ _id: new ObjectId(id) })
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Check if the user owns the review or is an admin
    if (!review.userId.equals(user._id) && session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "You can only edit your own reviews" }, { status: 403 })
    }

    // Process new images and convert to base64
    const newImages = []
    if (imageFiles && imageFiles.length > 0) {
      for (const file of imageFiles) {
        if (file instanceof File) {
          try {
            const base64Image = await imageToBase64(file)
            newImages.push(base64Image)
          } catch (error) {
            console.error("Error converting image to base64:", error)
          }
        }
      }
    }

    // Combine existing and new images
    const allImages = [...existingImages, ...newImages]

    // Prepare the update payload
    const updateData = {
      rating,
      text,
      images: allImages,
      updatedAt: new Date(),
    }

    // Update the review
    const result = await db.collection("reviews").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Review updated successfully",
    })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    // Check authentication
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

    // Get user ID
    const user = await db.collection("users").findOne({ email: session.user.email })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get the review
    const review = await db.collection("reviews").findOne({ _id: new ObjectId(id) })
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    // Check if the user owns the review or is an admin
    if (!review.userId.equals(user._id) && session.user.email !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "You can only delete your own reviews" }, { status: 403 })
    }

    // Delete the review
    const result = await db.collection("reviews").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 })
  }
}
