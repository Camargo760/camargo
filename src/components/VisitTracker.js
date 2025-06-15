"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function VisitTracker() {
  const pathname = usePathname()

  useEffect(() => {
    const trackVisit = async () => {
      try {
        // Generate or get session ID
        let sessionId = sessionStorage.getItem("visit_session_id")
        if (!sessionId) {
          sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
          sessionStorage.setItem("visit_session_id", sessionId)
        }

        await fetch("/api/track-visit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            page: pathname,
            userAgent: navigator.userAgent,
            sessionId: sessionId,
          }),
        })
      } catch (error) {
        console.error("Error tracking visit:", error)
      }
    }

    // Track visit after a small delay to ensure page is loaded
    const timer = setTimeout(trackVisit, 1000)

    return () => clearTimeout(timer)
  }, [pathname])

  return null // This component doesn't render anything
}
