"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/Header"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })
  const router = useRouter()

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

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result.error) {
        throw new Error(result.error)
      }

      // Redirect to home page on successful login
      router.push("/")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError(err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-10 px-4 md:px-8 w-full max-w-lg flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Log In
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            <p>{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-lg p-8 space-y-6 w-full shadow-lg"
          style={{
            backgroundColor: siteTheme.cardBgColor,
            borderColor: siteTheme.borderColor,
            borderWidth: "1px",
          }}
        >
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out"
            style={{
              backgroundColor: siteTheme.accentColor,
              color: siteTheme.textColor,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          <div className="text-center mt-4">
            <p style={{ color: siteTheme.textColor }}>
              Do not have an account?{" "}
              <Link href="/signup" className="hover:underline" style={{ color: siteTheme.accentColor }}>
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
