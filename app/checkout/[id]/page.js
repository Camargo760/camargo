"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"
import PaymentModal from "../../../components/payment-modal"
import DeliveryPaymentForm from "../../../components/delivery-payment-form"
import SimpleCaptcha from "../../../components/SimpleCaptcha"
import { loadStripe } from "@stripe/stripe-js"
import { useSession } from "next-auth/react"

// Use React.use for params
import { use } from "react"

export default function Checkout({ params }) {
  // Unwrap params with React.use
  const id = use(params).id

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [isDeliveryFormOpen, setIsDeliveryFormOpen] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null)
  const [captchaVerified, setCaptchaVerified] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const color = searchParams.get("color") || ""
  const size = searchParams.get("size") || ""
  const customText = searchParams.get("customText") || ""
  const quantity = Number.parseInt(searchParams.get("quantity") || "1", 10)
  const isCustomProduct = searchParams.get("customProduct") === "true"

  useEffect(() => {
    // Pre-fill user details if logged in
    if (session && session.user) {
      setEmail(session.user.email || "")
      setName(session.user.name || "")
    }
  }, [session])

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Use id instead of params.id
        const endpoint = isCustomProduct ? `/api/customProducts/${id}` : `/api/products/${id}`
        const res = await fetch(endpoint)

        if (!res.ok) {
          throw new Error("Failed to fetch product")
        }

        const data = await res.json()
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
  }, [id, isCustomProduct])

  const handleProceedToPayment = (e) => {
    e.preventDefault()

    // Verify captcha first
    if (!captchaVerified) {
      setError("Please verify the captcha first")
      return
    }

    // Validate form
    if (!name || !email || !phone || !address) {
      setError("Please fill in all required fields")
      return
    }

    // Open payment method selection modal
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
          phone,
          address,
          color,
          size,
          isCustomProduct,
          customText,
          quantity,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create checkout session")
      }

      const { id: sessionId } = await response.json()

      // Redirect to Stripe Checkout
      const stripe = await loadStripe(
        "pk_test_51P2GkSSEzW86D25YUkzW9QoZE31ODA3vRCoQpwmKlue7nrsuj7MI0MVD5w8oVUXwsSYhjbV7Xvq2iNu12Mi6vpjQ00a8DAondY",
      )
      await stripe.redirectToCheckout({ sessionId })
    } catch (err) {
      console.error("Error creating checkout session:", err)
      setError("Failed to process payment. Please try again.")
      setLoading(false)
    }
  }

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified)
  }

  if (loading && !product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl font-semibold">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (error && !product) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.back()}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
      <div className="min-h-screen bg-gray-100">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p>Product not found</p>
          </div>
          <div className="flex justify-center">
            <button
              onClick={() => router.push("/")}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Return to Home
            </button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            <div className="flex mb-4">
              <div className="w-24 h-24 relative flex-shrink-0 bg-gray-200 rounded-md overflow-hidden">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
                )}
              </div>
              <div className="ml-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-600 text-sm">${product.price.toFixed(2)}</p>
                {color && <p className="text-gray-600 text-sm">Color: {color}</p>}
                {size && <p className="text-gray-600 text-sm">Size: {size}</p>}
                {customText && <p className="text-gray-600 text-sm">Custom Text: {customText}</p>}
                <p className="text-gray-600 text-sm">Quantity: {quantity}</p>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span>Subtotal</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${(product.price * quantity).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Customer Information</h2>
            <form onSubmit={handleProceedToPayment}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Full Name
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  Email
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Phone
                </label>
                <input
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="phone"
                  type="tel"
                  placeholder="(123) 456-7890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
                  Shipping Address
                </label>
                <textarea
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  id="address"
                  placeholder="123 Main St, City, State, ZIP"
                  rows="3"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <SimpleCaptcha onVerify={handleCaptchaVerify} />

              <div className="flex items-center justify-between mt-4">
                <button
                  className={`w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                    captchaVerified
                      ? "bg-blue-500 hover:bg-blue-700 text-white"
                      : "bg-gray-400 text-gray-200 cursor-not-allowed"
                  }`}
                  type="submit"
                  disabled={loading || !captchaVerified}
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
            isCustomProduct,
            customText,
          }}
          customerInfo={{
            name,
            email,
            phone,
            address,
          }}
        />
      </main>
    </div>
  )
}
