// import { NextResponse } from "next/server"
// import { getServerSession } from "next-auth/next"
// import { authOptions } from "../../../auth/[...nextauth]/route"
// import clientPromise from "../../../../../lib/mongodb"
// import { ObjectId } from "mongodb"

// export async function PATCH(request, { params }) {
//   try {
//     // Check authentication
//     const session = await getServerSession(authOptions)
//     if (!session || session.user.email !== "camargo_co@outlook.com") {
//       return NextResponse.json({ error: "Not authorized" }, { status: 403 })
//     }

//     const { id } = params
//     if (!id || !ObjectId.isValid(id)) {
//       return NextResponse.json({ error: "Invalid order ID" }, { status: 400 })
//     }

//     // Parse the request body
//     const { status } = await request.json()

//     // Validate status
//     const validStatuses = ["pending", "received", "out_for_delivery", "delivered"]
//     if (!status || !validStatuses.includes(status)) {
//       return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
//     }

//     // Connect to MongoDB
//     const client = await clientPromise
//     const db = client.db("ecommerce")

//     // Update the order status
//     const result = await db.collection("orders").updateOne({ _id: new ObjectId(id) }, { $set: { status } })

//     if (result.matchedCount === 0) {
//       return NextResponse.json({ error: "Order not found" }, { status: 404 })
//     }

//     return NextResponse.json({
//       success: true,
//       message: "Order status updated successfully",
//       status,
//     })
//   } catch (error) {
//     console.error("Error updating order status:", error)
//     return NextResponse.json({ error: "Failed to update order status" }, { status: 500 })
//   }
// }

