"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"

export default function OrdersManagement({ siteTheme, orders }) {
  const [currentOrderPage, setCurrentOrderPage] = useState(1)
  const [totalOrderPages, setTotalOrderPages] = useState(Math.ceil(orders.length / 10) || 1)
  const ordersPerPage = 10

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

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Recent Orders</h2>
      {orders.length === 0 ? (
        <p>No recent orders.</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border" style={{ borderColor: siteTheme.borderColor }}>
              <thead>
                <tr style={{ backgroundColor: siteTheme.secondaryBgColor }}>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Order ID
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Customer Name
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Email
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Phone
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Address
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Product
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Details
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Quantity
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Total
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Date
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Payment Method
                  </th>
                  <th
                    className="px-6 py-3 border-b-2 text-left text-xs font-semibold uppercase tracking-wider"
                    style={{ borderColor: siteTheme.borderColor }}
                  >
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => (
                  <tr key={order.id} style={{ backgroundColor: siteTheme.cardBgColor }}>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.id || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.customer.name || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.customer.email || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.customer.phone || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.customer.address || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.product.name || "N/A"}
                      {order.product.isCustomProduct && (
                        <span className="ml-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Custom</span>
                      )}
                      <div className="text-xs mt-1">Category: {order.product.category || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      <div>
                        <p>Color: {order.selectedColor || "N/A"}</p>
                        <p>Size: {order.selectedSize || "N/A"}</p>
                        {order.product.customText && order.product.customText !== "N/A" && (
                          <p>Text: {order.product.customText}</p>
                        )}
                        {order.product.customImage && (
                          <div className="mt-1">
                            <a
                              href={order.product.customImage}
                              download={`custom-design-${order.id}.png`}
                              title="Click to download image"
                              className="cursor-pointer inline-block"
                            >
                              <Image
                                src={order.product.customImage || "/placeholder.svg"}
                                alt="Custom design"
                                width={50}
                                height={50}
                                className="rounded border hover:border-blue-500 transition-all"
                                style={{ borderColor: siteTheme.borderColor }}
                              />
                              <span className="text-xs block mt-1" style={{ color: siteTheme.accentColor }}>
                                Download
                              </span>
                            </a>
                          </div>
                        )}
                        {/* Display final design image if available */}
                        {order.product.finalDesignImage && (
                          <div className="mt-3">
                            <p className="text-xs font-semibold">Final Design:</p>
                            <div className="relative group">
                              <Image
                                src={order.product.finalDesignImage || "/placeholder.svg"}
                                alt="Final design"
                                width={100}
                                height={100}
                                className="rounded mt-1 transition-all"
                                style={{ borderColor: siteTheme.accentColor, borderWidth: "2px" }}
                              />
                              <button
                                onClick={() => downloadDesignImage(order.product.finalDesignImage, order.id)}
                                className="mt-2 right-2 p-1 rounded "
                                style={{ backgroundColor: siteTheme.accentColor, color: siteTheme.textColor }}
                                title="Download final design"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {order.quantity || 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      ${(order.amount_total / 100).toFixed(2) || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      {new Date(order.created * 1000).toLocaleDateString() || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      <div className="flex items-center">
                        <span
                          className="capitalize"
                          style={{ color: order.paymentMethod === "delivery" ? "#F97316" : "#3B82F6" }}
                        >
                          {order.paymentMethod === "delivery" ? "Delivery" : "Stripe"}
                        </span>
                        {order.paymentMethod === "delivery" && order.preferredMethod && (
                          <span
                            className="text-xs px-2 py-1 rounded capitalize ml-2"
                            style={{ backgroundColor: siteTheme.secondaryBgColor }}
                          >
                            {order.preferredMethod}
                          </span>
                        )}
                      </div>
                      {order.paymentMethod === "delivery" && order.additionalNotes && (
                        <p className="mt-1 text-xs">
                          <span className="font-semibold">Notes:</span> {order.additionalNotes}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap border-b" style={{ borderColor: siteTheme.borderColor }}>
                      <select
                        value={order.status || "pending"}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                        className="px-2 py-1 rounded text-sm"
                        style={{
                          backgroundColor: siteTheme.secondaryBgColor,
                          color: siteTheme.textColor,
                          borderColor: siteTheme.borderColor,
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination controls for orders */}
          <div className="sm:flex justify-between items-center mt-4">
            <div className="text-sm">
              Showing {indexOfFirstOrder + 1} to {Math.min(indexOfLastOrder, orders.length)} of {orders.length} orders
            </div>
            <div className="flex space-x-2 mt-2 sm:mt-0">
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
        </>
      )}
    </div>
  )
}
