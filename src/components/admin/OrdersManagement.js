"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, X, Download, ShoppingBag } from "lucide-react"

export default function OrdersManagement({ siteTheme, orders }) {
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isMobile, setIsMobile] = useState(false)

  // Calculate total pages
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage) || 1

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    // Initial check
    checkIfMobile()

    // Add event listener
    window.addEventListener("resize", checkIfMobile)

    // Cleanup
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Pagination handlers for orders
  const handlePreviousOrderPage = () => {
    if (currentOrderPage > 1) {
      setCurrentOrderPage(currentOrderPage - 1)
    }
  }

  const handleNextOrderPage = () => {
    if (currentOrderPage < totalOrderPages) {
      setCurrentOrderPage(currentOrderPage + 1)
    }
  }

  // Get current orders for pagination
  const indexOfLastOrder = currentOrderPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder)

  // Function to download the final design image
  const downloadDesignImage = (imageUrl, orderId) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `custom-design-${orderId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error("Error updating order status:", errorData)
        throw new Error(errorData.error || "Failed to update order status")
      }

      // Refresh orders after status update
      window.location.reload()
    } catch (err) {
      console.error("Error updating order status:", err)
      alert("Failed to update order status. Please try again.")
    }
  }

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
  }

  // Close order details modal
  const closeOrderDetails = () => {
    setSelectedOrder(null)
  }

  // Get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "processing":
        return "#3B82F6" // blue
      case "shipped":
        return "#10B981" // green
      case "delivered":
        return "#059669" // darker green
      case "cancelled":
        return "#EF4444" // red
      case "completed":
        return "#059669" // darker green
      default:
        return "#F59E0B" // amber for pending
    }
  }

  // Format text with line breaks after 100 characters
  const formatLongText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text

    // Split the text into chunks of maxLength
    const chunks = []
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength))
    }

    return chunks.join("\n")
  }

  // Debug function to log order structure
  const debugOrder = (order) => {
    console.log("Order structure:", order)
    console.log("Product:", order.product)
    console.log("Category:", order.product?.category)
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center">
        <ShoppingBag className="mr-2" size={24} />
        Orders Management
      </h2>

      {orders.length === 0 ? (
        <p>No recent orders.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table
              className="min-w-full border rounded-lg overflow-hidden"
              style={{ borderColor: siteTheme.borderColor }}
            >
              <thead>
                <tr style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Order
                  </th>

                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Date
                  </th>
                  {!isMobile && (
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Total
                    </th>
                  )}
                  {!isMobile && (
                    <th
                      className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                      style={{ borderColor: siteTheme.borderColor }}
                    >
                      Quantity
                    </th>
                  )}
                  <th
                    className="px-6 py-3 border-b-2 text-center text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  // Debug each order
                  if (process.env.NODE_ENV === "development") {
                    debugOrder(order)
                  }

                  return (
                    <tr key={order.id} style={{ backgroundColor: siteTheme.cardBgColor }}>
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <span style={{ color: siteTheme.accentColor }}>{`#${order.id?.substring(0, 5) || "N/A"}`}</span>
                      </td>

                      <td
                        className="px-6 py-4 whitespace-nowrap border-b"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        {new Date(order.created * 1000).toLocaleDateString() || "N/A"}
                      </td>

                      {!isMobile && (
                        <td
                          className="px-6 py-4 whitespace-nowrap border-b"
                          style={{ borderColor: siteTheme.borderColor }}
                        >
                          ${(order.amount_total / 100).toFixed(2) || "0.00"}
                        </td>
                      )}
                      {!isMobile && (
                        <td
                          className="px-6 py-4 whitespace-nowrap border-b"
                          style={{ borderColor: siteTheme.borderColor }}
                        >
                          
                          {order.quantity || 1} item
                          {order.quantity > 1 ? "s" : ""}
                        </td>
                      )}
                      <td
                        className="px-6 py-4 whitespace-nowrap border-b text-center"
                        style={{ borderColor: siteTheme.borderColor }}
                      >
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="px-4 py-1 rounded text-white text-sm flex items-center justify-center mx-auto"
                          style={{ backgroundColor: siteTheme.accentColor }}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination controls for orders */}
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handlePreviousOrderPage}
                disabled={currentOrderPage === 1}
                className="px-3 py-1 rounded flex items-center"
                style={{
                  backgroundColor: currentOrderPage === 1 ? "#9CA3AF" : siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: currentOrderPage === 1 ? 0.5 : 1,
                  cursor: currentOrderPage === 1 ? "not-allowed" : "pointer",
                }}
              >
                <ChevronLeft size={16} className="mr-1" /> Previous
              </button>
              <button
                onClick={handleNextOrderPage}
                disabled={currentOrderPage === totalOrderPages}
                className="px-3 py-1 rounded flex items-center"
                style={{
                  backgroundColor: currentOrderPage === totalOrderPages ? "#9CA3AF" : siteTheme.accentColor,
                  color: siteTheme.textColor,
                  opacity: currentOrderPage === totalOrderPages ? 0.5 : 1,
                  cursor: currentOrderPage === totalOrderPages ? "not-allowed" : "pointer",
                }}
              >
                Next <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          </div>

          {/* Order Details Modal */}
          {selectedOrder && (
            <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
              <div
                className="rounded-lg p-6 max-w-4xl max-h-[90vh] overflow-auto w-full"
                style={{
                  backgroundColor: siteTheme.bgColor,
                  color: siteTheme.textColor,
                  borderColor: siteTheme.borderColor,
                  borderWidth: "1px",
                }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold">
                    Order Details{" "}
                  </h3>
                  <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700 ">
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <h4 className="font-semibold mb-3">Customer Information</h4>
                    <p>
                      <span className="font-medium">Name:</span> {selectedOrder.customer?.name || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span> {selectedOrder.customer?.email || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {selectedOrder.customer?.phone || "N/A"}
                    </p>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <span className="font-medium">Address:</span>{" "}
                      {formatLongText(selectedOrder.customer?.address || "N/A")}
                    </p>
                  </div>

                  {/* Order Information */}
                  <div
                    className="p-4 rounded-lg"
                    style={{
                      backgroundColor: siteTheme.cardBgColor,
                      borderColor: siteTheme.borderColor,
                      borderWidth: "1px",
                    }}
                  >
                    <h4 className="font-semibold mb-3">Order Information</h4>
                    <p style={{ whiteSpace: "pre-wrap" }}>
                      <span className="font-medium">Order ID:</span> {formatLongText(selectedOrder.id || "N/A")}
                    </p>
                    <p>
                      <span className="font-medium">Date:</span>{" "}
                      {new Date(selectedOrder.created * 1000).toLocaleString()}
                    </p>
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {selectedOrder.paymentMethod === "delivery" ? "Delivery" : "Stripe"}
                    </p>
                    {selectedOrder.paymentMethod === "delivery" && selectedOrder.preferredMethod && (
                      <p>
                        <span className="font-medium">Preferred Method:</span> {selectedOrder.preferredMethod}
                      </p>
                    )}
                    <p>
                      <span className="font-medium">Total:</span> ${(selectedOrder.amount_total / 100).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Product Information */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  <h4 className="font-semibold mb-3">Product Information</h4>
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/3">
                      <p>
                        <span className="font-medium">Product:</span> {selectedOrder.product?.name || "N/A"}
                        {selectedOrder.product?.isCustomProduct && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                        )}
                      </p>
                      <p>
                      </p>
                      <p>
                        <span className="font-medium">Color:</span> {selectedOrder.selectedColor || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Size:</span> {selectedOrder.selectedSize || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Quantity:</span> {selectedOrder.quantity || 1}
                      </p>
                      {selectedOrder.product?.customText && selectedOrder.product?.customText !== "N/A" && (
                        <p style={{ whiteSpace: "pre-wrap" }}>
                          <span className="font-medium">Custom Text:</span>{" "}
                          {formatLongText(selectedOrder.product.customText)}
                        </p>
                      )}
                      {selectedOrder.paymentMethod === "delivery" && selectedOrder.additionalNotes && (
                        <p className="mt-2" style={{ whiteSpace: "pre-wrap" }}>
                          <span className="font-medium">Additional Notes:</span>{" "}
                          {formatLongText(selectedOrder.additionalNotes)}
                        </p>
                      )}
                    </div>

                    {/* Custom Design */}
                    {(selectedOrder.product?.customImage || selectedOrder.product?.finalDesignImage) && (
                      <div className="md:w-1/3 mt-4 md:mt-0">
                        <p className="font-medium mb-2">Custom Design:</p>
                        <div className="flex flex-col items-center">
                          <Image
                            src={
                              selectedOrder.product.finalDesignImage ||
                              selectedOrder.product.customImage ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt="Custom design"
                            width={150}
                            height={150}
                            className="rounded border"
                            style={{ borderColor: siteTheme.accentColor, borderWidth: "2px" }}
                          />
                          <button
                            onClick={() =>
                              downloadDesignImage(
                                selectedOrder.product.finalDesignImage || selectedOrder.product.customImage,
                                selectedOrder.id,
                              )
                            }
                            className="mt-2 px-3 py-1 rounded flex items-center text-sm"
                            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                          >
                            <Download size={14} className="mr-1" /> Download Design
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
