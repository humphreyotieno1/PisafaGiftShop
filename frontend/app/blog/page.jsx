"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import { formatDistanceToNow } from "date-fns"
import { Button } from "@/components/ui/button"

// Sample blog posts data - in a real app, this would come from an API or CMS
const blogPosts = [
  {
    id: 1,
    title: "Essential Car Maintenance Tips for Every Season",
    excerpt:
      "Learn how to keep your vehicle in top condition throughout the year with these maintenance tips for every season.",
    image: "/placeholder.svg",
    date: "2025-02-15",
    author: "John Smith",
    category: "Maintenance",
  },
  {
    id: 2,
    title: "Understanding Your Car's Brake System",
    excerpt:
      "A comprehensive guide to understanding how your car's brake system works and signs it needs maintenance.",
    image: "/placeholder.svg",
    date: "2025-02-10",
    author: "Sarah Johnson",
    category: "Education",
  },
  {
    id: 3,
    title: "The Future of Electric Vehicle Parts",
    excerpt:
      "Explore the latest trends and innovations in electric vehicle parts and what they mean for car owners.",
    image: "/placeholder.svg",
    date: "2025-02-05",
    author: "Mike Wilson",
    category: "Technology",
  },
  {
    id: 4,
    title: "How to Choose the Right Tires for Your Vehicle",
    excerpt:
      "A detailed guide to selecting the perfect tires based on your vehicle type, driving conditions, and needs.",
    image: "/placeholder.svg",
    date: "2025-01-30",
    author: "Emily Brown",
    category: "Guides",
  },
  {
    id: 5,
    title: "Common Engine Problems and Their Solutions",
    excerpt:
      "Learn about frequent engine issues, their symptoms, and how to address them before they become major problems.",
    image: "/placeholder.svg",
    date: "2025-01-25",
    author: "David Lee",
    category: "Troubleshooting",
  },
  {
    id: 6,
    title: "The Impact of Regular Oil Changes",
    excerpt:
      "Discover why regular oil changes are crucial for your engine's longevity and overall vehicle performance.",
    image: "/placeholder.svg",
    date: "2025-01-20",
    author: "Lisa Chen",
    category: "Maintenance",
  },
]

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 mt-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Our Blog</h1>
        <p className="mt-4 text-muted-foreground">
          Stay updated with the latest automotive news, maintenance tips, and industry insights
        </p>
      </div>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post, index) => (
          <motion.article
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="group flex flex-col gap-4"
          >
            <Link href={`/blog/${post.id}`} className="overflow-hidden rounded-lg">
              <div className="relative aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>
            </Link>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</span>
                <span>•</span>
                <span>{post.category}</span>
              </div>
              <h2 className="line-clamp-2 text-xl font-semibold group-hover:text-primary">
                <Link href={`/blog/${post.id}`}>{post.title}</Link>
              </h2>
              <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
              <div className="mt-2">
                <Button asChild variant="link" className="h-auto p-0">
                  <Link href={`/blog/${post.id}`}>Read More →</Link>
                </Button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </div>
  )
}
