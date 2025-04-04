"use client"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Sample category data - in a real app, this would come from an API or database
const categories = [
  {
    name: "Pendant",
    slug: "pendant",
    subcategories: [
      { name: "Gold Pendants", slug: "gold-pendants" },
      { name: "Silver Pendants", slug: "silver-pendants" },
      { name: "Diamond Pendants", slug: "diamond-pendants" },
      { name: "Gemstone Pendants", slug: "gemstone-pendants" },
    ],
  },
  {
    name: "Earring",
    slug: "earring",
    subcategories: [
      { name: "Stud Earrings", slug: "stud-earrings" },
      { name: "Hoop Earrings", slug: "hoop-earrings" },
      { name: "Drop Earrings", slug: "drop-earrings" },
      { name: "Dangle Earrings", slug: "dangle-earrings" },
    ],
  },
  {
    name: "Necklace",
    slug: "necklace",
    subcategories: [
      { name: "Chain Necklaces", slug: "chain-necklaces" },
      { name: "Choker Necklaces", slug: "choker-necklaces" },
      { name: "Statement Necklaces", slug: "statement-necklaces" },
      { name: "Beaded Necklaces", slug: "beaded-necklaces" },
    ],
  },
  {
    name: "Ring",
    slug: "ring",
    subcategories: [
      { name: "Engagement Rings", slug: "engagement-rings" },
      { name: "Wedding Rings", slug: "wedding-rings" },
      { name: "Fashion Rings", slug: "fashion-rings" },
      { name: "Cocktail Rings", slug: "cocktail-rings" },
    ],
  },
  {
    name: "Bracelet",
    slug: "bracelet",
    subcategories: [
      { name: "Chain Bracelets", slug: "chain-bracelets" },
      { name: "Bangle Bracelets", slug: "bangle-bracelets" },
      { name: "Charm Bracelets", slug: "charm-bracelets" },
      { name: "Cuff Bracelets", slug: "cuff-bracelets" },
    ],
  },
  {
    name: "Anklet",
    slug: "anklet",
    subcategories: [
      { name: "Chain Anklets", slug: "chain-anklets" },
      { name: "Beaded Anklets", slug: "beaded-anklets" },
      { name: "Charm Anklets", slug: "charm-anklets" },
      { name: "Bangle Anklets", slug: "bangle-anklets" },
    ],
  },
  {
    name: "Bangle",
    slug: "bangle",
    subcategories: [
      { name: "Gold Bangles", slug: "gold-bangles" },
      { name: "Silver Bangles", slug: "silver-bangles" },
      { name: "Diamond Bangles", slug: "diamond-bangles" },
      { name: "Stackable Bangles", slug: "stackable-bangles" },
    ],
  },
  {
    name: "Garment Accessories",
    slug: "garment-accessories",
    subcategories: [
      { name: "Brooches", slug: "brooches" },
      { name: "Cufflinks", slug: "cufflinks" },
      { name: "Tie Pins", slug: "tie-pins" },
      { name: "Scarf Rings", slug: "scarf-rings" },
    ],
  },
  {
    name: "Watches",
    slug: "watches",
    subcategories: [
      { name: "Luxury Watches", slug: "luxury-watches" },
      { name: "Smart Watches", slug: "smart-watches" },
      { name: "Sports Watches", slug: "sports-watches" },
      { name: "Fashion Watches", slug: "fashion-watches" },
    ],
  },
]

export default function CategorySidebar() {
  return (
    <Sidebar variant="floating" collapsible="none">
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold">Product Categories</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {categories.map((category) => (
                <Collapsible key={category.slug} className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton>
                        {category.name}
                        <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-180" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {category.subcategories.map((subcategory) => (
                          <SidebarMenuSubItem key={subcategory.slug}>
                            <SidebarMenuSubButton asChild>
                              <Link href={`/shop?category=${category.slug}&subcategory=${subcategory.slug}`}>
                                {subcategory.name}
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}

