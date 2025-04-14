'use client'

import { useState, useEffect } from 'react'

export default function SimpleForm() {
  const [message, setMessage] = useState('')
  const [submittedMessages, setSubmittedMessages] = useState([])
  const [status, setStatus] = useState('')

  // Fetch existing messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch('/api/messages')
        const data = await res.json()
        
        if (res.ok) {
          setSubmittedMessages(data.messages)
        } else {
          setStatus(`Error fetching messages: ${data.error}`)
        }
      } catch (error) {
        setStatus(`Failed to fetch messages: ${error.message}`)
      }
    }

    fetchMessages()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!message.trim()) {
      setStatus('Please enter a message')
      return
    }

    setStatus('Submitting...')
    
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      })

      const data = await res.json()
      
      if (res.ok) {
        setStatus('Message submitted successfully!')
        setMessage('')
        // Add the new message to the list
        setSubmittedMessages([...submittedMessages, { message, _id: data.messageId, createdAt: new Date() }])
      } else {
        setStatus(`Error: ${data.error}`)
      }
    } catch (error) {
      setStatus(`Failed to submit: ${error.message}`)
    }
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Submit a Message</h2>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="message" className="block text-gray-700 mb-2">Message</label>
          <input
            type="text"
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your message"
          />
        </div>
        
        <button 
          type="submit" 
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Submit
        </button>
        
        {status && (
          <p className={`mt-2 ${status.includes('Error') || status.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
            {status}
          </p>
        )}
      </form>
      
      <div>
        <h3 className="text-xl font-semibold mb-3">Submitted Messages</h3>
        {submittedMessages.length > 0 ? (
          <ul className="border rounded-lg divide-y">
            {submittedMessages.map((item) => (
              <li key={item._id} className="p-3">
                <p>{item.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No messages yet</p>
        )}
      </div>
    </div>
  )
}