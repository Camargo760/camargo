"use client"

import { useState } from "react"
import { useSignUp } from "@clerk/nextjs"

const EmailAuthVerification = ({ email, onVerificationComplete }) => {
  const [otpCode, setOtpCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp, setActive } = useSignUp()

  const sendVerificationCode = async () => {
    try {
      setError(null)
      setLoading(true)

      if (!signUp.emailAddress) {
        await signUp.create({ emailAddress: email });
      }
  
      // Create verification code
      await signUp.prepareEmailAddressVerification()

      // Send the OTP code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });


      console.log("Verification code sent successfully!")
      setIsCodeSent(true)
      setLoading(false)
    } catch (err) {
      console.error("Error sending verification code:", err)
      let errorMessage = "Failed to send verification code"

      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    try {
      setError(null)
      setLoading(true)

      // Attempt to verify the email address with the code
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: otpCode,
      })

      if (completeSignUp.status !== "complete") {
        // Handle verification still pending
        throw new Error("Verification not complete. Please try again.")
      }

      // Set the user session active
      await setActive({ session: completeSignUp.createdSessionId })

      console.log("Email verification successful!")
      setLoading(false)
      onVerificationComplete(true)
    } catch (err) {
      console.error("Error verifying code:", err)

      let errorMessage = "Invalid verification code"
      if (err.errors && err.errors.length > 0) {
        errorMessage = err.errors[0].message
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  // If email has been sent but not yet verified
  if (isCodeSent) {
    return (
      <div className="mb-6">
        <div className="text-sm text-gray-600 mb-2">Enter the 6-digit verification code sent to {email}</div>

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
            onClick={() => {
              setIsCodeSent(false)
              setOtpCode("")
              setError(null)
            }}
            className="py-2 px-4 border border-gray-300 rounded focus:outline-none hover:bg-gray-100"
          >
            Change Email
          </button>

          <button
            onClick={verifyCode}
            disabled={loading || otpCode.length !== 6}
            className={`flex-1 py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              otpCode.length === 6
                ? "bg-blue-500 hover:bg-blue-700 text-white"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </div>

        <div className="text-sm text-gray-600 mt-4 text-center">
          Did not receive the code?{" "}
          <button onClick={sendVerificationCode} disabled={loading} className="text-blue-600 hover:underline">
            {loading ? "Sending..." : "Resend Code"}
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
          <div className="text-sm text-gray-600 mb-2">We will send a verification code to this email address</div>
          <div className="font-medium">{email}</div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded mb-4 text-sm">{error}</div>
      )}

      <button
        onClick={sendVerificationCode}
        disabled={loading}
        className={`w-full py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
          !loading ? "bg-blue-500 hover:bg-blue-700 text-white" : "bg-gray-400 text-gray-200 cursor-not-allowed"
        }`}
      >
        {loading ? "Sending..." : "Send Verification Code"}
      </button>
    </div>
  )
}

export default EmailAuthVerification
