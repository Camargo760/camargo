
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { initializeApp, getApps, getApp } from "firebase/app"
import { getAuth, isSignInWithEmailLink, signInWithEmailLink, sendSignInLinkToEmail } from "firebase/auth"

const EmailAuthVerification = ({ email, onVerificationComplete }) => {
    const [isEmailSent, setIsEmailSent] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isLinkVerified, setIsLinkVerified] = useState(false)

    // Initialize Firebase and check for email link on component mount
    useEffect(() => {
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
            const auth = getAuth(app)

            // Check if there's a verification email link in the URL
            const checkEmailLink = async () => {
                if (isSignInWithEmailLink(auth, window.location.href)) {
                    // Get the email from local storage
                    let emailFromStorage = window.localStorage.getItem('emailForSignIn')

                    if (!emailFromStorage && email) {
                        // If email is not in storage but provided as prop, use it
                        emailFromStorage = email
                    }

                    if (!emailFromStorage) {
                        setError("Could not find your email. Please try signing up again.")
                        return
                    }

                    try {
                        await signInWithEmailLink(auth, emailFromStorage, window.location.href)
                        window.localStorage.removeItem('emailForSignIn')
                        setIsLinkVerified(true)
                        onVerificationComplete(true)
                    } catch (error) {
                        console.error("Error completing sign-in with email link:", error)
                        setError("Failed to verify email link. Please try again.")
                    }
                }
            }

            checkEmailLink()
        } catch (error) {
            console.error("Error initializing Firebase:", error)
            setError("Failed to initialize verification. Please refresh the page.")
        }
    }, [email, onVerificationComplete])

    const sendVerificationEmail = async () => {
        try {
            setError(null)
            setLoading(true)

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

            const actionCodeSettings = {
                // URL you want to redirect to after email verification
                url: window.location.href,
                handleCodeInApp: true,
            }

            await sendSignInLinkToEmail(auth, email, actionCodeSettings)

            // Save the email for later use
            window.localStorage.setItem('emailForSignIn', email)

            console.log("Verification email sent successfully!")
            setIsEmailSent(true)
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

    // If the link has been verified, show the simple "Email verified" message
    if (isLinkVerified) {
        return (
            <div className="text-center">
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    <p className="font-bold">Email verified</p>
                </div>
            </div>
        )
    }

    // If email has been sent but not yet verified
    if (isEmailSent) {
        return (
            <div className="text-center py-4">
                <svg className="w-16 h-16 mx-auto text-blue-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <h3 className="text-xl font-bold mb-2">Check your email</h3>
                <p className="text-gray-600 mb-4">
                    Weve sent a verification link to <strong>{email}</strong>
                </p>
                <p className="text-gray-600 mb-6">
                    Click the link in the email to verify your account and complete sign up.
                </p>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">
                        {error}
                    </div>
                )}

                <div className="text-sm text-gray-600 mt-6">
                    Didnt receive the email? Check your spam folder or{" "}
                    <button
                        onClick={sendVerificationEmail}
                        disabled={loading}
                        className="text-blue-600 hover:underline font-medium"
                    >
                        {loading ? "Sending..." : "Send again"}
                    </button>
                </div>

                <div className="mt-6">
                    <button
                        onClick={() => setIsEmailSent(false)}
                        className="text-gray-500 hover:text-gray-700 underline"
                    >
                        Use a different email address
                    </button>
                </div>
            </div>
        )
    }

    // Initial state - show email form
    return (
        <div className="mb-6">
            <div className="flex items-center mb-4">
                <div className="w-full">
                    <div className="text-sm text-gray-600 mb-2">Well send a verification link to this email address</div>
                    <div className="font-medium">{email}</div>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <button
                onClick={sendVerificationEmail}
                disabled={loading}
                className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline ${!loading
                        ? "bg-blue-500 hover:bg-blue-700 text-white"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                    }`}
            >
                {loading ? "Sending..." : "Send Verification Link"}
            </button>
        </div>
    )
}

export default EmailAuthVerification
