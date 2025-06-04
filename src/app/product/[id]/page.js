// product/[id]/page.js
"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"
import LoadingSpinner from "../../../components/LoadingSpinner"

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
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
  const imageContainerRef = useRef(null)

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

  // Reset zoom when image changes
  useEffect(() => {
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }, [currentImage])

  const zoomAtPoint = (newZoomLevel, mouseX, mouseY) => {
    const container = imageContainerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()
    
    // Calculate mouse position relative to container center
    const mouseRelativeX = mouseX - containerRect.left - containerRect.width / 2
    const mouseRelativeY = mouseY - containerRect.top - containerRect.height / 2
    
    // Calculate the new position to keep the mouse point fixed
    const zoomRatio = newZoomLevel / zoomLevel
    const newX = mouseRelativeX - (mouseRelativeX - zoomPosition.x) * zoomRatio
    const newY = mouseRelativeY - (mouseRelativeY - zoomPosition.y) * zoomRatio
    
    // Apply zoom and position
    setZoomLevel(newZoomLevel)
    
    if (newZoomLevel > 1) {
      // Limit boundaries
      const maxX = (containerRect.width * (newZoomLevel - 1)) / 2
      const maxY = (containerRect.height * (newZoomLevel - 1)) / 2
      
      setZoomPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY))
      })
    } else {
      setZoomPosition({ x: 0, y: 0 })
    }
  }

  const handleZoomIn = (mouseX, mouseY) => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 5)
    if (mouseX !== undefined && mouseY !== undefined) {
      zoomAtPoint(newZoomLevel, mouseX, mouseY)
    } else {
      // Default to center if no mouse position provided
      const container = imageContainerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        zoomAtPoint(newZoomLevel, rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }
  }

  const handleZoomOut = (mouseX, mouseY) => {
    const newZoomLevel = Math.max(zoomLevel / 1.5, 1)
    if (mouseX !== undefined && mouseY !== undefined) {
      zoomAtPoint(newZoomLevel, mouseX, mouseY)
    } else {
      // Default to center if no mouse position provided
      const container = imageContainerRef.current
      if (container) {
        const rect = container.getBoundingClientRect()
        zoomAtPoint(newZoomLevel, rect.left + rect.width / 2, rect.top + rect.height / 2)
      }
    }
  }

  const handleResetZoom = () => {
    setZoomLevel(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const handleWheel = (e) => {
    e.preventDefault()
    if (e.deltaY < 0) {
      handleZoomIn(e.clientX, e.clientY)
    } else {
      handleZoomOut(e.clientX, e.clientY)
    }
  }

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.clientX - zoomPosition.x,
        y: e.clientY - zoomPosition.y
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y
      
      // Limit drag boundaries
      const container = imageContainerRef.current
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const maxX = (containerRect.width * (zoomLevel - 1)) / 2
        const maxY = (containerRect.height * (zoomLevel - 1)) / 2
        
        setZoomPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY))
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

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
    return <LoadingSpinner siteTheme={siteTheme} />
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
            {/* Current image box with zoom functionality */}
            <div className="relative mb-4">
              <div
                ref={imageContainerRef}
                className="relative h-96 w-full rounded-lg overflow-hidden cursor-grab"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                  cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {product.images && product.images.length > 0 ? (
                  <div
                    style={{
                      transform: `scale(${zoomLevel}) translate(${zoomPosition.x / zoomLevel}px, ${zoomPosition.y / zoomLevel}px)`,
                      transition: isDragging ? 'none' : 'transform 0.2s ease-out',
                      transformOrigin: 'center center',
                      width: '100%',
                      height: '100%',
                      position: 'relative'
                    }}
                  >
                    <Image
                      src={product.images[currentImage] || "/assets/placeholder.svg"}
                      alt={product.name}
                      fill
                      style={{ objectFit: "contain" }}
                      draggable={false}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span style={{ color: siteTheme.textColor }}>No Image</span>
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <button
                  onClick={() => handleZoomIn()}
                  disabled={zoomLevel >= 5}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  title="Zoom In"
                >
                  +
                </button>
                <button
                  onClick={() => handleZoomOut()}
                  disabled={zoomLevel <= 1}
                  className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-80 transition-opacity"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                  title="Zoom Out"
                >
                  −
                </button>
                {zoomLevel > 1 && (
                  <button
                    onClick={handleResetZoom}
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold hover:opacity-80 transition-opacity"
                    style={{
                      backgroundColor: siteTheme.accentColor,
                      color: siteTheme.textColor,
                    }}
                    title="Reset Zoom"
                  >
                    1:1
                  </button>
                )}
              </div>

              {/* Zoom Level Indicator */}
              {zoomLevel > 1 && (
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded text-sm"
                     style={{
                       backgroundColor: siteTheme.cardBgColor,
                       color: siteTheme.textColor,
                       borderColor: siteTheme.borderColor,
                       borderWidth: "1px",
                     }}>
                  {Math.round(zoomLevel * 100)}%
                </div>
              )}
            </div>

            {/* Zoom Instructions */}
            <div className="text-sm mb-4 opacity-70" style={{ color: siteTheme.textColor }}>
              Use mouse wheel to zoom • Click and drag to pan when zoomed
            </div>

            {/* Thumbnail images */}
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
