"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Header from "../../components/Header"
import { Clock, ListOrderedIcon, DollarSign, Filter, Loader2 } from "lucide-react"
import Link from "next/link"
import LoadingSpinner from "../../components/LoadingSpinner"


export default function ProductsPage() {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [sortBy, setSortBy] = useState("newest")
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const [showFilterOptions, setShowFilterOptions] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch site theme
        const themeRes = await fetch("/api/site-theme")
        if (themeRes.ok) {
          const themeData = await themeRes.json()
          if (themeData.theme) {
            setSiteTheme(themeData.theme)
          }
        }

        // Fetch products from MongoDB API - add published=true parameter
        const productsRes = await fetch("/api/products?published=true")
        if (!productsRes.ok) {
          throw new Error("Failed to fetch products")
        }
        const productsData = await productsRes.json()
        setProducts(productsData)

        // Extract unique categories
        const uniqueCategories = [...new Set(productsData.map((product) => product.category || "Uncategorized"))]
        setCategories(uniqueCategories)
      } catch (err) {
        console.error("Error fetching data:", err)
        setError(err.message || "Failed to load products")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products]

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter((product) => (product.category || "Uncategorized") === selectedCategory)
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        result.sort((a, b) => new Date(b.uploadTime || b.createdAt) - new Date(a.uploadTime || a.createdAt))
        break
      case "oldest":
        result.sort((a, b) => new Date(a.uploadTime || a.createdAt) - new Date(b.uploadTime || b.createdAt))
        break
      case "name_asc":
        result.sort((a, b) => (a.name || a.title).localeCompare(b.name || b.title))
        break
      case "name_desc":
        result.sort((a, b) => (b.name || b.title).localeCompare(a.name || a.title))
        break
      case "price_low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price_high":
        result.sort((a, b) => b.price - a.price)
        break
      default:
        break
    }

    setFilteredProducts(result)
  }, [products, selectedCategory, sortBy])

  if (loading) {
    return <LoadingSpinner siteTheme={siteTheme} />
  }


  if (error) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor }}>
        <Header />
        <div className="container mx-auto py-8 px-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-12 px-4 md:px-8">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.accentColor }}>
          Our Products
        </h1>

        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Products with Sorting - Right Side */}
          <div className="md:w-full">
            {/* Filter and Sort Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-4 relative">
              <div className="relative">
                <button
                  onClick={() => setShowFilterOptions(!showFilterOptions)}
                  className="px-3 py-2 rounded text-sm transition-colors flex items-center"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  <Filter className="mr-1" size={14} />
                  Filter
                </button>
                {showFilterOptions && (
                  <div
                    className="p-4 rounded-lg mb-4 absolute z-10 mt-2 w-60"
                    style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
                  >
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Filter size={18} />
                      <span>Categories</span>
                    </h3>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => setSelectedCategory("all")}
                        className={`px-3 py-2 rounded text-left transition-colors`}
                        style={{
                          backgroundColor: selectedCategory === "all" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                          color: siteTheme.textColor,
                        }}
                      >
                        All Products
                      </button>
                      {categories.map((category) => (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`px-3 py-2 rounded text-left transition-colors`}
                          style={{
                            backgroundColor:
                              selectedCategory === category ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                            color: siteTheme.textColor,
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowSortOptions(!showSortOptions)}
                  className="px-3 py-2 rounded text-sm transition-colors flex items-center"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                >
                  <ListOrderedIcon className="mr-1" size={14} />
                  Sort
                </button>
                {showSortOptions && (
                  <div
                    className="mb-4 p-4 rounded-lg absolute z-10 mt-2 w-40"
                    style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2 mr-2">
                        <ListOrderedIcon size={18} />
                        <span>Sort by:</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center`}
                          style={{
                            backgroundColor:
                              sortBy.includes("newest") || sortBy.includes("oldest")
                                ? siteTheme.accentColor
                                : siteTheme.secondaryBgColor,
                            color: siteTheme.textColor,
                          }}
                        >
                          <Clock className="mr-1" size={14} />
                          {sortBy === "newest" ? "Newest First" : sortBy === "oldest" ? "Oldest First" : "Time"}
                        </button>

                        <button
                          onClick={() => setSortBy(sortBy === "name_asc" ? "name_desc" : "name_asc")}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center`}
                          style={{
                            backgroundColor: sortBy.includes("name") ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                            color: siteTheme.textColor,
                          }}
                        >
                          <ListOrderedIcon className="mr-1" size={14} />
                          {sortBy === "name_asc" ? "A-Z" : sortBy === "name_desc" ? "Z-A" : "Name"}
                        </button>

                        <button
                          onClick={() => setSortBy(sortBy === "price_low" ? "price_high" : "price_low")}
                          className={`px-3 py-1 rounded text-sm transition-colors flex items-center`}
                          style={{
                            backgroundColor: sortBy.includes("price") ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                            color: siteTheme.textColor,
                          }}
                        >
                          <DollarSign className="mr-1" size={14} />
                          {sortBy === "price_low"
                            ? "Price: Low to High"
                            : sortBy === "price_high"
                              ? "Price: High to Low"
                              : "Price"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Products Grid */}
            {filteredProducts.length === 0 ? (
              <div className="text-center p-8 rounded-lg" style={{ backgroundColor: siteTheme.cardBgColor }}>
                <p className="text-lg">No products found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all")
                    setSortBy("newest")
                  }}
                  className="mt-4 px-4 py-2 rounded"
                  style={{ backgroundColor: siteTheme.accentColor }}
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} siteTheme={siteTheme} />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Product Card Component
function ProductCard({ product, siteTheme }) {
  return (
    <Link href={`/product/${product._id}`}>
      <div
        className="rounded-lg overflow-hidden shadow-md transition-transform hover:scale-105 min-h-[400px]"
        style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
      >
        <div className="relative h-48 w-full">
          {product.images && product.images.length > 0 ? (
            <Image
              src={product.images[0] || "/assets/placeholder.svg"}
              alt={product.name || product.title}
              fill
              className="object-cover"
            />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: siteTheme.secondaryBgColor }}
            >
              <span style={{ color: siteTheme.textColor }}>No Image</span>
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="text-lg font-bold" style={{ color: siteTheme.accentColor }}>
            ${product.price.toFixed(2)}
          </p>
          <p className="text-sm mt-2 line-clamp-2" style={{ color: siteTheme.textColor }}>
            {product.description || "No description available"}
          </p>
        </div>
      </div>
    </Link>
  )
}
