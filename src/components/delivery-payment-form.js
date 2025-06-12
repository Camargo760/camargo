"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck, X, Tag } from "lucide-react"

export default function DeliveryPaymentForm({ isOpen, onClose, productDetails, customerInfo, onSubmit }) {
  const [preferredMethod, setPreferredMethod] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [couponValidation, setCouponValidation] = useState(null)
  const [discountedPrice, setDiscountedPrice] = useState(productDetails.price)
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

    fetchSiteTheme()
    fetchPaymentSettings()
  }, [])

  useEffect(() => {
    const validateCoupon = async () => {
      if (!customerInfo.coupon || !customerInfo.coupon.trim()) {
        setCouponValidation(null)
        setDiscountedPrice(productDetails.price)
        return
      }

      try {
        const response = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code: customerInfo.coupon.trim(),
          }),
        })

        if (response.ok) {
          const couponData = await response.json()
          setCouponValidation(couponData)
          const newPrice = productDetails.price * (1 - couponData.discountPercentage / 100)
          setDiscountedPrice(newPrice)
        } else {
          setCouponValidation(null)
          setDiscountedPrice(productDetails.price)
        }
      } catch (err) {
        setCouponValidation(null)
        setDiscountedPrice(productDetails.price)
      }
    }

    validateCoupon()
  }, [customerInfo.coupon, productDetails.price])

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!preferredMethod) {
      setError("Please select a preferred payment method")
      return
    }

    setLoading(true)
    setError(null)

    try {

      const response = await fetch("/api/create-delivery-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: productDetails.id,
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: customerInfo.address,
          price: productDetails.price,
          color: productDetails.color,
          size: productDetails.size,
          category: productDetails.category,
          isCustomProduct: productDetails.isCustomProduct || false,
          customText: productDetails.customText,
          quantity: productDetails.quantity,
          preferredMethod,
          additionalNotes,
          designImageId: productDetails.designImageId || null,
          finalPrice: discountedPrice,
          couponCode: couponValidation ? customerInfo.coupon.toUpperCase() : null,
          discountPercentage: couponValidation ? couponValidation.discountPercentage : 0,
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

      router.push(`/success?order_id=${orderData.id}&payment_method=delivery`)
    } catch (err) {
      setError(err.message || "Failed to create order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const totalPrice = discountedPrice * productDetails.quantity

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh]"
        style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: siteTheme.borderColor }}>
          <h2 className="text-xl font-bold">Pay at Delivery</h2>
          <button onClick={onClose} className="transition-colors" style={{ color: siteTheme.textColor }}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          <div className="flex items-center justify-center mb-6">
            <div className="p-3 rounded-full" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
              <Truck style={{ color: "#10b981" }} size={32} />
            </div>
          </div>

          <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
            <h3 className="font-semibold mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{productDetails.name}</span>
                <span>${productDetails.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Quantity</span>
                <span>{productDetails.quantity}</span>
              </div>
              {couponValidation && (
                <>
                  <div className="flex justify-between text-sm" style={{ color: siteTheme.accentColor }}>
                    <span className="flex items-center">
                      <Tag size={14} className="mr-1" />
                      Coupon ({customerInfo.coupon.toUpperCase()})
                    </span>
                    <span>-{couponValidation.discountPercentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm line-through opacity-60">
                    <span>Original Total</span>
                    <span>${(productDetails.price * productDetails.quantity).toFixed(2)}</span>
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
                disabled={loading || availableMethods.length === 0}
              >
                {loading ? "Processing..." : `Place Order - $${totalPrice.toFixed(2)}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
