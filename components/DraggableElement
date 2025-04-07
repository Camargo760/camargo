"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"

export default function DraggableElement({
  children,
  containerRef,
  onPositionChange,
  initialPosition = { x: 0, y: 0 },
  type,
  zIndex = 10,
}) {
  const [position, setPosition] = useState(initialPosition)
  const [isDragging, setIsDragging] = useState(false)
  const elementRef = useRef(null)

  // Update position when dragging ends
  const handleDragEnd = (event, info) => {
    setIsDragging(false)
    setPosition({ x: info.point.x, y: info.point.y })

    if (onPositionChange) {
      // Calculate position relative to container
      const containerRect = containerRef.current.getBoundingClientRect()
      const elementRect = elementRef.current.getBoundingClientRect()

      const relativeX = (elementRect.left - containerRect.left) / containerRect.width
      const relativeY = (elementRect.top - containerRect.top) / containerRect.height

      onPositionChange({
        type,
        position: { x: relativeX, y: relativeY },
        width: elementRect.width / containerRect.width,
        height: elementRect.height / containerRect.height,
      })
    }
  }

  return (
    <motion.div
      ref={elementRef}
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={handleDragEnd}
      className={`absolute cursor-move ${isDragging ? "opacity-90" : ""}`}
      style={{
        touchAction: "none", // Prevents scrolling while dragging on touch devices
        boxShadow: isDragging ? "0 0 10px rgba(255, 62, 0, 0.5)" : "none",
        zIndex: isDragging ? 100 : zIndex, // Higher z-index when dragging, otherwise use provided zIndex
      }}
      initial={false}
      animate={{
        boxShadow: isDragging ? "0 0 10px rgba(255, 62, 0, 0.5)" : "none",
      }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  )
}

