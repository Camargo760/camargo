"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function ProductManagement({ siteTheme, fetchProducts, products, sortOrder, setSortOrder }) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [images, setImages] = useState([])
  const [category, setCategory] = useState("")
  const [availableColors, setAvailableColors] = useState("")
  const [availableSizes, setAvailableSizes] = useState("")
  const [editingProduct, setEditingProduct] = useState(null)
  const [error, setError] = useState(null)
  const productImagesRefs = useRef({})

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

  return (
    <div className="mb-8">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
          <p>{error}</p>
        </div>
      )}

      {/* Product Form */}
      <form
        onSubmit={handleSubmit}
        className="mb-8 p-4 sm:p-6 rounded-lg"
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
    </div>
  )
}
