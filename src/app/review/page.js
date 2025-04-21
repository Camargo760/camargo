"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { Star, Edit, Trash, User, X, Upload, ChevronLeft, ChevronRight } from "lucide-react"
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
  const [reviewImages, setReviewImages] = useState([])
  const [imagePreviewUrls, setImagePreviewUrls] = useState([])
  const [iconSize, setIconSize] = useState(14);
  const fileInputRef = useRef(null)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImage, setLightboxImage] = useState("")
  const [lightboxImages, setLightboxImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

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

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;

      if (e.key === "Escape") {
        closeLightbox();
      } else if (e.key === "ArrowRight") {
        showNextImage();
      } else if (e.key === "ArrowLeft") {
        showPrevImage();
      }
    };

    const updateSize = () => {
      if (window.innerWidth >= 640) {
        setIconSize(20);
      } else {
        setIconSize(14);
      }
    };

    // Add event listeners
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updateSize);

    updateSize(); // Run on mount

    // Cleanup function — return only once
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updateSize);
    };
  }, [lightboxOpen, currentImageIndex, lightboxImages]);


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

          // Set review images if they exist
          if (userReview.images && userReview.images.length > 0) {
            setImagePreviewUrls(userReview.images)
          } else {
            setImagePreviewUrls([])
          }
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    // Limit to 3 images max
    const totalImages = imagePreviewUrls.length + files.length
    if (totalImages > 3) {
      setError("You can upload a maximum of 3 images per review")
      return
    }

    setReviewImages((prevImages) => [...prevImages, ...files])

    // Create preview URLs for the images
    const newImageUrls = files.map((file) => URL.createObjectURL(file))
    setImagePreviewUrls((prevUrls) => [...prevUrls, ...newImageUrls])
  }

  const handleRemoveImage = (index) => {
    // Create a copy of the current preview URLs
    const updatedPreviewUrls = [...imagePreviewUrls]

    // Get the URL that's being removed
    const removedUrl = updatedPreviewUrls[index]

    // Remove the URL from the preview array
    updatedPreviewUrls.splice(index, 1)
    setImagePreviewUrls(updatedPreviewUrls)

    // If it's a blob URL (new upload), we need to remove it from reviewImages as well
    if (removedUrl.startsWith("blob:")) {
      // Find the index in reviewImages that corresponds to this blob URL
      const blobIndex = Array.from(reviewImages).findIndex((file, i) => {
        const fileUrl = URL.createObjectURL(file)
        URL.revokeObjectURL(fileUrl) // Clean up
        return fileUrl === removedUrl
      })

      if (blobIndex !== -1) {
        const updatedReviewImages = [...reviewImages]
        updatedReviewImages.splice(blobIndex, 1)
        setReviewImages(updatedReviewImages)
      }
    }

    // Revoke the object URL to avoid memory leaks
    if (removedUrl.startsWith("blob:")) {
      URL.revokeObjectURL(removedUrl)
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

      // Create FormData to handle file uploads
      const formData = new FormData()
      formData.append("rating", rating)
      formData.append("text", reviewText)

      // Add existing image URLs that weren't removed (filter out blob URLs)
      if (isEditing) {
        const existingImages = imagePreviewUrls.filter((url) => !url.startsWith("blob:"))
        formData.append("existingImages", JSON.stringify(existingImages))
      }

      // Add new image files
      reviewImages.forEach((file) => {
        formData.append("images", file)
      })

      const url = isEditing ? `/api/reviews/${editingReviewId}` : "/api/reviews"
      const method = isEditing ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        body: formData, // No Content-Type header needed for FormData
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      // Reset form if not editing or if editing was successful
      if (!isEditing) {
        setRating(0)
        setReviewText("")
        setReviewImages([])
        setImagePreviewUrls([])
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

    // Set image previews if the review has images
    if (review.images && review.images.length > 0) {
      setImagePreviewUrls([...review.images])
    } else {
      setImagePreviewUrls([])
    }

    // Reset new image uploads
    setReviewImages([])
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

      // Reset all form fields including images
      setRating(0)
      setReviewText("")
      setReviewImages([])
      setImagePreviewUrls([])
      setIsEditing(false)
      setEditingReviewId(null)

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
    setReviewImages([])
    setImagePreviewUrls([])
  }

  // Lightbox functions
  const openLightbox = (imageUrl, allImages, index) => {
    setLightboxImage(imageUrl)
    setLightboxImages(allImages)
    setCurrentImageIndex(index)
    setLightboxOpen(true)

    // Prevent scrolling when lightbox is open
    document.body.style.overflow = "hidden"
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setLightboxImage("")

    // Re-enable scrolling
    document.body.style.overflow = "auto"
  }

  const showNextImage = () => {
    if (lightboxImages.length <= 1) return

    const nextIndex = (currentImageIndex + 1) % lightboxImages.length
    setCurrentImageIndex(nextIndex)
    setLightboxImage(lightboxImages[nextIndex])
  }

  const showPrevImage = () => {
    if (lightboxImages.length <= 1) return

    const prevIndex = (currentImageIndex - 1 + lightboxImages.length) % lightboxImages.length
    setCurrentImageIndex(prevIndex)
    setLightboxImage(lightboxImages[prevIndex])
  }

  // Sort reviews to put the current user's review at the top
  const sortedReviews = [...reviews].sort((a, b) => {
    if (session && a.user.email === session.user?.email) return -1
    if (session && b.user.email === session.user?.email) return 1
    return 0
  })


  // change icons size on smaller devices 

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

              {/* Image Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-bold mb-2" style={{ color: siteTheme.textColor }}>
                  Add Images (Optional)
                </label>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div
                        key={index}
                        className="relative w-24 h-24 border rounded overflow-hidden"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <div
                          className="w-full h-full cursor-pointer"
                          onClick={() => openLightbox(url, imagePreviewUrls, index)}
                        >
                          <Image
                            src={url || "/placeholder.svg"}
                            alt={`Review image ${index + 1}`}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                          aria-label="Remove image"
                        >
                          <X size={14} color="white" />
                        </button>
                      </div>
                    ))}

                    {imagePreviewUrls.length < 3 && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current.click()}
                        className="w-24 h-24 border-2 border-dashed rounded flex flex-col items-center justify-center"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <Upload size={24} style={{ color: siteTheme.textColor }} />
                        <span className="text-xs mt-1" style={{ color: siteTheme.textColor }}>
                          Add Image
                        </span>
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  <p className="text-xs" style={{ color: siteTheme.textColor }}>
                    You can upload up to 3 images (JPG, PNG). Max 5MB each.
                  </p>
                </div>
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
                      <div className="flex flex-row justify-between items-center mb-2">
                        <div className="font-semibold flex items-center">
                          <span
                            className="px-2 py-1 rounded text-sm"
                            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                          >
                            Your Review
                          </span>
                        </div>
                        <div className="flex space-x-4">
                          <button
                            onClick={() => handleEditReview(review)}
                            style={{ color: siteTheme.accentColor }}
                            title="Edit review"
                          >
                            <Edit size={iconSize} />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review._id)}
                            className="text-red-500 hover:text-red-700"
                            title="Delete review"
                          >
                            <Trash size={iconSize} />
                          </button>
                        </div>
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
                        <div className="">
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

                        <p className="mt-2" style={{ color: siteTheme.textColor }}>
                          {review.text}
                        </p>

                        {/* Review Images */}
                        {review.images && review.images.length > 0 && (
                          <div className="mt-4">
                            <div className="flex flex-wrap gap-2">
                              {review.images.map((imageUrl, index) => (
                                <div
                                  key={index}
                                  className="border rounded overflow-hidden cursor-pointer"
                                  style={{ borderColor: siteTheme.borderColor }}
                                  onClick={() => openLightbox(imageUrl, review.images, index)}
                                >
                                  <Image
                                    src={imageUrl || "/placeholder.svg"}
                                    alt={`Review image ${index + 1}`}
                                    width={120}
                                    height={120}
                                    className="object-cover w-14 h-14 sm:w-24 sm:h-24"
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
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

      {/* Image Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={closeLightbox}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 z-10"
              aria-label="Close lightbox"
            >
              <X size={24} color="white" />
            </button>

            {lightboxImages.length > 1 && (
              <>
                <button
                  onClick={showPrevImage}
                  className="absolute left-4 bg-black bg-opacity-50 rounded-full p-2 z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={24} color="white" />
                </button>
                <button
                  onClick={showNextImage}
                  className="absolute right-4 bg-black bg-opacity-50 rounded-full p-2 z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={24} color="white" />
                </button>
              </>
            )}

            <div className="relative w-full h-full flex items-center justify-center p-4">
              <Image src={lightboxImage || "/placeholder.svg"} alt="Review image" fill className="object-contain" />
            </div>

            {lightboxImages.length > 1 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                {lightboxImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentImageIndex(index)
                      setLightboxImage(lightboxImages[index])
                    }}
                    className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-gray-500"}`}
                    aria-label={`Go to image ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
