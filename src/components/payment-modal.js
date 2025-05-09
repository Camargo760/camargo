"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Truck, DollarSign, Send } from "lucide-react"

export default function PaymentModal({ isOpen, onClose, onSelectPaymentMethod, productDetails }) {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

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

  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    onSelectPaymentMethod(method)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div
        className="rounded-lg shadow-xl w-full max-w-md overflow-hidden"
        style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
      >
        <div className="flex justify-between items-center p-6 border-b" style={{ borderColor: siteTheme.borderColor }}>
          <h2 className="text-xl font-bold">Select Payment Method</h2>
          <button onClick={onClose} className="transition-colors" style={{ color: siteTheme.textColor }}>
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Order Summary</h3>
            <div className="p-3 rounded-md" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
              <p className="font-medium">{productDetails.name}</p>
              {productDetails.color && <p className="text-sm">Color: {productDetails.color}</p>}
              {productDetails.size && <p className="text-sm">Size: {productDetails.size}</p>}
              <p className="text-sm">Quantity: {productDetails.quantity || 1}</p>
              <p className="font-bold mt-2" style={{ color: siteTheme.accentColor }}>
                Total: ${(productDetails.price * (productDetails.quantity || 1)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSelectMethod("stripe")}
              className="w-full flex items-center justify-between p-4 border rounded-lg transition-colors"
              style={{
                borderColor: selectedMethod === "stripe" ? siteTheme.accentColor : siteTheme.borderColor,
                backgroundColor: selectedMethod === "stripe" ? siteTheme.secondaryBgColor : "transparent",
              }}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">Pay with Card</span>
                <span className="text-sm opacity-70">Visa, Mastercard, etc.</span>
              </div>
              <CreditCard style={{ color: "#3b82f6" }} className="mr-3" size={24} />

            </button>

            <button
              onClick={() => handleSelectMethod("delivery")}
              className="w-full flex items-center justify-between p-4 border rounded-lg transition-colors"
              style={{
                borderColor: selectedMethod === "delivery" ? siteTheme.accentColor : siteTheme.borderColor,
                backgroundColor: selectedMethod === "delivery" ? siteTheme.secondaryBgColor : "transparent",
              }}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">Pay at Delivery Time</span>
                <span className="text-sm opacity-70">Cash on delivery</span>
              </div>
              <Truck style={{ color: "#10b981" }} className="mr-3" size={24} />

            </button>
          </div>

          <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: siteTheme.borderColor }}>
            <p className="text-sm mb-2 opacity-80">We accept</p>
            <div className="flex justify-center items-center space-x-4">
              <div className="flex items-center">
                <DollarSign style={{ color: "#10b981" }} className="mr-1" size={16} />
                <span className="text-sm">Cash App Pay</span>
              </div>
              <div className="flex items-center">
                <Send style={{ color: "#3b82f6" }} className="mr-1" size={16} />
                <span className="text-sm">Zelle</span>
              </div>
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1" style={{ color: "#4169e1" }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.641.641 0 0 1 .634-.546h4.778a.641.641 0 0 1 .633.738l-3.278 17.21a.641.641 0 0 1-.635.55zm7.348-11.1L13.3 14.862a.32.32 0 0 0 .318.276h2.745c.272 0 .553-.249.623-.51l1.235-4.303a.32.32 0 0 0-.318-.276h-2.745c-.272 0-.553.25-.623.51zm-1.25 6.394l1.944-6.83c.163-.583.688-1.007 1.297-1.007h3.858c.82 0 1.39.786 1.25 1.595l-1.961 6.835c-.163.583-.688 1.006-1.297 1.006h-3.843c-.82 0-1.39-.785-1.25-1.595l.002-.004z" />
                </svg>
                <span className="text-sm">PayPal</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
