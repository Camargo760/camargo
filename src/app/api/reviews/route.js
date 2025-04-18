import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../auth/[...nextauth]/route"
import clientPromise from "../../../lib/mongodb"
import { ObjectId } from "mongodb"

// Helper function to convert image to base64
async function imageToBase64(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Get all reviews with user information
    const reviews = await db
      .collection("reviews")
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: {
            path: "$userDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            rating: 1,
            text: 1,
            images: 1,
            createdAt: 1,
            updatedAt: 1,
            user: {
              _id: "$userDetails._id",
              name: "$userDetails.name",
              email: "$userDetails.email",
              image: "$userDetails.image",
            },
          },
        },
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray()

    return NextResponse.json(reviews)
  } catch (error) {
    console.error("Error fetching reviews:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 })
    }

    // Parse the multipart form data
    const formData = await request.formData()
    const rating = Number.parseInt(formData.get("rating"))
    const text = formData.get("text")
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

    // Check if user already has a review
    const existingReview = await db.collection("reviews").findOne({
      userId: ObjectId.isValid(user._id) ? user._id : new ObjectId(user._id),
    })

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already submitted a review. Please edit your existing review instead." },
        { status: 400 },
      )
    }

    // Process images and convert to base64
    const savedImages = []
    if (imageFiles && imageFiles.length > 0) {
      // Limit number of images (optional)
      const filesToProcess = imageFiles.slice(0, 3) // Limit to 3 images

      // Convert each image to base64
      for (const file of filesToProcess) {
        try {
          const base64Image = await imageToBase64(file)
          savedImages.push(base64Image)
        } catch (error) {
          console.error("Error converting image to base64:", error)
        }
      }
    }

    // Create the review
    const review = {
      userId: user._id,
      rating,
      text,
      images: savedImages,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection("reviews").insertOne(review)

    return NextResponse.json({
      _id: result.insertedId,
      ...review,
      user: {
        name: user.name,
        email: user.email,
        image: user.image,
      },
    })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
