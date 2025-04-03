const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const adminExists = await prisma.user.findUnique({
    where: { email: 'admin@victoria.com' },
  });

  if (!adminExists) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await prisma.user.create({
      data: {
        email: 'admin@victoria.com',
        name: 'Admin User',
        password: hashedPassword,
        role: 'ADMIN',
      },
    });
    console.log('Admin user created');
  } else {
    console.log('Admin user already exists');
  }

  // Create categories
  const categories = [
    { name: 'Engines', slug: 'engines', description: 'Motorcycle engine parts and components' },
    { name: 'Brakes', slug: 'brakes', description: 'Brake systems and components' },
    { name: 'Transmission', slug: 'transmission', description: 'Transmission and drivetrain parts' },
    { name: 'Electrical', slug: 'electrical', description: 'Electrical components and systems' },
    { name: 'Body Parts', slug: 'body-parts', description: 'Motorcycle body and frame components' },
  ];

  for (const category of categories) {
    const exists = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!exists) {
      await prisma.category.create({
        data: category,
      });
      console.log(`Category ${category.name} created`);
    } else {
      console.log(`Category ${category.name} already exists`);
    }
  }

  // Create products
  const products = [
    {
      name: 'Motorcycle Engine Oil Filter',
      slug: 'motorcycle-engine-oil-filter',
      description: 'High-quality oil filter for optimal engine performance',
      price: 1200,
      image: '/images/products/oil-filter.jpg',
      stock: 50,
      categorySlug: 'engines',
    },
    {
      name: 'Brake Pads Set',
      slug: 'brake-pads-set',
      description: 'Durable brake pads for reliable stopping power',
      price: 2500,
      image: '/images/products/brake-pads.jpg',
      stock: 30,
      categorySlug: 'brakes',
    },
    {
      name: 'Motorcycle Chain Kit',
      slug: 'motorcycle-chain-kit',
      description: 'Complete chain kit with sprockets for smooth power transmission',
      price: 3500,
      image: '/images/products/chain-kit.jpg',
      stock: 25,
      categorySlug: 'transmission',
    },
    {
      name: 'LED Headlight Assembly',
      slug: 'led-headlight-assembly',
      description: 'Bright LED headlight for improved visibility',
      price: 4500,
      image: '/images/products/headlight.jpg',
      stock: 20,
      categorySlug: 'electrical',
    },
    {
      name: 'Motorcycle Fairing Kit',
      slug: 'motorcycle-fairing-kit',
      description: 'Complete fairing kit for motorcycle body protection',
      price: 15000,
      image: '/images/products/fairing-kit.jpg',
      stock: 10,
      categorySlug: 'body-parts',
    },
  ];

  for (const product of products) {
    const { categorySlug, ...productData } = product;
    
    const category = await prisma.category.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      console.log(`Category with slug ${categorySlug} not found, skipping product ${product.name}`);
      continue;
    }

    const exists = await prisma.product.findUnique({
      where: { slug: product.slug },
    });

    if (!exists) {
      await prisma.product.create({
        data: {
          ...productData,
          inStock: productData.stock > 0,
          category: {
            connect: { id: category.id },
          },
        },
      });
      console.log(`Product ${product.name} created`);
    } else {
      console.log(`Product ${product.name} already exists`);
    }
  }

  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
