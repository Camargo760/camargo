"use client"

import { useState, useEffect } from "react"
import { Palette, Save } from "lucide-react"

export default function ThemeSettings({ siteTheme, setSiteTheme, fetchSiteTheme }) {
  const [editingTheme, setEditingTheme] = useState(false)
  const [editTheme, setEditTheme] = useState({ ...siteTheme })

  useEffect(() => {
    setEditTheme({ ...siteTheme })
  }, [siteTheme])

  const saveSiteTheme = async () => {
    try {
      const res = await fetch("/api/site-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: editTheme,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to save site theme")
      }

      setSiteTheme(editTheme)
      setEditingTheme(false)
      alert("Site theme saved successfully! Refresh the page to see changes.")
      fetchSiteTheme()
    } catch (err) {
      console.error("Error saving site theme:", err)
      alert("Failed to save site theme. Please try again.")
    }
  }

  return (
    <div
      className="my-8 p-6 rounded-lg"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <Palette className="mr-2" size={24} />
          Site Theme Settings
        </h2>
        <button
          onClick={() => {
            if (editingTheme) {
              setEditingTheme(false)
            } else {
              setEditingTheme(true)
              setEditTheme({ ...siteTheme }) // Ensure we start with current theme
            }
          }}
          className="flex items-center px-4 py-2 rounded"
          style={{
            backgroundColor: editingTheme ? "#4B5563" : siteTheme.accentColor,
            color: siteTheme.textColor,
          }}
        >
          {editingTheme ? "Cancel" : "Edit Theme"}
        </button>
      </div>

      {editingTheme ? (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Background Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.bgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, bgColor: e.target.value })}
                  className="h-10 w-40 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.bgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, bgColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Card Background Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.cardBgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, cardBgColor: e.target.value })}
                  className="h-10 w-10 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.cardBgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, cardBgColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Secondary Background Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.secondaryBgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, secondaryBgColor: e.target.value })}
                  className="h-10 w-10 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.secondaryBgColor}
                  onChange={(e) => setEditTheme({ ...editTheme, secondaryBgColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Accent Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.accentColor}
                  onChange={(e) => setEditTheme({ ...editTheme, accentColor: e.target.value })}
                  className="h-10 w-10 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.accentColor}
                  onChange={(e) => setEditTheme({ ...editTheme, accentColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Text Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.textColor}
                  onChange={(e) => setEditTheme({ ...editTheme, textColor: e.target.value })}
                  className="h-10 w-10 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.textColor}
                  onChange={(e) => setEditTheme({ ...editTheme, textColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Border Color</label>
              <div className="flex items-center">
                <input
                  type="color"
                  value={editTheme.borderColor}
                  onChange={(e) => setEditTheme({ ...editTheme, borderColor: e.target.value })}
                  className="h-10 w-10 rounded mr-2"
                />
                <input
                  type="text"
                  value={editTheme.borderColor}
                  onChange={(e) => setEditTheme({ ...editTheme, borderColor: e.target.value })}
                  className="flex-1 p-2 rounded"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-2">Preview</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.bgColor,
                  color: editTheme.textColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <p>Background</p>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.cardBgColor,
                  color: editTheme.textColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <p>Card Background</p>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.secondaryBgColor,
                  color: editTheme.textColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <p>Secondary Background</p>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.accentColor,
                  color: editTheme.textColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <p>Accent Color</p>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.cardBgColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <p style={{ color: editTheme.textColor }}>Text Color</p>
              </div>
              <div
                className="p-4 rounded"
                style={{
                  backgroundColor: editTheme.cardBgColor,
                  color: editTheme.textColor,
                  borderColor: editTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <button className="px-4 py-2 rounded" style={{ backgroundColor: editTheme.accentColor }}>
                  Button
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4 space-x-3">
            <button
              onClick={() => {
                setEditTheme({
                  bgColor: "#0a0a0a",
                  cardBgColor: "#1a1a1a",
                  accentColor: "#ff3e00",
                  textColor: "#f0f0f0",
                  secondaryBgColor: "#2a2a2a",
                  borderColor: "#333",
                })
              }}
              className="flex items-center px-4 py-2 rounded"
              style={{ backgroundColor: "#4B5563" }}
            >
              Reset to Default
            </button>
            <button
              onClick={saveSiteTheme}
              className="flex items-center px-4 py-2 rounded"
              style={{ backgroundColor: editTheme.accentColor }}
            >
              <Save className="mr-2" size={16} />
              Save Theme
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.bgColor }}></div>
            <span className="text-sm">Background</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.cardBgColor }}></div>
            <span className="text-sm">Card BG</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.secondaryBgColor }}></div>
            <span className="text-sm">Secondary BG</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.accentColor }}></div>
            <span className="text-sm">Accent</span>
          </div>
          <div className="flex flex-col items-center">
            <div
              className="w-16 h-16 rounded mb-2 flex items-center justify-center"
              style={{ backgroundColor: siteTheme.cardBgColor }}
            >
              <span style={{ color: siteTheme.textColor }}>T</span>
            </div>
            <span className="text-sm">Text</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded mb-2" style={{ backgroundColor: siteTheme.borderColor }}></div>
            <span className="text-sm">Border</span>
          </div>
        </div>
      )}
    </div>
  )
}
