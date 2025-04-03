"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 mt-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">About Victoria Phantom Spares</h1>
        <p className="mt-4 text-muted-foreground">Ride Strong | Repair Fast | Stay Ahead</p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
        {/* Our Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-bold">About Us</h2>
          <p className="text-muted-foreground">
            Victoria Phantom Auto Spares Limited is committed to achieving operational excellece, fostering a positive workplace culture, and driving sustainable growth. To ensure effective governance and accountability.
          </p>
          <p className="text-muted-foreground">
            Over the years, we've built strong relationships with manufacturers and suppliers worldwide, enabling us to
            offer an extensive range of genuine and aftermarket parts for all major motorcycle brands.
          </p>
        </motion.div>

        {/* Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative aspect-video overflow-hidden rounded-lg"
        >
          <Image
            src="/office.jpg"
            alt="Victoria Phantom Spares Store"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </motion.div>

        {/* Why Choose Us Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col gap-6 md:col-span-2"
        >
          <h2 className="text-2xl font-bold">Why Choose Us</h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: "Quality Assurance",
                description:
                  "All our parts undergo rigorous quality checks to ensure they meet the highest standards of performance and durability.",
              },
              {
                title: "Expert Support",
                description:
                  "Our team of experienced professionals is always ready to help you find the right parts for your vehicle.",
              },
              {
                title: "Fast Shipping",
                description:
                  "We offer quick and reliable shipping services to get your parts delivered when you need them.",
              },
              {
                title: "Competitive Pricing",
                description:
                  "We work hard to offer the best prices without compromising on quality.",
              },
              {
                title: "Wide Selection",
                description:
                  "From engine components to body parts, we stock everything you need for your vehicle.",
              },
              {
                title: "Customer Satisfaction",
                description:
                  "Your satisfaction is our priority, backed by our hassle-free return policy.",
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                className="flex flex-col gap-2"
              >
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
