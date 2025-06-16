"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"
import { Tag } from "lucide-react"
import { useSession } from "next-auth/react"

import { use } from "react"

export default function Checkout({ params }) {
  const id = use(params).id

  const [product, setProduct] = useState(null)
  const [designImage, setDesignImage] = useState(null)
  const [designData, setDesignData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [couponCode, setCouponCode] = useState("")
  const [phone, setPhone] = useState("")
  const [couponValidation, setCouponValidation] = useState(null)
  const [discountedPrice, setDiscountedPrice] = useState(0)
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

    fetchSiteTheme()
  }, [])

  useEffect(() => {
    const fetchDesignImage = async () => {
      if (!imageId) return

      try {
        const res = await fetch(`/api/customProductImages?id=${imageId}`)
        if (!res.ok) {
          return
        }

        const data = await res.json()
        setDesignImage(data.imageData)

        if (data.designData) {
          setDesignData(data.designData)
        }
      } catch (err) {
      }
    }

    fetchDesignImage()
  }, [imageId])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        let res = await fetch(`/api/products/${id}`)
        let isCustom = false

        if (!res.ok) {
          res = await fetch(`/api/customProducts/${id}`)
          isCustom = true

          if (!res.ok) {
            throw new Error("Failed to fetch product from both collections")
          }
        }

        const data = await res.json()

        if (isCustom) {
          const currentUrl = new URL(window.location.href)
          if (!currentUrl.searchParams.has("customProduct")) {
            currentUrl.searchParams.set("customProduct", "true")
            router.replace(currentUrl.toString())
          }

          if (data.finalDesignImageId && !imageId) {
            const currentUrl = new URL(window.location.href)
            currentUrl.searchParams.set("imageId", data.finalDesignImageId)
            router.replace(currentUrl.toString())
          }
        }

        setProduct(data)
        setDiscountedPrice(data.price)
      } catch (err) {
        setError("Failed to load product. Please try again.")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id, router, imageId])

  useEffect(() => {
    const validateCoupon = async () => {
      if (!couponCode || !couponCode.trim()) {
        setCouponValidation(null)
        setDiscountedPrice(product?.price || 0)
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
          const newPrice = (product?.price || 0) * (1 - couponData.discountPercentage / 100)
          setDiscountedPrice(newPrice)
        } else {
          setCouponValidation(null)
          setDiscountedPrice(product?.price || 0)
        }
      } catch (err) {
        setCouponValidation(null)
        setDiscountedPrice(product?.price || 0)
      }
    }

    if (product) {
      validateCoupon()
    }
  }, [couponCode, product])

  const handleProceedToPayment = (e) => {
    e.preventDefault()

    if (!phone || !phone.trim()) {
      setError("Phone number is required")
      return
    }

    const checkoutData = {
      productId: id,
      productName: product.name,
      productPrice: product.price,
      discountedPrice,
      color,
      size,
      customText,
      quantity,
      isCustomProduct,
      imageId: imageId || product.finalDesignImageId || null,
      designData: designData || null,
      category: product?.category || null,
      phone,
      couponCode: couponValidation ? couponCode.trim() : null,
      couponValidation,
    }

    sessionStorage.setItem("checkoutData", JSON.stringify(checkoutData))

    router.push("/payment-method")
  }

  if (loading && !product) {
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

  const hasCustomDesign = !!designImage || !!product.finalDesignImageId
  const totalPrice = discountedPrice * quantity

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

        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-lg p-6 mb-6"
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
              <div className="ml-4 flex-1">
                <h3 className="font-semibold" style={{ color: siteTheme.textColor }}>
                  {product.name}
                </h3>
                <p style={{ color: siteTheme.textColor }}>${product.price.toFixed(2)}</p>
                {product.category && <p style={{ color: siteTheme.textColor }}>Category: {product.category}</p>}
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
              {couponValidation && (
                <>
                  <div className="flex justify-between mb-2" style={{ color: siteTheme.accentColor }}>
                    <span className="flex items-center">
                      <Tag size={14} className="mr-1" />
                      Coupon ({couponCode.toUpperCase()}): -{couponValidation.discountPercentage}%
                    </span>
                    <span>-${(product.price * quantity - totalPrice).toFixed(2)}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between mb-2">
                <span style={{ color: siteTheme.textColor }}>Shipping</span>
                <span style={{ color: siteTheme.textColor }}>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span style={{ color: siteTheme.textColor }}>Total</span>
                <span style={{ color: siteTheme.textColor }}>${totalPrice.toFixed(2)}</span>
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
              Checkout Information
            </h2>

            <form onSubmit={handleProceedToPayment}>
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
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                />
                {couponValidation && (
                  <p className="text-sm mt-1" style={{ color: siteTheme.accentColor }}>
                    ✓ Coupon applied: {couponValidation.discountPercentage}% off
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold mb-2" htmlFor="phone" style={{ color: siteTheme.textColor }}>
                  Phone Number *
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

              <div className="flex items-center justify-between">
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
      </main>
    </div>
  )
}
