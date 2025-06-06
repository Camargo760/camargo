"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Link from "next/link"
import Image from "next/image"

function SuccessContent() {
  const [orderDetails, setOrderDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    const fetchSiteTheme = async () => {
      try {
        const res = await fetch("/api/site-theme")
        if (res.ok) {
          const data = await res.json()
          if (data.theme) {
            setSiteTheme(data.theme)
          }
        }
      } catch (err) {
        console.error("Error fetching site theme:", err)
      }
    }

    fetchSiteTheme()

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

  // Find the getStatusText function and make sure it's defined correctly
  const getStatusText = (status) => {
    switch (status) {
      case "received":
        return "Order Received"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return "Pending"
    }
  }

  // Find the getStatusColor function and make sure it's defined correctly
  const getStatusColor = (status) => {
    switch (status) {
      case "received":
        return "#3b82f6" // blue
      case "out_for_delivery":
        return "#eab308" // yellow
      case "delivered":
        return "#10b981" // green
      default:
        return "#f97316" // orange
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-90">
        <div className="text-center text-white text-2xl font-bold">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
        <Header />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center text-lg font-medium py-8" style={{ color: "#ef4444" }}>
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
        <Header />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center text-lg font-medium py-8" style={{ color: "#ef4444" }}>
            No order details found.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-16 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.accentColor }}>
          Thank You for Your Order!
        </h1>
        <div
          className="shadow-lg rounded-lg p-8 space-y-4"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <div className="mb-4">
            <h2 className="text-2xl font-semibold">Order Details</h2>
            <p className="mt-2">
              Order ID: <span className="font-medium">{orderDetails.id}</span>
            </p>
            <p>
              Payment Method: <span className="font-medium capitalize">{orderDetails.paymentMethod || "Stripe"}</span>
              {orderDetails.paymentMethod === "delivery" && orderDetails.preferredMethod && (
                <span
                  className="ml-2 text-xs px-2 py-1 rounded capitalize"
                  style={{ backgroundColor: siteTheme.secondaryBgColor }}
                >
                  {orderDetails.preferredMethod}
                </span>
              )}
            </p>
            <p>
              Discount: <span className="font-medium" style={{ color: siteTheme.accentColor }}>{orderDetails.discountPercentage}% OFF</span>
            </p>
            <p>
              Price <small>(Each Product)</small>: <span className="font-medium">${(orderDetails.finalPrice.toFixed(2))}</span>
            </p>
            <p>
              Quantity:{" "}
              <span className="font-medium">
                {orderDetails.quantity || orderDetails.line_items?.[0]?.quantity || 1}
              </span>
            </p>
            <p>
              Total:{" "}
              <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                ${((orderDetails.amount_total || 0) / 100).toFixed(2)}
              </span>
            </p>
          </div>
          {/* Add coupon information if available */}
          {orderDetails.couponCode && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Discount Applied <small className="text-xs">(Each product)</small></h3>
                <p>
                  Coupon Code:{" "}
                  <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                    {orderDetails.couponCode}
                  </span>
                </p>
                <p>
                  Discount: <span className="font-medium">{orderDetails.discountPercentage}%</span>
                </p>
                {orderDetails.originalPrice && orderDetails.finalPrice && (
                  <>
                    <p>
                      Original Price: <span className="line-through">${orderDetails.originalPrice.toFixed(2)}</span>
                    </p>
                    <p>
                      Final Price:{" "}
                      <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                        ${orderDetails.finalPrice.toFixed(2)}
                      </span>
                    </p>
                    <p>
                      You Saved:{" "}
                      <span className="font-medium" style={{ color: "#10b981" }}>
                        ${(orderDetails.originalPrice - orderDetails.finalPrice).toFixed(2)}
                      </span>
                    </p>
                  </>
                )}
              </div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">Discount Applied <small className="text-xs">(All products)</small></h3>
                <p>
                  Coupon Code:{" "}
                  <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                    {orderDetails.couponCode}
                  </span>
                </p>
                <p>
                  Discount: <span className="font-medium">{orderDetails.discountPercentage}%</span>
                </p>

                {orderDetails.originalPrice && orderDetails.quantity && orderDetails.discountPercentage && (
                  <>
                    <p>
                      Original Total:{" "}
                      <span className="line-through">
                        ${(orderDetails.originalPrice * orderDetails.quantity).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      Final Price:{" "}
                      <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                        ${(
                          orderDetails.originalPrice *
                          orderDetails.quantity *
                          (1 - orderDetails.discountPercentage / 100)
                        ).toFixed(2)}
                      </span>
                    </p>
                    <p>
                      You Saved:{" "}
                      <span className="font-medium" style={{ color: "#10b981" }}>
                        ${(
                          orderDetails.originalPrice *
                          orderDetails.quantity *
                          (orderDetails.discountPercentage / 100)
                        ).toFixed(2)}
                      </span>
                    </p>
                  </>
                )}
              </div>

            </div>
          )}
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Product Information</h3>
            <p>
              Name: <span className="font-medium">{orderDetails.product?.name || "N/A"}</span>
            </p>
            <p>
              Name: <span className="font-medium">{orderDetails.product?.price || "N/A"}</span>
            </p>
            <p>
              Description: <span className="font-medium">{orderDetails.product?.description || "N/A"}</span>
            </p>
            <p>
              Category: <span className="font-medium">{orderDetails.product?.category || "N/A"}</span>
            </p>
            <p>
              Color: <span className="font-medium">{orderDetails.product?.selectedColor || "N/A"}</span>
            </p>
            <p>
              Size: <span className="font-medium">{orderDetails.product?.selectedSize || "N/A"}</span>
            </p>

            {/* Display custom text if it exists */}
            {orderDetails.product?.customText && (
              <p>
                Custom Text: <span className="font-medium">{orderDetails.product.customText}</span>
              </p>
            )}

            {/* Display if this is a custom product */}
            {orderDetails.isCustomProduct && (
              <p>
                Type: <span className="font-medium">Custom Product</span>
              </p>
            )}

            {/* Display final design image if available */}
            {orderDetails.product?.finalDesignImage && (
              <div className="mt-4">
                <p className="mb-2">Your Custom Design:</p>
                <div
                  className="relative w-full max-w-md h-64 border rounded-lg overflow-hidden"
                  style={{ borderColor: siteTheme.borderColor }}
                >
                  <Image
                    src={orderDetails.product.finalDesignImage || "/placeholder.svg"}
                    alt="Your custom design"
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </div>
            )}
          </div>
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Shipping Information</h3>
            <p>
              Name: <span className="font-medium">{orderDetails.customer_details?.name || "N/A"}</span>
            </p>
            <p>
              Email: <span className="font-medium">{orderDetails.customer_details?.email || "N/A"}</span>
            </p>
            <p>
              Address:{" "}
              <span className="font-medium">
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
              <h3 className="text-xl font-semibold">Additional Notes</h3>
              <p className="italic">{`"${orderDetails.additionalNotes}"`}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link
              href="/"
              className="font-bold py-2 px-6 rounded-lg transition-colors"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
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
