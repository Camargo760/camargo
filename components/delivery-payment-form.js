"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Truck, X } from "lucide-react"

export default function DeliveryPaymentForm({ isOpen, onClose, productDetails, customerInfo, onSubmit }) {
  const [preferredMethod, setPreferredMethod] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
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
        console.error("Error fetching site theme:", err)
      }
    }

    fetchSiteTheme()
  }, [])

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
      console.log("Submitting delivery order with product details:", productDetails)

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
          color: productDetails.color,
          size: productDetails.size,
          isCustomProduct: productDetails.isCustomProduct || false, // Ensure this is explicitly set
          customText: productDetails.customText,
          quantity: productDetails.quantity,
          preferredMethod,
          additionalNotes,
          price: productDetails.price,
          designImageId: productDetails.designImageId || null, // Pass the image ID
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()

        try {
          // Try to parse as JSON if possible
          const errorData = JSON.parse(errorText)
          throw new Error(errorData.error || "Failed to create order")
        } catch (jsonError) {
          // If not JSON, use the text directly
          throw new Error(`Server error (${response.status}): ${errorText.substring(0, 100)}...`)
        }
      }

      const orderData = await response.json()

      // Redirect to success page
      router.push(`/success?order_id=${orderData.id}&payment_method=delivery`)
    } catch (err) {
      console.error("Error creating delivery order:", err)
      setError(err.message || "Failed to create order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cash"
                    checked={preferredMethod === "cash"}
                    onChange={() => setPreferredMethod("cash")}
                    className="mr-2"
                  />
                  <span>Cash</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cashapp"
                    checked={preferredMethod === "cashapp"}
                    onChange={() => setPreferredMethod("cashapp")}
                    className="mr-2"
                  />
                  <span>Cash App Pay</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="zelle"
                    checked={preferredMethod === "zelle"}
                    onChange={() => setPreferredMethod("zelle")}
                    className="mr-2"
                  />
                  <span>Zelle</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paypal"
                    checked={preferredMethod === "paypal"}
                    onChange={() => setPreferredMethod("paypal")}
                    className="mr-2"
                  />
                  <span>PayPal</span>
                </label>
              </div>
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
                className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                disabled={loading}
              >
                {loading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
