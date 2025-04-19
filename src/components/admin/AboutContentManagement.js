"use client"

import { useState, useEffect } from "react"
import { Type, Edit } from "lucide-react"

export default function AboutContentManagement({
  siteTheme,
  aboutContent,
  aboutTextSize,
  aboutTextColor,
  aboutTextFont,
  fetchAboutContent,
}) {
  const [editingAbout, setEditingAbout] = useState(false)
  const [editAboutContent, setEditAboutContent] = useState(aboutContent)
  const [editAboutTextSize, setEditAboutTextSize] = useState(aboutTextSize)
  const [editAboutTextColor, setEditAboutTextColor] = useState(aboutTextColor)
  const [editAboutTextFont, setEditAboutTextFont] = useState(aboutTextFont)

  // Font options
  const fontOptions = [
    { value: "font-normal", label: "Normal" },
    { value: "font-medium", label: "Medium" },
    { value: "font-semibold", label: "Semi Bold" },
    { value: "font-bold", label: "Bold" },
    { value: "font-extrabold", label: "Extra Bold" },
    { value: "italic", label: "Italic" },
  ]

  // Text size options
  const textSizeOptions = [
    { value: "text-sm", label: "Small" },
    { value: "text-base", label: "Base" },
    { value: "text-lg", label: "Large" },
    { value: "text-xl", label: "Extra Large" },
    { value: "text-2xl", label: "2XL" },
    { value: "text-3xl", label: "3XL" },
    { value: "text-4xl", label: "4XL" },
    { value: "text-5xl", label: "5XL" },
    { value: "text-6xl", label: "6XL" },
  ]

  // Text color options
  const textColorOptions = [
    { value: "text-white", label: "White", color: "#ffffff" },
    { value: "text-gray-100", label: "Light Gray", color: "#f3f4f6" },
    { value: "text-gray-700", label: "Dark Gray", color: "#374151" },
    { value: "text-black", label: "Black", color: "#000000" },
    { value: "text-blue-500", label: "Blue", color: "#3b82f6" },
    { value: "text-red-500", label: "Red", color: "#ef4444" },
    { value: "text-green-500", label: "Green", color: "#10b981" },
    { value: "text-yellow-500", label: "Yellow", color: "#f59e0b" },
    { value: "text-orange-500", label: "Orange", color: "#f97316" },
    { value: "text-purple-500", label: "Purple", color: "#8b5cf6" },
    { value: "text-pink-500", label: "Pink", color: "#ec4899" },
  ]

  useEffect(() => {
    setEditAboutContent(aboutContent)
    setEditAboutTextSize(aboutTextSize)
    setEditAboutTextColor(aboutTextColor)
    setEditAboutTextFont(aboutTextFont)
  }, [aboutContent, aboutTextSize, aboutTextColor, aboutTextFont])

  const saveAboutContent = async () => {
    try {
      const res = await fetch("/api/about-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: editAboutContent,
          textStyles: {
            textSize: editAboutTextSize,
            textColor: editAboutTextColor,
            textFont: editAboutTextFont,
          },
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save about content")
      }

      setEditingAbout(false)
      alert("About content saved successfully!")
      fetchAboutContent()
    } catch (err) {
      console.error("Error saving about content:", err)
      alert("Failed to save about content. Please try again.")
    }
  }

  return (
    <div
      className="mt-8 rounded-lg p-6"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Type className="mr-2" size={24} />
        About Page Content
      </h2>

      {editingAbout ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">About Us Description</label>
            <textarea
              value={editAboutContent}
              onChange={(e) => setEditAboutContent(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
              }}
              placeholder="Write a description about your business..."
              rows={6}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-sm font-medium mb-1">Text Size</label>
                <select
                  value={editAboutTextSize}
                  onChange={(e) => setEditAboutTextSize(e.target.value)}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                >
                  {textSizeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Text Color</label>
                <select
                  value={editAboutTextColor}
                  onChange={(e) => setEditAboutTextColor(e.target.value)}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                >
                  {textColorOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Font Style</label>
                <select
                  value={editAboutTextFont}
                  onChange={(e) => setEditAboutTextFont(e.target.value)}
                  className="w-full p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                >
                  {fontOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={saveAboutContent}
              className="font-bold py-2 px-4 rounded"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
            >
              Save Changes
            </button>
            <button
              onClick={() => {
                setEditingAbout(false)
                setEditAboutContent(aboutContent)
                setEditAboutTextSize(aboutTextSize)
                setEditAboutTextColor(aboutTextColor)
                setEditAboutTextFont(aboutTextFont)
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
          <div className="mb-4 p-4 rounded" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
            <p className={`${aboutTextSize} ${aboutTextColor} ${aboutTextFont}`}>
              {aboutContent || "No about us description set"}
            </p>
          </div>

          <button
            onClick={() => {
              setEditingAbout(true)
              // Ensure we start with current values
              setEditAboutContent(aboutContent)
              setEditAboutTextSize(aboutTextSize)
              setEditAboutTextColor(aboutTextColor)
              setEditAboutTextFont(aboutTextFont)
            }}
            className="font-bold py-2 px-4 rounded flex items-center"
            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
          >
            <Edit size={16} className="mr-2" /> Edit About Content
          </button>
        </div>
      )}
    </div>
  )
}
