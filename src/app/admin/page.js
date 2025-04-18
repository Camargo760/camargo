"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../components/Header"
import { ChevronLeft, ChevronRight, Edit, Palette, Type, Save, Trash2, Upload, Star } from "lucide-react"
// Add import for AdminPasswordChange at the top of the file
import AdminPasswordChange from "../../components/AdminPasswordChange"

export default function Admin() {
  const [products, setProducts] = useState([])
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const [category, setCategory] = useState("")
  const [availableColors, setAvailableColors] = useState("")
  const [availableSizes, setAvailableSizes] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [sortOrder, setSortOrder] = useState("desc")
  const { data: session, status } = useSession()
  const router = useRouter()
  const productImagesRefs = useRef({})

  // Pagination state for orders
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [totalOrderPages, setTotalOrderPages] = useState(1)
  const ordersPerPage = 10

  // Pagination state for reviews
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const [totalReviewPages, setTotalReviewPages] = useState(1)
  const reviewsPerPage = 10

  // Home page background state
  const [homeBackground, setHomeBackground] = useState(null)
  const [homeBackgroundMobile, setHomeBackgroundMobile] = useState(null)
  const [homeText, setHomeText] = useState("")
  const [homeSubtext, setHomeSubtext] = useState("")
  const [editingHome, setEditingHome] = useState(false)
  const [homeBackgroundFile, setHomeBackgroundFile] = useState(null)
  const [homeBackgroundMobileFile, setHomeBackgroundMobileFile] = useState(null)

  // Logo state
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png")
  const [logoFile, setLogoFile] = useState(null)
  const [editingLogo, setEditingLogo] = useState(false)

  // Home page text customization
  const [homeTextSize, setHomeTextSize] = useState("text-4xl md:text-6xl")
  const [homeTextColor, setHomeTextColor] = useState("text-white")
  const [homeTextFont, setHomeTextFont] = useState("font-bold")
  const [homeSubtextSize, setHomeSubtextSize] = useState("text-xl md:text-2xl")
  const [homeSubtextColor, setHomeSubtextColor] = useState("text-white")
  const [homeSubtextFont, setHomeSubtextFont] = useState("font-normal")

  // About us content state
  const [aboutContent, setAboutContent] = useState("")
  const [editingAbout, setEditingAbout] = useState(false)

  // About page text customization
  const [aboutTextSize, setAboutTextSize] = useState("text-lg")
  const [aboutTextColor, setAboutTextColor] = useState("text-gray-700")
  const [aboutTextFont, setAboutTextFont] = useState("font-normal")

  // Reviews management
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Website theme settings
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const [editingTheme, setEditingTheme] = useState(false)

  // Define fetchProducts function before using it in useEffect
  const fetchProducts = async () => {
    try {
      const res = await fetch(`/api/products?sort=${sortOrder}`)
      if (!res.ok) {
        throw new Error("Failed to fetch products")
      }
      const data = await res.json()
      console.log("Fetched products:", data)
      setProducts(data)
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to fetch products. Please try again.")
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders")
      if (!res.ok) {
        throw new Error("Failed to fetch orders")
      }
      const data = await res.json()
      console.log("Fetched orders:", data)
      setOrders(data)
      setTotalOrderPages(Math.ceil(data.length / ordersPerPage))
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to fetch orders. Please try again.")
    }
  }

  const fetchHomeContent = async () => {
    try {
      const res = await fetch("/api/home-content")
      if (res.ok) {
        const data = await res.json()
        setHomeBackground(data.backgroundImage || null)
        setHomeBackgroundMobile(data.backgroundImageMobile || null)
        setHomeText(data.mainText || "")
        setHomeSubtext(data.subText || "")

        // Set text customization if available
        if (data.textStyles) {
          setHomeTextSize(data.textStyles.mainTextSize || "text-4xl md:text-6xl")
          setHomeTextColor(data.textStyles.mainTextColor || "text-white")
          setHomeTextFont(data.textStyles.mainTextFont || "font-bold")
          setHomeSubtextSize(data.textStyles.subtextSize || "text-xl md:text-2xl")
          setHomeSubtextColor(data.textStyles.subtextColor || "text-white")
          setHomeSubtextFont(data.textStyles.subtextFont || "font-normal")
        }
      }
    } catch (err) {
      console.error("Error fetching home content:", err)
    }
  }

  const fetchSiteSettings = async () => {
    try {
      const res = await fetch("/api/site-settings")
      if (res.ok) {
        const data = await res.json()
        if (data.logoUrl) {
          setLogoUrl(data.logoUrl)
        }
      }
    } catch (err) {
      console.error("Error fetching site settings:", err)
    }
  }

  const fetchAboutContent = async () => {
    try {
      const res = await fetch("/api/about-content")
      if (res.ok) {
        const data = await res.json()
        setAboutContent(data.description || "")

        // Set text customization if available
        if (data.textStyles) {
          setAboutTextSize(data.textStyles.textSize || "text-lg")
          setAboutTextColor(data.textStyles.textColor || "text-gray-700")
          setAboutTextFont(data.textStyles.textFont || "font-normal")
        }
      }
    } catch (err) {
      console.error("Error fetching about content:", err)
    }
  }

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true)
      const res = await fetch("/api/reviews")
      if (!res.ok) {
        throw new Error("Failed to fetch reviews")
      }
      const data = await res.json()
      setReviews(data)
      setTotalReviewPages(Math.ceil(data.length / reviewsPerPage))
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Failed to fetch reviews. Please try again.")
    } finally {
      setLoadingReviews(false)
    }
  }

  const fetchSiteTheme = async () => {
    try {
      const res = await fetch("/api/site-theme")
      if (res.ok) {
        const data = await res.json()
        if (data && data.theme) {
          setSiteTheme(data.theme)
        }
      }
    } catch (err) {
      console.error("Error fetching site theme:", err)
    }
  }

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      router.push("/")
    } else {
      fetchProducts()
      fetchOrders()
      fetchHomeContent()
      fetchAboutContent()
      fetchSiteTheme()
      fetchSiteSettings()
      fetchReviews()
    }
  }, [session, status, router, sortOrder]) // Removed fetchProducts from dependencies and added sortOrder instead

  const handleSubmit = async (e) => {
    e.preventDefault()
    const productData = {
      name,
      price: Number.parseFloat(price),
      description,
      images,
      category,
      availableColors: availableColors.split(",").map((color) => color.trim()),
      availableSizes: availableSizes.split(",").map((size) => size.trim()),
      published: false,
    }
    const url = editingProduct ? `/api/products/${editingProduct._id}` : "/api/products"
    const method = editingProduct ? "PUT" : "POST"
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productData),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Error saving product:", errorData)
        throw new Error(errorData.error || "Failed to save product")
      }
      setName("")
      setPrice("")
      setDescription("")
      setImages([])
      setCategory("")
      setAvailableColors("")
      setAvailableSizes("")
      setEditingProduct(null)
      fetchProducts()
      // Reset the image input field
      document.getElementById("images").value = ""
    } catch (err) {
      console.error("Error saving product:", err)
      setError("Failed to save product. Please try again.")
    }
  }

  const handlePublish = async (productId, publish) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: publish }),
      })
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Error updating product:", errorData)
        throw new Error(errorData.error || "Failed to update product")
      }
      fetchProducts()
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Failed to update product. Please try again.")
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setName(product.name)
    setPrice(product.price.toString())
    setDescription(product.description)
    setImages(product.images || [])
    setCategory(product.category)
    setAvailableColors(product.availableColors.join(", "))
    setAvailableSizes(product.availableSizes.join(", "))
  }

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        const res = await fetch(`/api/products/${productId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("Error deleting product:", errorData)
          throw new Error(errorData.error || "Failed to delete product")
        }
        fetchProducts()
      } catch (err) {
        console.error("Error deleting product:", err)
        setError("Failed to delete product. Please try again.")
      }
    }
  }

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("Error deleting review:", errorData)
          throw new Error(errorData.error || "Failed to delete review")
        }
        fetchReviews()
        alert("Review deleted successfully!")
      } catch (err) {
        console.error("Error deleting review:", err)
        setError("Failed to delete review. Please try again.")
      }
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Error updating order status:", errorData)
        throw new Error(errorData.error || "Failed to update order status")
      }

      // Refresh orders after status update
      fetchOrders()
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status. Please try again.")
    }
  }

  const handleSort = () => {
    const newSortOrder = sortOrder === "desc" ? "asc" : "desc"
    setSortOrder(newSortOrder)
    // fetchProducts will be called via the useEffect when sortOrder changes
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.onerror = (e) => reject(e)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(imagePromises)
      .then((results) => {
        setImages((prevImages) => [...prevImages, ...results])
      })
      .catch((err) => {
        console.error("Error reading images:", err)
        setError("Failed to process images. Please try again.")
      })
  }

  const removeImage = (index) => {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index))
  }

  // Function to download the final design image
  const downloadDesignImage = (imageUrl, orderId) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `custom-design-${orderId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Pagination handlers for orders
  const handlePreviousOrderPage = () => {
    if (currentOrderPage > 1) {
      setCurrentOrderPage(currentOrderPage - 1)
    }
  }

  const handleNextOrderPage = () => {
    if (currentOrderPage < totalOrderPages) {
      setCurrentOrderPage(currentOrderPage + 1)
    }
  }

  // Pagination handlers for reviews
  const handlePreviousReviewPage = () => {
    if (currentReviewPage > 1) {
      setCurrentReviewPage(currentReviewPage - 1)
    }
  }

  const handleNextReviewPage = () => {
    if (currentReviewPage < totalReviewPages) {
      setCurrentReviewPage(currentReviewPage + 1)
    }
  }

  // Get current orders for pagination
  const indexOfLastOrder = currentOrderPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Get current reviews for pagination
  const indexOfLastReview = currentReviewPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)

  const scrollProductImages = (productId, direction) => {
    if (productImagesRefs.current[productId]) {
      const scrollAmount = 110 // Adjust based on image width + gap
      if (direction === "left") {
        productImagesRefs.current[productId].scrollBy({ left: -scrollAmount, behavior: "smooth" })
      } else {
        productImagesRefs.current[productId].scrollBy({ left: scrollAmount, behavior: "smooth" })
      }
    }
  }

  // Home content handlers
  const handleHomeBackgroundChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setHomeBackgroundFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setHomeBackground(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleHomeBackgroundMobileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setHomeBackgroundMobileFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setHomeBackgroundMobile(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setLogoUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveHomeContent = async () => {
    try {
      // First, upload the background images if there are new ones
      let backgroundImageUrl = homeBackground
      let backgroundImageMobileUrl = homeBackgroundMobile

      if (homeBackgroundFile) {
        const formData = new FormData()
        formData.append("file", homeBackgroundFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload desktop background image")
        }

        const uploadData = await uploadRes.json()
        backgroundImageUrl = uploadData.url
      }

      if (homeBackgroundMobileFile) {
        const formData = new FormData()
        formData.append("file", homeBackgroundMobileFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload mobile background image")
        }

        const uploadData = await uploadRes.json()
        backgroundImageMobileUrl = uploadData.url
      }

      // Then save the home content with text styles
      const res = await fetch("/api/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundImage: backgroundImageUrl,
          backgroundImageMobile: backgroundImageMobileUrl,
          mainText: homeText,
          subText: homeSubtext,
          textStyles: {
            mainTextSize: homeTextSize,
            mainTextColor: homeTextColor,
            mainTextFont: homeTextFont,
            subtextSize: homeSubtextSize,
            subtextColor: homeSubtextColor,
            subtextFont: homeSubtextFont,
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save home content")
      }

      setEditingHome(false)
      setHomeBackgroundFile(null)
      setHomeBackgroundMobileFile(null)
      alert("Home content saved successfully!")
    } catch (err) {
      console.error("Error saving home content:", err)
      setError("Failed to save home content. Please try again.")
    }
  }

  const saveLogo = async () => {
    try {
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload logo image")
        }

        const uploadData = await uploadRes.json()
        const logoUrlFromServer = uploadData.url

        // Save the logo URL to site settings
        const res = await fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logoUrl: logoUrlFromServer,
          }),
        })

        if (!res.ok) {
          throw new Error("Failed to save logo settings")
        }

        setEditingLogo(false)
        setLogoFile(null)
        alert("Logo updated successfully!")
      } else {
        alert("No new logo selected")
      }
    } catch (err) {
      console.error("Error saving logo:", err)
      setError("Failed to save logo. Please try again.")
    }
  }

  // About content handlers
  const saveAboutContent = async () => {
    try {
      const res = await fetch("/api/about-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: aboutContent,
          textStyles: {
            textSize: aboutTextSize,
            textColor: aboutTextColor,
            textFont: aboutTextFont,
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save about content")
      }

      setEditingAbout(false)
      alert("About content saved successfully!")
    } catch (err) {
      console.error("Error saving about content:", err)
      setError("Failed to save about content. Please try again.")
    }
  }

  // Site theme handlers
  const saveSiteTheme = async () => {
    try {
      const res = await fetch("/api/site-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: siteTheme,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save site theme")
      }

      setEditingTheme(false)
      alert("Site theme saved successfully! Refresh the page to see changes.")
    } catch (err) {
      console.error("Error saving site theme:", err)
      setError("Failed to save site theme. Please try again.")
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return <div>You do not have permission to access this page.</div>
  }

  // Font options
  const fontOptions = [
    { value: "font-normal", label: "Normal" },
    { value: "font-medium", label: "Medium" },
    { value: "font-semibold", label: "Semi Bold" },
    { value: "font-bold", label: "Bold" },
    { value: "font-extrabold", label: "Extra Bold" },
    { value: "italic", label: "Italic" },
  ]

  // Text size options
  const textSizeOptions = [
    { value: "text-sm", label: "Small" },
    { value: "text-base", label: "Base" },
    { value: "text-lg", label: "Large" },
    { value: "text-xl", label: "Extra Large" },
    { value: "text-2xl", label: "2XL" },
    { value: "text-3xl", label: "3XL" },
    { value: "text-4xl", label: "4XL" },
    { value: "text-5xl", label: "5XL" },
    { value: "text-6xl", label: "6XL" },
  ]

  // Text color options
  const textColorOptions = [
    { value: "text-white", label: "White", color: "#ffffff" },
    { value: "text-gray-100", label: "Light Gray", color: "#f3f4f6" },
    { value: "text-gray-700", label: "Dark Gray", color: "#374151" },
    { value: "text-black", label: "Black", color: "#000000" },
    { value: "text-blue-500", label: "Blue", color: "#3b82f6" },
    { value: "text-red-500", label: "Red", color: "#ef4444" },
    { value: "text-green-500", label: "Green", color: "#10b981" },
    { value: "text-yellow-500", label: "Yellow", color: "#f59e0b" },
    { value: "text-orange-500", label: "Orange", color: "#f97316" },
    { value: "text-purple-500", label: "Purple", color: "#8b5cf6" },
    { value: "text-pink-500", label: "Pink", color: "#ec4899" },
  ]

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto mt-8 p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Product Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 rounded-lg"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-2xl font-bold mb-4">
            {editingProduct ? `Edit Product: ${editingProduct.name}` : "Add New Product"}
          </h2>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="name">
              Product Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="name"
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="price">
              Price
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="price"
              type="number"
              placeholder="Price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
              step="0.01"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="description"
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="images">
              Images
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="images"
              type="file"
              multiple
              onChange={handleImageChange}
              accept="image/*"
              required
            />
          </div>
          <div className="mb-4 flex flex-wrap gap-2">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <Image
                  src={image || "/placeholder.svg"}
                  alt={`Product image ${index + 1}`}
                  width={100}
                  height={100}
                  className="rounded-md"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="category"
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="availableColors">
              Available Colors (comma-separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="availableColors"
              type="text"
              placeholder="Red, Blue, Green"
              value={availableColors}
              onChange={(e) => setAvailableColors(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2" htmlFor="availableSizes">
              Available Sizes (comma-separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              id="availableSizes"
              type="text"
              placeholder="S, M, L, XL"
              value={availableSizes}
              onChange={(e) => setAvailableSizes(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              type="submit"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>

        {/* Products List */}
        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <button
          onClick={handleSort}
          className="mb-4 px-4 py-2 rounded"
          style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
        >
          Sort by Upload Time ({sortOrder === "desc" ? "Newest First" : "Oldest First"})
        </button>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div
                key={product._id}
                className="rounded-lg p-4"
                style={{
                  backgroundColor: siteTheme.cardBgColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="mb-2">${product.price.toFixed(2)}</p>
                <p className="text-sm mb-2">{product.description}</p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Category:</span> {product.category}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Colors:</span>{" "}
                  {product.availableColors ? product.availableColors.join(", ") : "N/A"}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Sizes:</span>{" "}
                  {product.availableSizes ? product.availableSizes.join(", ") : "N/A"}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Uploaded:</span> {new Date(product.uploadTime).toLocaleString()}
                </p>
                {product.images && product.images.length > 0 && (
                  <div className="mb-2 relative">
                    {product.images.length > 3 && (
                      <button
                        onClick={() => scrollProductImages(product._id, "left")}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                      >
                        <ChevronLeft size={16} color="white" />
                      </button>
                    )}

                    <div
                      ref={(el) => (productImagesRefs.current[product._id] = el)}
                      className="flex gap-2 overflow-x-auto px-10 py-2 scrollbar-hide"
                      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                    >
                      {product.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative w-24 h-24 flex-shrink-0 rounded-md overflow-hidden"
                          style={{
                            backgroundColor: siteTheme.secondaryBgColor,
                            borderColor: siteTheme.borderColor,
                            borderWidth: "1px",
                          }}
                        >
                          <Image
                            src={image || "/placeholder.svg"}
                            alt={`${product.name} - Image ${index + 1}`}
                            fill
                            style={{ objectFit: "cover" }}
                          />
                        </div>
                      ))}
                    </div>

                    {product.images.length > 3 && (
                      <button
                        onClick={() => scrollProductImages(product._id, "right")}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 w-8 h-8 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                      >
                        <ChevronRight size={16} color="white" />
                      </button>
                    )}
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="font-bold py-1 px-2 rounded text-sm"
                    style={{ backgroundColor: "#EAB308", color: "#000000" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(product._id, !product.published)}
                    className="font-bold py-1 px-2 rounded text-sm"
                    style={{
                      backgroundColor: product.published ? "#EF4444" : "#10B981",
                      color: "#FFFFFF",
                    }}
                  >
                    {product.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="font-bold py-1 px-2 rounded text-sm"
                    style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Orders */}
        <h2 className="text-2xl font-bold mb-4 mt-8">Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No recent orders.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border" style={{ borderColor: siteTheme.borderColor }}>
                <thead>
                  <tr style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Order ID
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Customer Name
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Email
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Phone
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Address
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Product
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Details
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Quantity
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Total
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Date
                    </th>
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Payment Method
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id} style={{ backgroundColor: siteTheme.cardBgColor }}>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.id || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.customer.name || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.customer.email || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.customer.phone || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.customer.address || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.product.name || "N/A"}
                        {order.product.isCustomProduct && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                        )}
                        <div className="text-xs mt-1">Category: {order.product.category || "N/A"}</div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <div>
                          <p>Color: {order.selectedColor || "N/A"}</p>
                          <p>Size: {order.selectedSize || "N/A"}</p>
                          {order.product.customText && order.product.customText !== "N/A" && (
                            <p>Text: {order.product.customText}</p>
                          )}
                          {order.product.customImage && (
                            <div className="mt-1">
                              <a
                                href={order.product.customImage}
                                download={`custom-design-${order.id}.png`}
                                title="Click to download image"
                                className="cursor-pointer inline-block"
                              >
                                <Image
                                  src={order.product.customImage || "/placeholder.svg"}
                                  alt="Custom design"
                                  width={50}
                                  height={50}
                                  className="rounded border hover:border-blue-500 transition-all"
                                  style={{ borderColor: siteTheme.borderColor }}
                                />
                                <span className="text-xs block mt-1" style={{ color: siteTheme.accentColor }}>
                                  Download
                                </span>
                              </a>
                            </div>
                          )}
                          {/* Display final design image if available */}
                          {order.product.finalDesignImage && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold">Final Design:</p>
                              <div className="relative group">
                                <Image
                                  src={order.product.finalDesignImage || "/placeholder.svg"}
                                  alt="Final design"
                                  width={100}
                                  height={100}
                                  className="rounded mt-1 transition-all"
                                  style={{ borderColor: siteTheme.accentColor, borderWidth: "2px" }}
                                />
                                <button
                                  onClick={() => downloadDesignImage(order.product.finalDesignImage, order.id)}
                                  className="mt-2 right-2 p-1 rounded "
                                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                                  title="Download final design"
                                >
                                  Download
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {order.quantity || 1}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        ${(order.amount_total / 100).toFixed(2) || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {new Date(order.created * 1000).toLocaleDateString() || "N/A"}
                      </td>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <div className="flex items-center">
                          <span
                            className="capitalize"
                            style={{ color: order.paymentMethod === "delivery" ? "#F97316" : "#3B82F6" }}
                          >
                            {order.paymentMethod === "delivery" ? "" : "Stripe"}
                          </span>
                          {order.paymentMethod === "delivery" && order.preferredMethod && (
                            <span
                              className="text-xs px-2 py-1 rounded capitalize"
                              style={{ backgroundColor: siteTheme.secondaryBgColor }}
                            >
                              {order.preferredMethod}
                            </span>
                          )}
                        </div>
                        {order.paymentMethod === "delivery" && order.additionalNotes && (
                          <p className="mt-1 text-xs">
                            <span className="font-semibold">Notes:</span> {order.additionalNotes}
                          </p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls for orders */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousOrderPage}
                  disabled={currentOrderPage === 1}
                  className="px-3 py-1 rounded flex items-center"
                  style={{
                    backgroundColor: currentOrderPage === 1 ? "#9CA3AF" : siteTheme.accentColor,
                    color: siteTheme.textColor,
                    opacity: currentOrderPage === 1 ? 0.5 : 1,
                    cursor: currentOrderPage === 1 ? "not-allowed" : "pointer",
                  }}
                >
                  <ChevronLeft size={16} className="mr-1" /> Previous
                </button>
                <button
                  onClick={handleNextOrderPage}
                  disabled={currentOrderPage === totalOrderPages}
                  className="px-3 py-1 rounded flex items-center"
                  style={{
                    backgroundColor: currentOrderPage === totalOrderPages ? "#9CA3AF" : siteTheme.accentColor,
                    color: siteTheme.textColor,
                    opacity: currentOrderPage === totalOrderPages ? 0.5 : 1,
                    cursor: currentOrderPage === totalOrderPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Logo Settings */}
        <div
          className="mt-8 p-6 rounded-lg"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Upload className="mr-2" size={24} />
            Site Logo
          </h2>

          {editingLogo ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative w-40 h-16 bg-gray-200 rounded overflow-hidden">
                  <Image src={logoUrl || "/assets/logo.png"} alt="Site Logo" fill style={{ objectFit: "contain" }} />
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="border rounded p-2"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveLogo}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  Save Logo
                </button>
                <button
                  onClick={() => {
                    setEditingLogo(false)
                    fetchSiteSettings() // Reset to original values
                  }}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
                <div className="relative w-40 h-16 bg-gray-200 rounded overflow-hidden mb-2">
                  <Image src={logoUrl || "/assets/logo.png"} alt="Site Logo" fill style={{ objectFit: "contain" }} />
                </div>
              </div>

              <button
                onClick={() => setEditingLogo(true)}
                className="font-bold py-2 px-4 rounded flex items-center"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                <Edit size={16} className="mr-2" /> Change Logo
              </button>
            </div>
          )}
        </div>

        {/* Admin Password Change */}
        <div className="mt-8">
          <AdminPasswordChange siteTheme={siteTheme} />
        </div>

        {/* Reviews Management */}
        <div
          className="mt-8 rounded-lg p-6"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Type className="mr-2" size={24} />
            Reviews Management
          </h2>

          {loadingReviews ? (
            <div className="text-center py-8">Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-8">No reviews found.</div>
          ) : (
            <>
              <div className="space-y-4">
                {currentReviews.map((review) => (
                  <div
                    key={review._id}
                    className="p-4 rounded-lg"
                    style={{ backgroundColor: siteTheme.secondaryBgColor }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <div className="font-semibold">{review.user.name}</div>
                          <div className="ml-2 text-sm opacity-70">{review.user.email}</div>
                        </div>
                        <div className="flex mt-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              fill={star <= review.rating ? "#FFD700" : "none"}
                              color={star <= review.rating ? "#FFD700" : "#D1D5DB"}
                              size={16}
                            />
                          ))}
                          <span className="ml-2 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        className="text-red-500 hover:text-red-700"
                        title="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p className="mt-2">{review.text}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-20 h-20">
                            <Image
                              src={image || "/placeholder.svg"}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="rounded object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Pagination controls for reviews */}
              <div className="flex justify-between items-center mt-4">
                <div className="text-sm">
                  Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, reviews.length)} of {reviews.length}{" "}
                  reviews
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handlePreviousReviewPage}
                    disabled={currentReviewPage === 1}
                    className="px-3 py-1 rounded flex items-center"
                    style={{
                      backgroundColor: currentReviewPage === 1 ? "#9CA3AF" : siteTheme.accentColor,
                      color: siteTheme.textColor,
                      opacity: currentReviewPage === 1 ? 0.5 : 1,
                      cursor: currentReviewPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    <ChevronLeft size={16} className="mr-1" /> Previous 10
                  </button>
                  <button
                    onClick={handleNextReviewPage}
                    disabled={currentReviewPage === totalReviewPages}
                    className="px-3 py-1 rounded flex items-center"
                    style={{
                      backgroundColor: currentReviewPage === totalReviewPages ? "#9CA3AF" : siteTheme.accentColor,
                      color: siteTheme.textColor,
                      opacity: currentReviewPage === totalReviewPages ? 0.5 : 1,
                      cursor: currentReviewPage === totalReviewPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next 10 <ChevronRight size={16} className="ml-1" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Home Page Content Management */}
        <div
          className="mt-8 rounded-lg p-6"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Type className="mr-2" size={24} />
            Home Page Content
          </h2>

          {editingHome ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Desktop Background Image</label>
                <div className="flex items-center space-x-4">
                  {homeBackground && (
                    <div className="relative w-40 h-24 bg-gray-200 rounded overflow-hidden">
                      <Image
                        src={homeBackground || "/placeholder.svg"}
                        alt="Home background"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHomeBackgroundChange}
                    className="border rounded p-2"
                    style={{
                      backgroundColor: siteTheme.secondaryBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mobile Background Image</label>
                <div className="flex items-center space-x-4">
                  {homeBackgroundMobile && (
                    <div className="relative w-24 h-40 bg-gray-200 rounded overflow-hidden">
                      <Image
                        src={homeBackgroundMobile || "/placeholder.svg"}
                        alt="Home mobile background"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHomeBackgroundMobileChange}
                    className="border rounded p-2"
                    style={{
                      backgroundColor: siteTheme.secondaryBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Main Text</label>
                <input
                  type="text"
                  value={homeText}
                  onChange={(e) => setHomeText(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                  placeholder="Main heading text"
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Size</label>
                    <select
                      value={homeTextSize}
                      onChange={(e) => setHomeTextSize(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      <option value="text-4xl md:text-6xl">Responsive (4XL to 6XL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <select
                      value={homeTextColor}
                      onChange={(e) => setHomeTextColor(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Style</label>
                    <select
                      value={homeTextFont}
                      onChange={(e) => setHomeTextFont(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Sub Text</label>
                <textarea
                  value={homeSubtext}
                  onChange={(e) => setHomeSubtext(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                  placeholder="Subheading or description text"
                  rows={3}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Size</label>
                    <select
                      value={homeSubtextSize}
                      onChange={(e) => setHomeSubtextSize(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                      <option value="text-xl md:text-2xl">Responsive (XL to 2XL)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <select
                      value={homeSubtextColor}
                      onChange={(e) => setHomeSubtextColor(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Style</label>
                    <select
                      value={homeSubtextFont}
                      onChange={(e) => setHomeSubtextFont(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveHomeContent}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingHome(false)
                    fetchHomeContent() // Reset to original values
                  }}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Desktop Background</h3>
                  {homeBackground ? (
                    <div className="relative w-full h-40 bg-gray-200 rounded overflow-hidden mb-2">
                      <Image
                        src={homeBackground || "/placeholder.svg"}
                        alt="Home background"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-full h-40 rounded flex items-center justify-center mb-2"
                      style={{ backgroundColor: siteTheme.secondaryBgColor }}
                    >
                      <p>No desktop background image set</p>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Mobile Background</h3>
                  {homeBackgroundMobile ? (
                    <div className="relative w-32 h-40 bg-gray-200 rounded overflow-hidden mb-2 mx-auto">
                      <Image
                        src={homeBackgroundMobile || "/placeholder.svg"}
                        alt="Home mobile background"
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                  ) : (
                    <div
                      className="w-32 h-40 rounded flex items-center justify-center mb-2 mx-auto"
                      style={{ backgroundColor: siteTheme.secondaryBgColor }}
                    >
                      <p className="text-center text-sm">No mobile background image set</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className={`${homeTextSize} ${homeTextColor} ${homeTextFont}`}>{homeText || "No main text set"}</p>
                <p className={`${homeSubtextSize} ${homeSubtextColor} ${homeSubtextFont}`}>
                  {homeSubtext || "No subtext set"}
                </p>
              </div>

              <button
                onClick={() => setEditingHome(true)}
                className="mt-4 font-bold py-2 px-4 rounded flex items-center"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                <Edit size={16} className="mr-2" /> Edit Home Content
              </button>
            </div>
          )}
        </div>

        {/* About Page Content Management */}
        <div
          className="mt-8 rounded-lg p-6"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <Type className="mr-2" size={24} />
            About Page Content
          </h2>

          {editingAbout ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">About Us Description</label>
                <textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                  placeholder="Write a description about your business..."
                  rows={6}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <div>
                    <label className="block text-sm font-medium mb-1">Text Size</label>
                    <select
                      value={aboutTextSize}
                      onChange={(e) => setAboutTextSize(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textSizeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Text Color</label>
                    <select
                      value={aboutTextColor}
                      onChange={(e) => setAboutTextColor(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {textColorOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Font Style</label>
                    <select
                      value={aboutTextFont}
                      onChange={(e) => setAboutTextFont(e.target.value)}
                      className="w-full p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    >
                      {fontOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveAboutContent}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingAbout(false)
                    fetchAboutContent() // Reset to original values
                  }}
                  className="font-bold py-2 px-4 rounded"
                  style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 rounded" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                <p className={`${aboutTextSize} ${aboutTextColor} ${aboutTextFont}`}>
                  {aboutContent || "No about us description set"}
                </p>
              </div>

              <button
                onClick={() => setEditingAbout(true)}
                className="font-bold py-2 px-4 rounded flex items-center"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                <Edit size={16} className="mr-2" /> Edit About Content
              </button>
            </div>
          )}
        </div>

        {/* Theme Setting */}
        <div
          className="my-8 p-6 rounded-lg"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center">
              <Palette className="mr-2" size={24} />
              Site Theme Settings
            </h2>
            <button
              onClick={() => setEditingTheme(!editingTheme)}
              className="flex items-center px-4 py-2 rounded"
              style={{
                backgroundColor: editingTheme ? "#4B5563" : siteTheme.accentColor,
                color: siteTheme.textColor,
              }}
            >
              {editingTheme ? "Cancel" : "Edit Theme"}
            </button>
          </div>

          {editingTheme ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Background Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.bgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, bgColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.bgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, bgColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Card Background Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.cardBgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, cardBgColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.cardBgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, cardBgColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Secondary Background Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.secondaryBgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, secondaryBgColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.secondaryBgColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, secondaryBgColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Accent Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.accentColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, accentColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.accentColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, accentColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Text Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.textColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, textColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.textColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, textColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Border Color</label>
                  <div className="flex items-center">
                    <input
                      type="color"
                      value={siteTheme.borderColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, borderColor: e.target.value })}
                      className="h-10 w-10 rounded mr-2"
                    />
                    <input
                      type="text"
                      value={siteTheme.borderColor}
                      onChange={(e) => setSiteTheme({ ...siteTheme, borderColor: e.target.value })}
                      className="flex-1 p-2 rounded"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        color: siteTheme.textColor,
                        borderColor: siteTheme.borderColor,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-2">Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.bgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <p>Background</p>
                  </div>
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <p>Card Background</p>
                  </div>
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.secondaryBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <p>Secondary Background</p>
                  </div>
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.accentColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <p>Accent Color</p>
                  </div>
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <p style={{ color: siteTheme.textColor }}>Text Color</p>
                  </div>
                  <div
                    className="p-4 rounded"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <button className="px-4 py-2 rounded" style={{ backgroundColor: siteTheme.accentColor }}>
                      Button
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-4 space-x-3">
                <button
                  onClick={() => {
                    setSiteTheme({
                      bgColor: "#0a0a0a",
                      cardBgColor: "#1a1a1a",
                      accentColor: "#ff3e00",
                      textColor: "#f0f0f0",
                      secondaryBgColor: "#2a2a2a",
                      borderColor: "#333",
                    })
                  }}
                  className="flex items-center px-4 py-2 rounded"
                  style={{ backgroundColor: "#4B5563" }}
                >
                  Reset to Default
                </button>
                <button
                  onClick={saveSiteTheme}
                  className="flex items-center px-4 py-2 rounded"
                  style={{ backgroundColor: siteTheme.accentColor }}
                >
                  <Save className="mr-2" size={16} />
                  Save Theme
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.bgColor }}></div>
                <span className="text-sm">Background</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.cardBgColor }}></div>
                <span className="text-sm">Card BG</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.secondaryBgColor }}></div>
                <span className="text-sm">Secondary BG</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.accentColor }}></div>
                <span className="text-sm">Accent</span>
              </div>
              <div className="flex flex-col items-center">
                <div
                  className="w-16 h-16 rounded mb-2 flex items-center justify-center"
                  style={{ backgroundColor: siteTheme.cardBgColor }}
                >
                  <span style={{ color: siteTheme.textColor }}>T</span>
                </div>
                <span className="text-sm">Text</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.borderColor }}></div>
                <span className="text-sm">Border</span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
