// Generate random products for demo purposes
export function generateProducts(count = 100) {
    const categories = [
      "Brakes",
      "Wheels",
      "Lighting",
      "Engine Parts",
      "Body Parts",
      "Interior",
      "Suspension",
      "Transmission",
      "Cooling System",
      "Exhaust System",
    ]

    // Define product data with specific images and price ranges
    const productTemplates = [
      {
        name: "Premium Brake Pads",
        category: "Brakes",
        image: "/products/default-product.svg",
        priceRange: [8000, 15000],
      },
      {
        name: "LED Headlight Kit",
        category: "Lighting",
        image: "/products/default-product.svg",
        priceRange: [15000, 25000],
      },
      {
        name: "Alloy Wheel Set",
        category: "Wheels",
        image: "/products/default-product.svg",
        priceRange: [70000, 100000],
      },
      {
        name: "High-Performance Oil Filter",
        category: "Engine Parts",
        image: "/products/default-product.svg",
        priceRange: [2000, 5000],
      },
      {
        name: "Leather Seat Covers",
        category: "Interior",
        image: "/products/default-product.svg",
        priceRange: [20000, 35000],
      },
      {
        name: "Performance Shock Absorber",
        category: "Suspension",
        image: "/products/default-product.svg",
        priceRange: [15000, 25000],
      },
      {
        name: "Premium Brake Rotors",
        category: "Brakes",
        image: "/products/default-product.svg",
        priceRange: [10000, 18000],
      },
      {
        name: "Sport Exhaust System",
        category: "Exhaust System",
        image: "/products/default-product.svg",
        priceRange: [40000, 60000],
      },
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
        description: `Premium quality ${template.name.toLowerCase()} designed for superior performance and durability. Features advanced technology and premium materials for optimal results. Compatible with a wide range of vehicle makes and models.`,
        features: [
          "Premium quality materials",
          "Enhanced durability",
          "Superior performance",
          "Easy installation",
        ],
        specs: {
          material: ["Aircraft-grade Aluminum", "High-strength Steel", "Premium Composite", "Carbon Fiber"][Math.floor(Math.random() * 4)],
          warranty: ["2 years", "3 years", "5 years", "Lifetime"][Math.floor(Math.random() * 4)],
        },
      })
    }
  
    return products
  }
  
  