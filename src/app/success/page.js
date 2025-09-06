"use client"

import Link from "next/link"
import Image from "next/image"
// import Header from "../components/Header"

export default function Home() {
  // Site theme (static)
  const siteTheme = {
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  }

  // Hero content (static)
  const homeContent = {
    backgroundImage: "/desktop-alien-bg.jpg",
    backgroundImageMobile: "/mobile-alien-bg.jpg",
    mainText: "Camargo's World",
    subText: "Where we make your apparel possible.",
    textStyles: {
      mainTextSize: "text-4xl md:text-6xl",
      mainTextColor: "text-white",
      mainTextFont: "font-bold",
      subtextSize: "text-xl md:text-2xl",
      subtextColor: "text-white",
      subtextFont: "font-normal",
    },
  }

  // Check if mobile
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768

  // Destructure textStyles
  const {
    mainTextSize,
    mainTextColor,
    mainTextFont,
    subtextSize,
    subtextColor,
    subtextFont,
  } = homeContent.textStyles

  // Choose background image
  const backgroundImage =
    isMobile && homeContent.backgroundImageMobile
      ? homeContent.backgroundImageMobile
      : homeContent.backgroundImage

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}
    >
      // <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative w-full h-[calc(100vh-60px)] flex items-center justify-center">
          {backgroundImage ? (
            <div className="absolute inset-0 z-0">
              <Image
                src={backgroundImage}
                alt="Hero background"
                fill
                style={{ objectFit: "cover" }}
                priority
              />
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          ) : (
            <div
              className="absolute inset-0 z-0"
              style={{ backgroundColor: siteTheme.secondaryBgColor }}
            ></div>
          )}

          <div className="relative z-10 text-center px-4 max-w-4xl">
            <h1 className={`${mainTextSize} ${mainTextColor} ${mainTextFont} mb-4`}>
              {homeContent.mainText}
            </h1>
            <p className={`${subtextSize} ${subtextColor} ${subtextFont} mb-8`}>
              {homeContent.subText}
            </p>
            <div className="flex md:gap-8 gap-4 justify-center">
              <Link
                href="/products"
                className="px-4 py-2 rounded-md font-semibold text-sm transition-colors border-2"
                style={{
                  borderColor: "#ffffff",
                  color: "#000000",
                  backgroundColor: "#ffffff",
                }}
              >
                Shop Now
              </Link>
              <Link
                href="/customOrder"
                className="px-4 py-2 rounded-md font-semibold text-sm transition-colors border-2"
                style={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  backgroundColor: "transparent",
                }}
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
