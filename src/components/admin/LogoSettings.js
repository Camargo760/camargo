"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Upload, Edit } from "lucide-react"

export default function LogoSettings({ siteTheme, logoUrl, fetchSiteSettings }) {
  const [editingLogo, setEditingLogo] = useState(false)
  const [logoFile, setLogoFile] = useState(null)
  const [previewLogoUrl, setPreviewLogoUrl] = useState(logoUrl)

  useEffect(() => {
    setPreviewLogoUrl(logoUrl)
  }, [logoUrl])

  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewLogoUrl(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const saveLogo = async () => {
    try {
      if (logoFile) {
        const formData = new FormData()
        formData.append("file", logoFile)

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!uploadRes.ok) {
          throw new Error("Failed to upload logo image")
        }

        const uploadData = await uploadRes.json()
        const logoUrlFromServer = uploadData.url

        // Save the logo URL to site settings
        const res = await fetch("/api/site-settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            logoUrl: logoUrlFromServer,
          }),
        })

        if (!res.ok) {
          throw new Error("Failed to save logo settings")
        }

        setEditingLogo(false)
        setLogoFile(null)
        alert("Logo updated successfully!")
        fetchSiteSettings()
      } else {
        alert("No new logo selected")
      }
    } catch (err) {
      console.error("Error saving logo:", err)
      alert("Failed to save logo. Please try again.")
    }
  }

  return (
    <div
      className="mt-8 p-6 rounded-lg"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Upload className="mr-2" size={24} />
        Site Logo
      </h2>

      {editingLogo ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="relative w-40 h-16 bg-gray-200 rounded overflow-hidden">
              <Image src={previewLogoUrl || "/assets/logo.png"} alt="Site Logo" fill style={{ objectFit: "contain" }} />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="border rounded p-2"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveLogo}
              className="font-bold py-2 px-4 rounded"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
            >
              Save Logo
            </button>
            <button
              onClick={() => {
                setEditingLogo(false)
                setPreviewLogoUrl(logoUrl)
                fetchSiteSettings() // Reset to original values
              }}
              className="font-bold py-2 px-4 rounded"
              style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <div className="relative w-40 h-16 bg-gray-200 rounded overflow-hidden mb-2">
              <Image src={logoUrl || "/assets/logo.png"} alt="Site Logo" fill style={{ objectFit: "contain" }} />
            </div>
          </div>

          <button
            onClick={() => {
              setEditingLogo(true)
              setPreviewLogoUrl(logoUrl) // Ensure we start with current logo
            }}
            className="font-bold py-2 px-4 rounded flex items-center"
            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
          >
            <Edit size={16} className="mr-2" /> Change Logo
          </button>
        </div>
      )}
    </div>
  )
}
