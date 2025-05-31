"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Upload, Type } from "lucide-react"
import html2canvas from "html2canvas"
import Header from "@/components/Header"

export default function CustomOrder() {
  const [currentBgColor, setCurrentBgColor] = useState("#1a1a1a")
  const [selectedSize, setSelectedSize] = useState("S")
  const [customText, setCustomText] = useState("")
  const [customTextColor, setCustomTextColor] = useState("#ffffff")
  const [customTextFont, setCustomTextFont] = useState("font-['Kanit']")
  const [customTextSize, setCustomTextSize] = useState("text-4xl")
  const [customTextFontSize, setCustomTextFontSize] = useState(24) // Default font size in px
  const [uploadedImage, setUploadedImage] = useState(null)
  const [fileName, setFileName] = useState("No file chosen")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(false)
  const [finalDesignImage, setFinalDesignImage] = useState(null)
  const [showTextOptions, setShowTextOptions] = useState(false)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const router = useRouter()
  const canvasRef = useRef(null)

  useEffect(() => {
    const fetchSiteTheme = async () => {
      try {
        const res = await fetch("/api/site-theme")
        if (res.ok) {
          const data = await res.json()
          if (data.theme) {
            setSiteTheme(data.theme)
            // Set the current background color to the card background color from the theme
            setCurrentBgColor(data.theme.cardBgColor)
          }
        }
      } catch (err) {
        console.error("Error fetching site theme:", err)
      }
    }

    fetchSiteTheme()
  }, [])

  const colorOptions = [
    { color: "#1a1a1a", title: "Black" },
    { color: "#ffffff", title: "White" },
    { color: "#808080", title: "Grey" },
    { color: "#36454F", title: "Charcoal Grey" },
    { color: "#A0522D", title: "Brown" },
    { color: "#F5F5DC", title: "Beige" },
    { color: "#ff3e00", title: "Orange" },
    { color: "#0a84ff", title: "Blue" },
    { color: "#30d158", title: "Green" },
    { color: "#5e5ce6", title: "Purple" },
    { color: "#FFD700", title: "Gold" },
    { color: "#FF1493", title: "Pink" },
  ]

  const textColorOptions = [
    { color: "#ffffff", title: "White" },
    { color: "#000000", title: "Black" },
    { color: "#ff3e00", title: "Orange" },
    { color: "#0a84ff", title: "Blue" },
    { color: "#30d158", title: "Green" },
    { color: "#5e5ce6", title: "Purple" },
    { color: "#FFD700", title: "Gold" },
    { color: "#FF1493", title: "Pink" },
    { color: "#ff0000", title: "Red" },
    { color: "#ffff00", title: "Yellow" },
  ]

  const fontOptions = [
    { value: "font-['Kanit']", label: "Kanit" },
    { value: "font-['Arial']", label: "Arial" },
    { value: "font-['Helvetica']", label: "Helvetica" },
    { value: "font-['Times_New_Roman']", label: "Times New Roman" },
    { value: "font-['Georgia']", label: "Georgia" },
    { value: "font-['Courier_New']", label: "Courier New" },
    { value: "font-['Verdana']", label: "Verdana" },
    { value: "font-['Tahoma']", label: "Tahoma" },
  ]

  const textSizeOptions = [
    { value: "text-xl", label: "Small", size: 16 },
    { value: "text-2xl", label: "Medium", size: 20 },
    { value: "text-3xl", label: "Large", size: 24 },
    { value: "text-4xl", label: "Extra Large", size: 28 },
    { value: "text-5xl", label: "Huge", size: 32 },
  ]

  const sizeOptions = ["S", "M", "L", "XL", "XXL"]

  // Function to get color title from color value
  const getColorTitle = (colorValue) => {
    const colorOption = colorOptions.find((option) => option.color === colorValue)
    return colorOption ? colorOption.title : colorValue
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        e.target.value = ""
        setFileName("No file chosen")
        return
      }

      setFileName(file.name)

      const reader = new FileReader()
      reader.onload = (event) => {
        setUploadedImage(event.target.result)
      }
      reader.readAsDataURL(file)
    } else {
      setFileName("No file chosen")
      setUploadedImage(null)
    }
  }

  // Capture the design as an image
  const captureDesign = async () => {
    if (!canvasRef.current) return null

    try {
      // Use html2canvas directly on the canvas element
      const canvas = await html2canvas(canvasRef.current, {
        backgroundColor: currentBgColor,
        scale: 2, // Higher quality
        logging: false,
        useCORS: true, // To handle cross-origin images
      })

      return canvas.toDataURL("image/png")
    } catch (error) {
      console.error("Error capturing design:", error)
      return null
    }
  }

  // Store the design image in the database
  const storeDesignImage = async (imageData, productId) => {
    try {
      // Prepare simple design data for storage
      const designData = {
        backgroundColor: currentBgColor,
        customText: customText,
        customTextColor: customTextColor,
        customTextFont: customTextFont,
        customTextSize: customTextSize,
        customImage: uploadedImage,
      }

      const response = await fetch("/api/customProductImages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          imageData,
          productId,
          designData, // Include the design data
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to store design image")
      }

      const data = await response.json()
      return data.id // Return the image ID
    } catch (error) {
      console.error("Error storing design image:", error)
      return null
    }
  }

  const handlePlaceOrder = async () => {
    setLoading(true)
    try {
      // Capture the design as an image
      const designImage = await captureDesign()

      if (!designImage) {
        throw new Error("Failed to capture design")
      }

      setFinalDesignImage(designImage)

      // Get the color title instead of the color value
      const colorTitle = getColorTitle(currentBgColor)

      // Create a custom product in the database
      const customProduct = {
        name: "Custom Designed T-Shirt",
        description: "Personalized t-shirt with custom design",
        price: 29.99,
        category: "Custom",
        published: true,
        availableColors: [currentBgColor],
        availableSizes: [selectedSize],
        customText: customText,
        customImage: uploadedImage,
        textCustomization: {
          color: customTextColor,
          font: customTextFont,
          size: customTextSize,
        },
      }

      // Create the custom product first
      const productResponse = await fetch("/api/customProducts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customProduct),
      })

      if (!productResponse.ok) {
        throw new Error("Failed to create custom product")
      }

      const productData = await productResponse.json()
      const productId = productData.id

      // Now store the design image and get its ID
      const imageId = await storeDesignImage(designImage, productId)

      if (!imageId) {
        throw new Error("Failed to store design image")
      }

      // Update the product with the image ID reference
      const updateResponse = await fetch(`/api/customProducts/${productId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          finalDesignImageId: imageId,
        }),
      })

      if (!updateResponse.ok) {
        throw new Error("Failed to update product with image reference")
      }

      // Redirect to checkout with the new product ID and color title
      router.push(
        `/checkout/${productId}?color=${encodeURIComponent(colorTitle)}&size=${selectedSize}&price=29.99&customText=${encodeURIComponent(customText)}&quantity=${quantity}&customProduct=true&imageId=${imageId}`,
      )
    } catch (error) {
      console.error("Error creating custom product:", error)
      alert("Failed to process your order. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}
    >
      <Header />
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto my-12 px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className="sm:p-8 p-4 rounded-lg text-center relative overflow-hidden"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div
                ref={canvasRef}
                className="w-full h-[400px] md:h-[500px] mb-6 flex flex-col items-center justify-center relative overflow-hidden rounded border"
                style={{
                  backgroundColor: currentBgColor,
                  minHeight: "400px", // Ensure minimum height
                  borderColor: siteTheme.borderColor,
                }}
              >
                {/* Static centered design */}
                {uploadedImage && (
                  <div className="mb-4 relative" style={{ maxWidth: "60%", maxHeight: "60%" }}>
                    <img
                      src={uploadedImage || "/placeholder.svg"}
                      alt="Custom Design"
                      style={{
                        maxWidth: "100%",
                        maxHeight: "200px",
                        display: "block",
                        margin: "0 auto",
                      }}
                    />
                  </div>
                )}

                {customText && (
                  <div
                    className={`${customTextFont} font-bold text-center mt-4`}
                    style={{
                      color: customTextColor,
                      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.7)",
                      padding: "8px",
                      borderRadius: "4px",
                      backgroundColor: "rgba(0, 0, 0, 0.2)",
                      fontSize: `${customTextFontSize}px`,
                      maxWidth: "80%",
                      wordBreak: "break-word",
                    }}
                  >
                    {customText}
                  </div>
                )}

                {!uploadedImage && !customText && (
                  <div className="font-['Kanit'] text-4xl font-bold text-white text-shadow">YOUR DESIGN</div>
                )}
              </div>
              <h2
                className="font-['Kanit'] text-2xl uppercase tracking-wide mt-0 mb-4"
                style={{ color: siteTheme.accentColor }}
              >
                YOUR CUSTOM TEE
              </h2>
              <p className="mb-4">Premium quality custom t-shirt with your unique design</p>
              <p className="text-2xl font-bold my-4" style={{ color: siteTheme.accentColor }}>
                $29.99
              </p>
            </div>

            <div
              className="sm:p-8 p-4 rounded-lg"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              }}
            >
              <div className="flex justify-between items-center mb-6">
                <h2
                  className="font-['Kanit'] text-2xl uppercase tracking-wide mt-0"
                  style={{ color: siteTheme.accentColor }}
                >
                  CUSTOMIZE YOUR TEE
                </h2>

                <div className="relative">
                  <button
                    type="button"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                    className="p-1 rounded-full hover:bg-opacity-20"
                    style={{ backgroundColor: showTooltip ? siteTheme.accentColor : 'transparent' }}
                  >
                    <Info size={16} color={siteTheme.accentColor} />
                  </button>
                  {showTooltip && (
                    <div
                      className="absolute right-0 top-8 w-80 p-3 rounded-lg shadow-lg z-10 text-sm max-w-[200px]"
                      style={{
                        backgroundColor: siteTheme.cardBgColor,
                        borderColor: siteTheme.borderColor,
                        borderWidth: '1px',
                        borderStyle: 'solid'
                      }}
                    >
                      <div className="relative">
                        <div
                          className="absolute -top-2 right-4 w-4 h-4 transform rotate-45"
                          style={{ backgroundColor: siteTheme.cardBgColor }}
                        ></div>
                        <p style={{ color: siteTheme.textColor }}>
                          Your feedback is invaluable in shaping the final version. We will reach out to discuss the logo and any necessary revisions. If a second upload is required, we will contact you by phone to confirm. The final logo will be delivered upon your approval.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-6">
                <span
                  className="font-semibold mb-3 block text-sm uppercase tracking-wide"
                  style={{ color: siteTheme.textColor }}
                >
                  T-SHIRT COLOR
                </span>
                <div className="flex gap-3 flex-wrap">
                  {colorOptions.map((option) => (
                    <button
                      key={option.color}
                      className={`w-9 h-9 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${
                        currentBgColor === option.color ? "scale-110" : "border-transparent"
                      }`}
                      style={{
                        backgroundColor: option.color,
                        borderColor: currentBgColor === option.color ? siteTheme.accentColor : "transparent",
                      }}
                      onClick={() => setCurrentBgColor(option.color)}
                      title={option.title}
                    />
                  ))}
                </div>
                <div className="mt-2 text-sm">
                  Selected: <span className="font-medium">{getColorTitle(currentBgColor)}</span>
                </div>
              </div>

              <div className="mb-6">
                <span
                  className="font-semibold mb-3 block text-sm uppercase tracking-wide"
                  style={{ color: siteTheme.textColor }}
                >
                  SIZE
                </span>
                <div className="flex gap-3 flex-wrap">
                  {sizeOptions.map((size) => (
                    <button
                      key={size}
                      className={`py-2 px-5 rounded cursor-pointer font-semibold border transition-all`}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        backgroundColor: selectedSize === size ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: selectedSize === size ? siteTheme.accentColor : siteTheme.borderColor,
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center">
                  <span
                    className="font-semibold mb-3 block text-sm uppercase tracking-wide"
                    style={{ color: siteTheme.textColor }}
                  >
                    CUSTOM TEXT
                  </span>
                  <button
                    onClick={() => setShowTextOptions(!showTextOptions)}
                    className="text-sm flex items-center gap-1 mb-3 px-2 py-1 rounded"
                    style={{
                      backgroundColor: showTextOptions ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                      color: siteTheme.textColor,
                    }}
                  >
                    <Type size={14} />
                    {showTextOptions ? "Hide Options" : "Text Options"}
                  </button>
                </div>
                <input
                  type="text"
                  className="w-full p-3 rounded text-base transition-colors focus:outline-none"
                  placeholder="Enter your custom text here"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    borderColor: siteTheme.borderColor,
                    color: siteTheme.textColor,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                />

                {showTextOptions && customText && (
                  <div className="mt-3 p-3 rounded" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Text Color</label>
                      <div className="flex gap-2 flex-wrap">
                        {textColorOptions.map((option) => (
                          <button
                            key={option.color}
                            className={`w-8 h-8 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${
                              customTextColor === option.color ? "scale-110" : "border-transparent"
                            }`}
                            style={{
                              backgroundColor: option.color,
                              borderColor: customTextColor === option.color ? siteTheme.accentColor : "transparent",
                            }}
                            onClick={() => setCustomTextColor(option.color)}
                            title={option.title}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="block text-sm font-medium mb-1">Font</label>
                      <select
                        value={customTextFont}
                        onChange={(e) => setCustomTextFont(e.target.value)}
                        className="w-full p-2 rounded"
                        style={{
                          backgroundColor: siteTheme.bgColor,
                          color: siteTheme.textColor,
                          borderColor: siteTheme.borderColor,
                          borderWidth: "1px",
                          borderStyle: "solid",
                        }}
                      >
                        {fontOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Text Size</label>
                      <select
                        value={customTextSize}
                        onChange={(e) => {
                          setCustomTextSize(e.target.value)
                          // Update font size in pixels
                          const selectedOption = textSizeOptions.find((option) => option.value === e.target.value)
                          if (selectedOption) {
                            setCustomTextFontSize(selectedOption.size)
                          }
                        }}
                        className="w-full p-2 rounded"
                        style={{
                          backgroundColor: siteTheme.bgColor,
                          color: siteTheme.textColor,
                          borderColor: siteTheme.borderColor,
                          borderWidth: "1px",
                          borderStyle: "solid",
                        }}
                      >
                        {textSizeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-3 p-2 rounded" style={{ backgroundColor: siteTheme.bgColor }}>
                      <p className="text-sm mb-1">Preview:</p>
                      <div
                        className={`${customTextFont} font-bold text-center p-2`}
                        style={{
                          color: customTextColor,
                          fontSize: `${customTextFontSize}px`,
                        }}
                      >
                        {customText}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <span
                  className="font-semibold mb-3 block text-sm uppercase tracking-wide"
                  style={{ color: siteTheme.textColor }}
                >
                  UPLOAD YOUR DESIGN
                </span>
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="designUpload"
                    className="inline-block p-3 rounded cursor-pointer text-center font-semibold border transition-all uppercase text-sm tracking-wide"
                    style={{
                      backgroundColor: siteTheme.secondaryBgColor,
                      borderColor: siteTheme.borderColor,
                      color: siteTheme.textColor,
                    }}
                  >
                    <Upload className="inline-block w-4 h-4 mr-2" /> CHOOSE IMAGE FILE
                    <input
                      type="file"
                      id="designUpload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                  <div className="text-sm" style={{ color: "#b0b0b0" }}>
                    {fileName}
                  </div>
                  <div className="text-xs" style={{ color: "#b0b0b0" }}>
                    JPG, PNG or GIF (Max 5MB)
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <span
                  className="font-semibold mb-3 block text-sm uppercase tracking-wide"
                  style={{ color: siteTheme.textColor }}
                >
                  QUANTITY
                </span>
                <select
                  className="w-full p-3 rounded text-base appearance-none bg-no-repeat bg-right pr-10"
                  style={{
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.8rem center",
                    backgroundSize: "1rem",
                    backgroundColor: siteTheme.secondaryBgColor,
                    borderColor: siteTheme.borderColor,
                    color: siteTheme.textColor,
                    borderWidth: "1px",
                    borderStyle: "solid",
                  }}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {[1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="w-full text-white border-none py-4 text-base font-bold rounded cursor-pointer mt-4 transition-colors uppercase tracking-wide flex items-center justify-center"
                onClick={handlePlaceOrder}
                disabled={loading}
                style={{ backgroundColor: siteTheme.accentColor }}
              >
                {loading ? "Processing..." : "PLACE ORDER"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
