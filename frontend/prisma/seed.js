const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const sampleProducts = [
  // Necklaces
  {
    name: "Silver Pendant Necklace",
    description: "Elegant silver pendant necklace with intricate design, perfect for any occasion.",
    price: 89.99,
    image: "/images/products/silver-pendant.jpg",
    stock: 15,
    categoryName: "Jewelry",
    subcategory: "Necklaces"
  },
  {
    name: "Gold Chain Necklace",
    description: "Classic 14k gold chain necklace with a polished finish.",
    price: 149.99,
    image: "/images/products/gold-chain.jpg",
    stock: 0,
    categoryName: "Jewelry",
    subcategory: "Necklaces"
  },
  {
    name: "Pearl Strand Necklace",
    description: "Luxurious freshwater pearl strand necklace with sterling silver clasp.",
    price: 199.99,
    image: "/images/products/pearl-strand.jpg",
    stock: 8,
    categoryName: "Jewelry",
    subcategory: "Necklaces"
  },
  {
    name: "Diamond Pendant Necklace",
    description: "Stunning diamond pendant necklace set in 14k white gold.",
    price: 499.99,
    image: "/images/products/diamond-pendant.jpg",
    stock: 3,
    categoryName: "Jewelry",
    subcategory: "Necklaces"
  },
  {
    name: "Charm Necklace",
    description: "Personalized charm necklace with multiple sterling silver charms.",
    price: 79.99,
    image: "/images/products/charm-necklace.jpg",
    stock: 12,
    categoryName: "Jewelry",
    subcategory: "Necklaces"
  },

  // Earrings
  {
    name: "Gold Hoop Earrings",
    description: "Classic gold hoop earrings, 14k gold plated with a polished finish.",
    price: 49.99,
    image: "/images/products/gold-hoops.jpg",
    stock: 20,
    categoryName: "Jewelry",
    subcategory: "Earrings"
  },
  {
    name: "Sapphire Stud Earrings",
    description: "Beautiful sapphire stud earrings set in 14k white gold.",
    price: 129.99,
    image: "/images/products/sapphire-studs.jpg",
    stock: 6,
    categoryName: "Jewelry",
    subcategory: "Earrings"
  },
  {
    name: "Pearl Drop Earrings",
    description: "Timeless pearl drop earrings with sterling silver hooks.",
    price: 79.99,
    image: "/images/products/pearl-drop.jpg",
    stock: 0,
    categoryName: "Jewelry",
    subcategory: "Earrings"
  },
  {
    name: "Diamond Stud Earrings",
    description: "Brilliant cut diamond stud earrings in 14k white gold.",
    price: 299.99,
    image: "/images/products/diamond-studs.jpg",
    stock: 4,
    categoryName: "Jewelry",
    subcategory: "Earrings"
  },
  {
    name: "Silver Hoop Earrings",
    description: "Versatile sterling silver hoop earrings with a polished finish.",
    price: 39.99,
    image: "/images/products/silver-hoops.jpg",
    stock: 25,
    categoryName: "Jewelry",
    subcategory: "Earrings"
  },

  // Rings
  {
    name: "Diamond Engagement Ring",
    description: "Stunning diamond engagement ring with a brilliant cut center stone.",
    price: 999.99,
    image: "/images/products/diamond-ring.jpg",
    stock: 5,
    categoryName: "Jewelry",
    subcategory: "Rings"
  },
  {
    name: "Gold Band Ring",
    description: "Classic 14k gold band ring with a polished finish.",
    price: 149.99,
    image: "/images/products/gold-band.jpg",
    stock: 0,
    categoryName: "Jewelry",
    subcategory: "Rings"
  },
  {
    name: "Sapphire Ring",
    description: "Elegant sapphire ring set in 14k white gold with diamond accents.",
    price: 399.99,
    image: "/images/products/sapphire-ring.jpg",
    stock: 2,
    categoryName: "Jewelry",
    subcategory: "Rings"
  },
  {
    name: "Silver Stacking Ring",
    description: "Delicate sterling silver stacking ring with a polished finish.",
    price: 29.99,
    image: "/images/products/silver-stack.jpg",
    stock: 30,
    categoryName: "Jewelry",
    subcategory: "Rings"
  },
  {
    name: "Pearl Ring",
    description: "Elegant pearl ring set in sterling silver with a polished finish.",
    price: 89.99,
    image: "/images/products/pearl-ring.jpg",
    stock: 7,
    categoryName: "Jewelry",
    subcategory: "Rings"
  },

  // Bracelets
  {
    name: "Pearl Bracelet",
    description: "Elegant pearl bracelet with sterling silver chain and clasp.",
    price: 79.99,
    image: "/images/products/pearl-bracelet.jpg",
    stock: 12,
    categoryName: "Jewelry",
    subcategory: "Bracelets"
  },
  {
    name: "Gold Chain Bracelet",
    description: "Classic 14k gold chain bracelet with a polished finish.",
    price: 129.99,
    image: "/images/products/gold-chain-bracelet.jpg",
    stock: 0,
    categoryName: "Jewelry",
    subcategory: "Bracelets"
  },
  {
    name: "Silver Charm Bracelet",
    description: "Personalized sterling silver charm bracelet with multiple charms.",
    price: 69.99,
    image: "/images/products/charm-bracelet.jpg",
    stock: 15,
    categoryName: "Jewelry",
    subcategory: "Bracelets"
  },
  {
    name: "Diamond Tennis Bracelet",
    description: "Luxurious diamond tennis bracelet set in 14k white gold.",
    price: 799.99,
    image: "/images/products/diamond-tennis.jpg",
    stock: 1,
    categoryName: "Jewelry",
    subcategory: "Bracelets"
  },
  {
    name: "Beaded Bracelet",
    description: "Handcrafted beaded bracelet with sterling silver accents.",
    price: 49.99,
    image: "/images/products/beaded-bracelet.jpg",
    stock: 20,
    categoryName: "Jewelry",
    subcategory: "Bracelets"
  },

  // Anklets
  {
    name: "Rose Gold Anklet",
    description: "Delicate rose gold anklet with small charms and adjustable chain.",
    price: 59.99,
    image: "/images/products/rose-gold-anklet.jpg",
    stock: 8,
    categoryName: "Jewelry",
    subcategory: "Anklets"
  },
  {
    name: "Silver Anklet",
    description: "Elegant sterling silver anklet with a polished finish.",
    price: 39.99,
    image: "/images/products/silver-anklet.jpg",
    stock: 0,
    categoryName: "Jewelry",
    subcategory: "Anklets"
  },
  {
    name: "Gold Anklet",
    description: "Classic 14k gold anklet with a polished finish.",
    price: 99.99,
    image: "/images/products/gold-anklet.jpg",
    stock: 5,
    categoryName: "Jewelry",
    subcategory: "Anklets"
  },
  {
    name: "Pearl Anklet",
    description: "Delicate pearl anklet with sterling silver chain.",
    price: 69.99,
    image: "/images/products/pearl-anklet.jpg",
    stock: 3,
    categoryName: "Jewelry",
    subcategory: "Anklets"
  },
  {
    name: "Charm Anklet",
    description: "Personalized charm anklet with sterling silver charms.",
    price: 49.99,
    image: "/images/products/charm-anklet.jpg",
    stock: 10,
    categoryName: "Jewelry",
    subcategory: "Anklets"
  }
]

async function main() {
  try {
    // Delete existing products and categories
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    console.log('Deleted existing data')

    // Create a single Jewelry category
    const jewelryCategory = await prisma.category.create({
      data: {
        name: 'Jewelry',
        subcategory: 'All'
      }
    })
    console.log('Created category')

    // Create products
    for (const product of sampleProducts) {
      await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          categoryName: product.categoryName,
          subcategory: product.subcategory,
          stock: product.stock
        }
      })
    }
    console.log('Created products')

    console.log('Database seeded successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
