"use client"

import { useState, useEffect } from "react"
import { Upload, Save, Eye, EyeOff } from "lucide-react"

export default function SocialManagement({ siteTheme }) {
  const [settings, setSettings] = useState({
    instagram: {
      enabled: true,
      profileImage: "/assets/camargo-profile.jpg",
      qrImage: "/assets/instagram-qr.png",
      displayName: "Camargo Clothing Co.",
      username: "@CAMARGO_CLOTHING_CO",
      description1: "Follow And Stay Posted!",
      description2: "DM FOR ANY ORDERS.",
      description3: "Zelle: Camargo_co@outlook.com",
      category: "Clothing (Brand)",
      website: "https://www.camargosworld.com",
      instagramUrl: "https://www.instagram.com/camargo_clothing_co/",
    },
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
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/social-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching social settings:", error)
    }
  }

  const handleImageUpload = async (file, platform, imageType) => {
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setSettings((prev) => ({
          ...prev,
          [platform]: {
            ...prev[platform],
            [imageType]: data.url,
          },
        }))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    }
  }

  const handleInputChange = (platform, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/social-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage("Social settings saved successfully!")
      } else {
        setMessage("Error saving settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Error saving settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: siteTheme.textColor }}>
          Social Media Management
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: siteTheme.accentColor,
            color: siteTheme.textColor,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Instagram Settings */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: siteTheme.textColor }}>
            Instagram Card
          </h3>
          <button
            onClick={() => handleInputChange("instagram", "enabled", !settings.instagram.enabled)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{
              backgroundColor: settings.instagram.enabled ? siteTheme.accentColor : "#6b7280",
              color: siteTheme.textColor,
            }}
          >
            {settings.instagram.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {settings.instagram.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={settings.instagram.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
              >
                <Upload size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], "instagram", "profileImage")}
                />
              </label>
            </div>
          </div>

          {/* QR Code Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              QR Code Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={settings.instagram.qrImage || "/placeholder.svg"}
                alt="QR Code"
                className="w-16 h-16 rounded object-cover"
              />
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
              >
                <Upload size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], "instagram", "qrImage")}
                />
              </label>
            </div>
          </div>

          {/* Text Fields */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Display Name
            </label>
            <input
              type="text"
              value={settings.instagram.displayName}
              onChange={(e) => handleInputChange("instagram", "displayName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Username
            </label>
            <input
              type="text"
              value={settings.instagram.username}
              onChange={(e) => handleInputChange("instagram", "username", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Description 1
            </label>
            <input
              type="text"
              value={settings.instagram.description1}
              onChange={(e) => handleInputChange("instagram", "description1", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Description 2
            </label>
            <input
              type="text"
              value={settings.instagram.description2}
              onChange={(e) => handleInputChange("instagram", "description2", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Description 3
            </label>
            <input
              type="text"
              value={settings.instagram.description3}
              onChange={(e) => handleInputChange("instagram", "description3", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Category
            </label>
            <input
              type="text"
              value={settings.instagram.category}
              onChange={(e) => handleInputChange("instagram", "category", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Website URL
            </label>
            <input
              type="url"
              value={settings.instagram.website}
              onChange={(e) => handleInputChange("instagram", "website", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Instagram URL
            </label>
            <input
              type="url"
              value={settings.instagram.instagramUrl}
              onChange={(e) => handleInputChange("instagram", "instagramUrl", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>
        </div>
      </div>

      {/* Facebook Settings */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: siteTheme.textColor }}>
            Facebook Card
          </h3>
          <button
            onClick={() => handleInputChange("facebook", "enabled", !settings.facebook.enabled)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{
              backgroundColor: settings.facebook.enabled ? siteTheme.accentColor : "#6b7280",
              color: siteTheme.textColor,
            }}
          >
            {settings.facebook.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {settings.facebook.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Profile Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={settings.facebook.profileImage || "/placeholder.svg"}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover"
              />
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
              >
                <Upload size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], "facebook", "profileImage")}
                />
              </label>
            </div>
          </div>

          {/* Banner Image Upload */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Banner Image
            </label>
            <div className="flex items-center gap-4">
              <img
                src={settings.facebook.bannerImage || "/placeholder.svg"}
                alt="Banner"
                className="w-16 h-10 rounded object-cover"
              />
              <label
                className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer"
                style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
              >
                <Upload size={16} />
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0], "facebook", "bannerImage")}
                />
              </label>
            </div>
          </div>

          {/* Text Fields */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Display Name
            </label>
            <input
              type="text"
              value={settings.facebook.displayName}
              onChange={(e) => handleInputChange("facebook", "displayName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Likes Count
            </label>
            <input
              type="text"
              value={settings.facebook.likes}
              onChange={(e) => handleInputChange("facebook", "likes", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Followers Count
            </label>
            <input
              type="text"
              value={settings.facebook.followers}
              onChange={(e) => handleInputChange("facebook", "followers", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Location
            </label>
            <input
              type="text"
              value={settings.facebook.location}
              onChange={(e) => handleInputChange("facebook", "location", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Phone Number
            </label>
            <input
              type="tel"
              value={settings.facebook.phone}
              onChange={(e) => handleInputChange("facebook", "phone", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Email
            </label>
            <input
              type="email"
              value={settings.facebook.email}
              onChange={(e) => handleInputChange("facebook", "email", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Website URL
            </label>
            <input
              type="url"
              value={settings.facebook.website}
              onChange={(e) => handleInputChange("facebook", "website", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Facebook URL
            </label>
            <input
              type="url"
              value={settings.facebook.facebookUrl}
              onChange={(e) => handleInputChange("facebook", "facebookUrl", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
