"use client"

import { Star } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import "./ImageLightBox"


export default function ReviewCard({ review, siteTheme }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [expanded, setExpanded] = useState(false)

  const formattedDate = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  const openLightbox = (index) => {
    setCurrentImageIndex(index)
    setLightboxOpen(true)
  }

  // Handle content truncation with 400 character limit
  const contentPreview = review.content?.substring(0, 400) || ""
  const needsTruncation = review.content?.length > 400

  return (
    <div
      className="p-4 rounded-lg"
      style={{ backgroundColor: siteTheme.cardBgColor, borderColor: siteTheme.borderColor, borderWidth: "1px" }}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{review.title}</h3>
          <p className="text-sm opacity-80 mb-1">
            {review.name || review.user?.name || "Anonymous"} • {formattedDate}
          </p>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              fill={star <= review.rating ? siteTheme.accentColor : "transparent"}
              color={star <= review.rating ? siteTheme.accentColor : siteTheme.borderColor}
            />
          ))}
        </div>
      </div>

      <div className="mb-3">
        {expanded || !needsTruncation ? (
          <div>
            <p>{review.content}</p>
            {needsTruncation && (
              <button
                onClick={() => setExpanded(false)}
                className="mt-1 font-medium hover:underline"
                style={{ color: siteTheme.accentColor }}
              >
                Show less
              </button>
            )}
          </div>
        ) : (
          <p>
            {contentPreview}
            <button
              onClick={() => setExpanded(true)}
              className="ml-1 font-medium hover:underline"
              style={{ color: siteTheme.accentColor }}
            >
              ... more
            </button>
          </p>
        )}
      </div>

      {review.images && review.images.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {review.images.map((image, index) => (
            <div
              key={index}
              className="relative w-16 h-16 rounded overflow-hidden cursor-pointer"
              onClick={() => openLightbox(index)}
              style={{ borderColor: siteTheme.borderColor, borderWidth: "1px" }}
            >
              <Image
                src={image || "/placeholder.svg"}
                alt={`Review image ${index + 1}`}
                fill
                style={{ objectFit: "cover" }}
              />
            </div>
          ))}
        </div>
      )}

      {lightboxOpen && review.images && (
        <ImageLightbox
          images={review.images}
          currentIndex={currentImageIndex}
          setCurrentIndex={setCurrentImageIndex}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
