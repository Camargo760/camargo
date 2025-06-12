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
      }
    }

    fetchSiteTheme()
    fetchPaymentSettings()
  }, [])

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

          {isCashOnDeliveryEnabled && paymentSettings?.cashOnDelivery?.methods && (
            <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: siteTheme.borderColor }}>
              <p className="text-sm mb-2 opacity-80">We accept</p>
              <div className="flex justify-center items-center space-x-4 flex-wrap gap-2">
                {paymentSettings.cashOnDelivery.methods
                  .filter((method) => method.enabled)
                  .map((method) => (
                    <div key={method.id} className="flex items-center">
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
