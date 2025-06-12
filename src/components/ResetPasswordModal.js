"use client"

import { useState } from "react"
import { X } from "lucide-react"

export default function ResetPasswordModal({ isOpen, onClose, siteTheme }) {
  const [step, setStep] = useState(1)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

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

  const handleVerifyUser = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (email.toLowerCase() === "camargo_co@outlook.com") {
      setError("You cannot change the admin password here")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/verify-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "User verification failed")
      }

      setStep(2)
    } catch (err) {
      setError(err.message || "Failed to verify user. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    const passwordErrors = validatePassword(newPassword)
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(". "))
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed")
      }

      setSuccess("Password reset successful! You can now log in with your new password.")

      setTimeout(() => {
        resetForm()
        onClose()
      }, 3000)
    } catch (err) {
      setError(err.message || "Failed to reset password. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setStep(1)
    setName("")
    setEmail("")
    setNewPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess("")
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className="relative rounded-lg p-6 max-w-md w-full"
        style={{ backgroundColor: siteTheme.cardBgColor, color: siteTheme.textColor }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={24} />
        </button>

        <h2 className="text-xl font-bold mb-4" style={{ color: siteTheme.textColor }}>
          {step === 1 ? "Reset Password" : "Create New Password"}
        </h2>

        {error && <div className="mb-4 p-3 rounded text-red-800 bg-red-100 border border-red-200">{error}</div>}

        {success && (
          <div className="mb-4 p-3 rounded text-green-800 bg-green-100 border border-green-200">{success}</div>
        )}

        {step === 1 ? (
          <form onSubmit={handleVerifyUser} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 rounded font-medium flex-1"
                style={{
                  backgroundColor: siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Verifying..." : "Continue"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded font-medium flex-1"
                style={{
                  backgroundColor: "#4B5563",
                  color: siteTheme.textColor,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                required
              />
              <p className="text-xs mt-1 opacity-70">
                Must be at least 6 characters with uppercase, lowercase, number, and special character
              </p>
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 rounded"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                required
              />
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="py-2 px-4 rounded font-medium flex-1"
                style={{
                  backgroundColor: siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2 px-4 rounded font-medium flex-1"
                style={{
                  backgroundColor: "#4B5563",
                  color: siteTheme.textColor,
                }}
              >
                Back
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
