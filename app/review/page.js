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

  useEffect(() => {
    fetchReviews()
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

      // Reset form
      setRating(0)
      setReviewText("")
      setIsEditing(false)
      setEditingReviewId(null)

      // Refresh reviews
      fetchReviews()
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto py-8 px-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {(!userHasReview || isEditing) && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">{isEditing ? "Edit Your Review" : "Write a Review"}</h2>
            <form onSubmit={handleSubmitReview}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">Rating</label>
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
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="review">
                  Your Review
                </label>
                <textarea
                  id="review"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                  placeholder="Share your experience with our products..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="flex space-x-2">
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  disabled={loading}
                >
                  {loading ? "Submitting..." : isEditing ? "Update Review" : "Submit Review"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">All Reviews</h2>
          {loading && !reviews.length ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : reviews.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to leave a review!</p>
          ) : (
            <div className="space-y-6">
              {sortedReviews.map((review) => {
                const isUserReview = session && review.user.email === session.user?.email

                return (
                  <div
                    key={review._id}
                    className={`border-b pb-6 last:border-b-0 ${isUserReview ? "bg-blue-50 p-4 rounded-lg" : ""}`}
                  >
                    {isUserReview && (
                      <div className="mb-2 text-blue-600 font-semibold flex items-center">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">Your Review</span>
                      </div>
                    )}
                    <div className="flex items-start">
                      <div className="bg-gray-200 rounded-full p-2 mr-3">
                        {review.user.image ? (
                          <Image
                            src={review.user.image || "/placeholder.svg"}
                            alt={review.user.name}
                            width={40}
                            height={40}
                            className="rounded-full"
                          />
                        ) : (
                          <User size={24} className="text-gray-500" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{review.user.name}</p>
                            <div className="flex items-center mt-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  fill={review.rating >= star ? "#FFD700" : "none"}
                                  color={review.rating >= star ? "#FFD700" : "#D1D5DB"}
                                  size={16}
                                />
                              ))}
                              <span className="ml-2 text-sm text-gray-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          {isUserReview && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditReview(review)}
                                className="text-blue-500 hover:text-blue-700"
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
                        <p className="mt-2 text-gray-700">{review.text}</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Login Required</h2>
            <p className="mb-6">You need to be logged in to submit a review.</p>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1 text-center"
              >
                Log In
              </Link>
              <button
                onClick={() => setShowLoginModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex-1"
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
