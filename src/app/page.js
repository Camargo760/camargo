"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "../components/Header"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInstagram, faFacebook } from "@fortawesome/free-brands-svg-icons"

export default function Home() {
  const [homeContent, setHomeContent] = useState({
    backgroundImage: null,
    mainText: "Welcome to Camargo Clothing Co.",
    subText: "Discover our latest collection of premium clothing and accessories.",
    textStyles: {
      mainTextSize: "text-3xl md:text-5xl lg:text-6xl", // Smaller font size
      mainTextColor: "text-white",
      mainTextFont: "font-bold",
      subtextSize: "text-sm md:text-xl lg:text-2xl", // Smaller font size
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
    mainTextSize = "text-3xl md:text-5xl lg:text-6xl",
    mainTextColor = "text-white",
    mainTextFont = "font-bold",
    subtextSize = "text-sm md:text-xl lg:text-2xl",
    subtextColor = "text-white",
    subtextFont = "font-normal",
  } = homeContent.textStyles || {}

  return (
    <div
      className="min-h-screen w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}
    >
      <Header />

      <main className="flex-grow relative">
        {/* Hero Section - Fixed calculation with proper fallback */}
        <div
          className="w-full flex items-center justify-center md:overflow-hidden sm:overflow-y-auto"
          style={{ height: "calc(100vh - 60px)" }}
        >
          {homeContent.backgroundImage ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={homeContent.backgroundImage || "/placeholder.svg"}
                alt="Hero background"
                fill
                style={{ objectFit: "cover", objectPosition: "center" }}
                priority
                sizes="100vw"
                quality={90}
              />
              <div className="absolute inset-0 bg-black/80"></div>
            </div>
          ) : (
            <div className="absolute inset-0 z-0" style={{ backgroundColor: siteTheme.secondaryBgColor }}></div>
          )}

          <div className="relative z-10 text-center px-4 md:px-6 max-w-4xl">
            <h1 className={`${mainTextSize} ${mainTextColor} ${mainTextFont} mb-3`}>
              {homeContent.mainText || "Welcome to Camargo Clothing Co."}
            </h1>
            <p className={`${subtextSize} ${subtextColor} ${subtextFont} mb-6 max-w-2xl mx-auto`}>
              {homeContent.subText || "Discover our latest collection of premium clothing and accessories."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Link
                href="/products"
                className="px-6 py-2 rounded-md font-semibold text-sm transition-colors border-2 bg-white"
                style={{ borderColor: "#ffffff", color: "#000000" }}
              >
                Custom Orders
              </Link>
              <Link
                href="/customOrder"
                className="px-6 py-2 rounded-md font-semibold text-sm transition-colors border-2"
                style={{ borderColor: "#ffffff", color: "#ffffff", backgroundColor: "transparent" }}
              >
                Custom Orders
              </Link>
            </div>
            <div className="flex justify-center gap-4">
              <Link
                href="https://www.instagram.com/camargo_clothing_co"
                target="_blank"
                className="text-white"
              >
                <FontAwesomeIcon icon={faInstagram} fontSize={20} />

              </Link>
              <Link
                href="https://www.facebook.com/CamargoClothingCo"
                target="_blank"
                className="text-white"
              >
                <FontAwesomeIcon icon={faFacebook} fontSize={20} />

              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
