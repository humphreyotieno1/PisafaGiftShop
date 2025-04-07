"use client"

import { useState } from "react"
import { ChevronDownIcon } from "@heroicons/react/24/outline"

export default function CategoryFilter({ categories = [], selectedCategory, onSelect }) {
  const [isOpen, setIsOpen] = useState(false)

  // Get unique subcategories
  const subcategories = [...new Set(categories.map(category => category.subcategory))].sort()

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
      >
        <span>{selectedCategory || "All Categories"}</span>
        <ChevronDownIcon className="w-5 h-5 ml-2 -mr-1" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg">
          <div className="py-1">
            <button
              onClick={() => {
                onSelect("")
                setIsOpen(false)
              }}
              className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
            >
              All Categories
            </button>
            {subcategories.map((subcategory) => (
              <button
                key={subcategory}
                onClick={() => {
                  onSelect(subcategory)
                  setIsOpen(false)
                }}
                className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
              >
                {subcategory}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 