"use client"

import { useState, useEffect } from "react"
import { Save, Eye, EyeOff, Plus, Trash2 } from "lucide-react"

export default function PaymentSettings({ siteTheme }) {
  const [settings, setSettings] = useState({
    stripe: {
      enabled: true,
      displayName: "Credit/Debit Card",
      description: "Pay securely with your credit or debit card",
    },
    cashOnDelivery: {
      enabled: true,
      displayName: "Cash on Delivery",
      description: "Pay when you receive your order",
      methods: [
        {
          id: "cash",
          name: "Cash",
          enabled: true,
          details: "Pay with cash upon delivery",
        },
        {
          id: "zelle",
          name: "Zelle",
          enabled: true,
          details: "Camargo_co@outlook.com",
        },
      ],
    },
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/payment-settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data.settings)
      }
    } catch (error) {
      console.error("Error fetching payment settings:", error)
    }
  }

  const handleInputChange = (section, field, value) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }))
  }

  const handleMethodChange = (methodId, field, value) => {
    setSettings((prev) => ({
      ...prev,
      cashOnDelivery: {
        ...prev.cashOnDelivery,
        methods: prev.cashOnDelivery.methods.map((method) =>
          method.id === methodId ? { ...method, [field]: value } : method,
        ),
      },
    }))
  }

  const addNewMethod = () => {
    const newMethod = {
      id: `method_${Date.now()}`,
      name: "New Method",
      enabled: true,
      details: "Enter payment details",
    }

    setSettings((prev) => ({
      ...prev,
      cashOnDelivery: {
        ...prev.cashOnDelivery,
        methods: [...prev.cashOnDelivery.methods, newMethod],
      },
    }))
  }

  const removeMethod = (methodId) => {
    setSettings((prev) => ({
      ...prev,
      cashOnDelivery: {
        ...prev.cashOnDelivery,
        methods: prev.cashOnDelivery.methods.filter((method) => method.id !== methodId),
      },
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    setMessage("")

    try {
      const response = await fetch("/api/payment-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setMessage("Payment settings saved successfully!")
      } else {
        setMessage("Error saving settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      setMessage("Error saving settings")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold" style={{ color: siteTheme.textColor }}>
          Payment Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors"
          style={{
            backgroundColor: siteTheme.accentColor,
            color: siteTheme.textColor,
            opacity: loading ? 0.7 : 1,
          }}
        >
          <Save size={16} />
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.includes("Error") ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}

      {/* Stripe Settings */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: siteTheme.textColor }}>
            Stripe Payments
          </h3>
          <button
            onClick={() => handleInputChange("stripe", "enabled", !settings.stripe.enabled)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{
              backgroundColor: settings.stripe.enabled ? siteTheme.accentColor : "#6b7280",
              color: siteTheme.textColor,
            }}
          >
            {settings.stripe.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {settings.stripe.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Display Name
            </label>
            <input
              type="text"
              value={settings.stripe.displayName}
              onChange={(e) => handleInputChange("stripe", "displayName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Description
            </label>
            <input
              type="text"
              value={settings.stripe.description}
              onChange={(e) => handleInputChange("stripe", "description", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-700">
          <p className="text-sm">
            <strong>Note:</strong> Stripe keys are configured via environment variables (STRIPE_SECRET_KEY,
            NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
          </p>
        </div>
      </div>

      {/* Cash on Delivery Settings */}
      <div
        className="p-6 rounded-lg"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
          borderWidth: "1px",
        }}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold" style={{ color: siteTheme.textColor }}>
            Cash on Delivery
          </h3>
          <button
            onClick={() => handleInputChange("cashOnDelivery", "enabled", !settings.cashOnDelivery.enabled)}
            className="flex items-center gap-2 px-3 py-1 rounded-lg"
            style={{
              backgroundColor: settings.cashOnDelivery.enabled ? siteTheme.accentColor : "#6b7280",
              color: siteTheme.textColor,
            }}
          >
            {settings.cashOnDelivery.enabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {settings.cashOnDelivery.enabled ? "Enabled" : "Disabled"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Display Name
            </label>
            <input
              type="text"
              value={settings.cashOnDelivery.displayName}
              onChange={(e) => handleInputChange("cashOnDelivery", "displayName", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: siteTheme.textColor }}>
              Description
            </label>
            <input
              type="text"
              value={settings.cashOnDelivery.description}
              onChange={(e) => handleInputChange("cashOnDelivery", "description", e.target.value)}
              className="w-full px-3 py-2 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            />
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium" style={{ color: siteTheme.textColor }}>
              Payment Methods
            </h4>
            <button
              onClick={addNewMethod}
              className="flex items-center gap-2 px-3 py-1 rounded-lg"
              style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
            >
              <Plus size={16} />
              Add Method
            </button>
          </div>

          {settings.cashOnDelivery.methods.map((method) => (
            <div
              key={method.id}
              className="p-4 rounded-lg"
              style={{
                backgroundColor: siteTheme.secondaryBgColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMethodChange(method.id, "enabled", !method.enabled)}
                    className="flex items-center gap-2 px-2 py-1 rounded text-sm"
                    style={{
                      backgroundColor: method.enabled ? siteTheme.accentColor : "#6b7280",
                      color: siteTheme.textColor,
                    }}
                  >
                    {method.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <span style={{ color: siteTheme.textColor }}>{method.name}</span>
                </div>
                <button onClick={() => removeMethod(method.id)} className="p-1 rounded text-red-500 hover:bg-red-100">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: siteTheme.textColor }}>
                    Method Name
                  </label>
                  <input
                    type="text"
                    value={method.name}
                    onChange={(e) => handleMethodChange(method.id, "name", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1" style={{ color: siteTheme.textColor }}>
                    Payment Details
                  </label>
                  <input
                    type="text"
                    value={method.details}
                    onChange={(e) => handleMethodChange(method.id, "details", e.target.value)}
                    className="w-full px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      color: siteTheme.textColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
