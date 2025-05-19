"use client"

import { useEffect, useState } from "react"

export default function LoadingComponent() {
  const [dots, setDots] = useState("")

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."))
    }, 400)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="relative">
        {/* Outer spinner */}
        <div className="w-16 h-16 rounded-full border-4 border-[#93C5FD] border-t-[#3B82F6] animate-spin"></div>

        {/* Middle spinner */}
        <div className="absolute top-1 left-1 w-14 h-14 rounded-full border-4 border-[#3B82F6] border-t-[#1E3A8A] animate-spin-slow"></div>

        {/* Inner spinner */}
        <div className="absolute top-3 left-3 w-10 h-10 rounded-full border-4 border-[#1E3A8A] border-t-[#93C5FD] animate-bounce-spin"></div>

        {/* Center dot */}
        <div className="absolute top-6 left-6 w-4 h-4 rounded-full bg-[#93C5FD] animate-pulse"></div>
      </div>

      <div className="mt-6 font-semibold text-[#93C5FD]">Loading{dots}</div>
    </div>
  )
}
