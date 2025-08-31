"use client"

import { useEffect, useState } from "react"

export function LoadingScreen() {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 bg-[#eeeeee] flex items-center justify-center z-50">
      <div className="text-center">
        <div className="text-blue-600 text-4xl font-bold mb-4 lowercase">facebook</div>
        <div className="w-8 h-8 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  )
}


export default LoadingScreen;