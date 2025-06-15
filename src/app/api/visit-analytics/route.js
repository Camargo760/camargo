import { NextResponse } from "next/server"
import clientPromise from "../../../lib/mongodb"

export async function GET(request) {
  try {
    const client = await clientPromise
    const db = client.db("ecommerce")

    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "all"
    const type = searchParams.get("type") || "overview"
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const showAll = searchParams.get("showAll") === "true"

    let dateFilter = {}
    const now = new Date()

    switch (filter) {
      case "today":
        const today = new Date().toISOString().split("T")[0]
        dateFilter = { date: today }
        break

      case "week":
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        weekStart.setHours(0, 0, 0, 0)
        dateFilter = { timestamp: { $gte: weekStart } }
        break

      case "month":
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
        dateFilter = { timestamp: { $gte: monthStart } }
        break

      case "year":
        const yearStart = new Date(now.getFullYear(), 0, 1)
        dateFilter = { timestamp: { $gte: yearStart } }
        break

      case "fiveYears":
        const fiveYearsAgo = new Date(now)
        fiveYearsAgo.setFullYear(now.getFullYear() - 5)
        dateFilter = { timestamp: { $gte: fiveYearsAgo } }
        break

      case "all":
      default:
        dateFilter = {}
        break
    }

    // Get total visits
    const totalVisits = await db.collection("visits").countDocuments(dateFilter)

    // Get unique visitors (by IP)
    const uniqueVisitors = await db.collection("visits").distinct("ip", dateFilter)

    // Get page visits breakdown
    const pageVisits = await db
      .collection("visits")
      .aggregate([
        { $match: dateFilter },
        { $group: { _id: "$page", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: showAll ? 1000 : limit },
      ])
      .toArray()

    // Get visits by country
    const visitsByCountry = await db
      .collection("visits")
      .aggregate([
        { $match: dateFilter },
        { $group: { _id: { country: "$country", countryCode: "$countryCode" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: showAll ? 1000 : limit },
        {
          $project: {
            country: "$_id.country",
            countryCode: "$_id.countryCode",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // Get visits by US states
    const visitsByUSStates = await db
      .collection("visits")
      .aggregate([
        { $match: { ...dateFilter, countryCode: "US" } },
        { $group: { _id: { state: "$state", stateCode: "$stateCode" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: showAll ? 1000 : limit },
        {
          $project: {
            state: "$_id.state",
            stateCode: "$_id.stateCode",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // Get visits by cities (for US only)
    const visitsByUSCities = await db
      .collection("visits")
      .aggregate([
        { $match: { ...dateFilter, countryCode: "US" } },
        { $group: { _id: { city: "$city", state: "$state" }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: showAll ? 1000 : limit },
        {
          $project: {
            city: "$_id.city",
            state: "$_id.state",
            count: 1,
            _id: 0,
          },
        },
      ])
      .toArray()

    // Get daily visits for the current period (for chart data)
    let dailyVisits = []
    if (filter !== "all") {
      dailyVisits = await db
        .collection("visits")
        .aggregate([
          { $match: dateFilter },
          {
            $group: {
              _id: "$date",
              visits: { $sum: 1 },
              uniqueVisitors: { $addToSet: "$ip" },
            },
          },
          {
            $project: {
              date: "$_id",
              visits: 1,
              uniqueVisitors: { $size: "$uniqueVisitors" },
            },
          },
          { $sort: { date: 1 } },
        ])
        .toArray()
    }

    // Get recent visits (last 10)
    const recentVisits = await db
      .collection("visits")
      .find(dateFilter)
      .sort({ timestamp: -1 })
      .limit(showAll ? 100 : 10)
      .project({
        timestamp: 1,
        page: 1,
        ip: 1,
        userAgent: 1,
        country: 1,
        state: 1,
        city: 1,
      })
      .toArray()

    return NextResponse.json({
      totalVisits,
      uniqueVisitors: uniqueVisitors.length,
      pageVisits,
      visitsByCountry,
      visitsByUSStates,
      visitsByUSCities,
      dailyVisits,
      recentVisits,
      filter,
      period: getPeriodLabel(filter),
    })
  } catch (error) {
    console.error("Error fetching visit analytics:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

function getPeriodLabel(filter) {
  switch (filter) {
    case "today":
      return "Today"
    case "week":
      return "This Week"
    case "month":
      return "This Month"
    case "year":
      return "This Year"
    case "fiveYears":
      return "Past 5 Years"
    case "all":
      return "All Time"
    default:
      return "All Time"
  }
}
