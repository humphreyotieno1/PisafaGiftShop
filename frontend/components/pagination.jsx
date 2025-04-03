"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const pages = []

  // Always show first page, last page, current page, and one page before and after current
  const showFirst = 1
  const showLast = totalPages
  const showCurrent = currentPage
  const showPrev = currentPage > 1 ? currentPage - 1 : null
  const showNext = currentPage < totalPages ? currentPage + 1 : null

  // Add pages to array
  if (showFirst) pages.push(showFirst)
  if (showPrev && showPrev !== showFirst) {
    if (showPrev > showFirst + 1) pages.push("...")
    pages.push(showPrev)
  }
  if (showCurrent !== showFirst && showCurrent !== showLast) pages.push(showCurrent)
  if (showNext && showNext !== showLast) {
    pages.push(showNext)
    if (showNext < showLast - 1) pages.push("...")
  }
  if (showLast && showLast !== showFirst) pages.push(showLast)

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((page, index) =>
        page === "..." ? (
          <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            onClick={() => onPageChange(page)}
            aria-label={`Page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

