"use client"

import Image from "next/image"
import { motion } from "framer-motion"

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 mt-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">About Pisafa Gift Shop</h1>
        <p className="mt-4 text-muted-foreground">Elegance | Quality | Craftsmanship</p>
      </div>

      <div className="grid gap-12 md:grid-cols-2 lg:gap-16">
        {/* Our Story Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-6"
        >
          <h2 className="text-2xl font-bold">Our Story</h2>
          <p className="text-muted-foreground">
            Pisafa Gift Shop is dedicated to bringing you exquisite jewelry pieces that blend traditional elegance with modern design. We believe that every piece of jewelry tells a story and should be as unique as the person wearing it.
          </p>
          <p className="text-muted-foreground">
            Our journey began with a passion for craftsmanship and a commitment to quality. We carefully select each piece, ensuring it meets our high standards of beauty, durability, and value. From classic designs to contemporary styles, our collection offers something special for every occasion.
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
            src="/store.jpg"
            alt="Pisafa Gifts Shop Store"
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
                title: "Quality Craftsmanship",
                description:
                  "Each piece is carefully crafted using premium materials and traditional techniques to ensure lasting beauty and durability.",
              },
              {
                title: "Expert Guidance",
                description:
                  "Our knowledgeable staff is here to help you find the perfect piece that matches your style and occasion.",
              },
              {
                title: "Fast Delivery",
                description:
                  "We offer reliable and secure shipping to ensure your jewelry arrives safely and on time.",
              },
              {
                title: "Affordable Luxury",
                description:
                  "We believe everyone deserves beautiful jewelry, offering high-quality pieces at accessible prices.",
              },
              {
                title: "Diverse Collection",
                description:
                  "From elegant rings to statement necklaces, our collection offers a wide range of styles for every taste.",
              },
              {
                title: "Customer Care",
                description:
                  "Your satisfaction is our priority, backed by our commitment to excellent service and support.",
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
