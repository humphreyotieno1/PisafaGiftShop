"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

// Sample blog posts data - in a real app, this would come from an API or CMS
const blogPosts = {
  1: {
    id: 1,
    title: "Essential Car Maintenance Tips for Every Season",
    content: `
      Regular car maintenance is crucial for keeping your vehicle running smoothly throughout the year. Each season brings its own set of challenges, and being prepared can help prevent costly repairs down the line.

      ## Winter Maintenance
      - Check your battery
      - Inspect tire tread and pressure
      - Test your heater and defroster
      - Check antifreeze levels
      - Replace wiper blades if needed

      ## Spring Maintenance
      - Check brake system
      - Rotate tires
      - Check alignment
      - Clean undercarriage
      - Check air conditioning

      ## Summer Maintenance
      - Check coolant levels
      - Inspect belts and hoses
      - Check air conditioning
      - Test battery
      - Check oil and filter

      ## Fall Maintenance
      - Check heater and defroster
      - Inspect exhaust system
      - Check all lights
      - Test battery
      - Check windshield wipers

      Remember, these are general guidelines. Always consult your vehicle's owner manual for specific maintenance schedules and requirements.
    `,
    image: "/placeholder.svg",
    date: "2025-02-15",
    author: "John Smith",
    category: "Maintenance",
    relatedPosts: [2, 3, 4],
  },
  2: {
    id: 2,
    title: "Understanding Your Car's Brake System",
    content: `
      Your car's brake system is one of its most critical safety features. Understanding how it works and recognizing signs of wear can help you maintain optimal braking performance.

      ## Components of a Brake System
      1. Brake Pads
      2. Brake Rotors
      3. Brake Calipers
      4. Brake Lines
      5. Master Cylinder

      ## Common Signs of Brake Problems
      - Squealing or squeaking noises
      - Grinding sounds
      - Vibration in the brake pedal
      - Soft or spongy brake pedal
      - Car pulling to one side when braking

      ## Maintenance Tips
      - Regular brake inspections
      - Replace brake fluid as recommended
      - Don't ignore warning signs
      - Use quality replacement parts

      Remember, if you notice any unusual sounds or behavior from your brakes, have them inspected by a professional immediately.
    `,
    image: "/placeholder.svg",
    date: "2025-02-10",
    author: "Sarah Johnson",
    category: "Education",
    relatedPosts: [1, 5, 6],
  },
}

export default function BlogPost({ params }) {
  const post = blogPosts[params.id]

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Blog Post Not Found</h1>
          <p className="mt-2 text-muted-foreground">The requested blog post could not be found.</p>
          <Button asChild className="mt-4">
            <Link href="/blog">Back to Blog</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Back Button */}
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <header className="mb-8">
          <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
            <time dateTime={post.date}>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</time>
            <span>•</span>
            <span>{post.category}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight">{post.title}</h1>
        </header>

        {/* Featured Image */}
        <div className="relative mb-8 aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="prose prose-lg prose-slate max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-p:text-muted-foreground prose-li:text-muted-foreground prose-strong:text-foreground/80 prose-a:text-primary">
          {post.content.split("\n").map((paragraph, index) => {
            if (paragraph.startsWith("##")) {
              return (
                <h2 key={index}>
                  {paragraph.replace("##", "").trim()}
                </h2>
              )
            }
            if (paragraph.startsWith("-")) {
              return (
                <ul key={index}>
                  <li>{paragraph.replace("-", "").trim()}</li>
                </ul>
              )
            }
            if (paragraph.match(/^\d\./)) {
              return (
                <ol key={index}>
                  <li>{paragraph.replace(/^\d\./, "").trim()}</li>
                </ol>
              )
            }
            return paragraph.trim() ? <p key={index}>{paragraph}</p> : null
          }).filter(Boolean)}
        </div>
      </motion.div>
    </article>
  )
}
