// components/ReviewForm.js
"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Upload, X, Info } from "lucide-react"
import Image from "next/image"
import { useSession } from "next-auth/react"

export default function ReviewForm({ onSubmit, siteTheme }) {
  const { data: session } = useSession()
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [reviewImages, setReviewImages] = useState([])
  const [previewImages, setPreviewImages] = useState([])
  const [showTooltip, setShowTooltip] = useState(false)

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxImages, setLightboxImages] = useState([])
  const [lightboxInitialIndex, setLightboxInitialIndex] = useState(0)

  // Set name from session when available
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name)
    }
  }, [session])

  const handleRatingChange = (newRating) => {
    setRating(newRating)
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)

    // Limit to 3 images
    if (reviewImages.length + files.length > 3) {
      alert("You can upload a maximum of 3 images")
      return
    }

    // Check file sizes (5MB max per file)
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size exceeds 5MB limit")
        e.target.value = ""
        return
      }
    }

    // Create preview URLs
    const newPreviewImages = files.map((file) => URL.createObjectURL(file))
    setPreviewImages([...previewImages, ...newPreviewImages])

    // Store the actual files
    setReviewImages([...reviewImages, ...files])
  }

  const removeImage = (index) => {
    // Release the object URL to avoid memory leaks
    URL.revokeObjectURL(previewImages[index])

    // Remove the image from both arrays
    const newPreviewImages = [...previewImages]
    newPreviewImages.splice(index, 1)
    setPreviewImages(newPreviewImages)

    const newReviewImages = [...reviewImages]
    newReviewImages.splice(index, 1)
    setReviewImages(newReviewImages)
  }

  // Open lightbox for preview images
  const openLightbox = (index) => {
    setLightboxImages(previewImages)
    setLightboxInitialIndex(index)
    setLightboxOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!title.trim() || !content.trim() || !name.trim()) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      // Create FormData for the request
      const formData = new FormData()
      formData.append("rating", rating)
      formData.append("title", title)
      formData.append("content", content)
      formData.append("name", name)

      if (session?.user?.email) {
        formData.append("userId", session.user.email)
      }

      // Add images if any
      if (reviewImages.length > 0) {
        reviewImages.forEach((file) => {
          formData.append("images", file)
        })
      }

      // Send the review data
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit review")
      }

      // Clean up preview URLs before resetting
      previewImages.forEach(url => URL.revokeObjectURL(url))

      // Reset form on success
      setRating(5)
      setTitle("")
      setContent("")
      if (!session) setName("") // Only reset name if not logged in
      setReviewImages([])
      setPreviewImages([])

      // Call the onSubmit callback
      onSubmit && onSubmit(true)

      alert("Review submitted successfully!")
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Write a Review</h3>
        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-1 rounded-full hover:bg-opacity-20"
            style={{ backgroundColor: showTooltip ? siteTheme.accentColor : 'transparent' }}
          >
            <Info size={16} color={siteTheme.accentColor} />
          </button>
          {showTooltip && (
            <div
              className="absolute right-0 top-8 w-80 p-3 rounded-lg shadow-lg z-10 text-sm max-w-[200px]"
              style={{
                backgroundColor: siteTheme.cardBgColor,
                borderColor: siteTheme.borderColor,
                borderWidth: '1px',
                borderStyle: 'solid'
              }}
              >
              <div className="relative">
                <div
                  className="absolute -top-2 right-4 w-4 h-4 transform rotate-45"
                  style={{ backgroundColor: siteTheme.cardBgColor }}
                ></div>
                <p style={{ color: siteTheme.textColor }}>
                  Your feedback is invaluable in shaping the final version. We will reach out to discuss the logo and any necessary revisions. If a second upload is required, we will contact you by phone to confirm. The final logo will be delivered upon your approval.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="name" className="block text-sm font-medium mb-2">
          Your Name*
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 rounded"
          style={{
            backgroundColor: siteTheme.secondaryBgColor,
            color: siteTheme.textColor,
            borderColor: siteTheme.borderColor,
            borderWidth: "1px",
          }}
          required
          disabled={!!session?.user} // Disable if user is logged in
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Rating*</label>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} type="button" onClick={() => handleRatingChange(star)} className="p-1">
              <Star
                size={24}
                fill={star <= rating ? siteTheme.accentColor : "transparent"}
                color={star <= rating ? siteTheme.accentColor : siteTheme.borderColor}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium mb-2">
          Title*
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 rounded"
          style={{
            backgroundColor: siteTheme.secondaryBgColor,
            color: siteTheme.textColor,
            borderColor: siteTheme.borderColor,
            borderWidth: "1px",
          }}
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium mb-2">
          Review*
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="4"
          className="w-full p-2 rounded"
          style={{
            backgroundColor: siteTheme.secondaryBgColor,
            color: siteTheme.textColor,
            borderColor: siteTheme.borderColor,
            borderWidth: "1px",
          }}
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Add Photos (Optional)</label>
        <div className="flex flex-col space-y-2">
          <label
            htmlFor="reviewImages"
            className="cursor-pointer flex items-center justify-center p-3 rounded border-dashed border-2"
            style={{ borderColor: siteTheme.borderColor }}
          >
            <Upload size={20} className="mr-2" />
            <span>Upload Images (Max 3)</span>
            <input
              type="file"
              id="reviewImages"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={reviewImages.length >= 3}
            />
          </label>

          <div className="text-xs" style={{ color: "#b0b0b0" }}>
            JPG, PNG or GIF (Max 5MB per image)
          </div>

          {previewImages.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {previewImages.map((src, index) => (
                <div
                  key={index}
                  className="relative w-20 h-20 rounded overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ borderColor: siteTheme.borderColor, borderWidth: "1px" }}
                >
                  <div onClick={() => openLightbox(index)} className="w-full h-full">
                    <Image
                      src={src || "/placeholder.svg"}
                      alt={`Review image ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 p-1 rounded-bl z-10"
                    style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
                  >
                    <X size={14} color="white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-2 rounded font-medium"
        style={{ backgroundColor: siteTheme.accentColor }}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  )
}
