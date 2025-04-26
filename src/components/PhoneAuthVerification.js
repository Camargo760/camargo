"use client"

import { useState, useEffect } from "react"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth"

const PhoneAuthVerification = ({ phone, onVerificationComplete }) => {
  const [verificationId, setVerificationId] = useState(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recaptchaVerified, setRecaptchaVerified] = useState(false)
  const [recaptchaReady, setRecaptchaReady] = useState(false)

  // Initialize Firebase on component mount
  useEffect(() => {
    const firebaseConfig = {
      apiKey: "AIzaSyAa2ypCdwLJfp88i1e0w-9GJE8iFnk6CuY",
      authDomain: "camargosworld.com",
      projectId: "camargosworld-38371",
      storageBucket: "camargosworld-38371.firebasestorage.app",
      messagingSenderId: "641311677825",
      appId: "1:641311677825:web:097da69d25ce455fec1c80"
    }

    try {
      // Initialize Firebase if not already initialized
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      const auth = getAuth(app)

      // Clear any existing recaptcha to prevent conflicts
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        } catch (e) {
          console.error("Error clearing existing recaptcha:", e)
        }
      }

      // Create a new recaptcha verifier with correct options
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "normal",
        callback: () => {
          console.log("reCAPTCHA verified!")
          setRecaptchaVerified(true)
        },
        "expired-callback": () => {
          setRecaptchaVerified(false)
          setError("reCAPTCHA expired. Please solve it again.")
        },
      })

      // Render the reCAPTCHA
      window.recaptchaVerifier
        .render()
        .then((widgetId) => {
          window.recaptchaWidgetId = widgetId
          setRecaptchaReady(true)
          console.log("reCAPTCHA rendered successfully!")
        })
        .catch((error) => {
          console.error("Error rendering reCAPTCHA:", error)
          setError("Failed to load verification. Please refresh the page.")
        })
    } catch (error) {
      console.error("Error initializing Firebase or reCAPTCHA:", error)
      setError("Failed to initialize verification. Please refresh the page.")
    }

    return () => {
      // Clean up recaptcha when component unmounts
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          window.recaptchaVerifier = null
        } catch (e) {
          console.error("Error clearing recaptcha:", e)
        }
      }
    }
  }, [])

  const sendVerificationCode = async () => {
    try {
      setError(null)
      setLoading(true)

      // Format phone number to E.164 format (required by Firebase)
      let formattedPhone = phone.trim()
      if (!formattedPhone.startsWith("+")) {
        // Check if it has a 1 at the start (US number)
        if (!/^1/.test(formattedPhone.replace(/\D/g, ""))) {
          formattedPhone = "+1" + formattedPhone.replace(/\D/g, "")
        } else {
          formattedPhone = "+" + formattedPhone.replace(/\D/g, "")
        }
      } else {
        // Just clean the number but preserve the + sign
        formattedPhone = "+" + formattedPhone.replace(/\D/g, "").slice(formattedPhone.startsWith("+") ? 0 : 1)
      }

      const auth = getAuth()
      const appVerifier = window.recaptchaVerifier

      console.log("Sending verification code to:", formattedPhone)
      const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, appVerifier)
      console.log("Verification code sent successfully!")

      setVerificationId(confirmationResult.verificationId)
      setIsCodeSent(true)
      setLoading(false)
    } catch (err) {
      console.error("Error sending verification code:", err)
      // Provide more specific error messages
      let errorMessage = "Failed to send verification code"
      if (err.code === "auth/invalid-phone-number") {
        errorMessage = "The phone number is invalid. Please enter a valid phone number."
      } else if (err.code === "auth/quota-exceeded") {
        errorMessage = "Too many requests. Please try again later."
      } else if (err.code === "auth/configuration-not-found") {
        errorMessage = "Phone authentication isn't properly configured. Please contact support."
      } else if (err.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection and try again."
      }

      setError(errorMessage)
      setLoading(false)

      // Reset recaptcha on error
      if (window.recaptchaVerifier) {
        try {
          window.recaptchaVerifier.clear()
          const auth = getAuth()
          window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
            size: "normal",
            callback: () => {
              setRecaptchaVerified(true)
            },
          })
          window.recaptchaVerifier.render()
        } catch (e) {
          console.error("Error resetting recaptcha:", e)
        }
      }
    }
  }

  const verifyCode = async () => {
    try {
      setError(null)
      setLoading(true)

      // Import PhoneAuthProvider dynamically to avoid issues
      const { PhoneAuthProvider, signInWithCredential } = await import("firebase/auth")

      const auth = getAuth()
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode)

      // For debugging
      console.log("Verifying code with ID:", verificationId)

      await signInWithCredential(auth, credential)
      console.log("Phone verification successful!")

      setLoading(false)
      onVerificationComplete(true)
    } catch (err) {
      console.error("Error verifying code:", err)

      // Provide more specific error messages
      let errorMessage = "Invalid verification code"
      if (err.code === "auth/code-expired") {
        errorMessage = "The verification code has expired. Please request a new one."
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  if (!isCodeSent) {
    return (
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="w-full">
            <div className="text-sm text-gray-600 mb-2">We will send a verification code to this phone number</div>
            <div className="font-medium">{phone}</div>
          </div>
        </div>

        <div id="recaptcha-container" className="mb-4"></div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
        )}

        <button
          onClick={sendVerificationCode}
          disabled={loading || !recaptchaReady || !recaptchaVerified}
          className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline ${recaptchaReady && recaptchaVerified
            ? "bg-blue-500 hover:bg-blue-700 text-white"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
        >
          {loading ? "Sending..." : "Send Verification Code"}
        </button>

        {!recaptchaReady && (
          <div className="text-sm text-gray-600 mt-2 text-center">Loading verification system...</div>
        )}

        {recaptchaReady && !recaptchaVerified && (
          <div className="text-sm text-gray-600 mt-2 text-center">Please complete the reCAPTCHA verification above</div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-6">
      <div className="text-sm text-gray-600 mb-2">Enter the 6-digit verification code sent to {phone}</div>

      <input
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mb-4"
        type="text"
        placeholder="6-digit code"
        value={verificationCode}
        onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        maxLength={6}
      />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => {
            setIsCodeSent(false)
            setVerificationCode("")
            setError(null)
          }}
          className="py-2 px-4 border border-gray-300 rounded focus:outline-none hover:bg-gray-100"
        >
          Change Number
        </button>

        <button
          onClick={verifyCode}
          disabled={loading || verificationCode.length !== 6}
          className={`flex-1 py-2 px-4 rounded focus:outline-none focus:shadow-outline ${verificationCode.length === 6
            ? "bg-blue-500 hover:bg-blue-700 text-white"
            : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
        >
          {loading ? "Verifying..." : "Verify Code"}
        </button>
      </div>
    </div>
  )
}

export default PhoneAuthVerification

