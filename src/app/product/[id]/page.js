// product/[id]/page.js
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch product
        const productRes = await fetch(`/api/products/${id}`)
        if (!productRes.ok) {
          throw new Error("Failed to fetch product")
        }
        const productData = await productRes.json()
        setProduct(productData)

        // Set default color and size if available
        if (productData.availableColors && productData.availableColors.length > 0) {
          setSelectedColor(productData.availableColors[0])
        }
        if (productData.availableSizes && productData.availableSizes.length > 0) {
          setSelectedSize(productData.availableSizes[0])
        }

        // Fetch site theme
        const themeRes = await fetch("/api/site-theme")
        if (themeRes.ok) {
          const themeData = await themeRes.json()
          if (themeData.theme) {
            setSiteTheme(themeData.theme)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load product")
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchData()
    }
  }, [id])

  const handleBuyNow = () => {
    if (!selectedColor) {
      alert("Please select a color")
      return
    }
    if (!selectedSize) {
      alert("Please select a size")
      return
    }

    // Redirect to checkout
    router.push(`/checkout/${id}?color=${encodeURIComponent(selectedColor)}&size=${selectedSize}&quantity=${quantity}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <div className="container mx-auto py-8 px-4 flex justify-center items-center h-64">
          <div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
            style={{ borderColor: siteTheme.accentColor }}
          ></div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error || "Product not found"}</p>
          </div>
          <button
            onClick={() => router.push("/products")}
            className="px-4 py-2 rounded"
            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
          >
            Back to Products
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div
              className="relative h-96 w-full rounded-lg overflow-hidden mb-4"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            >
              {product.images && product.images.length > 0 ? (
                <Image
                  src={product.images[currentImage] || "/assets/placeholder.svg"}
                  alt={product.name}
                  fill
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span style={{ color: siteTheme.textColor }}>No Image</span>
                </div>
              )}
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImage(index)}
                    className={`relative h-20 w-20 rounded-md overflow-hidden ${currentImage === index ? "ring-2" : ""
                      }`}
                    style={{
                      backgroundColor: siteTheme.secondaryBgColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                      ringColor: siteTheme.accentColor,
                    }}
                  >
                    <Image src={image || "/assets/placeholder.svg"} alt={`${product.name} - Image ${index + 1}`} fill style={{ objectFit: "cover" }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div
            className="rounded-lg p-6"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <h1 className="text-3xl font-bold mb-2" style={{ color: siteTheme.textColor }}>
              {product.name}
            </h1>
            <p className="text-2xl font-bold mb-4" style={{ color: siteTheme.accentColor }}>
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-6" style={{ color: siteTheme.textColor }}>
              {product.description}
            </p>

              <p className="text-sm mb-4" style={{ color: siteTheme.textColor }}>
                Category: <span className="font-semibold">{product.category}</span>
              </p>

            {/* Color Selection */}
            {product.availableColors && product.availableColors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: siteTheme.textColor }}>
                  Color
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-md ${selectedColor === color ? "ring-2" : ""
                        }`}
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                        borderWidth: "1px",
                        ringColor: siteTheme.accentColor,
                      }}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.availableSizes && product.availableSizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: siteTheme.textColor }}>
                  Size
                </h3>
                <div className="flex flex-wrap gap-2">
                  {product.availableSizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-md ${selectedSize === size ? "ring-2" : ""
                        }`}
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                        borderWidth: "1px",
                        ringColor: siteTheme.accentColor,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2" style={{ color: siteTheme.textColor }}>
                Quantity
              </h3>
              <div className="flex items-center">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-1 rounded-l"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center py-1"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-1 rounded-r"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",

                  }}
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row">
              <button
                onClick={handleBuyNow}
                className="flex-1 py-3 px-6 rounded-md font-semibold"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
