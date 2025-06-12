"use client"

import { useState } from "react"

export default function AdminPasswordChange({ siteTheme }) {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    setLoading(true)

    if (email.toLowerCase() !== "camargo_co@outlook.com") {
      setError("You can only change the admin password with this form.")
      setLoading(false)
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match")
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
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to change password")
      }

      setSuccess("Password changed successfully!")

      setName("")
      setEmail("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err.message || "Failed to change password. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="rounded-lg p-6"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <h2 className="text-2xl font-bold mb-4">Change Admin Password</h2>

      {error && <div className="mb-4 p-3 rounded text-red-800 bg-red-100 border border-red-200">{error}</div>}

      {success && <div className="mb-4 p-3 rounded text-green-800 bg-green-100 border border-green-200">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="admin-name" className="block text-sm font-medium mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="admin-name"
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
          <label htmlFor="admin-email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <input
            type="email"
            id="admin-email"
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
          <p className="text-xs mt-1 opacity-70">Must be admin email: camargo_co@outlook.com</p>
        </div>

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

        <button
          type="submit"
          disabled={loading}
          className="py-2 px-4 rounded font-medium"
          style={{
            backgroundColor: siteTheme.accentColor,
            color: siteTheme.textColor,
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  )
}
