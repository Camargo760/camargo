import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

async function imageToBase64(file) {
  const buffer = Buffer.from(await file.arrayBuffer())
  return `data:${file.type};base64,${buffer.toString("base64")}`
}

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

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
            title: 1,
            content: 1,
            name: 1,
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
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get("content-type") || ""

    let data
    let imageUrls = []

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      const rating = Number.parseInt(formData.get("rating"), 10)
      const title = formData.get("title")
      const content = formData.get("content")
      const name = formData.get("name")
      const userId = formData.get("userId")

      const imageFiles = formData.getAll("images")

      if (imageFiles && imageFiles.length > 0) {
        for (const file of imageFiles) {
          if (file.size > 0) {
            const base64Image = await imageToBase64(file)
            imageUrls.push(base64Image)
          }
        }
      }

      data = { rating, title, content, name, userId }
    } else {
      data = await request.json()
      imageUrls = data.imageUrls || []
    }

    const { rating, title, content, name, userId } = data

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 })
    }

    if (!title || title.trim() === "") {
      return NextResponse.json({ error: "Review title is required" }, { status: 400 })
    }

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "Review content is required" }, { status: 400 })
    }

    if (!name || name.trim() === "") {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("ecommerce")

    const review = {
      rating,
      title,
      content,
      name,
      images: imageUrls,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    if (userId) {
      const user = await db.collection("users").findOne({ email: userId })
      if (user) {
        review.userId = user._id
      }
    }

    const result = await db.collection("reviews").insertOne(review)

    return NextResponse.json({
      _id: result.insertedId,
      ...review,
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 })
  }
}
