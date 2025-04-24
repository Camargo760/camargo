"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/Header"
import { useSignUp } from "@clerk/nextjs"
import EmailAuthVerification from "../../components/EmailAuthVerification"

export default function SignUp() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showEmailVerification, setShowEmailVerification] = useState(false)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  const router = useRouter()
  const { signUp, setActive } = useSignUp()

  // Password validation
  const validatePassword = (password) => {
    const errors = []
    if (password.length < 6) errors.push("Password must be at least 6 characters long")
    if (!/[A-Z]/.test(password)) errors.push("Password must contain at least one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("Password must contain at least one lowercase letter")
    if (!/[0-9]/.test(password)) errors.push("Password must contain at least one number")
    if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password))
      errors.push("Password must contain at least one special character")

    return errors
  }

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

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address")
      setLoading(false)
      return
    }

    // Validate password strength
    const passwordErrors = validatePassword(password)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "))
      setLoading(false)
      return
    }

    try {
      // Start the sign-up process with Clerk
      await signUp.create({
        identifier: email,
        password: password,
        emailAddress: email,
      });

      // // Step 2 (optional): Prepare name fields for update
      // const firstName = name.split(" ")[0];
      // const lastName = name.split(" ").slice(1).join(" ");

      // // Step 3: Attempt to set additional attributes (after sign-up)
      // await signUp.update({
      //   firstName,
      //   lastName,
      // });



      // Show email verification component
      setShowEmailVerification(true)
      setLoading(false)
    } catch (err) {
      console.error("Signup error:", err)

      let errorMessage = "An error occurred during sign up"
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleVerificationComplete = async (verified) => {
    if (verified) {
      // Set success state
      setSuccess(true)

      // Clear form
      setName("")
      setEmail("")
      setPassword("")
      setConfirmPassword("")
      setShowEmailVerification(false)

      // Redirect to login after a short delay
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-10 px-4 md:px-8 w-full max-w-lg flex flex-col items-center">
        <h1 className="text-3xl font-extrabold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Sign Up
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 w-full">
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 w-full">
            <p>Account created successfully! Redirecting to login...</p>
          </div>
        )}

        {showEmailVerification ? (
          <div
            className="rounded-lg p-8 space-y-6 w-full shadow-lg"
            style={{
              backgroundColor: siteTheme.cardBgColor,
              borderColor: siteTheme.borderColor,
              borderWidth: "1px",
            }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
              Verify Your Email
            </h2>
            <EmailAuthVerification email={email} onVerificationComplete={handleVerificationComplete} />
          </div>
        ) : (
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
              <label
                htmlFor="password"
                className="block text-lg font-medium mb-2"
                style={{ color: siteTheme.textColor }}
              >
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
              <p className="text-xs mt-1 opacity-70">
                Must be at least 6 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div className="mb-4">
              <label
                htmlFor="confirmPassword"
                className="block text-lg font-medium mb-2"
                style={{ color: siteTheme.textColor }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            <div id="clerk-captcha"></div>

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
        )}
      </main>
    </div>
  )
}
