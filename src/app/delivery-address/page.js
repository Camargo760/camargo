"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "../../components/Header"
import { useSession } from "next-auth/react"
import LoadingSpinner from "../../components/LoadingSpinner"

export default function DeliveryAddressPage() {
    const [checkoutData, setCheckoutData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [phone, setPhone] = useState("")
    const [address, setAddress] = useState("")
    const [error, setError] = useState(null)
    const [siteTheme, setSiteTheme] = useState({
        bgColor: "#0a0a0a",
        cardBgColor: "#1a1a1a",
        accentColor: "#ff3e00",
        textColor: "#f0f0f0",
        secondaryBgColor: "#2a2a2a",
        borderColor: "#333",
    })

    const router = useRouter()
    const { data: session, status } = useSession()

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
            }
        }

        const storedData = sessionStorage.getItem("checkoutData")
        if (storedData) {
            const data = JSON.parse(storedData)
            setCheckoutData(data)
            setPhone(data.phone || "")
        } else {
            router.push("/")
            return
        }

        fetchSiteTheme()
        setLoading(false)
    }, [router])

    useEffect(() => {
        if (session && session.user) {
            setEmail(session.user.email || "")
            setName(session.user.name || "")
        }
    }, [session])

    const handleSubmit = (e) => {
        e.preventDefault()

        if (!name || !email || !phone || !address) {
            setError("Please fill in all required fields")
            return
        }

        const customerInfo = {
            name,
            email,
            phone,
            address,
            coupon: checkoutData?.couponCode || "",
        }

        sessionStorage.setItem("customerInfo", JSON.stringify(customerInfo))
        router.push("/delivery-payment")
    }

    if (loading || !checkoutData) {
        return <LoadingSpinner siteTheme={siteTheme} />
    }

    return (
        <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
            <Header />
            <main className="container mx-auto py-8 px-4">
                <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
                    Delivery Information
                </h1>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-2xl mx-auto">
                        <p>{error}</p>
                    </div>
                )}

                <div className="max-w-2xl mx-auto">
                    <div
                        className="rounded-lg p-6"
                        style={{
                            backgroundColor: siteTheme.cardBgColor,
                            borderColor: siteTheme.borderColor,
                            borderWidth: "1px",
                        }}
                    >
                        <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
                            Customer Information
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="name" style={{ color: siteTheme.textColor }}>
                                    Full Name *
                                </label>
                                <input
                                    className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{
                                        backgroundColor: siteTheme.secondaryBgColor,
                                        color: siteTheme.textColor,
                                        borderColor: siteTheme.borderColor,
                                        borderWidth: "1px",
                                    }}
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="email" style={{ color: siteTheme.textColor }}>
                                    Email *
                                </label>
                                <input
                                    className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{
                                        backgroundColor: siteTheme.secondaryBgColor,
                                        color: siteTheme.textColor,
                                        borderColor: siteTheme.borderColor,
                                        borderWidth: "1px",
                                    }}
                                    id="email"
                                    type="email"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2" htmlFor="phone" style={{ color: siteTheme.textColor }}>
                                    Phone *
                                </label>
                                <input
                                    className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{
                                        backgroundColor: siteTheme.secondaryBgColor,
                                        color: siteTheme.textColor,
                                        borderColor: siteTheme.borderColor,
                                        borderWidth: "1px",
                                    }}
                                    id="phone"
                                    type="tel"
                                    placeholder="(123) 456-7890"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-6">
                                <label
                                    className="block text-sm font-bold mb-2"
                                    htmlFor="address"
                                    style={{ color: siteTheme.textColor }}
                                >
                                    Shipping Address *
                                </label>
                                <textarea
                                    className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                                    style={{
                                        backgroundColor: siteTheme.secondaryBgColor,
                                        color: siteTheme.textColor,
                                        borderColor: siteTheme.borderColor,
                                        borderWidth: "1px",
                                    }}
                                    id="address"
                                    placeholder="123 Main St, City, State, ZIP"
                                    rows="3"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <button
                                    className="w-full font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                                    style={{
                                        backgroundColor: siteTheme.accentColor,
                                        color: siteTheme.textColor,
                                    }}
                                    type="submit"
                                >
                                    Continue to Payment Options
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    )
}
