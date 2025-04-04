// Generate random products for demo purposes
export function generateProducts(count = 100) {
    const categories = [
      "Pendant",
      "Earring",
      "Necklace",
      "Ring",
      "Bracelet",
      "Anklet",
      "Bangle",
      "Garment Accessories",
      "Watches"
    ]

    // Define product data with specific images and price ranges
    const productTemplates = [
      {
        name: "Diamond Solitaire Ring",
        category: "Ring",
        image: "/products/default-product.svg",
        priceRange: [8000, 20000],
      },
      {
        name: "Pearl Drop Earrings",
        category: "Earring",
        image: "/products/default-product.svg",
        priceRange: [5000, 15000],
      },
      {
        name: "Gold Chain Necklace",
        category: "Necklace",
        image: "/products/default-product.svg",
        priceRange: [6000, 18000],
      },
      {
        name: "Silver Bangle Set",
        category: "Bangle",
        image: "/products/default-product.svg",
        priceRange: [4000, 12000],
      },
      {
        name: "Gemstone Pendant",
        category: "Pendant",
        image: "/products/default-product.svg",
        priceRange: [3000, 10000],
      },
      {
        name: "Diamond Tennis Bracelet",
        category: "Bracelet",
        image: "/products/default-product.svg",
        priceRange: [7000, 20000],
      },
      {
        name: "Gold Anklet",
        category: "Anklet",
        image: "/products/default-product.svg",
        priceRange: [3000, 8000],
      },
      {
        name: "Luxury Watch",
        category: "Watches",
        image: "/products/default-product.svg",
        priceRange: [10000, 20000],
      },
      {
        name: "Crystal Brooch",
        category: "Garment Accessories",
        image: "/products/default-product.svg",
        priceRange: [1000, 5000],
      }
    ]

    const products = []

    for (let i = 1; i <= count; i++) {
      const template = productTemplates[Math.floor(Math.random() * productTemplates.length)]
      const price = Math.floor(
        Math.random() * (template.priceRange[1] - template.priceRange[0]) + template.priceRange[0]
      )
      const rating = Number.parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)) // Rating between 3.5 and 5.0

      products.push({
        id: i,
        name: `${template.name} ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) || ""}`, // A, B, C, ... AA, AB, etc.
        price,
        image: template.image,
        category: template.category,
        rating,
        inStock: true, // Ensure all products are in stock
        description: `Exquisite ${template.name.toLowerCase()} crafted with premium materials. Features elegant design and superior craftsmanship. Perfect for special occasions and everyday wear.`,
        features: [
          "Premium quality materials",
          "Handcrafted design",
          "Elegant finish",
          "Comfortable wear",
          "Durable construction"
        ],
        specs: {
          material: ["18K Gold", "925 Silver", "Platinum", "Rose Gold"][Math.floor(Math.random() * 4)],
          gemstone: ["Diamond", "Ruby", "Sapphire", "Emerald", "Pearl"][Math.floor(Math.random() * 5)],
          warranty: ["1 year", "2 years", "Lifetime"][Math.floor(Math.random() * 3)],
        },
      })
    }
  
    return products
  }
  
  