import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "../../../../lib/mongodb"

// Password validation
const validatePassword = (password) => {
  const errors = []
  if (password.length < 6) errors.push("Password must be at least 6 characters long")
  if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
  if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
  if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number")
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
    errors.push("Password must contain at least one special character")

  return errors
}

export async function POST(request) {
  try {
    const { name, email, newPassword } = await request.json()

    if (!name || !email || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    // Ensure this endpoint is only used for admin
    if (email.toLowerCase() !== "camargo_co@outlook.com") {
      return NextResponse.json({ error: "This endpoint is only for admin password changes" }, { status: 403 })
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      return NextResponse.json({ error: passwordErrors.join(". ") }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Find the admin user
    const admin = await db.collection("users").findOne({
      email: email.toLowerCase(),
    })

    if (!admin) {
      return NextResponse.json({ error: "Admin user not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the admin's password
    const result = await db.collection("users").updateOne({ _id: admin._id }, { $set: { password: hashedPassword } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Admin password changed successfully",
    })
  } catch (error) {
    console.error("Error changing admin password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
