const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@pisafagiftsshop.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@pisafagiftsshop.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create sample customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      name: 'Sample Customer',
      email: 'customer@example.com',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  });

  // Create jewelry products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Diamond Solitaire Ring',
        description: 'Elegant solitaire ring featuring a brilliant-cut diamond in a classic setting.',
        price: 15000,
        image: '/products/rings/solitaire.jpg',
        category: 'Ring',
        subcategory: 'Engagement',
        features: ['18K Gold', 'Brilliant Cut Diamond', 'Classic Setting'],
        specs: {
          material: '18K Gold',
          stone: 'Diamond',
          carat: '0.5',
          color: 'D',
          clarity: 'VS1',
          warranty: '1 year'
        },
        stock: 5,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Pearl Drop Earrings',
        description: 'Timeless pearl drop earrings with sterling silver hooks.',
        price: 8000,
        image: '/products/earrings/pearl-drop.jpg',
        category: 'Earring',
        subcategory: 'Drop',
        features: ['Freshwater Pearls', 'Sterling Silver', 'French Hooks'],
        specs: {
          material: 'Sterling Silver',
          pearlSize: '8mm',
          pearlType: 'Freshwater',
          warranty: '6 months'
        },
        stock: 10,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gold Chain Necklace',
        description: 'Classic 18K gold chain necklace with a secure lobster clasp.',
        price: 12000,
        image: '/products/necklaces/gold-chain.jpg',
        category: 'Necklace',
        subcategory: 'Chain',
        features: ['18K Gold', 'Lobster Clasp', 'Adjustable Length'],
        specs: {
          material: '18K Gold',
          length: '18 inches',
          width: '2mm',
          warranty: '1 year'
        },
        stock: 8,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Silver Bangle Set',
        description: 'Set of three sterling silver bangles with intricate designs.',
        price: 6000,
        image: '/products/bangles/silver-set.jpg',
        category: 'Bangle',
        subcategory: 'Set',
        features: ['Sterling Silver', 'Three-Piece Set', 'Intricate Design'],
        specs: {
          material: 'Sterling Silver',
          size: 'Medium',
          weight: '30g',
          warranty: '6 months'
        },
        stock: 12,
      },
    }),
    prisma.product.create({
      data: {
        name: 'Gemstone Pendant',
        description: 'Beautiful pendant featuring a natural sapphire in a sterling silver setting.',
        price: 9000,
        image: '/products/pendants/sapphire.jpg',
        category: 'Pendant',
        subcategory: 'Gemstone',
        features: ['Natural Sapphire', 'Sterling Silver', 'Adjustable Chain'],
        specs: {
          material: 'Sterling Silver',
          stone: 'Sapphire',
          stoneSize: '6x4mm',
          chainLength: '18 inches',
          warranty: '1 year'
        },
        stock: 6,
      },
    }),
  ]);

  // Create sample reviews
  await Promise.all([
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[0].id,
        rating: 5,
        comment: 'Absolutely stunning ring! The diamond sparkles beautifully.',
      },
    }),
    prisma.review.create({
      data: {
        userId: customer.id,
        productId: products[1].id,
        rating: 4,
        comment: 'Lovely earrings, very elegant and comfortable to wear.',
      },
    }),
  ]);

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
