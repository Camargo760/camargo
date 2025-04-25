"use client"

import { useState, useEffect, useRef } from "react"
import {
    getAuth,
    RecaptchaVerifier,
    signInWithPhoneNumber
} from "firebase/auth"
import { initializeApp } from "firebase/app"

// Firebase configuration - replace with your own config
const firebaseConfig = {
    apiKey: "AIzaSyAwgtSF2fU5YipJyztEpKkN_SPsi3QW1-4",
    authDomain: "myproject-3c36e.firebaseapp.com",
    projectId: "myproject-3c36e",
    storageBucket: "myproject-3c36e.firebasestorage.app",
    messagingSenderId: "599358717709",
    appId: "1:599358717709:web:06a4f41082eb0f58277a44",
}

// Initialize Firebase app only once
let app;
let auth;
if (typeof window !== 'undefined') {
    if (!app) {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
    }
}

const FirebasePhoneAuth = ({ phone, onVerificationComplete }) => {
    const [otpCode, setOtpCode] = useState("")
    const [isCodeSent, setIsCodeSent] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const [confirmationResult, setConfirmationResult] = useState(null)
    const [recaptchaVerified, setRecaptchaVerified] = useState(false)

    // Use a ref for the reCAPTCHA verifier
    const recaptchaVerifierRef = useRef(null)
    const recaptchaContainerRef = useRef(null)

    useEffect(() => {
        // Initialize Firebase if not already initialized
        if (typeof window !== 'undefined') {
            if (!app) {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                auth.languageCode = 'en';
            }
        }

        return () => {
            // Clean up reCAPTCHA when component unmounts
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (error) {
                    console.error("Error clearing reCAPTCHA:", error);
                }
                recaptchaVerifierRef.current = null;
            }
        }
    }, []);

    // Set up reCAPTCHA after the component has mounted and the container is available
    useEffect(() => {
        if (!isCodeSent && !recaptchaVerifierRef.current && recaptchaContainerRef.current) {
            try {
                const currentAuth = getAuth(); // safely get auth from already initialized app
                currentAuth.languageCode = 'en';
                recaptchaVerifierRef.current = new RecaptchaVerifier(
                    recaptchaContainerRef.current,
                    {
                        'size': 'normal',
                        'callback': () => {
                            setRecaptchaVerified(true);
                        },
                        'expired-callback': () => {
                            setRecaptchaVerified(false);
                            setError("reCAPTCHA expired. Please verify again.");
                        }
                    },
                    auth // Pass it as the 3rd argument here
                );

                recaptchaVerifierRef.current.render();
            } catch (error) {
                console.error("Error setting up reCAPTCHA:", error);
                setError("Failed to set up phone verification. Please try again.");
            }
        }
    }, [isCodeSent]);

    const formatPhoneNumber = (phoneNumber) => {
        // Format phone number to E.164 format
        let formattedPhone = phoneNumber.trim()
        if (!formattedPhone.startsWith("+")) {
            // Check if it has a 1 at the start (US number)
            if (!/^1/.test(formattedPhone.replace(/\D/g, ""))) {
                formattedPhone = "+1" + formattedPhone.replace(/\D/g, "")
            } else {
                formattedPhone = "+" + formattedPhone.replace(/\D/g, "")
            }
        } else {
            // Just clean the number but preserve the + sign
            formattedPhone = "+" + formattedPhone.replace(/\D/g, "")
        }
        return formattedPhone
    }

    const sendVerificationCode = async () => {
        try {
            setError(null)
            setLoading(true)

            if (!recaptchaVerified) {
                setError("Please complete the reCAPTCHA verification first")
                setLoading(false)
                return
            }

            const formattedPhone = formatPhoneNumber(phone)

            // Send verification code
            const confirmation = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifierRef.current)
            setConfirmationResult(confirmation)

            console.log("Verification code sent successfully!")
            setIsCodeSent(true)
            setLoading(false)
        } catch (err) {
            console.error("Error sending verification code:", err)

            let errorMessage = "Failed to send verification code"
            if (err.code === 'auth/invalid-phone-number') {
                errorMessage = "Invalid phone number format. Please try again."
            } else if (err.code === 'auth/too-many-requests') {
                errorMessage = "Too many requests. Please try again later."
            } else if (err.message) {
                errorMessage = err.message
            }

            setError(errorMessage)
            setLoading(false)

            // Reset reCAPTCHA if there's an error
            if (recaptchaVerifierRef.current) {
                try {
                    recaptchaVerifierRef.current.clear();
                } catch (error) {
                    console.error("Error clearing reCAPTCHA:", error);
                }
                recaptchaVerifierRef.current = null;
                setRecaptchaVerified(false);

                // The reCAPTCHA will be reinitialized by the useEffect
            }
        }
    }

    const verifyCode = async () => {
        try {
            setError(null)
            setLoading(true)

            if (!confirmationResult) {
                throw new Error("No verification code was sent. Please try again.")
            }

            // Confirm the verification code
            const result = await confirmationResult.confirm(otpCode)

            // User signed in successfully
            const user = result.user
            console.log("Phone verification successful!", user)

            setLoading(false)
            onVerificationComplete(true)
        } catch (err) {
            console.error("Error verifying code:", err)

            let errorMessage = "Invalid verification code"
            if (err.code === 'auth/invalid-verification-code') {
                errorMessage = "Invalid verification code. Please try again."
            } else if (err.code === 'auth/code-expired') {
                errorMessage = "Verification code has expired. Please request a new one."
            } else if (err.message) {
                errorMessage = err.message
            }

            setError(errorMessage)
            setLoading(false)
        }
    }

    const resetVerification = () => {
        setIsCodeSent(false)
        setOtpCode("")
        setError(null)
        setConfirmationResult(null)

        // Reset reCAPTCHA
        if (recaptchaVerifierRef.current) {
            try {
                recaptchaVerifierRef.current.clear();
            } catch (error) {
                console.error("Error clearing reCAPTCHA:", error);
            }
            recaptchaVerifierRef.current = null;
            setRecaptchaVerified(false);
        }
    }

    if (!isCodeSent) {
        return (
            <div className="mb-6">
                <div className="flex items-center mb-4">
                    <div className="w-full">
                        <div className="text-sm text-gray-600 mb-2">We'll send a verification code to this phone number</div>
                        <div className="font-medium">{phone}</div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
                )}

                <div ref={recaptchaContainerRef} className="mb-4"></div>

                <button
                    onClick={sendVerificationCode}
                    disabled={loading || !recaptchaVerified}
                    className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline ${(!loading && recaptchaVerified)
                        ? "bg-blue-500 hover:bg-blue-700 text-white"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    {loading ? "Sending..." : "Send Verification Code"}
                </button>
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
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
            />

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
            )}

            <div className="flex space-x-2">
                <button
                    onClick={resetVerification}
                    className="py-2 px-4 border border-gray-300 rounded focus:outline-none hover:bg-gray-100"
                >
                    Change Number
                </button>

                <button
                    onClick={verifyCode}
                    disabled={loading || otpCode.length !== 6}
                    className={`flex-1 py-2 px-4 rounded focus:outline-none focus:shadow-outline ${otpCode.length === 6
                        ? "bg-blue-500 hover:bg-blue-700 text-white"
                        : "bg-gray-400 text-gray-200 cursor-not-allowed"
                        }`}
                >
                    {loading ? "Verifying..." : "Verify Code"}
                </button>
            </div>

            <div className="text-sm text-gray-600 mt-4 text-center">
                Didn't receive the code?{" "}
                <button
                    onClick={resetVerification}
                    disabled={loading}
                    className="text-blue-600 hover:underline"
                >
                    Resend Code
                </button>
            </div>
        </div>
    )
}

export default FirebasePhoneAuth
