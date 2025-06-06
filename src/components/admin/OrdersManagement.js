"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  X,
  Download,
  ShoppingBag,
  Bell,
  Check,
  Trash2,
  CheckCheck,
  Trash,
  RefreshCw,
} from "lucide-react"

export default function OrdersManagement({ siteTheme, orders }) {
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [ordersPerPage] = useState(10)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isMobile, setIsMobile] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)

  // Notification colors
  const newOrderColor = "#0A0F2C" // Light yellow for new orders
  const readOrderColor = siteTheme.cardBgColor // Current theme color for read orders

  // Calculate total pages
  const totalOrderPages = Math.ceil(orders.length / ordersPerPage) || 1

  // Check if device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 640)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)
    return () => window.removeEventListener("resize", checkIfMobile)
  }, [])

  // Load notifications from database
  useEffect(() => {
    loadNotifications()
    // Also create notifications for any orders that don't have them
    createNotificationsForOrders()
  }, [])


  const loadNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.filter((n) => !n.isDeleted)) // Only show non-deleted notifications
      }
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const createNotificationsForOrders = async () => {
    try {
      await fetch("/api/notifications/create-for-orders", {
        method: "POST",
      })
      // Reload notifications after creating new ones
      loadNotifications()
    } catch (error) {
      console.error("Error creating notifications for orders:", error)
    }
  }

  // Get unread notifications count
  const unreadCount = notifications.filter((n) => !n.isRead && !n.isDeleted).length

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

  // View order details
  const viewOrderDetails = (order) => {
    setSelectedOrder(order)
    // Mark order as read when viewing details
    // markOrderAsRead(order.id)
  }

  // Close order details modal
  const closeOrderDetails = () => {
    setSelectedOrder(null)
  }

  // Mark single notification as read
  const markNotificationAsRead = async (notificationId) => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAsRead", notificationId }),
      })

      if (response.ok) {
        await loadNotifications() // Reload notifications
      }
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
    setLoading(false)
  }

  // Delete single notification
  const deleteNotification = async (notificationId) => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete", notificationId }),
      })

      if (response.ok) {
        await loadNotifications() // Reload notifications
        alert("Notification marked as read and deleted")
      }
    } catch (error) {
      console.error("Error deleting notification:", error)
    }
    setLoading(false)
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "markAllAsRead" }),
      })

      if (response.ok) {
        await loadNotifications() // Reload notifications
      }
    } catch (error) {
      console.error("Error marking all as read:", error)
    }
    setLoading(false)
  }

  // Delete all notifications
  const deleteAllNotifications = async () => {
    if (confirm("This will mark all notifications as read and deleted. Are you sure?")) {
      setLoading(true)
      try {
        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "deleteAll" }),
        })

        if (response.ok) {
          await loadNotifications() // Reload notifications
          alert("All notifications marked as read and deleted")
        }
      } catch (error) {
        console.error("Error deleting all notifications:", error)
      }
      setLoading(false)
    }
  }

  // Mark order as read (for when viewing order details)
  const markOrderAsRead = async (orderId) => {
    const notification = notifications.find((n) => n.orderId === orderId)
    if (notification && !notification.isRead) {
      await markNotificationAsRead(notification._id)
    }
  }

  // Get order background color based on read status
  const getOrderBackgroundColor = (orderId) => {
    const notification = notifications.find((n) => n.orderId === orderId)
    if (notification) {
      return notification.isRead ? readOrderColor : newOrderColor
    }
    return readOrderColor // Default to read color if no notification found
  }

  // Format text with line breaks after 100 characters
  const formatLongText = (text, maxLength = 20) => {
    if (!text || text.length <= maxLength) return text

    const chunks = []
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength))
    }

    return chunks.join("\n")
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold flex items-center">
          <ShoppingBag className="mr-2" size={24} />
          Orders Management
        </h2>

        {/* Notification Button */}
        <div className="relative flex items-center space-x-2">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg flex items-center"
            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Panel */}
          {showNotifications && (
            <div
              className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto rounded-lg shadow-lg border z-50"
              style={{
                backgroundColor: siteTheme.bgColor,
                borderColor: siteTheme.borderColor,
              }}
            >
              {/* Notification Header */}
              <div
                className="p-4 border-b flex justify-between items-center"
                style={{ borderColor: siteTheme.borderColor }}
              >
                <h3 className="font-semibold">Notifications ({unreadCount} unread)</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={markAllAsRead}
                    className="p-1 rounded hover:opacity-80"
                    style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                    title="Mark all as read"
                    disabled={loading}
                  >
                    <CheckCheck size={16} />
                  </button>
                  <button
                    onClick={deleteAllNotifications}
                    className="p-1 rounded hover:opacity-80 bg-red-500 text-white"
                    title="Delete all"
                    disabled={loading}
                  >
                    <Trash size={16} />
                  </button>
                </div>
              </div>

              {/* Notifications List */}
              <div className="max-h-64 overflow-y-auto">
                {loading ? (
                  <div className="p-4 text-center">
                    <RefreshCw size={20} className="animate-spin mx-auto" />
                    <p className="text-sm mt-2">Loading...</p>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification._id}
                      className="p-3 border-b flex justify-between items-start"
                      style={{
                        borderColor: siteTheme.borderColor,
                        backgroundColor: notification.isRead ? readOrderColor : newOrderColor,
                      }}
                    >
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-xs text-gray-600">Customer: {notification.customerName}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(notification.orderDate * 1000).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={() => markNotificationAsRead(notification._id)}
                            className="p-1 rounded hover:opacity-80"
                            style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                            title="Mark as read"
                            disabled={loading}
                          >
                            <Check size={12} />
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification._id)}
                          className="p-1 rounded hover:opacity-80 bg-red-500 text-white"
                          title="Delete"
                          disabled={loading}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

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
                {currentOrders.map((order) => (
                  <tr key={order.id} style={{ backgroundColor: getOrderBackgroundColor(order.id) }}>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      <span style={{ color: siteTheme.accentColor }}>{`#${order.id?.substring(0, 5) || "N/A"}`}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
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
                        {order.quantity || 1} item{order.quantity > 1 ? "s" : ""}
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
                ))}
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
                    <span style={{ color: siteTheme.accentColor }}>#{selectedOrder.id?.substring(0, 5)}</span>
                  </h3>
                  <button onClick={closeOrderDetails} className="text-gray-500 hover:text-gray-700">
                    <X size={24} />
                  </button>
                </div>

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
                  className="mt-6 p-4 rounded-lg"
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
                    <span className="font-medium">Quantity:</span> {selectedOrder.quantity || 1}
                  </p>
                  <p>
                    <span className="font-medium">Coupon:</span> {selectedOrder.coupon || "N/A"}
                  </p>
                  <p>
                    <span className="font-medium">Discount percentage:</span> {(selectedOrder.discountPercentage)}% OFF
                  </p>
                  <p>
                    <span className="font-medium">Total:</span> ${(selectedOrder.amount_total / 100).toFixed(2)}
                  </p>
                </div>

                {/* Discount Information Section */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  <h4 className="font-semibold mb-3">Discount Applied (<small className="text-xs">Each product</small>)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Coupon Code:</span>{" "}
                        <span style={{ color: siteTheme.accentColor, fontWeight: "bold" }}>
                          {selectedOrder.coupon || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Discount:</span>{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {selectedOrder.discountPercentage ? `${selectedOrder.discountPercentage}%` : "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Original Price:</span>{" "}
                        <span className="line-through">${selectedOrder.originalPrice || "N/A"}</span>
                      </p>
                      <p>
                        <span className="font-medium">Final Price:</span>{" "}
                        {selectedOrder.finalPrice ? (
                          <span style={{ color: siteTheme.accentColor, fontWeight: "bold" }}>
                            ${selectedOrder.finalPrice.toFixed(2)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Customer Saved:</span>{" "}
                        {selectedOrder.originalPrice && selectedOrder.finalPrice ? (
                          <span style={{ color: "#10b981", fontWeight: "bold" }}>
                            ${(selectedOrder.originalPrice - selectedOrder.finalPrice).toFixed(2)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
                  </div>
                </div>



                {/* Discount Information Section */}
                <div
                  className="mt-6 p-4 rounded-lg"
                  style={{
                    backgroundColor: siteTheme.cardBgColor,
                    borderColor: siteTheme.borderColor,
                    borderWidth: "1px",
                  }}
                >
                  <h4 className="font-semibold mb-3">Discount Applied (<small className="text-xs">All products</small>)</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p>
                        <span className="font-medium">Coupon Code:</span>{" "}
                        <span style={{ color: siteTheme.accentColor, fontWeight: "bold" }}>
                          {selectedOrder.coupon || "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Discount:</span>{" "}
                        <span style={{ fontWeight: "bold" }}>
                          {selectedOrder.discountPercentage ? `${selectedOrder.discountPercentage}%` : "N/A"}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Original Total:</span>{" "}
                        <span className="line-through">${selectedOrder.originalPrice * selectedOrder.quantity || "N/A"}</span>
                      </p>
                      <p>
                        <span className="font-medium">Final Price:</span>{" "}
                        {selectedOrder.originalPrice && selectedOrder.quantity && selectedOrder.discountPercentage ? (
                          <span style={{ color: siteTheme.accentColor, fontWeight: "bold" }}>
                            ${(
                              selectedOrder.originalPrice *
                              selectedOrder.quantity *
                              (1 - selectedOrder.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                      <p>
                        <span className="font-medium">Customer Saved:</span>{" "}
                        {selectedOrder.originalPrice && selectedOrder.quantity && selectedOrder.discountPercentage ? (
                          <span style={{ color: "#10b981", fontWeight: "bold" }}>
                            ${(
                              selectedOrder.originalPrice *
                              selectedOrder.quantity *
                              (selectedOrder.discountPercentage / 100)
                            ).toFixed(2)}
                          </span>
                        ) : (
                          "N/A"
                        )}
                      </p>
                    </div>
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
                        <span className="font-medium">Price:</span> {selectedOrder.product.price || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Category:</span> {selectedOrder.product.category || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Color:</span> {selectedOrder.selectedColor || "N/A"}
                      </p>
                      <p>
                        <span className="font-medium">Size:</span> {selectedOrder.selectedSize || "N/A"}
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
