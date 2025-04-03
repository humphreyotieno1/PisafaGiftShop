"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"

export default function ProductImage({ src, alt, className = "", priority = false }) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 2

  const handleLoad = () => {
    setIsLoading(false)
    setError(false)
  }

  const handleError = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1)
      // Try loading the image again after a short delay
      setTimeout(() => {
        setError(false)
        setIsLoading(true)
      }, 1000)
    } else {
      setError(true)
      setIsLoading(false)
    }
  }

  // Use a default placeholder if no src is provided or if there's an error
  const imageSrc = error ? "/placeholders/no-image.svg" : (src || "/placeholders/loading.svg")

  return (
    <div 
      className={`relative aspect-square overflow-hidden rounded-t-lg ${className}`}
      style={{ backgroundColor: "#f8f9fa" }}
    >
      <Image
        src={imageSrc}
        alt={error ? "Image not available" : (alt || "Product image")}
        fill
        className={`object-contain p-4 transition-all duration-300 ${isLoading ? "scale-105 blur-sm" : "scale-100 blur-0"} ${error ? "opacity-50" : "opacity-100"}`}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={priority}
        quality={85}
        onLoad={handleLoad}
        onError={handleError}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm transition-opacity">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <span className="text-xs font-medium text-muted-foreground">Loading...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/5 backdrop-blur-sm">
          <span className="text-sm font-medium text-muted-foreground">Unable to load image</span>
        </div>
      )}
    </div>
  )
}
