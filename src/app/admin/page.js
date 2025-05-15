"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"

// Import admin components
import ProductManagement from "../../components/admin/ProductManagement"
import OrdersManagement from "../../components/admin/OrdersManagement"
import LogoSettings from "../../components/admin/LogoSettings"
import AdminPasswordChange from "../../components/AdminPasswordChange"
import ReviewsManagement from "../../components/admin/ReviewsManagement"
import HomeContentManagement from "../../components/admin/HomeContentManagement"
import AboutContentManagement from "../../components/admin/AboutContentManagement"
import ThemeSettings from "../../components/admin/ThemeSettings"

export default function Admin() {
  const [products, setProducts] = useState([])
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [sortOrder, setSortOrder] = useState("desc")
  const { data: session, status } = useSession()
  const router = useRouter()

  // Reviews management
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(false)

  // Logo state
  const [logoUrl, setLogoUrl] = useState("/assets/logo.png")

  // Home page background state
  const [homeBackground, setHomeBackground] = useState(null)
  const [homeBackgroundMobile, setHomeBackgroundMobile] = useState(null)
  const [homeText, setHomeText] = useState("")
  const [homeSubtext, setHomeSubtext] = useState("")

  // Home page text customization
  const [homeTextSize, setHomeTextSize] = useState("text-4xl md:text-6xl")
  const [homeTextColor, setHomeTextColor] = useState("text-white")
  const [homeTextFont, setHomeTextFont] = useState("font-bold")
  const [homeSubtextSize, setHomeSubtextSize] = useState("text-xl md:text-2xl")
  const [homeSubtextColor, setHomeSubtextColor] = useState("text-white")
  const [homeSubtextFont, setHomeSubtextFont] = useState("font-normal")

  // About us content state
  const [aboutContent, setAboutContent] = useState("")

  // About page text customization
  const [aboutTextSize, setAboutTextSize] = useState("text-lg")
  const [aboutTextColor, setAboutTextColor] = useState("text-gray-700")
  const [aboutTextFont, setAboutTextFont] = useState("font-normal")

  // Website theme settings
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  // State to manage the active tab
  const [activeTab, setActiveTab] = useState("addNewProduct")

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
  }, [session, status, router, sortOrder])

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (!session || session.user.email !== "camargo_co@outlook.com") {
    return <div>You do not have permission to access this page.</div>
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto mt-8 sm:p-8 p-4">
        <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setActiveTab("addNewProduct")}
            className={`px-4 py-2 rounded ${activeTab === "addNewProduct" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "addNewProduct" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Add New Product
          </button>
          <button
            onClick={() => setActiveTab("ordersManagement")}
            className={`px-4 py-2 rounded ${activeTab === "ordersManagement" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "ordersManagement" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Orders Management
          </button>
          <button
            onClick={() => setActiveTab("logoSettings")}
            className={`px-4 py-2 rounded ${activeTab === "logoSettings" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "logoSettings" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Logo Settings
          </button>
          <button
            onClick={() => setActiveTab("passwordChange")}
            className={`px-4 py-2 rounded ${activeTab === "passwordChange" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "passwordChange" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Password Change
          </button>
          <button
            onClick={() => setActiveTab("reviewsManagement")}
            className={`px-4 py-2 rounded ${activeTab === "reviewsManagement" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "reviewsManagement" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Reviews Management
          </button>
          <button
            onClick={() => setActiveTab("homeContentManagement")}
            className={`px-4 py-2 rounded ${activeTab === "homeContentManagement" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "homeContentManagement" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Home Content Management
          </button>
          <button
            onClick={() => setActiveTab("aboutContentManagement")}
            className={`px-4 py-2 rounded ${activeTab === "aboutContentManagement" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "aboutContentManagement" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            About Content Management
          </button>
          <button
            onClick={() => setActiveTab("themeSettings")}
            className={`px-4 py-2 rounded ${activeTab === "themeSettings" ? "bg-accent" : "bg-secondary"}`}
            style={{
              backgroundColor: activeTab === "themeSettings" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
              color: siteTheme.textColor,
            }}
          >
            Theme Settings
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "addNewProduct" && (
          <ProductManagement
            siteTheme={siteTheme}
            fetchProducts={fetchProducts}
            products={products}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        )}

        {activeTab === "ordersManagement" && (
          <OrdersManagement siteTheme={siteTheme} orders={orders} />
        )}

        {activeTab === "logoSettings" && (
          <LogoSettings siteTheme={siteTheme} logoUrl={logoUrl} fetchSiteSettings={fetchSiteSettings} />
        )}

        {activeTab === "passwordChange" && (
          <div className="mt-8">
            <AdminPasswordChange siteTheme={siteTheme} />
          </div>
        )}

        {activeTab === "reviewsManagement" && (
          <ReviewsManagement siteTheme={siteTheme} reviews={reviews} fetchReviews={fetchReviews} />
        )}

        {activeTab === "homeContentManagement" && (
          <HomeContentManagement
            siteTheme={siteTheme}
            homeBackground={homeBackground}
            homeBackgroundMobile={homeBackgroundMobile}
            homeText={homeText}
            homeSubtext={homeSubtext}
            homeTextSize={homeTextSize}
            homeTextColor={homeTextColor}
            homeTextFont={homeTextFont}
            homeSubtextSize={homeSubtextSize}
            homeSubtextColor={homeSubtextColor}
            homeSubtextFont={homeSubtextFont}
            fetchHomeContent={fetchHomeContent}
          />
        )}

        {activeTab === "aboutContentManagement" && (
          <AboutContentManagement
            siteTheme={siteTheme}
            aboutContent={aboutContent}
            aboutTextSize={aboutTextSize}
            aboutTextColor={aboutTextColor}
            aboutTextFont={aboutTextFont}
            fetchAboutContent={fetchAboutContent}
          />
        )}

        {activeTab === "themeSettings" && (
          <ThemeSettings siteTheme={siteTheme} setSiteTheme={setSiteTheme} fetchSiteTheme={fetchSiteTheme} />
        )}
      </main>
    </div>
  )
}
