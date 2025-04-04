"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/Header"
import SimpleCaptcha from "../../components/SimpleCaptcha"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaVerified, setCaptchaVerified] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Verify captcha first
    if (!captchaVerified) {
      setError("Please verify the captcha first")
      return
    }

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
      setCaptchaVerified(false)
    } finally {
      setLoading(false)
    }
  }

  const handleCaptchaVerify = (verified) => {
    setCaptchaVerified(verified)
  }

  return (
    <>
      <Header />
      <main className="container mx-auto px-8 py-100 px-4 md:px-8 md:py-100 w-full max-w-lg">
        <h1 className="text-3xl font-extrabold mb-8 text-center text-gray-800">Log In</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white shadow-lg rounded-lg p-8 space-y-6">
          <div className="mb-4">
            <label htmlFor="email" className="block text-lg font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-lg font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <SimpleCaptcha onVerify={handleCaptchaVerify} />

          <button
            type="submit"
            disabled={loading || !captchaVerified}
            className={`w-full font-semibold py-3 px-6 rounded-lg transition duration-300 ease-in-out ${
              captchaVerified
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {loading ? "Logging In..." : "Log In"}
          </button>

          <div className="text-center mt-4">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link href="/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </main>
    </>
  )
}


