"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { useAuth } from "@/context/auth-context"

const carouselImages = [
  {
    src: "/welcome.jpg",
    alt: "Welcome to Pisafa Gifts Shop",
    title: "Welcome to Pisafa Gifts Shop",
    description: "Your premier destination for exquisite jewelry and accessories. Discover timeless pieces that tell your story.",
    buttonText: "Explore Collection",
    buttonLink: "/shop"
  },
  {
    src: "/hero.jpg",
    alt: "Discover our collection",
    title: "Elegant Jewelry Collection",
    description: "From classic designs to modern masterpieces, find the perfect piece to complement your style.",
    buttonText: "View Jewelry",
    buttonLink: "/shop?category=jewelry"
  },
  {
    src: "/rings.jpg",
    alt: "Shop with us",
    title: "Stunning Ring Collection",
    description: "Adorn your fingers with our carefully curated selection of rings, each piece crafted with precision and passion.",
    buttonText: "Browse Rings",
    buttonLink: "/shop?category=rings"
  },
  {
    src: "/dummy.jpg",
    alt: "Our store",
    title: "Visit Our Store",
    description: "Experience the magic of our physical store, where every piece tells a story and every visit is memorable.",
    buttonText: "Find Us",
    buttonLink: "/contact"
  },
]

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const { user } = useAuth()
  const isAdmin = user?.role === "ADMIN"

  // Auto-advance carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
    }, 5000) // Change image every 5 seconds

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselImages.length)
  }

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselImages.length) % carouselImages.length)
  }

  return (
    <section className="relative h-[80vh] min-h-[600px] w-full overflow-hidden">
      {/* Carousel */}
      <div className="relative h-full w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.0 }}
            className="absolute inset-0"
          >
            <Image
              src={carouselImages[currentIndex].src}
              alt={carouselImages[currentIndex].alt}
              fill
              className="object-cover blur-sm scale-105"
              priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-black/70" />
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
          aria-label="Next slide"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* Indicators */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {carouselImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                currentIndex === index ? "bg-white" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl items-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.0 }}
              className="max-w-2xl text-white"
            >
              <h1 className="mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl">
                {carouselImages[currentIndex].title}
              </h1>
              <p className="mb-8 text-lg text-white/90">
                {carouselImages[currentIndex].description}
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-black px-8 text-white transition-all duration-300 hover:bg-black/90 hover:shadow-lg hover:shadow-black/20"
                >
                  <Link href={carouselImages[currentIndex].buttonLink} className="flex items-center">
                    {carouselImages[currentIndex].buttonText}
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden border-2 border-white/20 bg-transparent text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                >
                  <Link href="/about" className="relative flex items-center">
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      Learn More
                    </span>
                  </Link>
                </Button>

                {isAdmin && (
                  <Button
                    asChild
                    variant="default"
                    size="lg"
                    className="group relative overflow-hidden bg-primary px-8 text-white transition-all duration-300 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20"
                  >
                    <Link href="/admin" className="flex items-center">
                      Admin Dashboard
                      <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
