"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Upload } from "lucide-react"
import Header from '../../components/Header'

export default function Home() {
    const [currentBgColor, setCurrentBgColor] = useState("#1a1a1a")
    const [selectedSize, setSelectedSize] = useState("S")
    const [customText, setCustomText] = useState("")
    const [uploadedImage, setUploadedImage] = useState(null)
    const [fileName, setFileName] = useState("No file chosen")
    const [quantity, setQuantity] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const colorOptions = [
        { color: "#1a1a1a", title: "Black" },
        { color: "#ffffff", title: "White" },
        { color: "#808080", title: "Grey" },
        { color: "#36454F", title: "Charcoal Grey" },
        { color: "#A0522D", title: "Brown" },
        { color: "#F5F5DC", title: "Beige" },
        { color: "#ff3e00", title: "Orange" },
        { color: "#0a84ff", title: "Blue" },
        { color: "#30d158", title: "Green" },
        { color: "#5e5ce6", title: "Purple" },
        { color: "#FFD700", title: "Gold" },
        { color: "#FF1493", title: "Pink" },
    ]

    const sizeOptions = ["S", "M", "L", "XL", "XXL"]

    // Function to get color title from color value
    const getColorTitle = (colorValue) => {
        const colorOption = colorOptions.find((option) => option.color === colorValue)
        return colorOption ? colorOption.title : colorValue
    }

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0]

            // Check file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB limit")
                e.target.value = ""
                setFileName("No file chosen")
                return
            }

            setFileName(file.name)

            const reader = new FileReader()
            reader.onload = (event) => {
                setUploadedImage(event.target.result)
            }
            reader.readAsDataURL(file)
        } else {
            setFileName("No file chosen")
            setUploadedImage(null)
        }
    }

    const handlePlaceOrder = async () => {
        setLoading(true)
        try {
            // Get the color title instead of the color value
            const colorTitle = getColorTitle(currentBgColor)

            // Create a custom product in the database
            const customProduct = {
                name: "Custom Designed T-Shirt",
                description: "Personalized t-shirt with custom design",
                price: 29.99,
                category: "Custom",
                published: true,
                availableColors: [currentBgColor],
                availableSizes: [selectedSize],
                customText: customText,
                customImage: uploadedImage,
                quantity: quantity,
                colorTitle: colorTitle, // Add the color title
            }

            const response = await fetch("/api/customProducts", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(customProduct),
            })

            if (!response.ok) {
                throw new Error("Failed to create custom product")
            }

            const data = await response.json()

            // Redirect to checkout with the new product ID and color title
            router.push(
                `/checkout/${data.id}?color=${encodeURIComponent(colorTitle)}&size=${selectedSize}&price=29.99&customText=${encodeURIComponent(customText)}&quantity=${quantity}&customProduct=true`
            )

        } catch (error) {
            console.error("Error creating custom product:", error)
            alert("Failed to process your order. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-[#f0f0f0]">
            <Header />
            <main className="flex-grow">
                <div className="max-w-7xl mx-auto my-12 px-4 md:px-8">
                    <div className="md:flex md:gap-10 block">
                        <div className="mb-8 md:mb-0 bg-[#1a1a1a] p-8 rounded-lg border border-[#333] shadow-xl text-center relative overflow-hidden">
                            <div
                                className="w-full h-[400px] md:h-[500px] bg-[#2a2a2a] mb-6 flex items-center justify-center relative overflow-hidden rounded border border-[#333]"
                                style={{ backgroundColor: currentBgColor }}
                            >
                                {uploadedImage ? (
                                    <>
                                        <img
                                            src={uploadedImage || "/placeholder.svg"}
                                            alt="Custom Design"
                                            className="max-w-[80%] max-h-[80%] object-contain"
                                        />
                                        {customText && (
                                            <div className="absolute bottom-5 w-full font-['Kanit'] text-4xl font-bold text-white text-shadow text-center w-full">
                                                {customText}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="font-['Kanit'] text-4xl font-bold text-white text-shadow text-center w-full mx-auto">
                                        {customText || "YOUR DESIGN"}
                                    </div>
                                )}
                            </div>
                            <h2 className="font-['Kanit'] text-2xl text-[#ff3e00] uppercase tracking-wide mt-0 mb-4">
                                YOUR CUSTOM Design
                            </h2>
                            <p className="mb-4">Premium quality custom t-shirt with your unique design</p>
                            <p className="text-2xl font-bold text-[#ff3e00] my-4">$29.99</p>
                        </div>

                        <div className="bg-[#1a1a1a] p-8 rounded-lg border border-[#333] shadow-xl">
                            <h2 className="font-['Kanit'] text-2xl text-[#ff3e00] uppercase tracking-wide mt-0 mb-6">
                                CUSTOMIZE YOUR TEE
                            </h2>

                            <div className="mb-6" >
                                <span className="font-semibold mb-3 block text-[#f0f0f0] text-sm uppercase tracking-wide">
                                    T-SHIRT COLOR
                                </span>
                                <div>
                                    {colorOptions.map((option) => (
                                        <button
                                            key={option.color}
                                            className={`mx-2 my-2 w-9 h-9 rounded-full cursor-pointer border-2 transition-transform hover:scale-110 ${currentBgColor === option.color ? "border-[#ff3e00] scale-110" : "border-transparent"
                                                }`}
                                            style={{ backgroundColor: option.color }}
                                            onClick={() => setCurrentBgColor(option.color)}
                                            title={option.title}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="font-semibold mb-3 block text-[#f0f0f0] text-sm uppercase tracking-wide">SIZE</span>
                                <div>
                                    {sizeOptions.map((size) => (
                                        <button
                                            key={size}
                                            className={`py-2 px-5 mx-2 my-2 bg-[#2a2a2a] rounded cursor-pointer font-semibold border border-[#333] transition-all hover:bg-[#333] ${selectedSize === size ? "bg-[#ff3e00] text-white border-[#ff3e00]" : ""
                                                }`}
                                            onClick={() => setSelectedSize(size)}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="font-semibold mb-3 block text-[#f0f0f0] text-sm uppercase tracking-wide">
                                    CUSTOM TEXT
                                </span>
                                <input
                                    type="text"
                                    className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded text-[#f0f0f0] text-base transition-colors focus:outline-none focus:border-[#ff3e00]"
                                    placeholder="Enter your custom text here"
                                    value={customText}
                                    onChange={(e) => setCustomText(e.target.value)}
                                />
                            </div>

                            <div className="mb-6">
                                <span className="font-semibold mb-3 block text-[#f0f0f0] text-sm uppercase tracking-wide">
                                    UPLOAD YOUR DESIGN
                                </span>
                                <div className="flex flex-col gap-3">
                                    <label
                                        htmlFor="designUpload"
                                        className="inline-block p-3 bg-[#2a2a2a] rounded cursor-pointer text-center font-semibold border border-[#333] transition-all hover:bg-[#333] hover:border-[#ff3e00] hover:text-[#ff3e00] uppercase text-sm tracking-wide"
                                    >
                                        <Upload className="inline-block w-4 h-4 mr-2" /> CHOOSE IMAGE FILE
                                        <input
                                            type="file"
                                            id="designUpload"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                        />
                                    </label>
                                    <div className="text-sm text-[#b0b0b0]">{fileName}</div>
                                    <div className="text-xs text-[#b0b0b0]">JPG, PNG or GIF (Max 5MB)</div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <span className="font-semibold mb-3 block text-[#f0f0f0] text-sm uppercase tracking-wide">
                                    QUANTITY
                                </span>
                                <select
                                    className="w-full p-3 bg-[#2a2a2a] border border-[#333] rounded text-[#f0f0f0] text-base appearance-none bg-no-repeat bg-right pr-10"
                                    style={{
                                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='white'%3e%3cpath d='M7 10l5 5 5-5z'/%3e%3c/svg%3e")`,
                                        backgroundPosition: "right 0.8rem center",
                                        backgroundSize: "1rem",
                                    }}
                                    value={quantity}
                                    onChange={(e) => setQuantity(Number(e.target.value))}
                                >
                                    {[1, 2, 3, 4, 5].map((num) => (
                                        <option key={num} value={num}>
                                            {num}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                className="w-full bg-[#ff3e00] text-white border-none py-4 text-base font-bold rounded cursor-pointer mt-4 transition-colors hover:bg-[#ff5e24] uppercase tracking-wide flex items-center justify-center"
                                onClick={handlePlaceOrder}
                                disabled={loading}
                            >
                                {loading ? "Processing..." : "PLACE ORDER"}
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

