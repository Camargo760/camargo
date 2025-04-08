"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Link from "next/link"

function SuccessContent() {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchOrderDetails = async () => {
      // Check if we have a Stripe session ID or a delivery order ID
      const sessionId = searchParams.get("session_id")
      const orderId = searchParams.get("order_id")
      const paymentMethod = searchParams.get("payment_method")

      if (!sessionId && !orderId) {
        setError("No order information provided")
        setLoading(false)
        return
      }

      try {
        let endpoint
        if (sessionId) {
          // Stripe payment
          console.log("Fetching Stripe order details for session:", sessionId)
          endpoint = `/api/order-details?session_id=${sessionId}`
        } else if (orderId) {
          // Delivery payment
          console.log("Fetching delivery order details for order:", orderId)
          endpoint = `/api/order-details?order_id=${orderId}&payment_method=${paymentMethod}`
        }

        const res = await fetch(endpoint)

        // Log response status for debugging
        console.log("Response status:", res.status)

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("Error response:", errorData)
          throw new Error(errorData.error || "Failed to fetch order details")
        }

        const data = await res.json()
        console.log("Order details received:", data)
        setOrderDetails(data)
      } catch (err) {
        console.error("Error fetching order details:", err)
        setError(err.message || "Failed to fetch order details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (searchParams.get("session_id") || searchParams.get("order_id")) {
      fetchOrderDetails()
    }
  }, [searchParams])

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
        <div className="text-center text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-lg font-medium text-red-600 py-8">Error: {error}</div>
  }

  if (!orderDetails) {
    return <div className="text-center text-lg font-medium text-red-600 py-8">No order details found.</div>
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <main className="container mx-auto py-16 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center text-green-600">Thank You for Your Order!</h1>
        <div className="bg-white shadow-lg rounded-lg p-8 space-y-4">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-800">Order Details</h2>
            <p className="text-gray-600 mt-2">
              Order ID: <span className="font-medium text-gray-800">{orderDetails.id}</span>
            </p>
            <p className="text-gray-600 mt-2">
              Payment Method:{" "}
              <span className="font-medium text-gray-800 capitalize">{orderDetails.paymentMethod || "Stripe"}</span>
              {orderDetails.paymentMethod === "delivery" && orderDetails.preferredMethod && (
                <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded capitalize">
                  {orderDetails.preferredMethod}
                </span>
              )}
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Product Information</h3>
            <p className="text-gray-600">
              Name: <span className="font-medium text-gray-800">{orderDetails.product?.name || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Description:{" "}
              <span className="font-medium text-gray-800">{orderDetails.product?.description || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Category: <span className="font-medium text-gray-800">{orderDetails.product?.category || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Color: <span className="font-medium text-gray-800">{orderDetails.product?.selectedColor || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Size: <span className="font-medium text-gray-800">{orderDetails.product?.selectedSize || "N/A"}</span>
            </p>

            {/* Display custom text if it exists */}
            {orderDetails.product?.customText && (
              <p className="text-gray-600">
                Custom Text: <span className="font-medium text-gray-800">{orderDetails.product.customText}</span>
              </p>
            )}

            {/* Display if this is a custom product */}
            {orderDetails.isCustomProduct && (
              <p className="text-gray-600">
                Type: <span className="font-medium text-gray-800">Custom Product</span>
              </p>
            )}
          </div>
          <div className="mb-4">
            <p className="text-gray-600">
              Price: <span className="font-medium text-gray-800">${(orderDetails.product?.price || 0).toFixed(2)}</span>
            </p>
            <p className="text-gray-600">
              Quantity:{" "}
              <span className="font-medium text-gray-800">
                {orderDetails.quantity || orderDetails.line_items?.[0]?.quantity || 1}
              </span>
            </p>
            <p className="text-gray-600">
              Total:{" "}
              <span className="font-medium text-gray-800">${((orderDetails.amount_total || 0) / 100).toFixed(2)}</span>
            </p>
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Shipping Information</h3>
            <p className="text-gray-600">
              Name: <span className="font-medium text-gray-800">{orderDetails.customer_details?.name || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Email: <span className="font-medium text-gray-800">{orderDetails.customer_details?.email || "N/A"}</span>
            </p>
            <p className="text-gray-600">
              Address:{" "}
              <span className="font-medium text-gray-800">
                {orderDetails.customer_details?.address?.line1 ? (
                  <>
                    {orderDetails.customer_details?.address?.line1 || ""},
                    {orderDetails.customer_details?.address?.city || ""},
                    {orderDetails.customer_details?.address?.state || ""},
                    {orderDetails.customer_details?.address?.postal_code || ""},
                    {orderDetails.customer_details?.address?.country || ""}
                  </>
                ) : (
                  orderDetails.customer_details?.address || "N/A"
                )}
              </span>
            </p>
          </div>

          {orderDetails.paymentMethod === "delivery" && orderDetails.additionalNotes && (
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Additional Notes</h3>
              <p className="text-gray-600 italic">"{orderDetails.additionalNotes}"</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function Success() {
  return (
    <Suspense fallback={<div className="text-center text-lg font-medium text-gray-700 py-8">Loading page...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

