"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"
import PaymentModal from "../../../components/payment-modal"
import DeliveryPaymentForm from "../../../components/delivery-payment-form"
import { loadStripe } from "@stripe/stripe-js"
import { useSession } from "next-auth/react"
import LoadingSpinner from "../../../components/LoadingSpinner"

// Use React.use for params
import { use } from "react"

export default function Checkout({ params }) {
  // Unwrap params with React.use
  const id = use(params).id

  const [product, setProduct] = useState(null)
  const [designImage, setDesignImage] = useState(null)
  const [designData, setDesignData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [coupon, setCoupon] = useState("")
  const [address, setAddress] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const color = searchParams.get("color") || ""
  const size = searchParams.get("size") || ""
  const customText = searchParams.get("customText") || ""
  const quantity = Number.parseInt(searchParams.get("quantity") || "1", 10)
  const isCustomProduct = searchParams.get("customProduct") === "true"
  const imageId = searchParams.get("imageId") || ""

  useEffect(() => {
    // Pre-fill user details if logged in
    if (session && session.user) {
      setEmail(session.user.email || "")
      setName(session.user.name || "")
    }
  }, [session])

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

  // Fetch the design image if we have an imageId
  useEffect(() => {
    const fetchDesignImage = async () => {
      if (!imageId) return

      try {
        const res = await fetch(`/api/customProductImages?id=${imageId}`)
        if (!res.ok) {
          console.error("Failed to fetch design image")
          return
        }

        const data = await res.json()
        setDesignImage(data.imageData)

        // Also store the design data
        if (data.designData) {
          setDesignData(data.designData)
        }
      } catch (err) {
        console.error("Error fetching design image:", err)
      }
    }

    fetchDesignImage()
  }, [imageId])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // First try to fetch from regular products
        let res = await fetch(`/api/products/${id}`)
        let isCustom = false

        // If not found in regular products, try custom products
        if (!res.ok) {
          console.log("Product not found in regular products, trying custom products...")
          res = await fetch(`/api/customProducts/${id}`)
          isCustom = true

          if (!res.ok) {
            throw new Error("Failed to fetch product from both collections")
          }
        }

        const data = await res.json()
        console.log("Product found:", data)

        // Set the isCustomProduct flag based on where we found the product
        if (isCustom) {
          // Add a URL parameter to indicate this is a custom product
          const currentUrl = new URL(window.location.href)
          if (!currentUrl.searchParams.has("customProduct")) {
            currentUrl.searchParams.set("customProduct", "true")
            router.replace(currentUrl.toString())
          }

          // If the product has a finalDesignImageId but we don't have an imageId in the URL
          if (data.finalDesignImageId && !imageId) {
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set("imageId", data.finalDesignImageId)
            router.replace(currentUrl.toString())
          }
        }

        setProduct(data)
      } catch (err) {
        console.error("Error fetching product:", err)
        setError("Failed to load product. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, router, imageId])

  const handleProceedToPayment = (e) => {
    e.preventDefault()

    // Validate form
    if (!name || !email || !phone || !address) {
      setError("Please fill in all required fields")
      return
    }

    // Open payment method selection modal directly
    setIsPaymentModalOpen(true)
  }

  const handleSelectPaymentMethod = async (method) => {
    setSelectedPaymentMethod(method)

    if (method === "stripe") {
      await handleStripeCheckout()
    } else if (method === "delivery") {
      // Show delivery payment form
      setIsDeliveryFormOpen(true)
    }
  }

  const handleStripeCheckout = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: id,
          name,
          email,
          coupon,
          phone,
          address,
          color,
          size,
          isCustomProduct: isCustomProduct,
          customText,
          quantity,
          designImageId: imageId || null, // Pass the image ID instead of the full image
          designData: designData || null, // Pass the design data
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { id: sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
      await stripe.redirectToCheckout({ sessionId })
    } catch (err) {
      console.error("Error creating checkout session:", err)
      setError("Failed to process payment. Please try again.")
      setLoading(false)
    }
  }

  if (loading && !product) {
    return <LoadingSpinner siteTheme={siteTheme} />
  }

  if (error && !product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.back()}
              className="font-bold py-2 px-4 rounded"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
            >
              Go Back
            </button>
          </div>
        </main>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Product not found</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="font-bold py-2 px-4 rounded"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
            >
              Return to Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  // Determine if this is a custom product with a design image
  const hasCustomDesign = !!designImage || !!product.finalDesignImageId

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Checkout
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
              Order Summary
            </h2>
            <div className="flex mb-4">
              <div
                className="w-24 h-24 relative flex-shrink-0 rounded-md overflow-hidden"
                style={{
                  backgroundColor: designData?.backgroundColor || siteTheme.secondaryBgColor,
                }}
              >
                {designImage ? (
                  <Image
                    src={designImage || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                ) : product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ color: siteTheme.textColor }}
                  >
                    No Image
                  </div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold" style={{ color: siteTheme.textColor }}>
                  {product.name}
                </h3>
                <p style={{ color: siteTheme.textColor }}>${product.price.toFixed(2)}</p>
                {color && <p style={{ color: siteTheme.textColor }}>Color: {color}</p>}
                {size && <p style={{ color: siteTheme.textColor }}>Size: {size}</p>}
                {customText && <p style={{ color: siteTheme.textColor }}>Custom Text: {customText}</p>}
                <p style={{ color: siteTheme.textColor }}>Quantity: {quantity}</p>
                {hasCustomDesign && (
                  <p style={{ color: siteTheme.accentColor }} className="text-sm font-semibold mt-1">
                    Custom Design
                  </p>
                )}
              </div>
            </div>
            <div className="border-t pt-4" style={{ borderColor: siteTheme.borderColor }}>
              <div className="flex justify-between mb-2">
                <span style={{ color: siteTheme.textColor }}>Subtotal</span>
                <span style={{ color: siteTheme.textColor }}>${(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: siteTheme.textColor }}>Shipping</span>
                <span style={{ color: siteTheme.textColor }}>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span style={{ color: siteTheme.textColor }}>Total</span>
                <span style={{ color: siteTheme.textColor }}>${(product.price * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
              Customer Information
            </h2>

            <form onSubmit={handleProceedToPayment}>
              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="name"
                  style={{ color: siteTheme.textColor }}
                >
                  Full Name
                </label>
                <input
                  className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="email"
                  style={{ color: siteTheme.textColor }}
                >
                  Email
                </label>
                <input
                  className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

                             <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="coupon" style={{ color: siteTheme.textColor }}>
              Coupon Code (Optional)
            </label>
            <input
              className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
              id="coupon"
              type="text"
              placeholder="Enter coupon code"
              value={couponCode}
              onChange={(e) => setCoupon(e.target.value)}
            />
          </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="phone"
                  style={{ color: siteTheme.textColor }}
                >
                  Phone
                </label>
                <input
                  className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <label
                  className="block text-sm font-bold mb-2"
                  htmlFor="address"
                  style={{ color: siteTheme.textColor }}
                >
                  Shipping Address
                </label>
                <textarea
                  className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="flex items-center justify-between mt-4">
                <button
                  className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.accentColor,
                    color: siteTheme.textColor,
                    opacity: loading ? 0.7 : 1,
                  }}
                  type="submit"
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Proceed to Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSelectPaymentMethod={handleSelectPaymentMethod}
          productDetails={{
            name: product.name,
            price: product.price,
            color,
            size,
            quantity,
          }}
        />

        <DeliveryPaymentForm
          isOpen={isDeliveryFormOpen}
          onClose={() => setIsDeliveryFormOpen(false)}
          productDetails={{
            id,
            name: product.name,
            price: product.price,
            color,
            size,
            quantity,
            isCustomProduct: isCustomProduct,
            customText,
            designImageId: imageId || product.finalDesignImageId || null,
            designData: designData || null,
          }}
          customerInfo={{
            name,
            email,
            coupon,
            phone,
            address,
          }}
        />
      </main>
    </div>
  )
}
