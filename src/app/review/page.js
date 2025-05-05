"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import ReviewForm from "@/components/ReviewForm"
import ReviewCard from "@/components/ReviewCard"
import Header from "@/components/Header"
import { Filter, Star, StarHalf } from "lucide-react"

export default function ReviewsPage() {
  // const { data: session } = useSession()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortOption, setSortOption] = useState("newest")
  const [siteTheme, setSiteTheme] = useState({
    bgColor: "#ffffff",            // Changed from primaryBgColor to bgColor
    secondaryBgColor: "#f9fafb",
    cardBgColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#4f46e5",
    borderColor: "#e5e7eb",
  })

  // Calculate rating statistics
  const calculateRatingStats = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      return {
        averageRating: 0,
        ratingCounts: [0, 0, 0, 0, 0],
        ratingPercentages: [0, 0, 0, 0, 0]
      };
    }

    // Calculate average rating
    const sum = reviewsData.reduce((acc, review) => acc + review.rating, 0);
    const avg = sum / reviewsData.length;

    // Count ratings by star
    const counts = [0, 0, 0, 0, 0]; // For 5, 4, 3, 2, 1 stars
    reviewsData.forEach(review => {
      const index = 5 - review.rating;
      if (index >= 0 && index < 5) {
        counts[index]++;
      }
    });

    // Calculate percentages
    const percentages = counts.map(count => 
      reviewsData.length > 0 ? (count / reviewsData.length) * 100 : 0
    );

    return {
      averageRating: avg,
      ratingCounts: counts,
      ratingPercentages: percentages
    };
  };

  // Initialize rating statistics
  const [ratingStats, setRatingStats] = useState({
    averageRating: 0,
    ratingCounts: [0, 0, 0, 0, 0],
    ratingPercentages: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    // Fetch site theme
    const fetchSiteTheme = async () => {
      try {
        console.log("Fetching site theme...")
        const res = await fetch("/api/site-theme")
        console.log("Site theme response status:", res.status)
        
        if (res.ok) {
          const data = await res.json()
          console.log("Received theme data:", data)
          
          // Check if the theme data is nested inside a 'theme' property
          if (data.theme) {
            console.log("Using nested theme data")
            setSiteTheme(data.theme)
          } else {
            console.log("Using direct theme data")
            setSiteTheme(data)
          }
        }
      } catch (error) {
        console.error("Error fetching site theme:", error)
      }
    }

    // Fetch reviews
    const fetchReviews = async () => {
      try {
        setLoading(true)
        const res = await fetch("/api/reviews")
        if (res.ok) {
          const data = await res.json()
          setReviews(data)
          
          // Calculate and set rating statistics
          setRatingStats(calculateRatingStats(data))
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSiteTheme()
    fetchReviews()
  }, [])

  const handleSubmitReview = async (reviewData) => {
    try {
      // Refresh reviews after submission
      const res = await fetch("/api/reviews")
      if (res.ok) {
        const data = await res.json()
        setReviews(data)
        
        // Recalculate rating statistics
        setRatingStats(calculateRatingStats(data))
      }
      return true
    } catch (error) {
      console.error("Error refreshing reviews:", error)
      return false
    }
  }

  // Sort reviews based on selected option
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortOption) {
      case "newest":
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
      case "highest":
        return b.rating - a.rating;
      case "lowest":
        return a.rating - b.rating;
      default:
        return new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now());
    }
  });

  // Destructure rating statistics for easier access
  const { averageRating, ratingCounts, ratingPercentages } = ratingStats;

  // Custom scrollbar styles
  const scrollbarStyle = {
    // Firefox
    scrollbarWidth: "thin",
    scrollbarColor: `${siteTheme.accentColor}80 ${siteTheme.secondaryBgColor}`,
    
    // For Chrome, Edge, and Safari
    "&::-webkit-scrollbar": {
      width: "8px",
      height: "8px",
    },
    "&::-webkit-scrollbar-track": {
      background: siteTheme.secondaryBgColor,
      borderRadius: "4px",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `${siteTheme.accentColor}80`,
      borderRadius: "4px",
      border: `2px solid ${siteTheme.secondaryBgColor}`,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: siteTheme.accentColor,
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: siteTheme.bgColor, 
        color: siteTheme.textColor, 
        minHeight: "100vh" 
      }}
      className="custom-scrollbar"
    >
      <style jsx global>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: ${siteTheme.secondaryBgColor};
    border-radius: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: ${siteTheme.accentColor}80;
    border-radius: 4px;
    border: 2px solid ${siteTheme.secondaryBgColor};
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: ${siteTheme.accentColor};
  }

  .custom-scrollbar::-webkit-scrollbar-button {
    display: none;
    height: 0;
    width: 0;
  }


