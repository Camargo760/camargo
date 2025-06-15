"use client"

import { useState, useEffect } from "react"
import { Eye, Users, Calendar, TrendingUp, Globe, Clock, BarChart3, MapPin, Flag, Building } from "lucide-react"

export default function VisitCountdown({ siteTheme }) {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [activeTab, setActiveTab] = useState("pages")
  const [showAll, setShowAll] = useState(false)
  const [error, setError] = useState(null)

  const filters = [
    { value: "today", label: "Today", icon: Calendar },
    { value: "week", label: "This Week", icon: Calendar },
    { value: "month", label: "This Month", icon: Calendar },
    { value: "year", label: "This Year", icon: Calendar },
    { value: "fiveYears", label: "Past 5 Years", icon: TrendingUp },
    { value: "all", label: "All Time", icon: Globe },
  ]

  const tabs = [
    { value: "pages", label: "Top Pages", icon: BarChart3 },
    { value: "recent", label: "Recent Visits", icon: Clock },
    { value: "countries", label: "Visit by Countries", icon: Flag },
    { value: "states", label: "Visit by US States", icon: MapPin },
  ]

  const fetchAnalytics = async (filter = "all", showAllData = false) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/visit-analytics?filter=${filter}&showAll=${showAllData}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analytics")
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError("Failed to load visit analytics")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics(selectedFilter, showAll)
  }, [selectedFilter, showAll])

  const handleFilterChange = (filter) => {
    setSelectedFilter(filter)
    setShowAll(false)
  }

  const handleShowAll = () => {
    setShowAll(!showAll)
  }

  const getCountryFlag = (countryCode) => {
    if (!countryCode || countryCode === "XX") return "🌍"
    return String.fromCodePoint(
      ...countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt()),
    )
  }

  const renderTabContent = () => {
    if (!analytics) return null

    switch (activeTab) {
      case "pages":
        return (
          <div className="space-y-3">
            {analytics.pageVisits?.map((page, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: siteTheme.textColor }}>{page._id === "/" ? "Home" : page._id}</span>
                </div>
                <span className="font-bold" style={{ color: siteTheme.accentColor }}>
                  {page.count.toLocaleString()}
                </span>
              </div>
            ))}
            {(!analytics.pageVisits || analytics.pageVisits.length === 0) && (
              <p className="text-center opacity-70" style={{ color: siteTheme.textColor }}>
                No page data available for this period
              </p>
            )}
          </div>
        )

      case "recent":
        return (
          <div className="space-y-3">
            {analytics.recentVisits?.map((visit, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded border"
                style={{ borderColor: siteTheme.borderColor }}
              >
                <div className="flex items-center space-x-3">
                  <Clock style={{ color: siteTheme.accentColor }} size={16} />
                  <div>
                    <p style={{ color: siteTheme.textColor }}>{visit.page === "/" ? "Home" : visit.page}</p>
                    <p className="text-sm opacity-70" style={{ color: siteTheme.textColor }}>
                      {visit.ip} • {visit.city}, {visit.state}, {visit.country}
                    </p>
                    <p className="text-xs opacity-50" style={{ color: siteTheme.textColor }}>
                      {new Date(visit.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {(!analytics.recentVisits || analytics.recentVisits.length === 0) && (
              <p className="text-center opacity-70" style={{ color: siteTheme.textColor }}>
                No recent visits available
              </p>
            )}
          </div>
        )

      case "countries":
        return (
          <div className="space-y-3">
            {analytics.visitsByCountry?.map((country, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-lg">{getCountryFlag(country.countryCode)}</span>
                  <span style={{ color: siteTheme.textColor }}>{country.country}</span>
                </div>
                <span className="font-bold" style={{ color: siteTheme.accentColor }}>
                  {country.count.toLocaleString()}
                </span>
              </div>
            ))}
            {(!analytics.visitsByCountry || analytics.visitsByCountry.length === 0) && (
              <p className="text-center opacity-70" style={{ color: siteTheme.textColor }}>
                No country data available for this period
              </p>
            )}
          </div>
        )

      case "states":
        return (
          <div className="space-y-3">
            {analytics.visitsByUSStates?.map((state, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold"
                    style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                  >
                    {index + 1}
                  </span>
                  <span className="text-lg">🇺🇸</span>
                  <span style={{ color: siteTheme.textColor }}>
                    {state.state} ({state.stateCode})
                  </span>
                </div>
                <span className="font-bold" style={{ color: siteTheme.accentColor }}>
                  {state.count.toLocaleString()}
                </span>
              </div>
            ))}
            {(!analytics.visitsByUSStates || analytics.visitsByUSStates.length === 0) && (
              <p className="text-center opacity-70" style={{ color: siteTheme.textColor }}>
                No US state data available for this period
              </p>
            )}
            {analytics.visitsByUSCities && analytics.visitsByUSCities.length > 0 && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold mb-3" style={{ color: siteTheme.textColor }}>
                  Top US Cities
                </h4>
                <div className="space-y-2">
                  {analytics.visitsByUSCities
                    .slice(0, showAll ? analytics.visitsByUSCities.length : 10)
                    .map((city, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span
                            className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ backgroundColor: siteTheme.secondaryBgColor, color: siteTheme.textColor }}
                          >
                            {index + 1}
                          </span>
                          <Building style={{ color: siteTheme.accentColor }} size={14} />
                          <span className="text-sm" style={{ color: siteTheme.textColor }}>
                            {city.city}, {city.state}
                          </span>
                        </div>
                        <span className="text-sm font-bold" style={{ color: siteTheme.accentColor }}>
                          {city.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div
            className="w-12 h-12 border-t-4 border-solid rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: siteTheme.accentColor }}
          ></div>
          <p style={{ color: siteTheme.textColor }}>Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="p-4 rounded-lg border"
        style={{
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          borderColor: "#ef4444",
          color: "#ef4444",
        }}
      >
        <p>{error}</p>
        <button
          onClick={() => fetchAnalytics(selectedFilter, showAll)}
          className="mt-2 px-4 py-2 rounded"
          style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: siteTheme.textColor }}>
          Website Visit Analytics
        </h2>
        <div className="flex items-center space-x-2">
          <BarChart3 style={{ color: siteTheme.accentColor }} size={24} />
          <span style={{ color: siteTheme.textColor }}>{analytics?.period}</span>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const IconComponent = filter.icon
          return (
            <button
              key={filter.value}
              onClick={() => handleFilterChange(filter.value)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                selectedFilter === filter.value ? "opacity-100" : "opacity-70 hover:opacity-90"
              }`}
              style={{
                backgroundColor: selectedFilter === filter.value ? siteTheme.accentColor : siteTheme.cardBgColor,
                color: siteTheme.textColor,
                borderColor: siteTheme.borderColor,
                borderWidth: "1px",
              }}
            >
              <IconComponent size={16} />
              <span>{filter.label}</span>
            </button>
          )
        })}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: siteTheme.cardBgColor,
            borderColor: siteTheme.borderColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: siteTheme.textColor }}>
                Total Visits
              </p>
              <p className="text-3xl font-bold" style={{ color: siteTheme.accentColor }}>
                {analytics?.totalVisits?.toLocaleString() || 0}
              </p>
            </div>
            <Eye style={{ color: siteTheme.accentColor }} size={32} />
          </div>
        </div>

        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: siteTheme.cardBgColor,
            borderColor: siteTheme.borderColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: siteTheme.textColor }}>
                Unique Visitors
              </p>
              <p className="text-3xl font-bold" style={{ color: siteTheme.accentColor }}>
                {analytics?.uniqueVisitors?.toLocaleString() || 0}
              </p>
            </div>
            <Users style={{ color: siteTheme.accentColor }} size={32} />
          </div>
        </div>

        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: siteTheme.cardBgColor,
            borderColor: siteTheme.borderColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: siteTheme.textColor }}>
                Countries
              </p>
              <p className="text-3xl font-bold" style={{ color: siteTheme.accentColor }}>
                {analytics?.visitsByCountry?.length || 0}
              </p>
            </div>
            <Flag style={{ color: siteTheme.accentColor }} size={32} />
          </div>
        </div>

        <div
          className="p-6 rounded-lg border"
          style={{
            backgroundColor: siteTheme.cardBgColor,
            borderColor: siteTheme.borderColor,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-70" style={{ color: siteTheme.textColor }}>
                US States
              </p>
              <p className="text-3xl font-bold" style={{ color: siteTheme.accentColor }}>
                {analytics?.visitsByUSStates?.length || 0}
              </p>
            </div>
            <MapPin style={{ color: siteTheme.accentColor }} size={32} />
          </div>
        </div>
      </div>

      {/* Tabbed Content */}
      <div
        className="rounded-lg border"
        style={{
          backgroundColor: siteTheme.cardBgColor,
          borderColor: siteTheme.borderColor,
        }}
      >
        {/* Tab Headers */}
        <div className="flex border-b" style={{ borderColor: siteTheme.borderColor }}>
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                  activeTab === tab.value ? "opacity-100" : "opacity-70 hover:opacity-90"
                }`}
                style={{
                  backgroundColor: activeTab === tab.value ? siteTheme.secondaryBgColor : "transparent",
                  color: activeTab === tab.value ? siteTheme.accentColor : siteTheme.textColor,
                  borderBottomWidth: activeTab === tab.value ? "2px" : "0",
                  borderBottomColor: activeTab === tab.value ? siteTheme.accentColor : "transparent",
                }}
              >
                <IconComponent size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}

          {/* See All Button */}
          {((activeTab === "pages" && analytics?.pageVisits?.length > 10) ||
            (activeTab === "recent" && analytics?.recentVisits?.length > 10) ||
            (activeTab === "countries" && analytics?.visitsByCountry?.length > 10) ||
            (activeTab === "states" && analytics?.visitsByUSStates?.length > 10)) && (
            <div className="mt-6 text-center">
              <button
                onClick={handleShowAll}
                className="px-6 py-2 rounded-lg font-medium transition-all"
                style={{
                  backgroundColor: siteTheme.accentColor,
                  color: siteTheme.textColor,
                }}
              >
                {showAll ? "Show Less" : "See All"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
