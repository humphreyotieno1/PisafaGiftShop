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
    title: "How to Choose the Perfect Engagement Ring",
    content: `
      <p>Choosing an engagement ring is one of the most significant purchases you'll ever make. It's not just about the price tag; it's about finding a piece that perfectly represents your love and commitment. Here's a comprehensive guide to help you make the right choice.</p>

      <h2>Understanding the 4 Cs</h2>
      <p>The 4 Cs - Cut, Color, Clarity, and Carat - are the fundamental characteristics that determine a diamond's quality and value. Understanding these factors will help you make an informed decision.</p>

      <h3>1. Cut</h3>
      <p>The cut of a diamond refers to how well it has been shaped and faceted. A well-cut diamond will reflect light beautifully, creating that signature sparkle. The cut is often considered the most important of the 4 Cs because it directly affects the diamond's brilliance.</p>

      <h3>2. Color</h3>
      <p>Diamonds come in various colors, from completely colorless to slightly yellow. The most valuable diamonds are those that are completely colorless. However, some people prefer the warmth of slightly colored diamonds, which can be more affordable.</p>

      <h3>3. Clarity</h3>
      <p>Clarity refers to the presence of internal or external flaws in the diamond. While most diamonds have some imperfections, the fewer and smaller they are, the more valuable the diamond. Many inclusions are invisible to the naked eye.</p>

      <h3>4. Carat</h3>
      <p>Carat weight is often what people think of first when considering a diamond. While size is important, it's crucial to balance it with the other Cs to get the best value for your budget.</p>

      <h2>Choosing the Right Style</h2>
      <p>Beyond the technical aspects, the style of the ring should reflect your partner's personality and taste. Consider these popular styles:</p>

      <ul>
        <li><strong>Solitaire:</strong> A timeless classic featuring a single diamond</li>
        <li><strong>Halo:</strong> A center stone surrounded by smaller diamonds</li>
        <li><strong>Three-Stone:</strong> Symbolizing past, present, and future</li>
        <li><strong>Vintage:</strong> Inspired by different historical periods</li>
        <li><strong>Modern:</strong> Contemporary designs with clean lines</li>
      </ul>

      <h2>Setting a Budget</h2>
      <p>While there's a traditional guideline of spending two to three months' salary on an engagement ring, the most important thing is to choose a ring that fits your budget and your partner's expectations. Remember, the value of the ring is in the meaning behind it, not just its price tag.</p>

      <h2>Final Tips</h2>
      <ul>
        <li>Consider your partner's lifestyle and daily activities</li>
        <li>Pay attention to their existing jewelry preferences</li>
        <li>Don't be afraid to ask for help from a trusted jeweler</li>
        <li>Take your time and don't rush the decision</li>
      </ul>
    `,
    image: "/blog/engagement-ring.jpg",
    date: "2025-02-15",
    author: "Sarah Johnson",
    category: "Guides",
  },
  2: {
    id: 2,
    title: "Understanding Different Types of Gold Jewelry",
    content: `
      <p>Gold jewelry comes in various forms and purities, each with its own unique characteristics and benefits. Understanding these differences can help you make informed decisions when purchasing gold jewelry.</p>

      <h2>Gold Purity Levels</h2>
      <p>Gold purity is measured in karats (K), with 24K being pure gold. Here's a breakdown of common gold purities:</p>

      <ul>
        <li><strong>24K Gold:</strong> 99.9% pure gold, very soft and malleable</li>
        <li><strong>22K Gold:</strong> 91.7% pure gold, commonly used in traditional jewelry</li>
        <li><strong>18K Gold:</strong> 75% pure gold, popular for engagement rings and fine jewelry</li>
        <li><strong>14K Gold:</strong> 58.3% pure gold, durable and affordable</li>
        <li><strong>10K Gold:</strong> 41.7% pure gold, most durable and budget-friendly</li>
      </ul>

      <h2>Gold Colors</h2>
      <p>Gold can be alloyed with different metals to create various colors:</p>

      <ul>
        <li><strong>Yellow Gold:</strong> Classic gold color, alloyed with silver and copper</li>
        <li><strong>White Gold:</strong> Silver-colored, alloyed with nickel or palladium</li>
        <li><strong>Rose Gold:</strong> Pinkish hue, alloyed with copper</li>
        <li><strong>Green Gold:</strong> Subtle green tint, alloyed with silver</li>
      </ul>

      <h2>Choosing the Right Gold</h2>
      <p>When selecting gold jewelry, consider these factors:</p>

      <ul>
        <li>Your budget and desired purity level</li>
        <li>Skin tone and personal style</li>
        <li>Durability requirements for daily wear</li>
        <li>Allergy considerations (especially for white gold)</li>
      </ul>

      <h2>Gold Care and Maintenance</h2>
      <p>To keep your gold jewelry looking its best:</p>

      <ul>
        <li>Clean regularly with mild soap and warm water</li>
        <li>Store separately to prevent scratching</li>
        <li>Avoid exposure to harsh chemicals</li>
        <li>Have professional cleaning and inspection annually</li>
      </ul>
    `,
    image: "/blog/gold-types.jpg",
    date: "2025-02-10",
    author: "Michael Chen",
    category: "Education",
  },
  3: {
    id: 3,
    title: "Caring for Your Precious Jewelry",
    content: `
      <p>Proper care and maintenance are essential to keep your jewelry looking beautiful for years to come. Follow these expert tips to preserve your precious pieces.</p>

      <h2>Daily Care Tips</h2>
      <p>Simple habits to protect your jewelry:</p>

      <ul>
        <li>Remove jewelry before showering or swimming</li>
        <li>Put on jewelry after applying makeup and perfume</li>
        <li>Store pieces separately to prevent scratching</li>
        <li>Regularly inspect for loose stones or damage</li>
      </ul>

      <h2>Cleaning Different Types of Jewelry</h2>
      <p>Each type of jewelry requires specific cleaning methods:</p>

      <h3>Gold Jewelry</h3>
      <ul>
        <li>Use mild dish soap and warm water</li>
        <li>Gently scrub with a soft toothbrush</li>
        <li>Rinse thoroughly and dry with a soft cloth</li>
      </ul>

      <h3>Silver Jewelry</h3>
      <ul>
        <li>Use a silver polishing cloth for light tarnish</li>
        <li>For heavy tarnish, use a silver cleaning solution</li>
        <li>Store with anti-tarnish strips</li>
      </ul>

      <h3>Gemstone Jewelry</h3>
      <ul>
        <li>Clean with mild soap and water</li>
        <li>Avoid ultrasonic cleaners for delicate stones</li>
        <li>Check stone settings regularly</li>
      </ul>

      <h2>Storage Solutions</h2>
      <p>Proper storage is crucial for jewelry preservation:</p>

      <ul>
        <li>Use individual pouches or compartments</li>
        <li>Keep in a cool, dry place</li>
        <li>Use anti-tarnish strips for silver</li>
        <li>Consider a jewelry box with soft lining</li>
      </ul>

      <h2>Professional Maintenance</h2>
      <p>Regular professional care is essential:</p>

      <ul>
        <li>Annual inspection and cleaning</li>
        <li>Prong tightening for stone settings</li>
        <li>Professional polishing when needed</li>
        <li>Insurance appraisal updates</li>
      </ul>
    `,
    image: "/blog/jewelry-care.jpg",
    date: "2025-02-05",
    author: "Emily Davis",
    category: "Maintenance",
  },
  4: {
    id: 4,
    title: "The History of Gemstones in Jewelry",
    content: `
      <p>Gemstones have fascinated humans for millennia, serving as symbols of power, protection, and beauty. Let's explore their rich history in jewelry making.</p>

      <h2>Ancient Civilizations</h2>
      <p>Early uses of gemstones in jewelry:</p>

      <ul>
        <li><strong>Egyptians:</strong> Used lapis lazuli and turquoise in burial jewelry</li>
        <li><strong>Greeks:</strong> Valued amethyst for its protective properties</li>
        <li><strong>Romans:</strong> Popularized emeralds and sapphires in signet rings</li>
        <li><strong>Chinese:</strong> Used jade for ceremonial and decorative purposes</li>
      </ul>

      <h2>Middle Ages and Renaissance</h2>
      <p>Gemstones gained new significance:</p>

      <ul>
        <li>Religious symbolism in ecclesiastical jewelry</li>
        <li>Emergence of gemstone cutting techniques</li>
        <li>Rise of royal gem collections</li>
        <li>Development of trade routes for precious stones</li>
      </ul>

      <h2>Modern Era</h2>
      <p>Contemporary uses and innovations:</p>

      <ul>
        <li>Advancements in gemstone cutting and setting</li>
        <li>Discovery of new gem sources worldwide</li>
        <li>Development of synthetic gemstones</li>
        <li>Ethical sourcing and sustainability focus</li>
      </ul>

      <h2>Cultural Significance</h2>
      <p>Gemstones hold different meanings across cultures:</p>

      <ul>
        <li>Birthstones and their traditions</li>
        <li>Healing properties and spiritual beliefs</li>
        <li>Status symbols and wealth indicators</li>
        <li>Personal expression and style statements</li>
      </ul>
    `,
    image: "/blog/gemstones.jpg",
    date: "2025-01-30",
    author: "David Wilson",
    category: "History",
  },
  5: {
    id: 5,
    title: "Trending Jewelry Styles for 2025",
    content: `
      <p>Stay ahead of the fashion curve with our guide to the most popular jewelry trends for 2025. From bold statement pieces to delicate everyday wear, discover what's in style this year.</p>

      <h2>Top Trends for 2025</h2>
      <p>Key styles dominating the jewelry scene:</p>

      <ul>
        <li><strong>Mixed Metals:</strong> Combining gold, silver, and rose gold</li>
        <li><strong>Organic Shapes:</strong> Nature-inspired designs</li>
        <li><strong>Bold Colors:</strong> Vibrant gemstone combinations</li>
        <li><strong>Minimalist Stacking:</strong> Layered delicate pieces</li>
        <li><strong>Vintage Revival:</strong> Art Deco and Victorian influences</li>
      </ul>

      <h2>Popular Materials</h2>
      <p>Materials making waves in 2025:</p>

      <ul>
        <li>Sustainable and recycled metals</li>
        <li>Lab-grown diamonds and gemstones</li>
        <li>Alternative materials like wood and ceramic</li>
        <li>Textured finishes and matte surfaces</li>
      </ul>

      <h2>Statement Pieces</h2>
      <p>Bold jewelry making an impact:</p>

      <ul>
        <li>Oversized hoops and ear cuffs</li>
        <li>Chunky chain necklaces</li>
        <li>Stackable rings and bangles</li>
        <li>Geometric pendants</li>
      </ul>

      <h2>Everyday Essentials</h2>
      <p>Versatile pieces for daily wear:</p>

      <ul>
        <li>Delicate chain necklaces</li>
        <li>Simple stud earrings</li>
        <li>Thin stacking rings</li>
        <li>Minimalist bracelets</li>
      </ul>
    `,
    image: "/blog/trends.jpg",
    date: "2025-01-25",
    author: "Lisa Thompson",
    category: "Fashion",
  },
  6: {
    id: 6,
    title: "The Art of Jewelry Making",
    content: `
      <p>Discover the fascinating process behind creating beautiful jewelry pieces, from initial design to final product. This behind-the-scenes look reveals the skill and craftsmanship involved in jewelry making.</p>

      <h2>The Design Process</h2>
      <p>Creating a jewelry piece begins with design:</p>

      <ul>
        <li>Sketching initial concepts</li>
        <li>Creating detailed technical drawings</li>
        <li>Selecting materials and gemstones</li>
        <li>Developing prototypes</li>
      </ul>

      <h2>Traditional Techniques</h2>
      <p>Time-honored methods still used today:</p>

      <ul>
        <li><strong>Lost-Wax Casting:</strong> Creating detailed metal pieces</li>
        <li><strong>Hand Fabrication:</strong> Building pieces from raw materials</li>
        <li><strong>Stone Setting:</strong> Securing gemstones in place</li>
        <li><strong>Metal Forming:</strong> Shaping metal through hammering and bending</li>
      </ul>

      <h2>Modern Innovations</h2>
      <p>Contemporary techniques enhancing jewelry making:</p>

      <ul>
        <li>3D printing for prototyping</li>
        <li>CAD/CAM design software</li>
        <li>Laser cutting and welding</li>
        <li>Advanced stone cutting technology</li>
      </ul>

      <h2>Quality Control</h2>
      <p>Ensuring excellence in every piece:</p>

      <ul>
        <li>Material testing and verification</li>
        <li>Precision measurements</li>
        <li>Finishing and polishing</li>
        <li>Final inspection and certification</li>
      </ul>
    `,
    image: "/blog/jewelry-making.jpg",
    date: "2025-01-20",
    author: "James Rodriguez",
    category: "Craftsmanship",
  },
}

export default function BlogPostPage({ params }) {
  const post = blogPosts[params.id]

  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-4 pt-32 pb-12">
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
    <div className="mx-auto max-w-4xl px-4 pt-32 pb-12">
      <div className="mb-8">
        <Button asChild variant="ghost" className="mb-4">
          <Link href="/blog" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
          </div>

      <article className="prose prose-lg mx-auto">
        <div className="mb-8">
          <div className="relative aspect-video overflow-hidden rounded-lg">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{formatDistanceToNow(new Date(post.date), { addSuffix: true })}</span>
            <span>•</span>
            <span>{post.category}</span>
            <span>•</span>
            <span>By {post.author}</span>
          </div>
          <h1 className="mt-4 text-3xl font-bold md:text-4xl">{post.title}</h1>
        </div>

        <div
          className="prose prose-lg mx-auto"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
    </article>
    </div>
  )
}
