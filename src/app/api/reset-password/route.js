import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import clientPromise from "../../../lib/mongodb"

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
      return NextResponse.json({ error: "Name, email, and new password are required" }, { status: 400 })
    }

    // Prevent resetting admin password through this endpoint
    if (email.toLowerCase() === "camargo_co@outlook.com") {
      return NextResponse.json({ error: "Cannot reset admin password through this endpoint" }, { status: 403 })
    }

    // Validate password strength
    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      return NextResponse.json({ error: passwordErrors.join(". ") }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if user exists with the provided name and email
    const user = await db.collection("users").findOne({
      name: name,
      email: email.toLowerCase(),
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10)

    // Update the user's password
    const result = await db.collection("users").updateOne({ _id: user._id }, { $set: { password: hashedPassword } })

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: "Failed to update password" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
