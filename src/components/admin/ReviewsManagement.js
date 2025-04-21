"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Trash2, Star, Type } from "lucide-react"

export default function ReviewsManagement({ siteTheme, reviews, fetchReviews }) {
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const [totalReviewPages, setTotalReviewPages] = useState(Math.ceil(reviews.length / 10) || 1)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const reviewsPerPage = 10

  // Pagination handlers for reviews
  const handlePreviousReviewPage = () => {
    if (currentReviewPage > 1) {
      setCurrentReviewPage(currentReviewPage - 1)
    }
  }

  const handleNextReviewPage = () => {
    if (currentReviewPage < totalReviewPages) {
      setCurrentReviewPage(currentReviewPage + 1)
    }
  }

  // Get current reviews for pagination
  const indexOfLastReview = currentReviewPage * reviewsPerPage
  const indexOfFirstReview = indexOfLastReview - reviewsPerPage
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)

  const handleDeleteReview = async (reviewId) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        setLoadingReviews(true)
        const res = await fetch(`/api/reviews/${reviewId}`, {
          method: "DELETE",
        })
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error("Error deleting review:", errorData)
          throw new Error(errorData.error || "Failed to delete review")
        }
        await fetchReviews()
        alert("Review deleted successfully!")
      } catch (err) {
        console.error("Error deleting review:", err)
        alert("Failed to delete review. Please try again.")
      } finally {
        setLoadingReviews(false)
      }
    }
  }

  return (
    <div
      className="mt-8 rounded-lg p-4"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <Type className="mr-2" size={24} />
        Reviews Management
      </h2>

      {loadingReviews ? (
        <div className="text-center py-8">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">No reviews found.</div>
      ) : (
        <>
          <div className="space-y-4">
            {currentReviews.map((review) => (
              <div key={review._id} className="p-4 rounded-lg" style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex-col items-center">
                      <div className="font-semibold">{review.user.name}</div>
                      <div className="text-sm opacity-70">{review.user.email}</div>
                    </div>
                    <div className="flex mt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          fill={star <= review.rating ? "#FFD700" : "none"}
                          color={star <= review.rating ? "#FFD700" : "#D1D5DB"}
                          size={16}
                        />
                      ))}
                      <span className="ml-2 text-sm">{new Date(review.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <p className="mt-2">{review.text}</p>
                {review.images && review.images.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative w-15 h-15 sm:w-20 sm:h-20">
                        <Image
                          src={image || "/placeholder.svg"}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination controls for reviews */}
          <div className="sm:flex justify-between items-center mt-4">
            <div className="text-sm">
              Showing {indexOfFirstReview + 1} to {Math.min(indexOfLastReview, reviews.length)} of {reviews.length}{" "}
              reviews
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
              <button
                onClick={handlePreviousReviewPage}
                disabled={currentReviewPage === 1}
                className="px-3 py-1 rounded flex items-center"
                style={{
                  backgroundColor: currentReviewPage === 1 ? "#9CA3AF" : siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: currentReviewPage === 1 ? 0.5 : 1,
                  cursor: currentReviewPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={16} className="mr-1" /> Previous 10
              </button>
              <button
                onClick={handleNextReviewPage}
                disabled={currentReviewPage === totalReviewPages}
                className="px-3 py-1 rounded flex items-center"
                style={{
                  backgroundColor: currentReviewPage === totalReviewPages ? "#9CA3AF" : siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: currentReviewPage === totalReviewPages ? 0.5 : 1,
                  cursor: currentReviewPage === totalReviewPages ? "not-allowed" : "pointer",
                }}
              >
                Next 10 <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
