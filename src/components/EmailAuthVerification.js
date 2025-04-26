"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "../../components/Header"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth"

export default function EmailVerificationComplete() {
  const [verifying, setVerifying] = useState(true)
  const [verified, setVerified] = useState(false)
  const [error, setError] = useState("")
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
    verifyEmailLink()
  }, [])

  const verifyEmailLink = async () => {
    try {
      const firebaseConfig = {
        apiKey: "AIzaSyAa2ypCdwLJfp88i1e0w-9GJE8iFnk6CuY",
        authDomain: "camargosworld-38371.firebaseapp.com",
        projectId: "camargosworld-38371",
        storageBucket: "camargosworld-38371.firebasestorage.app",
        messagingSenderId: "641311677825",
        appId: "1:641311677825:web:097da69d25ce455fec1c80"
      }

      // Initialize Firebase if not already initialized
      const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
      const auth = getAuth(app)

      // Check if this is a sign-in with email link
      if (isSignInWithEmailLink(auth, window.location.href)) {
        // Get the email from localStorage that was saved in the sign-up page
        let email = window.localStorage.getItem('emailForSignIn')

        if (!email) {
          setError("Could not find your email. Please try signing up again.")
          setVerifying(false)
          return
        }

        // Sign in with the email link
        await signInWithEmailLink(auth, email, window.location.href)
        
        // Remove the email from storage
        window.localStorage.removeItem('emailForSignIn')

        // Update your backend about the email verification if needed
        try {
          await fetch("/api/auth/verify-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          })
        } catch (err) {
          console.error("Error updating backend about verification:", err)
          // Continue anyway as Firebase auth succeeded
        }

        setVerified(true)
        setVerifying(false)

        // Redirect to login page after a delay
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setError("Invalid verification link. Please request a new one.")
        setVerifying(false)
      }
    } catch (err) {
      console.error("Error verifying email link:", err)
      setError(err.message || "Failed to verify email. Please try again.")
      setVerifying(false)
    }
  }

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
          {verifying ? (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: siteTheme.accentColor }}></div>
              </div>
              <h3 className="text-xl font-bold mb-2">Verifying your email...</h3>
              <p>Please wait while we verify your email address.</p>
            </>
          ) : verified ? (
            <>
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
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold mb-2">Email Verified Successfully!</h3>
              <p className="mb-4">
                Your email has been verified successfully.
              </p>
              <p>
                You will be redirected to the login page in a few seconds...
              </p>
              <div className="mt-6">
                <Link 
                  href="/login" 
                  className="font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out inline-block"
                  style={{
                    backgroundColor: siteTheme.accentColor,
                    color: siteTheme.textColor,
                  }}
                >
                  Go to Login
                </Link>
              </div>
            </>
          ) : (
            <>
              <svg 
                className="w-16 h-16 mx-auto mb-4" 
                fill="none" 
                stroke="#ef4444" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-bold mb-2">Verification Failed</h3>
              <p className="mb-4">
                {error}
              </p>
              <div className="mt-6">
                <Link 
                  href="/signup" 
                  className="font-semibold py-2 px-6 rounded-lg transition duration-300 ease-in-out inline-block"
                  style={{
                    backgroundColor: siteTheme.accentColor,
                    color: siteTheme.textColor,
                  }}
                >
                  Back to Sign Up
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
