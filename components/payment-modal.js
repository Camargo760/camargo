"use client"

import { useState } from "react"
import { X, CreditCard, Truck, DollarSign, Send } from "lucide-react"

export default function PaymentModal({ isOpen, onClose, onSelectPaymentMethod, productDetails }) {
  const [selectedMethod, setSelectedMethod] = useState(null)

  if (!isOpen) return null

  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    onSelectPaymentMethod(method)
    onClose()
  }

  return (
    <div className=" fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 " >
      <div className="mt-[140px] bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden overflow-y-auto" style={{ maxHeight: "calc(90vh - 100px)" }}>
        <div className="py-6 px-8 border-b relative">
          <h2 className="text-xl font-bold text-gray-800 inline-block">Select Payment Method</h2>
          <button
            onClick={onClose}
            className="float-right text-gray-500 hover:text-gray-700 transition-colors absolute top-1/2 transform -translate-y-1/2 right-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6" >
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Order Summary</h3>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="font-medium">{productDetails.name}</p>
              {productDetails.color && <p className="text-sm text-gray-600">Color: {productDetails.color}</p>}
              {productDetails.size && <p className="text-sm text-gray-600">Size: {productDetails.size}</p>}
              <p className="text-sm text-gray-600">Quantity: {productDetails.quantity || 1}</p>
              <p className="font-bold mt-2">
                Total: ${(productDetails.price * (productDetails.quantity || 1)).toFixed(2)}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleSelectMethod("stripe")}
              className={`w-full p-4 border rounded-lg hover:border-blue-500 transition-colors ${selectedMethod === "stripe" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            >
              <div className="inline-block align-middle float-left">
                <CreditCard className="text-blue-600 mr-3 inline-block" size={24} />
                <span className="font-medium inline-block">Pay with Card</span>
              </div>
              <span className="text-sm text-gray-500 inline-block ml-3 align-middle float-right">Visa, Mastercard, etc.</span>
            </button>

            <button
              onClick={() => handleSelectMethod("delivery")}
              className={`w-full p-4 border rounded-lg hover:border-blue-500 transition-colors ${selectedMethod === "delivery" ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
            >
              <div className="inline-block align-middle float-left">
                <Truck className="text-green-600 mr-3 inline-block" size={24} />
                <span className="font-medium inline-block">Pay at Delivery Time</span>
              </div>
              <span className="text-sm text-gray-500 inline-block ml-3 align-middle float-right">Cash on delivery</span>
            </button>
          </div>


          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-gray-600 mb-2">We accept</p>
            <div className="text-center">
              <div className="inline-block mr-4">
                <div className="inline-flex items-center">
                  <DollarSign className="text-green-600 mr-1" size={16} />
                  <span className="text-sm">Cash App Pay</span>
                </div>
              </div>
              <div className="inline-block mr-4">
                <div className="inline-flex items-center">
                  <Send className="text-blue-600 mr-1" size={16} />
                  <span className="text-sm">Zelle</span>
                </div>
              </div>
              <div className="inline-block">
                <div className="inline-flex items-center">
                  <svg className="w-4 h-4 mr-1 text-blue-700" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 3.384a.641.641 0 0 1 .634-.546h4.778a.641.641 0 0 1 .633.738l-3.278 17.21a.641.641 0 0 1-.635.55zm7.348-11.1L13.3 14.862a.32.32 0 0 0 .318.276h2.745c.272 0 .553-.249.623-.51l1.235-4.303a.32.32 0 0 0-.318-.276h-2.745c-.272 0-.553.25-.623.51zm-1.25 6.394l1.944-6.83c.163-.583.688-1.007 1.297-1.007h3.858c.82 0 1.39.786 1.25 1.595l-1.961 6.835c-.163.583-.688 1.006-1.297 1.006h-3.843c-.82 0-1.39-.785-1.25-1.595l.002-.004z" />
                  </svg>
                  <span className="text-sm">PayPal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

