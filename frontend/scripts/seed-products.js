import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const sampleProducts = [
  {
    name: "Handmade Wooden Bowl",
    description: "Beautiful handcrafted wooden bowl made from sustainable materials.",
    price: 45.99,
    image: "/images/products/wooden-bowl.jpg",
    stock: 10,
    category: {
      name: "Home Decor",
      subcategory: "Kitchenware"
    }
  },
  {
    name: "Artisan Ceramic Mug",
    description: "Unique ceramic mug with hand-painted design, perfect for your morning coffee.",
    price: 25.99,
    image: "/images/products/ceramic-mug.jpg",
    stock: 15,
    category: {
      name: "Home Decor",
      subcategory: "Kitchenware"
    }
  },
  {
    name: "Handwoven Basket",
    description: "Traditional handwoven basket made from natural materials.",
    price: 35.99,
    image: "/images/products/basket.jpg",
    stock: 8,
    category: {
      name: "Home Decor",
      subcategory: "Storage"
    }
  },
  {
    name: "Batik Scarf",
    description: "Colorful batik scarf made using traditional techniques.",
    price: 29.99,
    image: "/images/products/batik-scarf.jpg",
    stock: 12,
    category: {
      name: "Fashion",
      subcategory: "Accessories"
    }
  },
  {
    name: "Leather Wallet",
    description: "Handcrafted leather wallet with multiple compartments.",
    price: 39.99,
    image: "/images/products/leather-wallet.jpg",
    stock: 6,
    category: {
      name: "Fashion",
      subcategory: "Accessories"
    }
  },
  {
    name: "Wooden Jewelry Box",
    description: "Elegant wooden jewelry box with velvet lining.",
    price: 49.99,
    image: "/images/products/jewelry-box.jpg",
    stock: 5,
    category: {
      name: "Home Decor",
      subcategory: "Storage"
    }
  }
]

async function main() {
  try {
    // Create categories first
    const categories = {}
    for (const product of sampleProducts) {
      if (!categories[product.category.name]) {
        const category = await prisma.category.upsert({
          where: { name: product.category.name },
          update: {},
          create: {
            name: product.category.name,
            subcategory: product.category.subcategory
          }
        })
        categories[product.category.name] = category
      }
    }

    // Create products
    for (const product of sampleProducts) {
      await prisma.product.upsert({
        where: { name: product.name },
        update: {},
        create: {
          name: product.name,
          description: product.description,
          price: product.price,
          image: product.image,
          stock: product.stock,
          category: {
            connect: {
              name: product.category.name
            }
          }
        }
      })
    }

    console.log('Successfully seeded database with sample products')
  } catch (error) {
    console.error('Error seeding database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 