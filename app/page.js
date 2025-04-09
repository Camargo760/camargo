"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import Header from "../components/Header"

export default function Home() {
  const [homeContent, setHomeContent] = useState({
    backgroundImage: null,
    mainText: "Welcome to Camargo Clothing Co.",
    subText: "Discover our latest collection of premium clothing and accessories.",
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHomeContent = async () => {
      try {
        const res = await fetch("/api/home-content")
        if (res.ok) {
          const data = await res.json()
          if (data.backgroundImage || data.mainText || data.subText) {
            setHomeContent(data)
          }
        }
      } catch (err) {
        console.error("Error fetching home content:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchHomeContent()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Header />

      <main className="flex-grow ">
        {/* Hero Section */}
        <div className="relative w-full flex items-center justify-center" style={{ height: "calc(100vh - 60px" }}>
          {homeContent.backgroundImage ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={homeContent.backgroundImage || "/placeholder.svg"}
                alt="Hero background"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-600 z-0"></div>
          )}

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {homeContent.mainText || "Welcome to Camargo Clothing Co."}
            </h1>
            <p className="text-xl md:text-2xl text-white mb-8">
              {homeContent.subText || "Discover our latest collection of premium clothing and accessories."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center w-full">
                <div className="inline-block bg-red">
                  <Link
                    href="/products"
                    className="no-underline bg-white text-gray-900 hover:bg-gray-100 px-8 py-3 rounded-md font-semibold text-lg transition-colors inline-block mb-4 sm:mb-0 sm:mr-4"
                  >
                    Shop Now
                  </Link>
                  <Link
                    href="/"
                    className="no-underline bg-transparent border-2 border-white text-white hover:bg-white hover:text-gray-900 px-8 py-3 rounded-md font-semibold text-lg transition-colors inline-block"
                  >
                    Custom Orders
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
