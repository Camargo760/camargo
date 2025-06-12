"use client"

import { useState, useEffect } from "react"
import { Trash2, Plus, Percent, Tag } from "lucide-react"

export default function DiscountManagement({ siteTheme }) {
  const [coupons, setCoupons] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const [couponCode, setCouponCode] = useState("")
  const [discountPercentage, setDiscountPercentage] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    fetchCoupons()
  }, [])

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/coupons")
      if (response.ok) {
        const data = await response.json()
        setCoupons(data)
      } else {
        throw new Error("Failed to fetch coupons")
      }
    } catch (err) {
      setError("Failed to load coupons")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!couponCode || !discountPercentage) {
      setError("Please fill in all required fields")
      return
    }

    if (discountPercentage < 1 || discountPercentage > 100) {
      setError("Discount percentage must be between 1 and 100")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/coupons", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: couponCode.toUpperCase(),
          discountPercentage: Number.parseFloat(discountPercentage),
          description,
          isActive,
        }),
      })

      if (response.ok) {
        setSuccess("Coupon created successfully!")
        setCouponCode("")
        setDiscountPercentage("")
        setDescription("")
        setIsActive(true)
        fetchCoupons()

        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to create coupon")
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) {
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSuccess("Coupon deleted successfully!")
        fetchCoupons()

        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error("Failed to delete coupon")
      }
    } catch (err) {
      setError("Failed to delete coupon")
    } finally {
      setLoading(false)
    }
  }

  const toggleCouponStatus = async (couponId, currentStatus) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !currentStatus,
        }),
      })

      if (response.ok) {
        setSuccess(`Coupon ${!currentStatus ? "activated" : "deactivated"} successfully!`)
        fetchCoupons()

        setTimeout(() => setSuccess(null), 3000)
      } else {
        throw new Error("Failed to update coupon status")
      }
    } catch (err) {
      setError("Failed to update coupon status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center mb-6">
        <Percent className="mr-2" size={24} />
        <h2 className="text-2xl font-bold">Discount Management</h2>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <p>{success}</p>
        </div>
      )}

      <div
        className="rounded-lg p-6 mb-8"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Create New Coupon
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="couponCode"
                style={{ color: siteTheme.textColor }}
              >
                Coupon Code *
              </label>
              <input
                className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                id="couponCode"
                type="text"
                placeholder="SAVE20"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                required
              />
            </div>

            <div>
              <label
                className="block text-sm font-bold mb-2"
                htmlFor="discountPercentage"
                style={{ color: siteTheme.textColor }}
              >
                Discount Percentage (1-100) *
              </label>
              <input
                className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                style={{
                  backgroundColor: siteTheme.secondaryBgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
                id="discountPercentage"
                type="number"
                min="1"
                max="100"
                placeholder="20"
                value={discountPercentage}
                onChange={(e) => setDiscountPercentage(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label
              className="block text-sm font-bold mb-2"
              htmlFor="description"
              style={{ color: siteTheme.textColor }}
            >
              Description (Optional)
            </label>
            <input
              className="appearance-none rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
              id="description"
              type="text"
              placeholder="20% off all products"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mr-2"
              />
              <span style={{ color: siteTheme.textColor }}>Active (customers can use this coupon)</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            style={{
              backgroundColor: siteTheme.accentColor,
              color: siteTheme.textColor,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Creating..." : "Create Coupon"}
          </button>
        </form>
      </div>

      <div
        className="rounded-lg p-6"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center">
          <Tag className="mr-2" size={20} />
          Existing Coupons ({coupons.length})
        </h3>

        {loading && coupons.length === 0 ? (
          <div className="text-center py-8">
            <p className="mt-2">Loading coupons...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="text-center py-8">
            <p style={{ color: siteTheme.textColor }}>No coupons created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                  <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Code
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Discount
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Description
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Status
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Created
                  </th>
                  <th className="px-4 py-2 text-center text-sm font-semibold" style={{ color: siteTheme.textColor }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon._id} className="border-t" style={{ borderColor: siteTheme.borderColor }}>
                    <td className="px-4 py-3">
                      <span
                        className="font-mono font-bold px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: siteTheme.accentColor,
                          color: siteTheme.textColor,
                        }}
                      >
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3" style={{ color: siteTheme.textColor }}>
                      {coupon.discountPercentage}%
                    </td>
                    <td className="px-4 py-3" style={{ color: siteTheme.textColor }}>
                      {coupon.description || "No description"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="px-2 py-1 rounded text-xs font-semibold"
                        style={{
                          backgroundColor: coupon.isActive ? "#10B981" : "#EF4444",
                          color: "#FFFFFF",
                        }}
                      >
                        {coupon.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: siteTheme.textColor }}>
                      {new Date(coupon.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          onClick={() => toggleCouponStatus(coupon._id, coupon.isActive)}
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: coupon.isActive ? "#EAB308" : "#10B981",
                            color: "#FFFFFF",
                          }}
                          disabled={loading}
                        >
                          {coupon.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="p-1 rounded hover:opacity-80"
                          style={{ backgroundColor: "#EF4444", color: "#FFFFFF" }}
                          disabled={loading}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
