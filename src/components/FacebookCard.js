"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"

const FacebookCard = () => {
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
      className="w-full max-w-xs mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
    >
      <div className="h-40 relative bg-gray-200">
        <Image src="/assets/camargo-banner.png" alt="Facebook Banner" fill style={{ objectFit: "cover" }} />
      </div>
      <div className="px-6 pt-12 pb-6 relative text-left">
        <div
          className="absolute -top-10 left-4 w-24 h-24 rounded-full border-4 overflow-hidden"
          style={{ borderColor: siteTheme.cardBgColor, backgroundColor: siteTheme.cardBgColor }}
        >
          <Image
            src="/assets/camargo-profile.jpg"
            alt="Camargo Clothing Co. Logo"
            width={96}
            height={96}
          />
        </div>
        <h2 className="text-2xl font-bold text-left">Camargo Clothing Co.</h2>
        <div className="opacity-80 text-sm mt-1 text-left">
          <span className="inline-block">102 likes</span>
          <span className="mx-1 inline-block">•</span>
          <span className="inline-block">99 followers</span>
        </div>
        <div className="mt-2 space-y-2 text-left">
          <div>
            <span className="inline-block align-middle mr-2">
              <MapPin size={16} />
            </span>
            <span className="inline-block align-middle text-sm">Los Angeles, CA</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Phone size={16} />
            </span>
            <span className="inline-block align-middle text-sm">(123) 456-7890</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Mail size={16} />
            </span>
            <span className="inline-block align-middle text-sm">Camargo_co@outlook.com</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Globe size={16} />
            </span>
            <Link
              href="https://www.camargosworld.com"
              target="_blank"
              className="hover:underline inline-block align-middle text-sm"
              style={{ color: "#3b82f6" }}
            >
              www.camargosworld.com
            </Link>
          </div>
        </div>
        <div className="mt-4 text-left">
          <Link
            href="https://www.facebook.com/CamargoClothingCo"
            target="_blank"
            className="inline-block px-4 py-2 text-sm text-white rounded-md transition-colors"
            style={{ backgroundColor: "#1877f2" }}
          >
            <span className="inline-block align-middle mr-1">
              <FontAwesomeIcon icon={faFacebook} size="lg" />
            </span>
            <span className="inline-block align-middle">Follow</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default FacebookCard
