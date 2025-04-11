"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Globe } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faInstagram } from "@fortawesome/free-brands-svg-icons"

const InstagramCard = ({ small }) => {
  const [flipped, setFlipped] = useState(false)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  useEffect(() => {
    const fetchSiteTheme = async () => {
      try {
        const res = await fetch("/api/site-theme")
        if (res.ok) {
          const data = await res.json()
          if (data.theme) {
            setSiteTheme(data.theme)
          }
        }
      } catch (err) {
        console.error("Error fetching site theme:", err)
      }
    }

    fetchSiteTheme()
  }, [])

  return (
    <div className={`h-full w-full md:w-full md:h-full max-w-xs mx-auto`}>
      <div
        className={`${small ? "h-[350px] w-[240px] md:h-[260px] md:w-[200px]" : "h-[500px] w-[300px]"} perspective-1000 cursor-pointer`}
        onMouseEnter={() => setFlipped(true)}
        onMouseLeave={() => setFlipped(false)}
        onTouchStart={() => setFlipped(!flipped)}
      >
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""}`}
          style={{
            transformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
        >
          {/* Front of card */}
          <div
            className="absolute w-full h-full rounded-lg shadow-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              backgroundColor: siteTheme.cardBgColor,
              color: siteTheme.textColor,
            }}
          >
            <div className={`text-center ${small ? "p-2 md:p-1" : "p-6"}`}>
              <div
                className={`rounded-full overflow-hidden mb-2 mx-auto ${small ? "w-14 h-14 md:w-12 md:h-12" : "w-32 h-32"}`}
              >
                <Image
                  src="/assets/camargo-profile.jpg"
                  alt="Camargo Clothing Co. Logo"
                  width={small ? 56 : 128}
                  height={small ? 56 : 128}
                />
              </div>
              <h2 className={`${small ? "text-sm md:text-xs" : "text-xl"} font-bold mb-1`}>Camargo Clothing Co.</h2>
              <p className={`opacity-80 text-center ${small ? "mb-1 text-xs md:text-[10px]" : "mb-2"}`}>
                Follow And Stay Posted!
              </p>
              <p className={`opacity-80 text-center ${small ? "mb-1 text-xs md:text-[10px]" : "mb-2"}`}>
                DM FOR ANY ORDERS.
              </p>
              <p className={`opacity-80 text-center ${small ? "mb-1 text-xs md:text-[10px]" : "mb-2"}`}>
                Zelle: Camargo_co@outlook.com
              </p>
              <div
                className={`rounded-full ${small ? "px-2 py-[2px] text-[10px] md:text-[8px] md:py-[1px] md:px-1" : "px-4 py-2 text-sm"} mb-2 inline-block`}
                style={{ backgroundColor: siteTheme.secondaryBgColor }}
              >
                <span className="font-medium">Clothing (Brand)</span>
              </div>
              <div className="block">
                <Link
                  href="https://www.camargosworld.com"
                  target="_blank"
                  className={`${small ? "text-xs md:text-[10px]" : "text-base"} inline-block hover:underline`}
                  style={{ color: "#e1306c" }}
                >
                  <span className="inline-block align-middle mr-1">
                    <Globe size={small ? 10 : 16} />
                  </span>
                  <span className="inline-block align-middle">www.camargosworld.com</span>
                </Link>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-block align-middle" style={{ color: "#e1306c" }}>
                  <FontAwesomeIcon icon={faInstagram} size={small ? "xs" : "lg"} />
                </span>
                <span
                  className={`ml-2 font-bold inline-block align-middle ${small ? "text-xs md:text-[10px]" : "text-base"}`}
                >
                  @CAMARGO_CLOTHING_CO
                </span>
              </div>
            </div>
          </div>

          {/* Back of card */}
          <div
            className="absolute flex flex-col items-center justify-center w-full h-full rounded-lg shadow-lg overflow-hidden"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
            }}
          >
            <div className={`${small ? "p-2 md:p-1" : "p-6"} text-center rounded-lg`}>
              <div
                className={`bg-white ${small ? "p-1" : "p-4"} rounded-lg mb-3 inline-block`}
                style={{ transform: "rotate(-10deg)" }}
              >
                <Image
                  src="/assets/instagram-qr.png"
                  alt="Instagram QR Code"
                  width={small ? 90 : 150}
                  height={small ? 90 : 150}
                />
              </div>
              <p className={`text-white font-bold ${small ? "text-xs md:text-[10px] mb-1" : "text-xl mb-2"}`}>
                Scan to Follow
              </p>
              <Link
                href="https://www.instagram.com/camargo_clothing_co/"
                target="_blank"
                className={`text-white font-bold inline-block ${small ? "text-xs md:text-[10px]" : "text-xl"}`}
                style={{ transform: "rotate(5deg)" }}
              >
                @CAMARGO_CLOTHING_CO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstagramCard
