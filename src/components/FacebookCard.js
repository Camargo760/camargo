"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Globe } from "lucide-react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faFacebook } from "@fortawesome/free-brands-svg-icons"

const FacebookCard = () => {
  const [socialSettings, setSocialSettings] = useState({
    facebook: {
      enabled: true,
      profileImage: "/assets/camargo-profile.jpg",
      bannerImage: "/assets/camargo-banner.png",
      displayName: "Camargo Clothing Co.",
      likes: "102",
      followers: "99",
      location: "Los Angeles, CA",
      phone: "(123) 456-7890",
      email: "Camargo_co@outlook.com",
      website: "https://www.camargosworld.com",
      facebookUrl: "https://www.facebook.com/CamargoClothingCo",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const socialRes = await fetch("/api/social-settings")
        if (socialRes.ok) {
          const socialData = await socialRes.json()
          if (socialData.settings) {
            setSocialSettings(socialData.settings)
          }
        }

        const themeRes = await fetch("/api/site-theme")
        if (themeRes.ok) {
          const themeData = await themeRes.json()
          if (themeData.theme) {
            setSiteTheme(themeData.theme)
          }
        }
      } catch (err) {
      }
    }

    fetchData()
  }, [])

  if (!socialSettings.facebook.enabled) {
    return null
  }

  return (
    <div
      className="w-full max-w-xs mx-auto rounded-xl shadow-xl overflow-hidden"
      style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
    >
      <div className="h-40 relative bg-gray-200">
        <Image
          src={socialSettings.facebook.bannerImage || "/placeholder.svg"}
          alt="Facebook Banner"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
      <div className="px-6 pt-12 pb-6 relative text-left">
        <div
          className="absolute -top-10 left-4 w-24 h-24 rounded-full border-4 overflow-hidden"
          style={{ borderColor: siteTheme.cardBgColor, backgroundColor: siteTheme.cardBgColor }}
        >
          <Image
            src={socialSettings.facebook.profileImage || "/placeholder.svg"}
            alt="Profile Image"
            width={96}
            height={96}
          />
        </div>
        <h2 className="text-2xl font-bold text-left">{socialSettings.facebook.displayName}</h2>
        <div className="opacity-80 text-sm mt-1 text-left">
          <span className="inline-block">{socialSettings.facebook.likes} likes</span>
          <span className="mx-1 inline-block">•</span>
          <span className="inline-block">{socialSettings.facebook.followers} followers</span>
        </div>
        <div className="mt-2 space-y-2 text-left">
          <div>
            <span className="inline-block align-middle mr-2">
              <MapPin size={16} />
            </span>
            <span className="inline-block align-middle text-sm">{socialSettings.facebook.location}</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Phone size={16} />
            </span>
            <span className="inline-block align-middle text-sm">{socialSettings.facebook.phone}</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Mail size={16} />
            </span>
            <span className="inline-block align-middle text-sm">{socialSettings.facebook.email}</span>
          </div>
          <div>
            <span className="inline-block align-middle mr-2">
              <Globe size={16} />
            </span>
            <Link
              href={socialSettings.facebook.website}
              target="_blank"
              className="hover:underline inline-block align-middle text-sm"
              style={{ color: "#3b82f6" }}
            >
              {socialSettings.facebook.website}
            </Link>
          </div>
        </div>
        <div className="mt-4 text-left">
          <Link
            href={socialSettings.facebook.facebookUrl}
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
