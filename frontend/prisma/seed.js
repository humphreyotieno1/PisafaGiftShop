const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const categories = [
  {
    name: "Necklaces",
    products: [
      {
        name: "Silver Pendant Necklace",
        description: "Elegant silver pendant necklace with intricate design, perfect for any occasion.",
        price: 89.99,
        image: "/images/products/silver-pendant.jpg",
        stock: 15,
        features: ["Sterling silver", "Adjustable chain", "Pendant size: 1.5 inches"],
        specs: [
          { name: "Material", value: "Sterling Silver" },
          { name: "Chain Length", value: "18 inches" },
          { name: "Clasp Type", value: "Lobster" }
        ],
        tags: ["silver", "pendant", "necklace", "elegant"]
      },
      {
        name: "Gold Chain Necklace",
        description: "Classic 14k gold chain necklace with a polished finish.",
        price: 149.99,
        image: "/images/products/gold-chain.jpg",
        stock: 0,
        features: ["14k gold", "Durable construction", "Classic design"],
        specs: [
          { name: "Material", value: "14k Gold" },
          { name: "Chain Length", value: "20 inches" },
          { name: "Chain Type", value: "Box Chain" }
        ],
        tags: ["gold", "chain", "necklace", "classic"]
      }
    ]
  },
  {
    name: "Earrings",
    products: [
      {
        name: "Gold Hoop Earrings",
        description: "Classic gold hoop earrings, 14k gold plated with a polished finish.",
        price: 49.99,
        image: "/images/products/gold-hoops.jpg",
        stock: 20,
        features: ["14k gold plated", "Lightweight", "Secure closure"],
        specs: [
          { name: "Material", value: "14k Gold Plated" },
          { name: "Diameter", value: "1.5 inches" },
          { name: "Closure Type", value: "Click-top" }
        ],
        tags: ["gold", "hoops", "earrings", "classic"]
      },
      {
        name: "Pearl Stud Earrings",
        description: "Timeless freshwater pearl stud earrings with sterling silver posts.",
        price: 79.99,
        image: "/images/products/pearl-studs.jpg",
        stock: 15,
        features: ["Genuine freshwater pearls", "Sterling silver posts", "Secure backs"],
        specs: [
          { name: "Pearl Type", value: "Freshwater" },
          { name: "Pearl Size", value: "7-8mm" },
          { name: "Post Material", value: "Sterling Silver" }
        ],
        tags: ["pearl", "studs", "earrings", "classic"]
      }
    ]
  },
  {
    name: "Rings",
    products: [
      {
        name: "Diamond Engagement Ring",
        description: "Stunning diamond engagement ring with a brilliant cut center stone.",
        price: 999.99,
        image: "/images/products/diamond-ring.jpg",
        stock: 5,
        features: ["Brilliant cut diamond", "14k white gold", "Comfort fit band"],
        specs: [
          { name: "Diamond Carat", value: "0.75ct" },
          { name: "Metal", value: "14k White Gold" },
          { name: "Ring Size", value: "Available 4-10" }
        ],
        tags: ["diamond", "engagement", "ring", "luxury"]
      },
      {
        name: "Gold Band Ring",
        description: "Classic 14k gold band ring with a polished finish.",
        price: 149.99,
        image: "/images/products/gold-band.jpg",
        stock: 0,
        features: ["14k gold", "Comfort fit", "Polished finish"],
        specs: [
          { name: "Material", value: "14k Gold" },
          { name: "Width", value: "4mm" },
          { name: "Style", value: "Comfort Fit" }
        ],
        tags: ["gold", "band", "ring", "classic"]
      }
    ]
  },
  {
    name: "Bracelets",
    products: [
      {
        name: "Pearl Bracelet",
        description: "Elegant pearl bracelet with sterling silver chain and clasp.",
        price: 79.99,
        image: "/images/products/pearl-bracelet.jpg",
        stock: 12,
        features: ["Freshwater pearls", "Sterling silver chain", "Adjustable length"],
        specs: [
          { name: "Pearl Type", value: "Freshwater" },
          { name: "Length", value: "6.5-7.5 inches" },
          { name: "Clasp", value: "Sterling Silver Lobster" }
        ],
        tags: ["pearl", "bracelet", "elegant", "adjustable"]
      },
      {
        name: "Diamond Tennis Bracelet",
        description: "Luxurious diamond tennis bracelet set in 14k white gold.",
        price: 799.99,
        image: "/images/products/diamond-tennis.jpg",
        stock: 1,
        features: ["Round brilliant diamonds", "14k white gold", "Secure clasp"],
        specs: [
          { name: "Total Carat Weight", value: "2.00ct" },
          { name: "Metal", value: "14k White Gold" },
          { name: "Length", value: "7 inches" }
        ],
        tags: ["diamond", "tennis bracelet", "luxury", "white gold"]
      }
    ]
  }
]

async function main() {
  try {
    // Delete existing products and categories
    await prisma.product.deleteMany()
    await prisma.category.deleteMany()
    console.log('Deleted existing data')

    // Create categories and their products
    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: {
          name: category.name
        }
      })

      // Create products for this category
      for (const product of category.products) {
        await prisma.product.create({
          data: {
            ...product,
            categoryName: createdCategory.name,
            inStock: product.stock > 0,
            specs: JSON.stringify(product.specs || [])
          }
        })
      }
    }

    console.log('Seeding completed successfully')
  } catch (error) {
    console.error('Error seeding database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
