"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../components/Header"
import { Download, ChevronLeft, ChevronRight, Edit } from "lucide-react"

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

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ordersPerPage = 10

  // Home page background state
  const [homeBackground, setHomeBackground] = useState(null)
  const [homeText, setHomeText] = useState("")
  const [homeSubtext, setHomeSubtext] = useState("")
  const [editingHome, setEditingHome] = useState(false)
  const [homeBackgroundFile, setHomeBackgroundFile] = useState(null)

  // About us content state
  const [aboutContent, setAboutContent] = useState("")
  const [editingAbout, setEditingAbout] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.email !== "camargo_co@outlook.com") {
      router.push("/")
    } else {
      fetchProducts()
      fetchOrders()
      fetchHomeContent()
      fetchAboutContent()
    }
  }, [session, status, router])

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
      setTotalPages(Math.ceil(data.length / ordersPerPage))
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
        setHomeText(data.mainText || "")
        setHomeSubtext(data.subText || "")
      }
    } catch (err) {
      console.error("Error fetching home content:", err)
    }
  }

  const fetchAboutContent = async () => {
    try {
      const res = await fetch("/api/about-content")
      if (res.ok) {
        const data = await res.json()
        setAboutContent(data.description || "")
      }
    } catch (err) {
      console.error("Error fetching about content:", err)
    }
  }

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
    fetchProducts()
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

  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Get current orders for pagination
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

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

  const saveHomeContent = async () => {
    try {
      // First, upload the background image if there's a new one
      let backgroundImageUrl = homeBackground

      if (homeBackgroundFile) {
        const formData = new FormData()
        formData.append("file", homeBackgroundFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload background image")
        }

        const uploadData = await uploadRes.json()
        backgroundImageUrl = uploadData.url
      }

      // Then save the home content
      const res = await fetch("/api/home-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          backgroundImage: backgroundImageUrl,
          mainText: homeText,
          subText: homeSubtext,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save home content")
      }

      setEditingHome(false)
      setHomeBackgroundFile(null)
      alert("Home content saved successfully!")
    } catch (err) {
      console.error("Error saving home content:", err)
      setError("Failed to save home content. Please try again.")
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

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto mt-8 p-8">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="mb-8 bg-white shadow-md rounded px-8 pt-6 pb-8">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
              Product Name
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="name"
              type="text"
              placeholder="Product Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
              Price
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
              Description
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="description"
              placeholder="Product Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
              Images
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="category"
              type="text"
              placeholder="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availableColors">
              Available Colors (comma-separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="availableColors"
              type="text"
              placeholder="Red, Blue, Green"
              value={availableColors}
              onChange={(e) => setAvailableColors(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="availableSizes">
              Available Sizes (comma-separated)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
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
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {editingProduct ? "Update Product" : "Add Product"}
            </button>
          </div>
        </form>

        <h2 className="text-2xl font-bold mb-4">Products</h2>
        <button onClick={handleSort} className="mb-4 bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded">
          Sort by Upload Time ({sortOrder === "desc" ? "Newest First" : "Oldest First"})
        </button>
        {products.length === 0 ? (
          <p>No products found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((product) => (
              <div key={product._id} className="border bg-white rounded-lg shadow-md p-4">
                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                <p className="text-gray-600 mb-2">${product.price.toFixed(2)}</p>
                <p className="text-sm text-gray-500 mb-2">{product.description}</p>
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
                  <div className="mb-2 flex flex-wrap gap-2">
                    {product.images.map((image, index) => (
                      <Image
                        key={index}
                        src={image || "/placeholder.svg"}
                        alt={`${product.name} - Image ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md"
                      />
                    ))}
                  </div>
                )}
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handlePublish(product._id, !product.published)}
                    className={`${
                      product.published ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"
                    } text-white font-bold py-1 px-2 rounded text-sm`}
                  >
                    {product.published ? "Unpublish" : "Publish"}
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-1 px-2 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold mb-4 mt-8">Recent Orders</h2>
        {orders.length === 0 ? (
          <p>No recent orders.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300">
                <thead>
                  <tr>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer Name
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Details
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Payment Method
                    </th>
                    <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">{order.id || "N/A"}</td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {order.customer.name || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {order.customer.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {order.customer.phone || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {order.customer.address || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {order.product.name || "N/A"}
                        {order.product.isCustomProduct && (
                          <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                        )}
                        <div className="text-xs text-gray-600 mt-1">Category: {order.product.category || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
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
                                  className="rounded border border-gray-200 hover:border-blue-500 transition-all"
                                />
                                <span className="text-xs text-blue-600 block mt-1">Download</span>
                              </a>
                            </div>
                          )}
                          {/* Display final design image if available */}
                          {order.product.finalDesignImage && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold text-gray-700">Final Design:</p>
                              <div className="relative group">
                                <Image
                                  src={order.product.finalDesignImage || "/placeholder.svg"}
                                  alt="Final design"
                                  width={100}
                                  height={100}
                                  className="rounded border-2 border-orange-400 mt-1 hover:border-orange-600 transition-all"
                                />
                                <button
                                  onClick={() => downloadDesignImage(order.product.finalDesignImage, order.id)}
                                  className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Download final design"
                                >
                                  <Download size={16} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">{order.quantity || 1}</td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        ${(order.amount_total / 100).toFixed(2) || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        {new Date(order.created * 1000).toLocaleDateString() || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        <div className="flex items-center">
                          <span
                            className={`capitalize ${order.paymentMethod === "delivery" ? "text-orange-600" : "text-blue-600"}`}
                          >
                            {order.paymentMethod || "stripe"}
                          </span>
                          {order.paymentMethod === "delivery" && order.preferredMethod && (
                            <span className="ml-2 text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded capitalize">
                              {order.preferredMethod}
                            </span>
                          )}
                        </div>
                        {order.paymentMethod === "delivery" && order.additionalNotes && (
                          <p className="mt-1 text-xs text-gray-600">
                            <span className="font-semibold">Notes:</span> {order.additionalNotes}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`inline-block px-2 py-1 text-xs font-semibold rounded-full 
                            ${order.status === "pending" ? "bg-yellow-100 text-yellow-800" : ""}
                            ${order.status === "received" ? "bg-blue-100 text-blue-800" : ""}
                            ${order.status === "out_for_delivery" ? "bg-purple-100 text-purple-800" : ""}
                            ${order.status === "delivered" ? "bg-green-100 text-green-800" : ""}
                          `}
                          >
                            {order.status || "pending"}
                          </span>
                          <select
                            className="text-sm border border-gray-300 rounded p-1"
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            value={order.status || "pending"}
                          >
                            <option value="pending">Pending</option>
                            <option value="received">Received</option>
                            <option value="out_for_delivery">Out for Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded flex items-center ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  <ChevronLeft size={16} className="mr-1" /> Previous
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded flex items-center ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next <ChevronRight size={16} className="ml-1" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Home Page Content Management */}
        <div className="mt-12 bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">Home Page Content</h2>

          {editingHome ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Background Image</label>
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Main Text</label>
                <input
                  type="text"
                  value={homeText}
                  onChange={(e) => setHomeText(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Main heading text"
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Sub Text</label>
                <textarea
                  value={homeSubtext}
                  onChange={(e) => setHomeSubtext(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Subheading or description text"
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveHomeContent}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingHome(false)
                    fetchHomeContent() // Reset to original values
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4">
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
                  <div className="w-full h-40 bg-gray-200 rounded flex items-center justify-center mb-2">
                    <p className="text-gray-500">No background image set</p>
                  </div>
                )}

                <div className="mt-2">
                  <p className="font-bold text-lg">{homeText || "No main text set"}</p>
                  <p className="text-gray-600">{homeSubtext || "No subtext set"}</p>
                </div>
              </div>

              <button
                onClick={() => setEditingHome(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <Edit size={16} className="mr-2" /> Edit Home Content
              </button>
            </div>
          )}
        </div>

        {/* About Page Content Management */}
        <div className="mt-8 bg-white shadow-md rounded p-6">
          <h2 className="text-2xl font-bold mb-4">About Page Content</h2>

          {editingAbout ? (
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">About Us Description</label>
                <textarea
                  value={aboutContent}
                  onChange={(e) => setAboutContent(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="Write a description about your business..."
                  rows={6}
                />
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={saveAboutContent}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setEditingAbout(false)
                    fetchAboutContent() // Reset to original values
                  }}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-gray-50 rounded">
                <p className="text-gray-700">{aboutContent || "No about us description set"}</p>
              </div>

              <button
                onClick={() => setEditingAbout(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded flex items-center"
              >
                <Edit size={16} className="mr-2" /> Edit About Content
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
