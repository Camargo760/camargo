"use client"

import { useState, useEffect } from "react"
import Header from "../../components/Header"
import InstagramCard from "../../components/InstagramCard"
import FacebookCard from "../../components/FacebookCard"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function AboutPage() {
  const [aboutContent, setAboutContent] = useState({
    description: "",
    textStyles: {
      textSize: "text-lg",
      textColor: "text-gray-700",
      textFont: "font-normal",
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
  const [flipped, setFlipped] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch about content
        const aboutRes = await fetch("/api/about-content")
        if (aboutRes.ok) {
          const aboutData = await aboutRes.json()

          // Create a merged object with default values
          const mergedContent = {
            description: aboutData.description || "",
            textStyles: aboutData.textStyles || {
              textSize: "text-lg",
              textColor: "text-gray-700",
              textFont: "font-normal",
            },
          }

          setAboutContent(mergedContent)
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
  }, []) // Remove the dependency array item

    if (loading) {
    return <LoadingSpinner siteTheme={siteTheme} />
  }

  // Destructure textStyles with fallbacks
  const { textSize = "text-lg", textColor = "text-gray-700", textFont = "font-normal" } = aboutContent.textStyles || {}

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          About Us
        </h1>

        <div
          className="max-w-4xl mx-auto rounded-lg shadow-md p-8 mb-12"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <p className={`${textSize} ${textColor} ${textFont} leading-relaxed`}>
            {aboutContent.description ||
              "Camargo Clothing Co. was established in 1989 with a passion for quality clothing and unique designs. We pride ourselves on creating comfortable, stylish apparel that stands the test of time. Our commitment to quality materials and ethical manufacturing processes sets us apart in the industry. Whether you're looking for everyday essentials or statement pieces, Camargo Clothing Co. has something for everyone."}
          </p>
        </div>

        <div className="md:flex justify-center gap-20">
          {/* 3D Instagram Card */}
          <div className="flex justify-center items-center box-border md:mb-0 mb-8">
            <InstagramCard />
          </div>
          {/* Facebook Profile */}
          <div className="flex justify-center items-center box-border">
            <FacebookCard />
          </div>
        </div>

      </main>
    </div>
  )
}
