"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Truck, X } from "lucide-react"

export default function DeliveryPaymentForm({ isOpen, onClose, productDetails, customerInfo, onSubmit }) {
  const [preferredMethod, setPreferredMethod] = useState("")
  const [additionalNotes, setAdditionalNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

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
          color: productDetails.color,
          size: productDetails.size,
          isCustomProduct: productDetails.isCustomProduct,
          customText: productDetails.customText,
          quantity: productDetails.quantity,
          preferredMethod,
          additionalNotes,
          price: productDetails.price,
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Pay at Delivery</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: "calc(90vh - 80px)" }}>
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-100 p-3 rounded-full">
              <Truck className="text-green-600" size={32} />
            </div>
          </div>

          <p className="text-center text-gray-700 mb-6">
            Please provide additional information for your delivery payment.
          </p>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">Preferred Payment Method</label>
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
              <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="notes">
                Additional Notes
              </label>
              <textarea
                id="notes"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
                placeholder="Any special instructions for delivery or payment"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <button
                type="submit"
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
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

