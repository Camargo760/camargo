"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../components/Header"

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
  const [updatingOrderStatus, setUpdatingOrderStatus] = useState(false)

  useEffect(() => {
    if (status === "loading") return
    if (!session || session.user.email !==  process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push("/")
    } else {
      fetchProducts()
      fetchOrders()
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
    } catch (err) {
      console.error("Error fetching orders:", err)
      setError("Failed to fetch orders. Please try again.")
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

  const updateOrderStatus = async (orderId, newStatus) => {
    if (updatingOrderStatus) return

    try {
      setUpdatingOrderStatus(true)
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update order status")
      }

      // Update the order status locally
      setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
    } catch (err) {
      console.error("Error updating order status:", err)
      setError("Failed to update order status. Please try again.")
    } finally {
      setUpdatingOrderStatus(false)
    }
  }

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "received":
        return "bg-blue-100 text-blue-800"
      case "out_for_delivery":
        return "bg-yellow-100 text-yellow-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      default:
        return "bg-orange-100 text-orange-800"
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case "received":
        return "Order Received"
      case "out_for_delivery":
        return "Out for Delivery"
      case "delivered":
        return "Delivered"
      default:
        return "Pending"
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
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
                  {/* <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th> */}
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
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
                        {/* {order.status && (
                          <span className={`ml-2 text-xs ${getStatusBadgeColor(order.status)} px-2 py-1 rounded`}>
                            {getStatusText(order.status)}
                          </span>
                        )} */}
                      </div>
                      {/* {order.paymentMethod === "delivery" && order.additionalNotes && (
                        <p className="mt-1 text-xs text-gray-600">
                          <span className="font-semibold">Notes:</span> {order.additionalNotes}
                        </p>
                      )} */}
                    </td>
                    {/* <td className="px-6 py-4 whitespace-nowrap border-b border-gray-300">
                      {order.paymentMethod === "delivery" && (
                        <div className="flex flex-col space-y-2">
                          <button
                            onClick={() => updateOrderStatus(order.id, "received")}
                            className={`text-xs px-2 py-1 rounded ${
                              order.status === "received" ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-blue-100"
                            }`}
                            disabled={updatingOrderStatus}
                          >
                            Order Received
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "out_for_delivery")}
                            className={`text-xs px-2 py-1 rounded ${
                              order.status === "out_for_delivery"
                                ? "bg-yellow-500 text-white"
                                : "bg-gray-200 hover:bg-yellow-100"
                            }`}
                            disabled={updatingOrderStatus}
                          >
                            Out for Delivery
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, "delivered")}
                            className={`text-xs px-2 py-1 rounded ${
                              order.status === "delivered"
                                ? "bg-green-500 text-white"
                                : "bg-gray-200 hover:bg-green-100"
                            }`}
                            disabled={updatingOrderStatus}
                          >
                            Delivered
                          </button>
                        </div>
                      )}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  )
}

