"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/Header"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, sendSignInLinkToEmail } from "firebase/auth"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
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

  const initializeFirebase = () => {
    const firebaseConfig = {
      apiKey: "AIzaSyAa2ypCdwLJfp88i1e0w-9GJE8iFnk6CuY",
      authDomain: "camargosworld-38371.firebaseapp.com",
      projectId: "camargosworld-38371",
      storageBucket: "camargosworld-38371.firebasestorage.app",
      messagingSenderId: "641311677825",
      appId: "1:641311677825:web:097da69d25ce455fec1c80"
    }

    try {
      // Initialize Firebase if not already initialized
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      return getAuth(app)
    } catch (error) {
      console.error("Error initializing Firebase:", error)
      setError("Failed to initialize authentication. Please try again later.")
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setError("")
    setLoading(true)

    try {
      // First register the user in your backend
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text()
        console.error("Non-JSON response:", text)
        throw new Error("Server returned non-JSON response")
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up")
      }

      // Now send verification email via Firebase
      await sendVerificationEmail()
      
    } catch (err) {
      console.error("Signup error:", err)
      setError(err.message || "An error occurred during sign up")
      setLoading(false)
    }
  }

  const sendVerificationEmail = async () => {
    try {
      const auth = initializeFirebase()
      if (!auth) return

      const actionCodeSettings = {
        url: window.location.origin + "/email-verification-complete",
        handleCodeInApp: true,
      }

      await sendSignInLinkToEmail(auth, email, actionCodeSettings)

      // Save the email for later use
      window.localStorage.setItem('emailForSignIn', email)

      console.log("Verification email sent successfully!")
      setIsEmailSent(true)
      setSuccess(true)
      setLoading(false)
    } catch (err) {
      console.error("Error sending verification email:", err)
      let errorMessage = "Failed to send verification email"

      if (err.code === "auth/invalid-email") {
        errorMessage = "The email address is invalid. Please enter a valid email."
      } else if (err.code === "auth/user-disabled") {
        errorMessage = "This user account has been disabled."
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection and try again."
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
        <Header />
        <main className="container mx-auto py-10 px-4 md:px-8 w-full max-w-lg flex flex-col items-center">
          <div 
            className="rounded-lg p-8 space-y-6 w-full shadow-lg text-center"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <svg 
              className="w-16 h-16 mx-auto mb-4" 
              fill="none" 
              stroke={siteTheme.accentColor} 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <h3 className="text-xl font-bold mb-2">Check your email</h3>
            <p className="mb-4">
              We've sent a verification link to <strong>{email}</strong>
            </p>
            <p className="mb-6">
              Click the link in the email to verify your account and complete sign up.
            </p>

            {error && (
              <div 
                className="px-3 py-2 rounded mb-4 text-sm"
                style={{ 
                  backgroundColor: "rgba(239, 68, 68, 0.2)", 
                  color: "#ef4444",
                  border: "1px solid #ef4444"
                }}
              >
                {error}
              </div>
            )}

            <div className="text-sm mt-6">
              Didn't receive the email? Check your spam folder or{" "}
              <button
                onClick={sendVerificationEmail}
                disabled={loading}
                className="hover:underline font-medium"
                style={{ color: siteTheme.accentColor }}
              >
                {loading ? "Sending..." : "Send again"}
              </button>
            </div>

            <div className="mt-6">
              <button
                onClick={() => setIsEmailSent(false)}
                className="hover:underline"
                style={{ color: siteTheme.textColor, opacity: 0.8 }}
              >
                Use a different email address
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-10 px-4 md:px-8 w-full max-w-lg flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Sign Up
        </h1>

        {error && (
          <div 
            className="px-4 py-3 rounded mb-4 w-full"
            style={{ 
              backgroundColor: "rgba(239, 68, 68, 0.2)", 
              color: "#ef4444",
              border: "1px solid #ef4444"
            }}
          >
            <p>{error}</p>
          </div>
        )}

        {success && !isEmailSent && (
          <div 
            className="px-4 py-3 rounded mb-4 w-full"
            style={{ 
              backgroundColor: "rgba(34, 197, 94, 0.2)", 
              color: "#22c55e",
              border: "1px solid #22c55e"
            }}
          >
            <p>Account created successfully! Redirecting to login...</p>
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
            <label htmlFor="name" className="block text-lg font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <div className="text-center mt-4">
            <p style={{ color: siteTheme.textColor }}>
              Already have an account?{" "}
              <Link href="/login" className="hover:underline" style={{ color: siteTheme.accentColor }}>
                Log In
              </Link>
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
