"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Header from "../../components/Header"
import { Instagram, Facebook, Mail, Phone, MapPin, Globe } from "lucide-react"

export default function AboutPage() {
    const [aboutContent, setAboutContent] = useState("")
    const [loading, setLoading] = useState(true)
    const [flipped, setFlipped] = useState(false)

    useEffect(() => {
        const fetchAboutContent = async () => {
            try {
                const res = await fetch("/api/about-content")
                if (res.ok) {
                    const data = await res.json()
                    setAboutContent(data.description || "")
                }
            } catch (err) {
                console.error("Error fetching about content:", err)
            } finally {
                setLoading(false)
            }
        }

        fetchAboutContent()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen grid place-items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 w-full overflow-x-hidden">
            <Header />
            <main className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8 text-center">About Us</h1>

                <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8 mb-12">
                    <p className="text-lg text-gray-700 leading-relaxed">
                        {aboutContent}
                    </p>
                </div>

                <h1 className="text-3xl font-bold mb-8 text-center">Connect With Us</h1>
                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Instagram Card */}
                    <div className="h-[500px] w-[400px] md:w-full md:h-full max-w-xs mx-auto">
                        <div
                            className="w-full h-full perspective-1000 cursor-pointer"
                            onMouseEnter={() => setFlipped(true)}
                            onMouseLeave={() => setFlipped(false)}
                            onTouchStart={() => setFlipped(!flipped)}
                        >
                            <div
                                className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${flipped ? "rotate-y-180" : ""
                                    }`}
                                style={{
                                    transformStyle: "preserve-3d",
                                    transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)"
                                }}
                            >
                                {/* Front of card */}
                                <div
                                    className="absolute w-full h-full bg-white rounded-xl shadow-xl overflow-hidden"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <div className="p-6 text-center">
                                        <div className="w-32 h-32 rounded-full overflow-hidden mb-4 mx-auto">
                                            <Image src="/assets/camargo-profile.jpg" alt="Camargo Clothing Co. Logo" width={128} height={128} />
                                        </div>
                                        <h2 className="text-xl font-bold mb-2">Camargo Clothing Co.</h2>
                                        <p className="text-gray-600 text-center mb-4">Follow And Stay Posted!</p>
                                        <p className="text-gray-600 text-center mb-4">DM FOR ANY ORDERS.</p>
                                        <p className="text-gray-600 text-center mb-4">Zelle: Camargo_co@outlook.com</p>
                                        <div className="bg-gray-100 rounded-full px-4 py-2 mb-4 inline-block">
                                            <span className="text-sm font-medium">Clothing (Brand)</span>
                                        </div>
                                        <div className="block">
                                            <Link
                                                href="https://www.camargosworld.com"
                                                target="_blank"
                                                className="inline-block text-pink-500 hover:underline"
                                            >
                                                <span className="inline-block align-middle mr-1">
                                                    <Globe size={16} />
                                                </span>
                                                <span className="inline-block align-middle">www.camargosworld.com</span>
                                            </Link>
                                        </div>
                                        <div className="mt-6 text-center">
                                            <span className="inline-block align-middle">
                                                <Instagram className="text-pink-600" size={24} />
                                            </span>
                                            <span className="ml-2 font-bold inline-block align-middle">@CAMARGO_CLOTHING_CO</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Back of card */}
                                <div
                                    className="absolute flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 rounded-xl shadow-xl overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)"

                                    }}
                
                                >
                                    <div
                                        className="p-6 text-center rounded-xl"
         
                                    >
                                        <div
                                            className="bg-white p-4 rounded-xl mb-6 inline-block"
                                            style={{ transform: 'rotate(-10deg)' }}
                                        >
                                            <Image
                                                src="/assets/instagram-qr.png"
                                                alt="Instagram QR Code"
                                                width={150}
                                                height={150}
                                            />
                                        </div>
                                        <p className="text-white text-xl font-bold mb-2">Scan to Follow</p>
                                        <Link
                                            href="https://www.instagram.com/camargo_clothing_co/"
                                            target="_blank"
                                            className="text-white font-bold text-xl inline-block"
                                            style={{ transform: 'rotate(5deg)' }}
                                        >
                                            @CAMARGO_CLOTHING_CO
                                        </Link>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Facebook Profile */}
                    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-xl overflow-hidden">
                        <div className="relative h-40 bg-gray-200">
                            <Image src="/assets/camargo-banner.png" alt="Facebook Banner" fill style={{ objectFit: "cover" }} />
                        </div>
                        <div className="px-6 pt-16 pb-6 relative">
                            <div className="absolute -top-12 left-6 w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-white">
                                <Image src="/assets/camargo-profile.jpg" alt="Camargo Clothing Co. Logo" width={96} height={96} />
                            </div>
                            <h2 className="text-2xl font-bold">Camargo Clothing Co.</h2>
                            <div className="text-gray-600 text-sm mt-1">
                                <span className="inline-block">102 likes</span>
                                <span className="mx-1 inline-block">•</span>
                                <span className="inline-block">99 followers</span>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="text-gray-700">
                                    <span className="inline-block align-middle mr-2">
                                        <MapPin size={16} />
                                    </span>
                                    <span className="inline-block align-middle">Los Angeles, CA</span>
                                </div>
                                <div className="text-gray-700">
                                    <span className="inline-block align-middle mr-2">
                                        <Phone size={16} />
                                    </span>
                                    <span className="inline-block align-middle">(123) 456-7890</span>
                                </div>
                                <div className="text-gray-700">
                                    <span className="inline-block align-middle mr-2">
                                        <Mail size={16} />
                                    </span>
                                    <span className="inline-block align-middle">Camargo_co@outlook.com</span>
                                </div>
                                <div className="text-gray-700">
                                    <span className="inline-block align-middle mr-2">
                                        <Globe size={16} />
                                    </span>
                                    <Link href="https://www.camargosworld.com" target="_blank" className="text-blue-600 hover:underline inline-block align-middle">
                                        www.camargosworld.com
                                    </Link>
                                </div>
                            </div>
                            <div className="mt-6">
                                <Link
                                    href="https://www.facebook.com/CamargoClothingCo"
                                    target="_blank"
                                    className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                                >
                                    <span className="inline-block align-middle mr-2">
                                        <Facebook size={16} />
                                    </span>
                                    <span className="inline-block align-middle">Follow</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