`}</style>

      
      <Header siteTheme={siteTheme} />

      <main className="container mx-auto px-4 py-8 custom-scrollbar">
        <h1 className="text-3xl font-bold mb-8 text-center">Customer Reviews</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Review Form with fixed height */}
          <div className="lg:col-span-1">
            <div 
              className="sticky top-4 p-6 rounded-lg custom-scrollbar"
              style={{ 
                backgroundColor: siteTheme.cardBgColor, 
                borderColor: siteTheme.borderColor, 
                borderWidth: "1px",
                maxHeight: "calc(100vh - 2rem)",
                overflowY: "auto"
              }}
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2">Overall Rating</h2>
                <div className="flex justify-center items-center mb-2">
                  <span className="text-4xl font-bold mr-2">{averageRating.toFixed(1)}</span>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const difference = averageRating - star + 1
                      return difference >= 1 ? (
                        <Star key={star} fill={siteTheme.accentColor} color={siteTheme.accentColor} />
                      ) : difference > 0 && difference < 1 ? (
                        <StarHalf key={star} fill={siteTheme.accentColor} color={siteTheme.accentColor} />
                      ) : (
                        <Star key={star} color={siteTheme.borderColor} />
                      )
                    })}
                  </div>
                </div>
                <p className="text-sm opacity-80">Based on {reviews.length} reviews</p>
              </div>

              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating, index) => (
                  <div key={rating} className="flex items-center">
                    <span className="w-8 text-sm font-medium">{rating} ★</span>
                    <div
                      className="flex-grow h-4 mx-2 rounded-full overflow-hidden"
                      style={{ backgroundColor: siteTheme.secondaryBgColor }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${ratingPercentages[index]}%`,
                          backgroundColor: siteTheme.accentColor,
                        }}
                      ></div>
                    </div>
                    <span className="w-8 text-right text-sm">{ratingCounts[index]}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <ReviewForm onSubmit={handleSubmitReview} siteTheme={siteTheme} />
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2">
            {loading ? (
              <div className="text-center py-12">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-4">No reviews yet</p>
                <p>Be the first to share your experience!</p>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">{reviews.length} Reviews</h2>         
                  <div className="flex items-center">
                    <Filter size={16} className="mr-1" />
                    <select
                      className="p-2 rounded text-sm appearance-none cursor-pointer pl-3 pr-8 relative"
                      style={{
                        backgroundColor: siteTheme.secondaryBgColor,
                        borderColor: siteTheme.borderColor,
                        borderWidth: "1px",
                        color: siteTheme.textColor,
                        background: `${siteTheme.secondaryBgColor} url("data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23${siteTheme.textColor.replace('#', '')}' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E") no-repeat right .75rem center`,
                        backgroundSize: "8px 10px",
                        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
                      }}
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                    >
                      <option value="newest">Newest First</option>
                      <option value="highest">Highest Rated</option>
                      <option value="lowest">Lowest Rated</option>
                    </select>
                  </div>
                </div>

                <div className="custom-scrollbar" style={{ maxHeight: "100%", overflowY: "auto" }}>
                  {sortedReviews.map((review) => (
                    <ReviewCard key={review._id} review={review} siteTheme={siteTheme} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
