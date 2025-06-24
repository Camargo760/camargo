"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Header from "../../components/Header"
import Link from "next/link"
import Image from "next/image"
import LoadingSpinner from "@/components/LoadingSpinner"

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
  const [paymentSettings, setPaymentSettings] = useState(null)
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
      } catch (err) {}
    }

    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch("/api/payment-settings")
        if (res.ok) {
          const data = await res.json()
          console.log("Success page - Payment settings response:", data)
          setPaymentSettings(data.settings)
        }
      } catch (err) {
        console.error("Error fetching payment settings:", err)
      }
    }

    fetchSiteTheme()
    fetchPaymentSettings()

    const fetchOrderDetails = async () => {
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
          endpoint = `/api/order-details?session_id=${sessionId}`
        } else if (orderId) {
          endpoint = `/api/order-details?order_id=${orderId}&payment_method=${paymentMethod}`
        }

        const res = await fetch(endpoint)

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to fetch order details")
        }

        const data = await res.json()
        setOrderDetails(data)
      } catch (err) {
        setError(err.message || "Failed to fetch order details. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (searchParams.get("session_id") || searchParams.get("order_id")) {
      fetchOrderDetails()
    }
  }, [searchParams])

  const getPaymentMethodDetails = (methodId) => {
    console.log("Success page - Looking up method:", methodId)
    console.log("Success page - Payment settings:", paymentSettings)

    if (!methodId || !paymentSettings) {
      console.log("Success page - Missing methodId or paymentSettings")
      return { name: methodId || "Unknown", details: null }
    }

    // Try different possible paths in the settings structure
    let methods = []

    if (paymentSettings.cashOnDelivery?.methods) {
      methods = paymentSettings.cashOnDelivery.methods
      console.log("Success page - Found methods in cashOnDelivery.methods:", methods)
    } else if (paymentSettings.settings?.cashOnDelivery?.methods) {
      methods = paymentSettings.settings.cashOnDelivery.methods
      console.log("Success page - Found methods in settings.cashOnDelivery.methods:", methods)
    } else {
      console.log("Success page - No methods found in payment settings")
    }

    if (methods && methods.length > 0) {
      // Find the method by ID (try exact match first, then case-insensitive)
      let method = methods.find((m) => m.id === methodId)

      if (!method) {
        // Try case-insensitive match
        method = methods.find((m) => m.id?.toLowerCase() === methodId?.toLowerCase())
      }

      if (method && method.enabled !== false) {
        console.log("Success page - Found matching method:", method)
        return {
          name: method.name,
          details: method.details,
        }
      } else {
        console.log("Success page - Method not found or disabled")
      }
    }

    console.log("Success page - Using fallback for method:", methodId)
    return { name: methodId, details: null }
  }

  if (loading) {
    return <LoadingSpinner siteTheme={siteTheme} />
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

  const paymentMethodInfo =
    orderDetails.paymentMethod === "delivery" && orderDetails.preferredMethod
      ? getPaymentMethodDetails(orderDetails.preferredMethod)
      : null

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
            <div className="mt-2">
              <span>Payment Method: </span>
              <span className="font-medium capitalize">{orderDetails.paymentMethod || "Stripe"}</span>
              {paymentMethodInfo && (
                <div className="mt-3 p-4 rounded-lg" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                  <div className="text-lg font-semibold" style={{ color: siteTheme.accentColor }}>
                    {paymentMethodInfo.name}
                  </div>
                  {paymentMethodInfo.details && (
                    <div className="text-sm mt-2 opacity-90" style={{ color: siteTheme.textColor }}>
                      {paymentMethodInfo.details}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-2">
              Discount:{" "}
              <span className="font-medium" style={{ color: siteTheme.accentColor }}>
                {orderDetails.discountPercentage}% OFF
              </span>
            </p>
            <p>
              Price <small>(Each Product)</small>:{" "}
              <span className="font-medium">${orderDetails.finalPrice.toFixed(2)}</span>
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
          {orderDetails.couponCode && (
            <div>
              <div className="mb-4">
                <h3 className="text-xl font-semibold">
                  Discount Applied{" "}
                  {orderDetails.quantity > 1 ? <small className="text-xs">(Each product)</small> : null}
                </h3>
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

              {orderDetails.quantity > 1 ? (
                <div className="mb-4">
                  <h3 className="text-xl font-semibold">
                    Discount Applied <small className="text-xs">(All products)</small>
                  </h3>
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
                          $
                          {(
                            orderDetails.originalPrice *
                            orderDetails.quantity *
                            (1 - orderDetails.discountPercentage / 100)
                          ).toFixed(2)}
                        </span>
                      </p>
                      <p>
                        You Saved:{" "}
                        <span className="font-medium" style={{ color: "#10b981" }}>
                          $
                          {(
                            orderDetails.originalPrice *
                            orderDetails.quantity *
                            (orderDetails.discountPercentage / 100)
                          ).toFixed(2)}
                        </span>
                      </p>
                    </>
                  )}
                </div>
              ) : null}
            </div>
          )}
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Product Information</h3>
            <p>
              Name: <span className="font-medium">{orderDetails.product?.name || "N/A"}</span>
            </p>
            <p>
              Price: <span className="font-medium">{orderDetails.product?.price || "N/A"}</span>
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

            {orderDetails.product?.customText && (
              <p>
                Custom Text: <span className="font-medium">{orderDetails.product.customText}</span>
              </p>
            )}

            {orderDetails.isCustomProduct && (
              <p>
                Type: <span className="font-medium">Custom Product</span>
              </p>
            )}

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
