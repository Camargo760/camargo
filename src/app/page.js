"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "../components/Header"

export default function Home() {
  const [homeContent, setHomeContent] = useState({
    backgroundImage: null,
    backgroundImageMobile: null,
    mainText: "Welcome to Camargo Clothing Co.",
    subText: "Discover our latest collection of premium clothing and accessories.",
    textStyles: {
      mainTextSize: "text-4xl md:text-6xl",
      mainTextColor: "text-white",
      mainTextFont: "font-bold",
      subtextSize: "text-xl md:text-2xl",
      subtextColor: "text-white",
      subtextFont: "font-normal",
    },
  })
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if we're on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Initial check
    checkMobile()

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch home content
        const homeRes = await fetch("/api/home-content")
        if (homeRes.ok) {
          const homeData = await homeRes.json()
          console.log("Home content data:", homeData) // Debug log

          // Create a merged object with default values for textStyles if not present
          const mergedContent = {
            ...homeContent,
            backgroundImage: homeData.backgroundImage || null,
            backgroundImageMobile: homeData.backgroundImageMobile || null,
            mainText: homeData.mainText || homeContent.mainText,
            subText: homeData.subText || homeContent.subText,
            textStyles: homeData.textStyles || homeContent.textStyles,
          }

          setHomeContent(mergedContent)
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
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: siteTheme.bgColor }}>
        <div
          className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
          style={{ borderColor: siteTheme.accentColor }}
        ></div>
      </div>
    )
  }

  // Destructure textStyles with fallbacks
  const {
    mainTextSize = "text-4xl md:text-6xl",
    mainTextColor = "text-white",
    mainTextFont = "font-bold",
    subtextSize = "text-xl md:text-2xl",
    subtextColor = "text-white",
    subtextFont = "font-normal",
  } = homeContent.textStyles || {}

  // Determine which background image to use based on screen size
  const backgroundImage =
    isMobile && homeContent.backgroundImageMobile ? homeContent.backgroundImageMobile : homeContent.backgroundImage

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}
    >
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative w-full h-[calc(100vh-60px)] flex items-center justify-center">
          {backgroundImage ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={backgroundImage || "/placeholder.svg"}
                alt="Hero background"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0" style={{ backgroundColor: siteTheme.secondaryBgColor }}></div>
          )}

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className={`${mainTextSize} ${mainTextColor} ${mainTextFont} mb-4`}>
              {homeContent.mainText || "Welcome to Camargo Clothing Co."}
            </h1>
            <p className={`${subtextSize} ${subtextColor} ${subtextFont} mb-8`}>
              {homeContent.subText || "Discover our latest collection of premium clothing and accessories."}
            </p>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              <Link
                href="/products"
                className="px-4 py-2 rounded-md font-semibold text-sm transition-colors"
                style={{ backgroundColor: "#ffffff", color: "#000000" }}
              >
                Shop Now
              </Link>
              <Link
                href="/customOrder"
                className="px-4 py-2 rounded-md font-semibold text-sm transition-colors border-2"
                style={{ borderColor: "#ffffff", color: "#ffffff", backgroundColor: "transparent" }}
              >
                Custom Orders
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
