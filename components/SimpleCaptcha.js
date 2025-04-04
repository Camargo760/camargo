"use client"

import { useState, useEffect } from "react"

export default function SimpleCaptcha({ onVerify }) {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [operator, setOperator] = useState("+")
  const [answer, setAnswer] = useState("")
  const [error, setError] = useState("")
  const [verified, setVerified] = useState(false)

  // Generate a new captcha challenge
  const generateCaptcha = () => {
    // Generate random numbers between 1 and 10
    const newNum1 = Math.floor(Math.random() * 10) + 1
    const newNum2 = Math.floor(Math.random() * 10) + 1

    // Randomly choose an operator (+ or -)
    const operators = ["+", "-", "×"]
    const newOperator = operators[Math.floor(Math.random() * operators.length)]

    setNum1(newNum1)
    setNum2(newNum2)
    setOperator(newOperator)
    setAnswer("")
    setError("")
    setVerified(false)
  }

  // Calculate the correct answer based on the operator
  const calculateCorrectAnswer = () => {
    switch (operator) {
      case "+":
        return num1 + num2
      case "-":
        return num1 - num2
      case "×":
        return num1 * num2
      default:
        return 0
    }
  }

  // Verify the user's answer
  const verifyCaptcha = () => {
    const userAnswer = Number.parseInt(answer, 10)
    const correctAnswer = calculateCorrectAnswer()

    if (isNaN(userAnswer)) {
      setError("Please enter a valid number")
      return false
    }

    if (userAnswer === correctAnswer) {
      setVerified(true)
      onVerify(true)
      return true
    } else {
      setError("Incorrect answer, please try again")
      generateCaptcha()
      onVerify(false)
      return false
    }
  }

  // Initialize captcha on component mount
  useEffect(() => {
    generateCaptcha()
  }, [])

  return (
    <div className="mt-4 p-3 bg-gray-50 border rounded-md">
      <div className="text-sm font-medium text-gray-700 mb-2">Please solve this captcha:</div>
      <div className="flex items-center space-x-2 mb-2">
        <div className="text-lg font-bold">
          {num1} {operator} {num2} = ?
        </div>
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          className="w-16 px-2 py-1 border rounded"
          placeholder="?"
          disabled={verified}
        />
        <button
          type="button"
          onClick={verifyCaptcha}
          className={`px-3 py-1 rounded text-sm ${
            verified ? "bg-green-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
          disabled={verified}
        >
          {verified ? "Verified" : "Verify"}
        </button>
        {!verified && (
          <button
            type="button"
            onClick={generateCaptcha}
            className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            New
          </button>
        )}
      </div>
      {error && <div className="text-red-500 text-sm">{error}</div>}
      {verified && <div className="text-green-500 text-sm">Captcha verified successfully!</div>}
    </div>
  )
}

