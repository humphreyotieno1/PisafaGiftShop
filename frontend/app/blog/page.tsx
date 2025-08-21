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
    title: "How to Choose the Perfect Engagement Ring",
    excerpt:
      "Discover the essential factors to consider when selecting an engagement ring that perfectly matches your partner's style and personality.",
    image: "/blog/engagement-ring.jpg",
    date: "2025-02-15",
    author: "Sarah Johnson",
    category: "Guides",
  },
  {
    id: 2,
    title: "Understanding Different Types of Gold Jewelry",
    excerpt:
      "Learn about the various types of gold used in jewelry making, from 24K to 14K, and how to choose the right one for your needs.",
    image: "/blog/gold-types.jpg",
    date: "2025-02-10",
    author: "Michael Chen",
    category: "Education",
  },
  {
    id: 3,
    title: "Caring for Your Precious Jewelry",
    excerpt:
      "Essential tips and tricks for maintaining the beauty and longevity of your jewelry collection, from cleaning to proper storage.",
    image: "/blog/jewelry-care.jpg",
    date: "2025-02-05",
    author: "Emily Davis",
    category: "Maintenance",
  },
  {
    id: 4,
    title: "The History of Gemstones in Jewelry",
    excerpt:
      "Explore the fascinating history of gemstones and their significance in jewelry making throughout different cultures and eras.",
    image: "/blog/gemstones.jpg",
    date: "2025-01-30",
    author: "David Wilson",
    category: "History",
  },
  {
    id: 5,
    title: "Trending Jewelry Styles for 2025",
    excerpt:
      "Stay ahead of the fashion curve with our guide to the most popular jewelry trends and styles for the upcoming year.",
    image: "/blog/trends.jpg",
    date: "2025-01-25",
    author: "Lisa Thompson",
    category: "Fashion",
  },
  {
    id: 6,
    title: "The Art of Jewelry Making",
    excerpt:
      "A behind-the-scenes look at the intricate process of creating beautiful jewelry pieces, from design to final product.",
    image: "/blog/jewelry-making.jpg",
    date: "2025-01-20",
    author: "James Rodriguez",
    category: "Craftsmanship",
  },
]

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 mt-20">
      <div className="mb-12 text-center">
        <h1 className="text-3xl font-bold md:text-4xl">Our Blog</h1>
        <p className="mt-4 text-muted-foreground">
          Discover the latest trends, expert tips, and fascinating stories from the world of jewelry
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
