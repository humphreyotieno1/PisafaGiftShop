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
    name: "Engine Parts",
    slug: "engine-parts",
    subcategories: [
      { name: "Pistons", slug: "pistons" },
      { name: "Valves", slug: "valves" },
      { name: "Gaskets", slug: "gaskets" },
      { name: "Timing Belts", slug: "timing-belts" },
    ],
  },
  {
    name: "Body Parts",
    slug: "body-parts",
    subcategories: [
      { name: "Bumpers", slug: "bumpers" },
      { name: "Doors", slug: "doors" },
      { name: "Mirrors", slug: "mirrors" },
      { name: "Hoods", slug: "hoods" },
    ],
  },
  {
    name: "Electrical",
    slug: "electrical",
    subcategories: [
      { name: "Batteries", slug: "batteries" },
      { name: "Alternators", slug: "alternators" },
      { name: "Starters", slug: "starters" },
      { name: "Sensors", slug: "sensors" },
    ],
  },
  {
    name: "Wheels & Tires",
    slug: "wheels-tires",
    subcategories: [
      { name: "Alloy Wheels", slug: "alloy-wheels" },
      { name: "Steel Wheels", slug: "steel-wheels" },
      { name: "Summer Tires", slug: "summer-tires" },
      { name: "Winter Tires", slug: "winter-tires" },
    ],
  },
  {
    name: "Frames",
    slug: "frames",
    subcategories: [
      { name: "Seats", slug: "seats" },
      { name: "Steering Wheels", slug: "steering-wheels" },
      { name: "Dashboard", slug: "dashboard" },
      { name: "Exhaust", slug: "exhaust" },
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
                              <Link href={`/shop/category/${category.slug}/${subcategory.slug}`}>
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

