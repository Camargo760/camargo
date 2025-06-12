"use client"

import { useState, useEffect } from "react"
import { X, CreditCard, Truck, DollarSign, Send, Tag } from "lucide-react"

export default function PaymentModal({ isOpen, onClose, onSelectPaymentMethod, productDetails, couponCode }) {
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [couponValidation, setCouponValidation] = useState(null)
  const [discountedPrice, setDiscountedPrice] = useState(productDetails.price)
  const [paymentSettings, setPaymentSettings] = useState(null)
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

    const fetchPaymentSettings = async () => {
      try {
        const res = await fetch("/api/payment-settings")
        if (res.ok) {
          const data = await res.json()
          setPaymentSettings(data.settings)
        }
      } catch (err) {
        console.error("Error fetching payment settings:", err)
      }
    }

    fetchSiteTheme()
    fetchPaymentSettings()
  }, [])

  // Validate coupon when modal opens or coupon changes
  useEffect(() => {
    const validateCoupon = async () => {
      if (!couponCode || !couponCode.trim()) {
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
            code: couponCode.trim(),
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
        console.error("Error validating coupon:", err)
        setCouponValidation(null)
        setDiscountedPrice(productDetails.price)
      }
    }

    validateCoupon()
  }, [couponCode, productDetails.price])

  if (!isOpen) return null

  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    onSelectPaymentMethod(method)
    onClose()
  }

  const totalPrice = discountedPrice * (productDetails.quantity || 1)

  const isStripeEnabled = paymentSettings?.stripe?.enabled ?? true
  const isCashOnDeliveryEnabled = paymentSettings?.cashOnDelivery?.enabled ?? true

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
         <div className="space-y-3">
            {/* Stripe Payment Button */}
            <button
              onClick={isStripeEnabled ? () => handleSelectMethod("stripe") : undefined}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                !isStripeEnabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                borderColor:
                  selectedMethod === "stripe" && isStripeEnabled ? siteTheme.accentColor : siteTheme.borderColor,
                backgroundColor:
                  selectedMethod === "stripe" && isStripeEnabled ? siteTheme.secondaryBgColor : "transparent",
              }}
              disabled={!isStripeEnabled}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">{paymentSettings?.stripe?.displayName || "Pay with Card"}</span>
                <span className="text-sm opacity-70">
                  {isStripeEnabled
                    ? paymentSettings?.stripe?.description || "Visa, Mastercard, etc."
                    : "Not available currently"}
                </span>
              </div>
              <CreditCard style={{ color: isStripeEnabled ? "#3b82f6" : "#666" }} className="mr-3" size={24} />
            </button>

            {/* Cash on Delivery Button */}
            <button
              onClick={isCashOnDeliveryEnabled ? () => handleSelectMethod("delivery") : undefined}
              className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${
                !isCashOnDeliveryEnabled ? "opacity-50 cursor-not-allowed" : ""
              }`}
              style={{
                borderColor:
                  selectedMethod === "delivery" && isCashOnDeliveryEnabled
                    ? siteTheme.accentColor
                    : siteTheme.borderColor,
                backgroundColor:
                  selectedMethod === "delivery" && isCashOnDeliveryEnabled ? siteTheme.secondaryBgColor : "transparent",
              }}
              disabled={!isCashOnDeliveryEnabled}
            >
              <div className="flex flex-col items-start">
                <span className="font-medium">
                  {paymentSettings?.cashOnDelivery?.displayName || "Pay at Delivery Time"}
                </span>
                <span className="text-sm opacity-70">
                  {isCashOnDeliveryEnabled
                    ? paymentSettings?.cashOnDelivery?.description || "Cash on delivery"
                    : "Not available currently"}
                </span>
              </div>
              <Truck style={{ color: isCashOnDeliveryEnabled ? "#10b981" : "#666" }} className="mr-3" size={24} />
            </button>
          </div>

          {/* Available Payment Methods Display */}
          {isCashOnDeliveryEnabled && paymentSettings?.cashOnDelivery?.methods && (
            <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: siteTheme.borderColor }}>
              <p className="text-sm mb-2 opacity-80">We accept</p>
              <div className="flex justify-center items-center space-x-4 flex-wrap gap-2">
                {paymentSettings.cashOnDelivery.methods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <div key={method.id} className="flex items-center">
                      {method.id === "cash" && <DollarSign style={{ color: "#10b981" }} className="mr-1" size={16} />}
                      {method.id === "zelle" && <Send style={{ color: "#3b82f6" }} className="mr-1" size={16} />}
                      {method.id === "venmo" && <DollarSign style={{ color: "#3b82f6" }} className="mr-1" size={16} />}
                      {method.id === "paypal" && (
                        <svg
                          className="w-4 h-4 mr-1"
                          style={{ color: "#4169e1" }}
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.641.641 0 0 1 .634-.546h4.778a.641.641 0 0 1 .633.738l-3.278 17.21a.641.641 0 0 1-.635.55zm7.348-11.1L13.3 14.862a.32.32 0 0 0 .318.276h2.745c.272 0 .553-.249.623-.51l1.235-4.303a.32.32 0 0 0-.318-.276h-2.745c-.272 0-.553.25-.623.51zm-1.25 6.394l1.944-6.83c.163-.583.688-1.007 1.297-1.007h3.858c.82 0 1.39.786 1.25 1.595l-1.961 6.835c-.163.583-.688 1.006-1.297 1.006h-3.843c-.82 0-1.39-.785-1.25-1.595l.002-.004z" />
                        </svg>
                      )}
                      <span className="text-sm">{method.name}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
