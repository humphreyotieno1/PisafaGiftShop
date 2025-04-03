"use client"

import { useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function HeroSection() {
  const constraintsRef = useRef(null)
  const { user } = useAuth()
  
  const isAdmin = user?.role === "ADMIN"

  return (
    <section className="relative overflow-hidden bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-background via-muted/10 to-muted/30 dark:from-background dark:via-background dark:to-muted/20">
      <div className="mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
          <motion.div 
            initial={{ opacity: 0, x: -50 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ 
              duration: 0.8,
              ease: [0.165, 0.84, 0.44, 1]
            }}
          >
            <h1 className="mb-6 text-4xl font-bold tracking-tighter md:text-5xl lg:text-6xl xl:text-7xl">
              Quality Spare Parts for Your Motocycle
            </h1>
            <p className="mb-8 max-w-lg text-lg text-muted-foreground">
              Find genuine and high-quality spare parts for all makes and models. Fast shipping and competitive prices
              guaranteed. Expert support available.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button 
                asChild 
                size="lg" 
                className="group relative overflow-hidden bg-black px-8 text-white transition-all duration-300 hover:bg-black/90 hover:shadow-lg hover:shadow-black/20"
              >
                <Link href="/shop" className="flex items-center">
                  Shop Now
                  <ChevronRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg" 
                className="group relative overflow-hidden border-2 border-black/10 bg-white/50 transition-all duration-300 hover:border-black/20 hover:bg-black/5 hover:text-black hover:shadow-lg hover:shadow-black/5 dark:border-white/10 dark:bg-white/10 dark:hover:border-white/20 dark:hover:bg-white/20 dark:hover:shadow-white/5"
              >
                <Link href="/about" className="relative flex items-center">
                  <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">Learn More</span>
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

          <div ref={constraintsRef} className="relative flex h-[300px] items-center justify-center md:h-[400px] lg:h-[500px]">
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{
                opacity: 1,
                scale: 1,
                y: [0, -10, 0],
                rotate: [0, -1, 0],
              }}
              transition={{
                opacity: { duration: 0.8, ease: "easeOut" },
                scale: { duration: 0.8, ease: [0.165, 0.84, 0.44, 1] },
                y: {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 6,
                  ease: "easeInOut",
                },
                rotate: {
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 8,
                  ease: "easeInOut",
                },
              }}
            >
              <Image
                src="/hero.jpeg"
                alt="High-quality automotive spare parts showcase"
                fill
                className="object-contain p-8 drop-shadow-xl transition-all dark:invert-[0.95] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] md:p-12 lg:p-16"
                priority
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Background decorative elements */}
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-gradient-to-br from-primary/5 to-primary/10 blur-3xl dark:from-primary/10 dark:to-primary/20" />
      <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-gradient-to-bl from-primary/5 to-primary/10 blur-3xl dark:from-primary/10 dark:to-primary/20" />
      <div className="absolute left-1/2 top-1/3 h-64 w-64 -translate-x-1/2 rounded-full bg-gradient-to-tr from-primary/5 to-primary/10 blur-3xl dark:from-primary/10 dark:to-primary/20" />
      <div className="absolute right-1/4 bottom-1/4 h-48 w-48 rounded-full bg-gradient-to-tl from-primary/5 to-primary/10 blur-3xl dark:from-primary/10 dark:to-primary/20" />
    </section>
  )
}
