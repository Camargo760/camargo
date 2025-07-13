"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../../components/Header"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductDetail({ params }) {
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedColor, setSelectedColor] = useState("")
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [currentImage, setCurrentImage] = useState(0)

  // Zoom functionality states
  const [zoomLevel, setZoomLevel] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  // Touch handling states
  const [touchStart, setTouchStart] = useState(null)
  const [lastTouchDistance, setLastTouchDistance] = useState(0)
  const [initialZoomLevel, setInitialZoomLevel] = useState(1)
  const [touchCenter, setTouchCenter] = useState({ x: 0, y: 0 })

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

  // Touch utility functions
  const getTouchDistance = (touch1, touch2) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getTouchCenter = (touch1, touch2) => {
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }

  // Zoom at specific point
  const zoomAtPoint = (newZoomLevel, mouseX, mouseY) => {
    const container = imageContainerRef.current
    if (!container) return

    const containerRect = container.getBoundingClientRect()

    const mouseRelativeX = mouseX - containerRect.left - containerRect.width / 2
    const mouseRelativeY = mouseY - containerRect.top - containerRect.height / 2

    const zoomRatio = newZoomLevel / zoomLevel
    const newX = mouseRelativeX - (mouseRelativeX - zoomPosition.x) * zoomRatio
    const newY = mouseRelativeY - (mouseRelativeY - zoomPosition.y) * zoomRatio

    setZoomLevel(newZoomLevel)

    if (newZoomLevel > 1) {
      const maxX = (containerRect.width * (newZoomLevel - 1)) / 2
      const maxY = (containerRect.height * (newZoomLevel - 1)) / 2

      setZoomPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      })
    } else {
      setZoomPosition({ x: 0, y: 0 })
    }
  }

  // Zoom functions
  const handleZoomIn = (mouseX, mouseY) => {
    const newZoomLevel = Math.min(zoomLevel * 1.5, 5)
    if (mouseX !== undefined && mouseY !== undefined) {
      zoomAtPoint(newZoomLevel, mouseX, mouseY)
    } else {
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

  // Mouse event handlers
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
        y: e.clientY - zoomPosition.y,
      })
    }
  }

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      const newX = e.clientX - dragStart.x
      const newY = e.clientY - dragStart.y

      const container = imageContainerRef.current
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const maxX = (containerRect.width * (zoomLevel - 1)) / 2
        const maxY = (containerRect.height * (zoomLevel - 1)) / 2

        setZoomPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        })
      }
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Touch event handlers
  const handleTouchStart = (e) => {
    e.preventDefault()

    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])

      setLastTouchDistance(distance)
      setInitialZoomLevel(zoomLevel)
      setTouchCenter(center)
      setTouchStart({ touches: [...e.touches], center })
    } else if (e.touches.length === 1 && zoomLevel > 1) {
      setIsDragging(true)
      setDragStart({
        x: e.touches[0].clientX - zoomPosition.x,
        y: e.touches[0].clientY - zoomPosition.y,
      })
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()

    if (e.touches.length === 2 && touchStart) {
      const distance = getTouchDistance(e.touches[0], e.touches[1])
      const center = getTouchCenter(e.touches[0], e.touches[1])

      if (lastTouchDistance > 0) {
        const scale = distance / lastTouchDistance
        let newZoomLevel = initialZoomLevel * scale

        newZoomLevel = Math.max(1, Math.min(5, newZoomLevel))

        zoomAtPoint(newZoomLevel, touchStart.center.x, touchStart.center.y)
      }
    } else if (e.touches.length === 1 && isDragging && zoomLevel > 1) {
      const newX = e.touches[0].clientX - dragStart.x
      const newY = e.touches[0].clientY - dragStart.y

      const container = imageContainerRef.current
      if (container) {
        const containerRect = container.getBoundingClientRect()
        const maxX = (containerRect.width * (zoomLevel - 1)) / 2
        const maxY = (containerRect.height * (zoomLevel - 1)) / 2

        setZoomPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        })
      }
    }
  }

  const handleTouchEnd = (e) => {
    e.preventDefault()

    if (e.touches.length === 0) {
      setIsDragging(false)
      setTouchStart(null)
      setLastTouchDistance(0)
      setInitialZoomLevel(zoomLevel)
    } else if (e.touches.length === 1) {
      setTouchStart(null)
      setLastTouchDistance(0)
      setInitialZoomLevel(zoomLevel)
    }
  }

  const handleBuyNow = () => {
    if (!product) return

    if (product.availableColors && product.availableColors.length > 0 && !selectedColor) {
      alert("Please select a color")
      return
    }

    if (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) {
      alert("Please select a size")
      return
    }

    // Redirect to checkout
    router.push(`/checkout/${id}?color=${encodeURIComponent(selectedColor)}&size=${selectedSize}&quantity=${quantity}`)
  }

  const nextImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1))
    }
  }

  const prevImage = () => {
    if (product?.images && product.images.length > 1) {
      setCurrentImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1))
    }
  }

  // Generate unique ID for this component instance to avoid style conflicts
  const uniqueId = `custom-html-${id}`

  // Function to process custom HTML/CSS and make it scoped
  const processCustomHTML = (htmlContent) => {
    if (!htmlContent) return ""

    // Extract style tags and scope them
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi
    let processedHTML = htmlContent

    // Replace style tags with scoped versions
    processedHTML = processedHTML.replace(styleRegex, (match, cssContent) => {
      // Clean up the CSS content
      let cleanCSS = cssContent.trim()

      // Handle CSS rules and scope them properly
      const scopedCSS = cleanCSS
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments first
        .split('}')
        .map((rule) => {
          if (!rule.trim()) return ''

          const trimmedRule = rule.trim()
          if (!trimmedRule.includes('{')) return trimmedRule

          const [selector, ...declarations] = trimmedRule.split('{')
          const cleanSelector = selector.trim()
          const declarationBlock = declarations.join('{').trim()

          // Handle special CSS rules that shouldn't be scoped
          if (cleanSelector.startsWith('@keyframes')) {
            // Make keyframes unique to this container
            const keyframeName = cleanSelector.replace('@keyframes', '').trim()
            return `@keyframes ${uniqueId}-${keyframeName} { ${declarationBlock} }`
          }

          if (cleanSelector.startsWith('@media')) {
            // For media queries, we need to scope the inner rules
            const mediaRule = declarationBlock
            const scopedMediaRule = mediaRule.replace(/([^{}]+)\s*\{([^{}]*)\}/g, (innerMatch, innerSelector, innerDeclarations) => {
              const cleanInnerSelector = innerSelector.trim()
              if (cleanInnerSelector.startsWith('@')) return innerMatch

              // Scope each selector in the media query
              const scopedInnerSelectors = cleanInnerSelector
                .split(',')
                .map(s => {
                  const trimmedS = s.trim()
                  // Don't scope if it's already scoped or if it's a special selector
                  if (trimmedS.includes(`#${uniqueId}`) || trimmedS.startsWith(':root') || trimmedS.startsWith('*')) {
                    return trimmedS
                  }
                  return `#${uniqueId} ${trimmedS}`
                })
                .join(', ')

              return `${scopedInnerSelectors} { ${innerDeclarations} }`
            })

            return `${cleanSelector} { ${scopedMediaRule} }`
          }

          // Handle other @ rules (like @font-face, @import, etc.)
          if (cleanSelector.startsWith('@')) {
            return `${cleanSelector} { ${declarationBlock} }`
          }

          // For regular selectors, scope them to the container
          const scopedSelectors = cleanSelector
            .split(',')
            .map((s) => {
              const trimmedS = s.trim()

              // Don't scope if it's already scoped
              if (trimmedS.includes(`#${uniqueId}`)) {
                return trimmedS
              }

              // Don't scope universal selectors, :root, html, body
              if (trimmedS === '*' || trimmedS === ':root' || trimmedS === 'html' || trimmedS === 'body') {
                return `#${uniqueId}`
              }

              // Handle pseudo-selectors properly
              if (trimmedS.startsWith(':')) {
                return `#${uniqueId}${trimmedS}`
              }

              return `#${uniqueId} ${trimmedS}`
            })
            .join(', ')

          return `${scopedSelectors} { ${declarationBlock} }`
        })
        .filter(rule => rule.trim()) // Remove empty rules
        .join(' } ') + (cleanCSS ? ' }' : '')

      // Update keyframe references in the scoped CSS
      const finalCSS = scopedCSS.replace(
        /animation(-name)?:\s*([^;,\s]+)/g,
        (match, prop, animationName) => {
          const cleanAnimationName = animationName.trim()
          return match.replace(cleanAnimationName, `${uniqueId}-${cleanAnimationName}`)
        }
      )

      return `<style>${finalCSS}</style>`
    })

    return processedHTML
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
          {/* Product Images with Zoom */}
          <div>
            <div className="relative mb-4">
              <div
                ref={imageContainerRef}
                className="relative h-96 w-full rounded-lg overflow-hidden"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                  cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "default",
                  touchAction: "none", // Prevent default touch behaviors
                }}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {product.images && product.images.length > 0 ? (
                  <>
                    <div
                      style={{
                        transform: `scale(${zoomLevel}) translate(${zoomPosition.x / zoomLevel}px, ${zoomPosition.y / zoomLevel}px)`,
                        transition: isDragging ? "none" : "transform 0.2s ease-out",
                        transformOrigin: "center center",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <Image
                        src={product.images[currentImage] || "/placeholder.svg"}
                        alt={product.name || product.title}
                        fill
                        style={{ objectFit: "contain" }}
                        draggable={false}
                      />
                    </div>

                    {product.images.length > 1 && zoomLevel === 1 && (
                      <>
                        <button
                          onClick={prevImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2"
                          aria-label="Previous image"
                        >
                          <ChevronLeft size={24} color="white" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2"
                          aria-label="Next image"
                        >
                          <ChevronRight size={24} color="white" />
                        </button>
                      </>
                    )}
                  </>
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
                <div
                  className="absolute bottom-4 right-4 px-2 py-1 rounded text-sm"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  {Math.round(zoomLevel * 100)}%
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="text-sm mb-4 opacity-70" style={{ color: siteTheme.textColor }}>
              Use mouse wheel to zoom • Pinch with two fingers on mobile • Click and drag to pan when zoomed
            </div>

            {/* Image Thumbnails */}
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
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`${product.name || product.title} - Image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
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
              {product.name || product.title}
            </h1>
            <p className="text-2xl font-bold mb-4" style={{ color: siteTheme.accentColor }}>
              ${product.price.toFixed(2)}
            </p>
            <p className="mb-6" style={{ color: siteTheme.textColor }}>
              {product.description || "No description available"}
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
                      className={`px-4 py-2 rounded-md ${selectedColor === color ? "ring-2" : ""}`}
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
                      className={`px-4 py-2 rounded-md ${selectedSize === size ? "ring-2" : ""}`}
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
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
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

            {/* Action Button */}
            <div className="mb-8">
              <button
                onClick={handleBuyNow}
                className="w-full py-3 px-6 rounded-md font-semibold"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                Buy Now
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-8">
              <p className="text-sm" style={{ color: siteTheme.textColor }}>
                Category: <span className="font-semibold">{product.category || "Uncategorized"}</span>
              </p>
              {product.material && (
                <p className="text-sm mt-1" style={{ color: siteTheme.textColor }}>
                  Material: <span className="font-semibold">{product.material}</span>
                </p>
              )}
              {product.dimensions && (
                <p className="text-sm mt-1" style={{ color: siteTheme.textColor }}>
                  Dimensions: <span className="font-semibold">{product.dimensions}</span>
                </p>
              )}
              <p className="text-sm mt-1" style={{ color: siteTheme.textColor }}>
                SKU: <span className="font-semibold">{product._id.substring(0, 8).toUpperCase()}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Rich Description Section - ONLY SHOWS HERE */}
        {product.richDescription && (
          <div className="mt-12">
            <div
              className="rounded-lg p-8"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6 pb-4 border-b"
                style={{
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                }}
              >
                DESCRIPTION
              </h2>
              <div
                className="prose prose-lg max-w-none product-description"
                style={{ color: siteTheme.textColor }}
                dangerouslySetInnerHTML={{ __html: product.richDescription }}
              />
            </div>
          </div>
        )}

        {/* Custom HTML/CSS Section - PROPERLY SCOPED AND ISOLATED */}
        {product.htmlCssCode && (
          <div className="mt-12">
            <div
              className="rounded-lg p-4 sm:p-8"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            >
              <h2
                className="text-2xl font-bold mb-6 pb-4 border-b"
                style={{
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                }}
              >
                ADDITIONAL DETAILS
              </h2>

              {/* Custom HTML with properly scoped styles and isolation */}
              <div
                id={uniqueId}
                className="custom-html-container"
                style={{
                  isolation: 'isolate', // CSS isolation
                  contain: 'layout style', // CSS containment
                  overflow: 'hidden', // Prevent overflow
                }}
                dangerouslySetInnerHTML={{ __html: processCustomHTML(product.htmlCssCode) }}
              />
            </div>
          </div>
        )}

        {/* Custom styles for product description lists */}
        <style jsx>{`
          .product-description {
            direction: ltr !important;
            text-align: left !important;
            writing-mode: horizontal-tb !important;
          }
          
          .product-description * {
            direction: ltr !important;
            unicode-bidi: normal !important;
          }
          
          .product-description ul {
            list-style-type: disc !important;
            padding-left: 20px !important;
            margin-left: 10px !important;
            margin-bottom: 16px !important;
            direction: ltr !important;
          }

          .product-description ol {
            list-style-type: decimal !important;
            padding-left: 20px !important;
            margin-left: 10px !important;
            margin-bottom: 16px !important;
            direction: ltr !important;
          }

          .product-description li {
            margin-bottom: 8px !important;
            padding-left: 8px !important;
            line-height: 1.6 !important;
            display: list-item !important;
            direction: ltr !important;
            text-align: left !important;
          }

          .product-description ul li {
            list-style-type: disc !important;
          }

          .product-description ol li {
            list-style-type: decimal !important;
          }

          .product-description li::marker {
            color: #fff !important;
            font-weight: bold !important;
          }

          .product-description li::before {
            content: "• " !important;
            color: #fff !important;
            font-weight: bold !important;
            margin-right: 8px !important;
          }

          .product-description ol li::before {
            content: none !important;
          }

          .product-description p {
            margin-bottom: 12px !important;
            line-height: 1.6 !important;
            direction: ltr !important;
            text-align: left !important;
          }

          .product-description h1,
          .product-description h2,
          .product-description h3,
          .product-description h4,
          .product-description h5,
          .product-description h6 {
            margin-top: 24px !important;
            margin-bottom: 12px !important;
            font-weight: bold !important;
            direction: ltr !important;
            text-align: left !important;
          }

          .product-description a {
            color: #3b82f6 !important;
            text-decoration: underline !important;
          }

          .product-description a:hover {
            color: #1d4ed8 !important;
          }

          /* Container for custom HTML - basic styling */

          /* Container for custom HTML - enhanced isolation and styling */
.custom-html-container {
  width: 100%;
  overflow-x: auto;
  position: relative;
  isolation: isolate;
  contain: layout style;
  z-index: 1;
}

.custom-html-container * {
  max-width: 100%;
  box-sizing: border-box;
}

/* Reset any potentially problematic styles within the container */
.custom-html-container {
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
}

/* Prevent global styles from leaking out */
.custom-html-container > * {
  all: revert;
}

/* Ensure the container doesn't affect parent elements */
.custom-html-container::before,
.custom-html-container::after {
  content: none;
}

/* Additional safety for animations and transitions */
.custom-html-container * {
  animation-duration: inherit;
  transition-duration: inherit;
}
        `}</style>
      </main>
    </div>
  )
}
