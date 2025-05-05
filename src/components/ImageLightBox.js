"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

export default function ImageLightbox({ isOpen, onClose, images, initialIndex = 0, altText = "Image" }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(initialIndex)

  // Reset current image index when images change
  useEffect(() => {
    setCurrentImageIndex(initialIndex)
  }, [images, initialIndex])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowRight") {
        showNextImage()
      } else if (e.key === "ArrowLeft") {
        showPrevImage()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    // Prevent scrolling when lightbox is open
    if (isOpen) {
      document.body.style.overflow = "hidden"
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      document.body.style.overflow = "auto"
    }
  }, [isOpen, currentImageIndex, images, onClose])

  const showNextImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length)
  }

  const showPrevImage = () => {
    if (images.length <= 1) return
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 z-10"
          aria-label="Close lightbox"
        >
          <X size={24} color="white" />
        </button>

        {images.length > 1 && (
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
          <Image
            src={images[currentImageIndex] || "/placeholder.svg"}
            alt={`${altText} ${currentImageIndex + 1}`}
            fill
            className="object-contain"
          />
        </div>

        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation()
                  setCurrentImageIndex(index)
                }}
                className={`w-2 h-2 rounded-full ${index === currentImageIndex ? "bg-white" : "bg-gray-500"}`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
