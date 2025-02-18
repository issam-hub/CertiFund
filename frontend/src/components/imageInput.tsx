"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"

interface ImageInputProps {
  defaultValue: string
  onImageChange?: (imageUrl: string, file: File) => void;
}

export default function ImageInput({ defaultValue, onImageChange }: ImageInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(defaultValue)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const MAX_FILE_SIZE = 1024 * 1024 // 1MB in bytes

  const handleImageClick = () => {
    setError(null)
    fileInputRef.current?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setError("File size must be less than 1MB")
        setImagePreview(null)
        setImageFile(null)
        // Reset the input so the same file can be selected again
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        return
      }

      setError(null)
      setImageFile(file)

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setImagePreview(result)
        // Pass both the base64 string and file object to parent
        if (onImageChange && result) {
          onImageChange(result, file)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div>
      <div
        className="h-[400px] max-w-[750px] border-2 border-dashed border-gray-300 rounded-lg cursor-pointer flex items-center justify-center overflow-hidden"
        onClick={handleImageClick}
      >
        {imagePreview ? (
          <Image
            src={"https://res.cloudinary.com/dw9gxl9qm/image/upload/v1739822061/xubiqlzyb2brz4kvcdqw.jpg"}
            alt="Chosen image"
            width={750}
            height={400}
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="text-gray-500 bg-slate-100 h-full w-full flex justify-center items-center">Click to choose an image (max 1MB)</div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">* {error}</p>}
    </div>
  )
}