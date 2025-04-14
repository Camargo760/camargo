"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"

const FacebookCard = ({ small = false }) => {
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
    <div
      className={`w-full ${
        small ? "max-w-[230px] max-h-[350px] md:max-w-[200px] md:max-h-[260px]" : "max-w-md"
      } mx-auto rounded-xl shadow-xl overflow-hidden`}
      style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
    >
      <div className={`${small ? "h-24 md:h-16" : "h-40"} relative bg-gray-200`}>
        <Image src="/assets/camargo-banner.png" alt="Facebook Banner" fill style={{ objectFit: "cover" }} />
      </div>
      <div className={`${small ? "px-3 pt-8 pb-4 md:px-2 md:pt-4 md:pb-3" : "px-6 pt-12 pb-6"} relative text-left`}>
        <div
          className={`absolute ${
            small ? "-top-8 left-4 w-16 h-16 md:-top-7 md:left-3 md:w-12 md:h-12" : "-top-10 left-4 w-24 h-24"
          } rounded-full border-4 overflow-hidden`}
          style={{ borderColor: siteTheme.cardBgColor, backgroundColor: siteTheme.cardBgColor }}
        >
          <Image
            src="/assets/camargo-profile.jpg"
            alt="Camargo Clothing Co. Logo"
            width={small ? 64 : 96}
            height={small ? 64 : 96}
            className={small ? "md:w-12 md:h-12" : ""}
          />
        </div>
        <h2 className={`${small ? "text-sm md:text-xs" : "text-2xl"} font-bold text-left`}>Camargo Clothing Co.</h2>
        <div className={`opacity-80 ${small ? "text-xs md:text-[10px]" : "text-sm"} mt-1 text-left`}>
          <span className="inline-block">102 likes</span>
          <span className="mx-1 inline-block">•</span>
          <span className="inline-block">99 followers</span>
        </div>
        <div className={`mt-2 ${small ? "space-y-0.5" : "space-y-2"} text-left`}>
          <div>
            <span className="inline-block align-middle mr-2">
              <MapPin size={small ? 12 : 16} />
            </span>
            <span className="inline-block align-middle text-xs md:text-[10px]">Los Angeles, CA</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Phone size={small ? 12 : 16} />
            </span>
            <span className="inline-block align-middle text-xs md:text-[10px]">(123) 456-7890</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Mail size={small ? 12 : 16} />
            </span>
            <span className="inline-block align-middle text-xs md:text-[10px]">Camargo_co@outlook.com</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Globe size={small ? 12 : 16} />
            </span>
            <Link
              href="https://www.camargosworld.com"
              target="_blank"
              className="hover:underline inline-block align-middle text-xs md:text-[10px]"
              style={{ color: "#3b82f6" }}
            >
              www.camargosworld.com
            </Link>
          </div>
        </div>
        <div className={`${small ? "mt-2 md:mt-1" : "mt-4"} text-left`}>
          <Link
            href="https://www.facebook.com/CamargoClothingCo"
            target="_blank"
            className={`inline-block ${
              small ? "px-3 py-1 text-xs md:px-2 md:py-0.5 md:text-[10px]" : "px-4 py-2 text-sm"
            } text-white rounded-md transition-colors`}
            style={{ backgroundColor: "#1877f2" }}
          >
            <span className="inline-block align-middle mr-1">
              <FontAwesomeIcon icon={faFacebook} size={small ? "xs" : "lg"} />
            </span>
            <span className="inline-block align-middle">Follow</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FacebookCard
