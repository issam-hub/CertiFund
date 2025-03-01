"use client"

import { useEffect, useState } from "react"

export default function Loading() {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Sample projects data - replace with your actual projects
  const projects = [
    { id: 1, title: "Project 1", image: "/placeholder.svg?height=400&width=300" },
    { id: 2, title: "Project 2", image: "/placeholder.svg?height=400&width=300" },
    { id: 3, title: "Project 3", image: "/placeholder.svg?height=400&width=300" },
    { id: 4, title: "Project 4", image: "/placeholder.svg?height=400&width=300" },
    { id: 5, title: "Project 5", image: "/placeholder.svg?height=400&width=300" },
    { id: 6, title: "Project 6", image: "/placeholder.svg?height=400&width=300" },
    { id: 7, title: "Project 7", image: "/placeholder.svg?height=400&width=300" },
    { id: 8, title: "Project 8", image: "/placeholder.svg?height=400&width=300" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length)
    }, 2000) // Change slide every 2 seconds

    return () => clearInterval(timer)
  }, [projects.length])

  // Calculate positions for visible slides
  const getVisibleSlides = () => {
    const slides = []
    const totalSlides = projects.length

    // We'll show 7 slides at a time
    for (let i = -3; i <= 3; i++) {
      const index = (currentIndex + i + totalSlides) % totalSlides
      slides.push({ index, offset: i })
    }

    return slides
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center overflow-hidden">
      {/* Main title */}
      <div className="text-center mb-16 px-4">
        <h1 className="text-[#1F2937] text-4xl md:text-6xl font-bold mb-4">Crowdfunding Innovation</h1>
        <p className="text-[#3B82F6] text-lg md:text-xl">Loading amazing projects that change the world</p>
      </div>

      {/* Carousel container */}
      <div className="relative w-full h-[400px] perspective-[1000px]">
        <div className="relative w-full h-full">
          {getVisibleSlides().map(({ index, offset }) => (
            <div
              key={projects[index].id}
              className="absolute left-1/2 top-1/2 transition-all duration-500 ease-out"
              style={{
                transform: `
                  translate(-50%, -50%)
                  translateX(${offset * 200}px)
                  translateZ(${Math.abs(offset) * -100}px)
                  rotateY(${offset * 10}deg)
                `,
                opacity: 1 - Math.abs(offset) * 0.2,
                zIndex: 3 - Math.abs(offset),
              }}
            >
              <div className="w-[250px] h-[350px] bg-white rounded-xl shadow-xl overflow-hidden transform-gpu">
                <img
                  src={projects[index].image || "/placeholder.svg"}
                  alt={projects[index].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1E3A8A]/50 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-6">
                  <span className="text-white text-xl font-medium">{projects[index].title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading indicator */}
      <div className="mt-16">
        <div className="w-64 h-1 bg-[#93C5FD] rounded-full overflow-hidden">
          <div className="h-full bg-[#3B82F6] rounded-full animate-[loading_2s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  )
}

