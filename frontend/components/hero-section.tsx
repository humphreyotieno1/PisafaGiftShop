"use client"
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";

const carouselSlides = [
  {
    src: "/welcome.jpg",
    alt: "Elegant jewelry background",
    title: "Elegant Jewelry Collection",
    description: "From classic designs to modern masterpieces, find the perfect piece to complement your style.",
    buttonText: "View Jewelry",
    buttonLink: "/shop"
  },
  {
    src: "/rings.jpg",
    alt: "Stunning rings",
    title: "Stunning Ring Collection",
    description: "Discover our exquisite range of rings, crafted with precision and elegance.",
    buttonText: "Browse Rings",
    buttonLink: "/shop"
  },
  {
    src: "/hero.jpg",
    alt: "Luxury necklaces",
    title: "Luxury Necklace Collection",
    description: "Elevate your style with our timeless necklaces, designed to captivate.",
    buttonText: "Explore Necklaces",
    buttonLink: "/shop"
  }
];

export default function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Avoid hydration mismatch and only start timers after mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isMounted]);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + carouselSlides.length) % carouselSlides.length);
  };

  return (
    <section className="relative h-[75vh] min-h-[560px] w-full overflow-hidden">
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
            {isMounted && (
              <Image
                src={carouselSlides[currentIndex].src}
                alt={carouselSlides[currentIndex].alt}
                fill
                className="object-cover blur-sm scale-105"
                priority
              />
            )}
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
          {carouselSlides.map((_, index) => (
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
        <div className="relative z-10 mx-auto flex h-full max-w-5xl items-center px-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 1.0 }}
              className="w-full text-center text-white"
            >
              <p className="mb-3 text-sm tracking-widest uppercase">Elegance | Style | Luxury</p>
              <h1 className="mb-4 text-4xl font-extrabold md:text-6xl">
                {carouselSlides[currentIndex].title}
              </h1>
              <p className="mx-auto mb-8 max-w-2xl text-base md:text-lg opacity-90">
                {carouselSlides[currentIndex].description}
              </p>
              <div className="flex items-center justify-center gap-3">
                <Button
                  asChild
                  size="lg"
                  className="group relative overflow-hidden bg-white px-8 text-gray-900 transition-all duration-300 hover:bg-gray-100 hover:shadow-lg hover:shadow-black/20"
                >
                  <Link href={carouselSlides[currentIndex].buttonLink} className="flex items-center">
                    {carouselSlides[currentIndex].buttonText}
                    <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group relative overflow-hidden border-2 border-white/20 bg-transparent text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:shadow-lg hover:shadow-white/5"
                >
                  <Link href="/about" className="flex items-center">
                    <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
                      Learn More
                    </span>
                  </Link>
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}