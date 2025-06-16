"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck } from "lucide-react"
import Header from "../../components/Header"

export default function DeliveryPaymentPage() {
  const [checkoutData, setCheckoutData] = useState(null)
  const [customerInfo, setCustomerInfo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [preferredMethod, setPreferredMethod] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [paymentSettings, setPaymentSettings] = useState(null)
  const [availableMethods, setAvailableMethods] = useState([])
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  const router = useRouter()

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
      }
    }

    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch("/api/payment-settings")
        if (res.ok) {
          const data = await res.json()
          setPaymentSettings(data.settings)

          if (data.settings?.cashOnDelivery?.methods) {
            const enabledMethods = data.settings.cashOnDelivery.methods.filter((method) => method.enabled)
            setAvailableMethods(enabledMethods)

            if (enabledMethods.length > 0) {
              setPreferredMethod(enabledMethods[0].id)
            }
          }
        }
      } catch (err) {
        const defaultMethods = [
          { id: "cash", name: "Cash", enabled: true },
          { id: "zelle", name: "Zelle", enabled: true },
          { id: "cashapp", name: "Cash App Pay", enabled: true },
          { id: "paypal", name: "PayPal", enabled: true },
        ]
        setAvailableMethods(defaultMethods)
        setPreferredMethod("cash")
      }
    }

    const storedCheckoutData = sessionStorage.getItem("checkoutData")
    const storedCustomerInfo = sessionStorage.getItem("customerInfo")

    if (storedCheckoutData && storedCustomerInfo) {
      setCheckoutData(JSON.parse(storedCheckoutData))
      setCustomerInfo(JSON.parse(storedCustomerInfo))
    } else {
      router.push("/")
      return
    }

    fetchSiteTheme()
    fetchPaymentSettings()
    setLoading(false)
  }, [router])

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!preferredMethod) {
      setError("Please select a preferred payment method")
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch("/api/create-delivery-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: checkoutData.productId,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          price: checkoutData.productPrice,
          color: checkoutData.color,
          size: checkoutData.size,
          category: checkoutData.category,
          isCustomProduct: checkoutData.isCustomProduct || false,
          customText: checkoutData.customText,
          quantity: checkoutData.quantity,
          preferredMethod,
          additionalNotes,
          designImageId: checkoutData.imageId || null,
          couponCode: checkoutData.couponCode || null, 
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        try {
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || "Failed to create order")
        } catch (jsonError) {
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}...`)
        }
      }

      const orderData = await response.json()

      sessionStorage.removeItem("checkoutData")
      sessionStorage.removeItem("customerInfo")

      router.push(`/success?order_id=${orderData.id}&payment_method=delivery`)
    } catch (err) {
      setError(err.message || "Failed to create order. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !checkoutData || !customerInfo) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <div
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: siteTheme.accentColor }}
            ></div>
          </div>
        </main>
      </div>
    )
  }

  const finalPrice = checkoutData.discountedPrice || checkoutData.productPrice
  const totalPrice = finalPrice * checkoutData.quantity

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Complete Your Order
        </h1>

        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 rounded-full" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                <Truck style={{ color: "#10b981" }} size={32} />
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 text-center" style={{ color: siteTheme.textColor }}>
              Pay at Delivery
            </h2>

            {/* Order Summary */}
            <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
              <h3 className="font-semibold mb-3">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{checkoutData.productName}</span>
                  <span>${checkoutData.productPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Quantity</span>
                  <span>{checkoutData.quantity}</span>
                </div>
                {checkoutData.color && (
                  <div className="flex justify-between">
                    <span>Color</span>
                    <span>{checkoutData.color}</span>
                  </div>
                )}
                {checkoutData.size && (
                  <div className="flex justify-between">
                    <span>Size</span>
                    <span>{checkoutData.size}</span>
                  </div>
                )}
                {/* Show discount information if coupon is applied */}
                {checkoutData.couponCode && checkoutData.discountedPrice && (
                  <>
                    <div className="flex justify-between text-sm" style={{ color: siteTheme.accentColor }}>
                      <span>Coupon ({checkoutData.couponCode.toUpperCase()})</span>
                      <span>-{checkoutData.couponValidation?.discountPercentage || 0}%</span>
                    </div>
                    <div className="flex justify-between text-sm line-through opacity-60">
                      <span>Original Total</span>
                      <span>${(checkoutData.productPrice * checkoutData.quantity).toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div
                  className="flex justify-between font-bold text-lg border-t pt-2"
                  style={{ borderColor: siteTheme.borderColor }}
                >
                  <span>Total</span>
                  <span style={{ color: siteTheme.accentColor }}>${totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <p className="text-center mb-6">Please provide additional information for your delivery payment.</p>

            {error && (
              <div
                className="border px-4 py-3 rounded mb-4"
                style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", borderColor: "#ef4444", color: "#ef4444" }}
              >
                <p>{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2">Preferred Payment Method</label>
                {availableMethods.length > 0 ? (
                  <div className="space-y-2">
                    {availableMethods.map((method) => (
                      <label key={method.id} className="flex items-center">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={preferredMethod === method.id}
                          onChange={() => setPreferredMethod(method.id)}
                          className="mr-2"
                        />
                        <span>{method.name}</span>
                        {method.details && <span className="text-sm opacity-70 ml-2">({method.details})</span>}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 opacity-70">
                    <p>No payment methods available currently</p>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" htmlFor="notes">
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                  rows="3"
                  placeholder="Any special instructions for delivery or payment"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full disabled:opacity-50"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                  disabled={submitting || availableMethods.length === 0}
                >
                  {submitting ? "Processing..." : `Place Order - $${totalPrice.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
