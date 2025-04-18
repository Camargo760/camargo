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
    // Parse the request body
    const { name, email, password } = await request.json()

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    // Validate password strength
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      return NextResponse.json({ error: passwordErrors.join(". ") }, { status: 400 })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db("ecommerce")

    // Check if user already exists
    const existingUser = await db.collection("users").findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 409 })
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the user
    const result = await db.collection("users").insertOne({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      createdAt: new Date(),
      role: "customer", // Default role
    })

    // Return success response without exposing the password
    return NextResponse.json(
      {
        id: result.insertedId.toString(),
        name,
        email,
        role: "customer",
        message: "User created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
  }
}

// Add OPTIONS method to handle preflight requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  })
}
