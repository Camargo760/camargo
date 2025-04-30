"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Type, Edit, Smartphone, Monitor } from "lucide-react"

export default function HomeContentManagement({
    siteTheme,
    homeBackground,
    homeBackgroundMobile,
    homeText,
    homeSubtext,
    homeTextSize,
    homeTextColor,
    homeTextFont,
    homeSubtextSize,
    homeSubtextColor,
    homeSubtextFont,
    fetchHomeContent,
}) {
    const [editingHome, setEditingHome] = useState(false)
    const [homeBackgroundFile, setHomeBackgroundFile] = useState(null)
    const [homeBackgroundMobileFile, setHomeBackgroundMobileFile] = useState(null)
    const [editHomeText, setEditHomeText] = useState(homeText)
    const [editHomeSubtext, setEditHomeSubtext] = useState(homeSubtext)

    // Parse responsive text sizes into desktop and mobile components
    const parseResponsiveSize = (responsiveSize, defaultDesktop, defaultMobile) => {
        if (!responsiveSize) return { desktop: defaultDesktop, mobile: defaultMobile }

        // Check if it's a responsive class like "text-xl md:text-3xl"
        const parts = responsiveSize.split("md:")
        if (parts.length === 2) {
            return {
                mobile: parts[0].trim(),
                desktop: parts[1].trim()
            }
        }

        // If it's not responsive, use the same size for both
        return {
            desktop: responsiveSize,
            mobile: responsiveSize
        }
    }

    // Parse the current text sizes
    const mainTextSizes = parseResponsiveSize(homeTextSize, "text-4xl", "text-2xl")
    const subtextSizes = parseResponsiveSize(homeSubtextSize, "text-xl", "text-base")

    // State for separate desktop and mobile sizes
    const [editHomeTextSizeDesktop, setEditHomeTextSizeDesktop] = useState(mainTextSizes.desktop)
    const [editHomeTextSizeMobile, setEditHomeTextSizeMobile] = useState(mainTextSizes.mobile)
    const [editHomeSubtextSizeDesktop, setEditHomeSubtextSizeDesktop] = useState(subtextSizes.desktop)
    const [editHomeSubtextSizeMobile, setEditHomeSubtextSizeMobile] = useState(subtextSizes.mobile)

    // Other state variables
    const [editHomeTextColor, setEditHomeTextColor] = useState(homeTextColor)
    const [editHomeTextFont, setEditHomeTextFont] = useState(homeTextFont)
    const [editHomeSubtextColor, setEditHomeSubtextColor] = useState(homeSubtextColor)
    const [editHomeSubtextFont, setEditHomeSubtextFont] = useState(homeSubtextFont)
    const [previewHomeBackground, setPreviewHomeBackground] = useState(homeBackground)
    const [previewHomeBackgroundMobile, setPreviewHomeBackgroundMobile] = useState(homeBackgroundMobile)
    const [previewMode, setPreviewMode] = useState("desktop") // "desktop" or "mobile"

    useEffect(() => {
        setEditHomeText(homeText)
        setEditHomeSubtext(homeSubtext)

        // Update the parsed sizes when props change
        const newMainTextSizes = parseResponsiveSize(homeTextSize, "text-4xl", "text-2xl")
        const newSubtextSizes = parseResponsiveSize(homeSubtextSize, "text-xl", "text-base")

        setEditHomeTextSizeDesktop(newMainTextSizes.desktop)
        setEditHomeTextSizeMobile(newMainTextSizes.mobile)
        setEditHomeSubtextSizeDesktop(newSubtextSizes.desktop)
        setEditHomeSubtextSizeMobile(newSubtextSizes.mobile)

        setEditHomeTextColor(homeTextColor)
        setEditHomeTextFont(homeTextFont)
        setEditHomeSubtextColor(homeSubtextColor)
        setEditHomeSubtextFont(homeSubtextFont)
        setPreviewHomeBackground(homeBackground)
        setPreviewHomeBackgroundMobile(homeBackgroundMobile)
    }, [
        homeText,
        homeSubtext,
        homeTextSize,
        homeTextColor,
        homeTextFont,
        homeSubtextSize,
        homeSubtextColor,
        homeSubtextFont,
        homeBackground,
        homeBackgroundMobile,
    ])

    // Font options
    const fontOptions = [
        { value: "font-normal", label: "Normal" },
        { value: "font-medium", label: "Medium" },
        { value: "font-semibold", label: "Semi Bold" },
        { value: "font-bold", label: "Bold" },
        { value: "font-extrabold", label: "Extra Bold" },
        { value: "italic", label: "Italic" },
    ]

    // Text size options - expanded with more small sizes for mobile
    const textSizeOptions = [
        { value: "text-xs", label: "Extra Small (xs)" },
        { value: "text-sm", label: "Small (sm)" },
        { value: "text-base", label: "Base" },
        { value: "text-lg", label: "Large (lg)" },
        { value: "text-xl", label: "Extra Large (xl)" },
        { value: "text-2xl", label: "2XL" },
        { value: "text-3xl", label: "3XL" },
        { value: "text-4xl", label: "4XL" },
        { value: "text-5xl", label: "5XL" },
        { value: "text-6xl", label: "6XL" },
        { value: "text-7xl", label: "7XL" },
        { value: "text-8xl", label: "8XL" },
        { value: "text-9xl", label: "9XL" },
    ]

    // Mobile-specific smaller text options
    const mobileTextSizeOptions = [
        { value: "text-[0.5rem]", label: "Tiny (0.5rem)" },
        { value: "text-[0.625rem]", label: "Micro (0.625rem)" },
        { value: "text-[0.75rem]", label: "Mini (0.75rem)" },
        ...textSizeOptions
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

    const handleHomeBackgroundChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setHomeBackgroundFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewHomeBackground(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleHomeBackgroundMobileChange = (e) => {
        const file = e.target.files[0]
        if (file) {
            setHomeBackgroundMobileFile(file)
            const reader = new FileReader()
            reader.onload = (e) => {
                setPreviewHomeBackgroundMobile(e.target.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const saveHomeContent = async () => {
        try {
            // First, upload the background images if there are new ones
            let backgroundImageUrl = previewHomeBackground
            let backgroundImageMobileUrl = previewHomeBackgroundMobile

            if (homeBackgroundFile) {
                const formData = new FormData()
                formData.append("file", homeBackgroundFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload desktop background image")
                }

                const uploadData = await uploadRes.json()
                backgroundImageUrl = uploadData.url
            }

            if (homeBackgroundMobileFile) {
                const formData = new FormData()
                formData.append("file", homeBackgroundMobileFile)

                const uploadRes = await fetch("/api/upload", {
                    method: "POST",
                    body: formData,
                })

                if (!uploadRes.ok) {
                    throw new Error("Failed to upload mobile background image")
                }

                const uploadData = await uploadRes.json()
                backgroundImageMobileUrl = uploadData.url
            }

            // Combine mobile and desktop sizes into responsive classes
            const combinedMainTextSize = `${editHomeTextSizeMobile} md:${editHomeTextSizeDesktop}`
            const combinedSubtextSize = `${editHomeSubtextSizeMobile} md:${editHomeSubtextSizeDesktop}`

            // Then save the home content with text styles
            const res = await fetch("/api/home-content", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    backgroundImage: backgroundImageUrl,
                    backgroundImageMobile: backgroundImageMobileUrl,
                    mainText: editHomeText,
                    subText: editHomeSubtext,
                    textStyles: {
                        mainTextSize: combinedMainTextSize,
                        mainTextColor: editHomeTextColor,
                        mainTextFont: editHomeTextFont,
                        subtextSize: combinedSubtextSize,
                        subtextColor: editHomeSubtextColor,
                        subtextFont: editHomeSubtextFont,
                    },
                }),
            })

            if (!res.ok) {
                throw new Error("Failed to save home content")
            }

            setEditingHome(false)
            setHomeBackgroundFile(null)
            setHomeBackgroundMobileFile(null)
            alert("Home content saved successfully!")
            fetchHomeContent()
        } catch (err) {
            console.error("Error saving home content:", err)
            alert("Failed to save home content. Please try again.")
        }
    }

    return (
        <div
            className="mt-8 rounded-lg p-4 sm:p-6"
            style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
            <h2 className="text-2xl font-bold mb-4 flex items-center">
                <Type className="mr-2" size={24} />
                Home Page Content
            </h2>

            {editingHome ? (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Desktop Background Image</label>
                        <div className="flex items-center space-x-4">
                            {previewHomeBackground && (
                                <div className="relative w-40 h-24 bg-gray-200 rounded overflow-hidden">
                                    <Image
                                        src={previewHomeBackground || "/assets/placeholder.svg"}
                                        alt="Home background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleHomeBackgroundChange}
                                className="border rounded p-2"
                                style={{
                                    backgroundColor: siteTheme.secondaryBgColor,
                                    color: siteTheme.textColor,
                                    borderColor: siteTheme.borderColor,
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Mobile Background Image</label>
                        <div className="flex items-center space-x-4">
                            {previewHomeBackgroundMobile && (
                                <div className="relative w-24 h-40 bg-gray-200 rounded overflow-hidden">
                                    <Image
                                        src={previewHomeBackgroundMobile || "/assets/placeholder.svg"}
                                        alt="Home mobile background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleHomeBackgroundMobileChange}
                                className="border rounded p-2"
                                style={{
                                    backgroundColor: siteTheme.secondaryBgColor,
                                    color: siteTheme.textColor,
                                    borderColor: siteTheme.borderColor,
                                }}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Main Text</label>
                        <input
                            type="text"
                            value={editHomeText}
                            onChange={(e) => setEditHomeText(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                            style={{
                                backgroundColor: siteTheme.secondaryBgColor,
                                color: siteTheme.textColor,
                                borderColor: siteTheme.borderColor,
                            }}
                            placeholder="Main heading text"
                        />

                        <div className="mt-3 border-t pt-3" style={{ borderColor: siteTheme.borderColor }}>
                            <div className="flex items-center mb-3">
                                <Monitor className="mr-2" size={18} />
                                <h3 className="font-medium">Desktop Text Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Desktop Text Size</label>
                                    <select
                                        value={editHomeTextSizeDesktop}
                                        onChange={(e) => setEditHomeTextSizeDesktop(e.target.value)}
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
                                        value={editHomeTextColor}
                                        onChange={(e) => setEditHomeTextColor(e.target.value)}
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
                                        value={editHomeTextFont}
                                        onChange={(e) => setEditHomeTextFont(e.target.value)}
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

                            <div className="flex items-center mb-3 mt-4">
                                <Smartphone className="mr-2" size={18} />
                                <h3 className="font-medium">Mobile Text Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Text Size</label>
                                    <select
                                        value={editHomeTextSizeMobile}
                                        onChange={(e) => setEditHomeTextSizeMobile(e.target.value)}
                                        className="w-full p-2 rounded"
                                        style={{
                                            backgroundColor: siteTheme.secondaryBgColor,
                                            color: siteTheme.textColor,
                                            borderColor: siteTheme.borderColor,
                                        }}
                                    >
                                        {mobileTextSizeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Sub Text</label>
                        <textarea
                            value={editHomeSubtext}
                            onChange={(e) => setEditHomeSubtext(e.target.value)}
                            className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                            style={{
                                backgroundColor: siteTheme.secondaryBgColor,
                                color: siteTheme.textColor,
                                borderColor: siteTheme.borderColor,
                            }}
                            placeholder="Subheading or description text"
                            rows={3}
                        />

                        <div className="mt-3 border-t pt-3" style={{ borderColor: siteTheme.borderColor }}>
                            <div className="flex items-center mb-3">
                                <Monitor className="mr-2" size={18} />
                                <h3 className="font-medium">Desktop Subtext Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Desktop Subtext Size</label>
                                    <select
                                        value={editHomeSubtextSizeDesktop}
                                        onChange={(e) => setEditHomeSubtextSizeDesktop(e.target.value)}
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
                                        value={editHomeSubtextColor}
                                        onChange={(e) => setEditHomeSubtextColor(e.target.value)}
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
                                        value={editHomeSubtextFont}
                                        onChange={(e) => setEditHomeSubtextFont(e.target.value)}
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

                            <div className="flex items-center mb-3 mt-4">
                                <Smartphone className="mr-2" size={18} />
                                <h3 className="font-medium">Mobile Subtext Settings</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Mobile Subtext Size</label>
                                    <select
                                        value={editHomeSubtextSizeMobile}
                                        onChange={(e) => setEditHomeSubtextSizeMobile(e.target.value)}
                                        className="w-full p-2 rounded"
                                        style={{
                                            backgroundColor: siteTheme.secondaryBgColor,
                                            color: siteTheme.textColor,
                                            borderColor: siteTheme.borderColor,
                                        }}
                                    >
                                        {mobileTextSizeOptions.map((option) => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Preview section */}
                    <div className="mt-6 border-t pt-4" style={{ borderColor: siteTheme.borderColor }}>
                        <h3 className="text-lg font-medium mb-3">Preview</h3>

                        <div className="flex space-x-2 mb-4">
                            <button
                                onClick={() => setPreviewMode("desktop")}
                                className={`py-1 px-3 rounded flex items-center ${previewMode === "desktop" ? "ring-2" : ""
                                    }`}
                                style={{
                                    backgroundColor: previewMode === "desktop" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                                    color: siteTheme.textColor,
                                    ringColor: siteTheme.accentColor
                                }}
                            >
                                <Monitor size={16} className="mr-1" /> Desktop
                            </button>
                            <button
                                onClick={() => setPreviewMode("mobile")}
                                className={`py-1 px-3 rounded flex items-center ${previewMode === "mobile" ? "ring-2" : ""
                                    }`}
                                style={{
                                    backgroundColor: previewMode === "mobile" ? siteTheme.accentColor : siteTheme.secondaryBgColor,
                                    color: siteTheme.textColor,
                                    ringColor: siteTheme.accentColor
                                }}
                            >
                                <Smartphone size={16} className="mr-1" /> Mobile
                            </button>
                        </div>

                        <div
                            className="relative overflow-hidden rounded"
                            style={{
                                width: previewMode === "desktop" ? "100%" : "320px",
                                height: "200px",
                                margin: previewMode === "mobile" ? "0 auto" : "0"
                            }}
                        >
                            {/* Background */}
                            {previewMode === "desktop" && previewHomeBackground ? (
                                <div className="absolute inset-0">
                                    <Image
                                        src={previewHomeBackground || "/assets/placeholder.svg"}
                                        alt="Preview background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                                </div>
                            ) : previewMode === "mobile" && previewHomeBackgroundMobile ? (
                                <div className="absolute inset-0">
                                    <Image
                                        src={previewHomeBackgroundMobile || "/assets/placeholder.svg"}
                                        alt="Preview mobile background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                    <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                                </div>
                            ) : (
                                <div className="absolute inset-0" style={{ backgroundColor: siteTheme.secondaryBgColor }}></div>
                            )}

                            {/* Text */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                <p
                                    className={`${previewMode === "desktop" ? editHomeTextSizeDesktop : editHomeTextSizeMobile} ${editHomeTextColor} ${editHomeTextFont} mb-2`}
                                >
                                    {editHomeText || "Main Text"}
                                </p>
                                <p
                                    className={`${previewMode === "desktop" ? editHomeSubtextSizeDesktop : editHomeSubtextSizeMobile} ${editHomeSubtextColor} ${editHomeSubtextFont}`}
                                >
                                    {editHomeSubtext || "Subtext"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        <button
                            onClick={saveHomeContent}
                            className="font-bold py-2 px-4 rounded"
                            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                        >
                            Save Changes
                        </button>
                        <button
                            onClick={() => {
                                setEditingHome(false)
                                setPreviewHomeBackground(homeBackground)
                                setPreviewHomeBackgroundMobile(homeBackgroundMobile)
                                setEditHomeText(homeText)
                                setEditHomeSubtext(homeSubtext)

                                // Reset to original values
                                const origMainTextSizes = parseResponsiveSize(homeTextSize, "text-4xl", "text-2xl")
                                const origSubtextSizes = parseResponsiveSize(homeSubtextSize, "text-xl", "text-base")

                                setEditHomeTextSizeDesktop(origMainTextSizes.desktop)
                                setEditHomeTextSizeMobile(origMainTextSizes.mobile)
                                setEditHomeSubtextSizeDesktop(origSubtextSizes.desktop)
                                setEditHomeSubtextSizeMobile(origSubtextSizes.mobile)

                                setEditHomeTextColor(homeTextColor)
                                setEditHomeTextFont(homeTextFont)
                                setEditHomeSubtextColor(homeSubtextColor)
                                setEditHomeSubtextFont(homeSubtextFont)
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
                    <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-lg font-medium mb-2">Desktop Background</h3>
                            {homeBackground ? (
                                <div className="relative w-full h-40 bg-gray-200 rounded overflow-hidden mb-2">
                                    <Image
                                        src={homeBackground || "/assets/placeholder.svg"}
                                        alt="Home background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-full h-40 rounded flex items-center justify-center mb-2"
                                    style={{ backgroundColor: siteTheme.secondaryBgColor }}
                                >
                                    <p>No desktop background image set</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <h3 className="text-lg font-medium mb-2">Mobile Background</h3>
                            {homeBackgroundMobile ? (
                                <div className="relative w-32 h-40 bg-gray-200 rounded overflow-hidden mb-2 mx-auto">
                                    <Image
                                        src={homeBackgroundMobile || "/assets/placeholder.svg"}
                                        alt="Home mobile background"
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                            ) : (
                                <div
                                    className="w-32 h-40 rounded flex items-center justify-center mb-2 mx-auto"
                                    style={{ backgroundColor: siteTheme.secondaryBgColor }}
                                >
                                    <p className="text-center text-sm">No mobile background image set</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="mt-4">
                        <div className="flex items-center mb-2">
                            <Monitor className="mr-2" size={16} />
                            <h3 className="font-medium">Desktop Preview</h3>
                        </div>
                        <div style={{ maxWidth: "800px" }} className="overflow-hidden">
                            <p className={`${mainTextSizes.desktop} ${homeTextColor} ${homeTextFont}`}>{homeText || "No main text set"}</p>
                        </div>
                        <div style={{ maxWidth: "800px" }} className="overflow-hidden mt-4">
                            <p className={`${subtextSizes.desktop} ${homeSubtextColor} ${homeSubtextFont}`}>
                                {homeSubtext || "No subtext set"}
                            </p>
                        </div>

                        <div className="mt-4 pt-4 border-t" style={{ borderColor: siteTheme.borderColor }}>
                            <div className="flex items-center mb-2">
                                <Smartphone className="mr-2" size={16} />
                                <h3 className="font-medium">Mobile Preview</h3>
                            </div>
                            <div style={{ maxWidth: "320px" }} className="overflow-hidden">
                                <p className={`${mainTextSizes.mobile} ${homeTextColor} ${homeTextFont} break-words overflow-wrap`}>
                                    {homeText || "No main text set"}
                                </p>
                            </div>
                            <div style={{ maxWidth: "320px" }} className="overflow-hidden mt-2">
                                <p className={`${subtextSizes.mobile} ${homeSubtextColor} ${homeSubtextFont} break-words overflow-wrap`}>
                                    {homeSubtext || "No subtext set"}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setEditingHome(true)
                            // Ensure we start with current values
                            setPreviewHomeBackground(homeBackground)
                            setPreviewHomeBackgroundMobile(homeBackgroundMobile)
                            setEditHomeText(homeText)
                            setEditHomeSubtext(homeSubtext)

                            // Set the parsed sizes
                            const currentMainTextSizes = parseResponsiveSize(homeTextSize, "text-4xl", "text-2xl")
                            const currentSubtextSizes = parseResponsiveSize(homeSubtextSize, "text-xl", "text-base")

                            setEditHomeTextSizeDesktop(currentMainTextSizes.desktop)
                            setEditHomeTextSizeMobile(currentMainTextSizes.mobile)
                            setEditHomeSubtextSizeDesktop(currentSubtextSizes.desktop)
                            setEditHomeSubtextSizeMobile(currentSubtextSizes.mobile)

                            setEditHomeTextColor(homeTextColor)
                            setEditHomeTextFont(homeTextFont)
                            setEditHomeSubtextColor(homeSubtextColor)
                            setEditHomeSubtextFont(homeSubtextFont)
                        }}
                        className="mt-4 font-bold py-2 px-4 rounded flex items-center"
                        style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                    >
                        <Edit size={16} className="mr-2" /> Edit Home Content
                    </button>
                </div>
            )}
        </div>
    )
}
