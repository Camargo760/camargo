"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Star, Edit, Trash, User } from "lucide-react"
import Header from "../../components/Header"
import Link from "next/link"
import Image from "next/image"

export default function ReviewPage() {
  const { data: session, status } = useSession()
  const [reviews, setReviews] = useState([])
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [editingReviewId, setEditingReviewId] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [userHasReview, setUserHasReview] = useState(false)
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#0a0a0a",
    cardBgColor: "#1a1a1a",
    accentColor: "#ff3e00",
    textColor: "#f0f0f0",
    secondaryBgColor: "#2a2a2a",
    borderColor: "#333",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchReviews()

        // Fetch site theme
        const themeRes = await fetch("/api/site-theme")
        if (themeRes.ok) {
          const themeData = await themeRes.json()
          if (themeData.theme) {
            setSiteTheme(themeData.theme)
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err)
      }
    }

    fetchData()
  }, [])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/reviews")
      if (!res.ok) {
        throw new Error("Failed to fetch reviews")
      }
      const data = await res.json()

      // Check if the current user has a review
      if (status === "authenticated" && session?.user?.email) {
        const userReview = data.find((review) => review.user.email === session.user.email)
        setUserHasReview(!!userReview)

        // If user has a review and we're not already editing, set it up for editing
        if (userReview && !isEditing) {
          setRating(userReview.rating)
          setReviewText(userReview.text)
          setEditingReviewId(userReview._id)
        }
      }

      setReviews(data)
    } catch (err) {
      console.error("Error fetching reviews:", err)
      setError("Failed to load reviews. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()

    if (status !== "authenticated") {
      setShowLoginModal(true)
      return
    }

    if (rating === 0) {
      setError("Please select a rating")
      return
    }

    if (!reviewText.trim()) {
      setError("Please enter a review")
      return
    }

    try {
      setLoading(true)
      setError(null)

      const url = isEditing ? `/api/reviews/${editingReviewId}` : "/api/reviews"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          text: reviewText,
        }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      // Reset form if not editing or if editing was successful
      if (!isEditing) {
        setRating(0)
        setReviewText("")
      }

      // Reset editing state
      setIsEditing(false)
      setEditingReviewId(null)

      // Refresh reviews
      fetchReviews()

      // Show success message
      alert(isEditing ? "Review updated successfully!" : "Review submitted successfully!")
    } catch (err) {
      console.error("Error submitting review:", err)
      setError(err.message || "Failed to submit review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEditReview = (review) => {
    setRating(review.rating)
    setReviewText(review.text)
    setIsEditing(true)
    setEditingReviewId(review._id)
  }

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return
    }

    try {
      setLoading(true)
      const res = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        throw new Error("Failed to delete review")
      }

      // Refresh reviews
      fetchReviews()
      setUserHasReview(false)
    } catch (err) {
      console.error("Error deleting review:", err)
      setError("Failed to delete review. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setRating(0)
    setReviewText("")
    setIsEditing(false)
    setEditingReviewId(null)
  }

  // Sort reviews to put the current user's review at the top
  const sortedReviews = [...reviews].sort((a, b) => {
    if (session && a.user.email === session.user?.email) return -1
    if (session && b.user.email === session.user?.email) return 1
    return 0
  })

  return (
    <div className="min-h-screen" style={{ backgroundColor: siteTheme.bgColor, color: siteTheme.textColor }}>
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center" style={{ color: siteTheme.textColor }}>
          Customer Reviews
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {(!userHasReview || isEditing) && (
          <div
            className="rounded-lg shadow-md p-6 mb-8"
            style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
          >
            <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
              {isEditing ? "Edit Your Review" : "Write a Review"}
            </h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: siteTheme.textColor }}>
                  Rating
                </label>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className="text-2xl focus:outline-none"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        fill={(hoverRating || rating) >= star ? "#FFD700" : "none"}
                        color={(hoverRating || rating) >= star ? "#FFD700" : "#D1D5DB"}
                        size={28}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" htmlFor="review" style={{ color: siteTheme.textColor }}>
                  Your Review
                </label>
                <textarea
                  id="review"
                  className="shadow appearance-none border rounded w-full py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  style={{
                    backgroundColor: siteTheme.secondaryBgColor,
                    color: siteTheme.textColor,
                    borderColor: siteTheme.borderColor,
                  }}
                  rows="4"
                  placeholder="Share your experience with our products..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2">
                <button
                  type="submit"
                  className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-grow basis-full sm:basis-auto"
                  style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                  disabled={loading}
                >
                  {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-grow basis-full sm:basis-auto"
                    style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div
          className="rounded-lg shadow-md p-6"
          style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
        >
          <h2 className="text-xl font-semibold mb-4" style={{ color: siteTheme.textColor }}>
            All Reviews
          </h2>
          {loading && !reviews.length ? (
            <div className="flex justify-center py-8">
              <div
                className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2"
                style={{ borderColor: siteTheme.accentColor }}
              ></div>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-center py-8" style={{ color: siteTheme.textColor }}>
              No reviews yet. Be the first to leave a review!
            </p>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review) => {
                const isUserReview = session && review.user.email === session.user?.email

                return (
                  <div
                    key={review._id}
                    className={`border-b pb-6 last:border-b-0 ${isUserReview ? "p-4 rounded-lg" : ""}`}
                    style={{
                      borderColor: siteTheme.borderColor,
                      backgroundColor: isUserReview ? siteTheme.secondaryBgColor : "transparent",
                    }}
                  >
                    {isUserReview && (
                      <div className="mb-2 font-semibold flex items-center">
                        <span
                          className="px-2 py-1 rounded text-sm"
                          style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                        >
                          Your Review
                        </span>
                      </div>
                    )}
                    <div className="flex flex-row flex-wrap items-start">
                      <div
                        className="rounded-full p-2 mb-3 mr-3"
                        style={{ backgroundColor: siteTheme.secondaryBgColor }}
                      >
                        {review.user.image ? (
                          <Image
                            src={review.user.image || "/placeholder.svg"}
                            alt={review.user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <User size={24} style={{ color: siteTheme.textColor }} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                          <div>
                            <p className="font-semibold" style={{ color: siteTheme.textColor }}>
                              {review.user.name}
                            </p>
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  fill={review.rating >= star ? "#FFD700" : "none"}
                                  color={review.rating >= star ? "#FFD700" : "#D1D5DB"}
                                  size={16}
                                />
                              ))}
                              <span className="ml-2 text-sm" style={{ color: siteTheme.textColor }}>
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {isUserReview && (
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                              <button
                                onClick={() => handleEditReview(review)}
                                style={{ color: siteTheme.accentColor }}
                                title="Edit review"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteReview(review._id)}
                                className="text-red-500 hover:text-red-700"
                                title="Delete review"
                              >
                                <Trash size={16} />
                              </button>
                            </div>
                          )}
                        </div>
                        <p className="mt-2" style={{ color: siteTheme.textColor }}>
                          {review.text}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="rounded-lg p-6 sm:p-8 max-w-md w-full" style={{ backgroundColor: siteTheme.cardBgColor }}>
            <h2 className="text-xl font-bold mb-4" style={{ color: siteTheme.textColor }}>
              Login Required
            </h2>
            <p className="mb-6" style={{ color: siteTheme.textColor }}>
              You need to be logged in to submit a review.
            </p>
            <div className="flex flex-row flex-wrap sm:flex-nowrap gap-2">
              <Link
                href="/login"
                className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-grow basis-full sm:basis-auto text-center"
                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
              >
                Log In
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-grow basis-full sm:basis-auto"
                style={{ backgroundColor: "#4B5563", color: siteTheme.textColor }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}