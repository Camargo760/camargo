"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import { X, CreditCard, Truck, DollarSign, Send, Tag } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import LoadingSpinner from "@/components/LoadingSpinner"

export default function PaymentMethodPage() {
    const [checkoutData, setCheckoutData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [paymentSettings, setPaymentSettings] = useState(null)
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
                }
            } catch (err) {
            }
        }

        const storedData = sessionStorage.getItem("checkoutData")
        if (storedData) {
            setCheckoutData(JSON.parse(storedData))
        } else {
            router.push("/")
            return
        }

        fetchSiteTheme()
        fetchPaymentSettings()
        setLoading(false)
    }, [router])

    const handleSelectPaymentMethod = async (method) => {
        if (!checkoutData) return

        if (method === "stripe") {
            await handleStripeCheckout()
        } else if (method === "delivery") {
            router.push("/delivery-address")
        }
    }

    const handleStripeCheckout = async () => {
        try {
            setLoading(true)

            const requestBody = {
                productId: checkoutData.productId,
                name: "",
                email: "",
                phone: checkoutData.phone || "",
                address: "",
                color: checkoutData.color || "",
                size: checkoutData.size || "",
                isCustomProduct: checkoutData.isCustomProduct || false,
                customText: checkoutData.customText || "",
                quantity: checkoutData.quantity || 1,
                designImageId: checkoutData.imageId || null,
                designData: checkoutData.designData || null,
                category: checkoutData.category || "Uncategorized",
                couponCode: checkoutData.couponCode || null,
                discountedPrice: checkoutData.discountedPrice || checkoutData.productPrice,
                price: checkoutData.productPrice || checkoutData.discountedPrice,
            }

            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || "Failed to create checkout session")
            }

            const { id: sessionId } = await response.json()

            const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)

            if (!stripe) {
                throw new Error("Failed to load Stripe")
            }

            const { error } = await stripe.redirectToCheckout({ sessionId })

            if (error) {
                throw new Error(error.message)
            }
        } catch (err) {
            alert(`Failed to process payment: ${err.message}`)
            setLoading(false)
        }
    }

    if (loading || !checkoutData) {
        return <LoadingSpinner siteTheme={siteTheme} />
    }

    const isStripeEnabled = paymentSettings?.stripe?.enabled ?? true
    const isCashOnDeliveryEnabled = paymentSettings?.cashOnDelivery?.enabled ?? true
    const totalPrice = checkoutData.discountedPrice * checkoutData.quantity

    return (
        <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
            <Header />
            <main className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
                    Select Payment Method
                </h1>

                <div className="max-w-md mx-auto">
                    <div
                        className="rounded-lg shadow-xl w-full overflow-hidden"
                        style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
                    >
                        <div className="p-6">
                            <div className="mb-4">
                                <h3 className="text-lg font-semibold mb-4 text-center">Order Summary</h3>
                                <div className="p-3 rounded-md" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                                    <p className="font-medium">{checkoutData.productName}</p>
                                    {checkoutData.color && <p className="text-sm">Color: {checkoutData.color}</p>}
                                    {checkoutData.size && <p className="text-sm">Size: {checkoutData.size}</p>}
                                    <p className="text-sm">Quantity: {checkoutData.quantity}</p>
                                    {checkoutData.couponValidation && (
                                        <>
                                            <div className="flex items-center text-sm mt-1" style={{ color: siteTheme.accentColor }}>
                                                <Tag size={14} className="mr-1" />
                                                <span>
                                                    Coupon ({checkoutData.couponCode.toUpperCase()}): -
                                                    {checkoutData.couponValidation.discountPercentage}%
                                                </span>
                                            </div>
                                            <p className="text-sm line-through opacity-60">
                                                Original: ${(checkoutData.productPrice * checkoutData.quantity).toFixed(2)}
                                            </p>
                                        </>
                                    )}
                                    <p className="font-bold mt-2" style={{ color: siteTheme.accentColor }}>
                                        Total: ${totalPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {/* Stripe Payment Button */}
                                <button
                                    onClick={isStripeEnabled ? () => handleSelectPaymentMethod("stripe") : undefined}
                                    className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${!isStripeEnabled ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
                                        }`}
                                    style={{
                                        borderColor: siteTheme.borderColor,
                                        backgroundColor: "transparent",
                                    }}
                                    disabled={!isStripeEnabled || loading}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">{paymentSettings?.stripe?.displayName || "Pay with Card"}</span>
                                        <span className="text-sm opacity-70 text-left">
                                            {isStripeEnabled
                                                ? paymentSettings?.stripe?.description || "Visa, Mastercard, etc."
                                                : "Not available currently"}
                                        </span>
                                    </div>
                                    <CreditCard style={{ color: isStripeEnabled ? "#3b82f6" : "#666" }} className="mr-3" size={24} />
                                </button>

                                {/* Cash on Delivery Button */}
                                <button
                                    onClick={isCashOnDeliveryEnabled ? () => handleSelectPaymentMethod("delivery") : undefined}
                                    className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${!isCashOnDeliveryEnabled ? "opacity-50 cursor-not-allowed" : "hover:bg-opacity-80"
                                        }`}
                                    style={{
                                        borderColor: siteTheme.borderColor,
                                        backgroundColor: "transparent",
                                    }}
                                    disabled={!isCashOnDeliveryEnabled || loading}
                                >
                                    <div className="flex flex-col items-start">
                                        <span className="font-medium">
                                            {paymentSettings?.cashOnDelivery?.displayName || "Pay at Delivery Time"}
                                        </span>
                                        <span className="text-sm opacity-70 text-left">
                                            {isCashOnDeliveryEnabled
                                                ? paymentSettings?.cashOnDelivery?.description || "Cash on delivery"
                                                : "Not available currently"}
                                        </span>
                                    </div>
                                    <Truck style={{ color: isCashOnDeliveryEnabled ? "#10b981" : "#666" }} className="mr-3" size={24} />
                                </button>
                            </div>

                            {loading && (
                                <LoadingSpinner siteTheme={siteTheme} />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
