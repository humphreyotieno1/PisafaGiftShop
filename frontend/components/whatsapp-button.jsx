"use client"

import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export default function WhatsAppButton() {
  const handleClick = () => {
    window.open("https://wa.me/254712345678", "_blank")
  }

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <Button
        onClick={handleClick}
        className="h-14 w-14 rounded-full bg-green-500 p-0 text-white shadow-lg hover:bg-green-600"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="h-7 w-7" />
      </Button>
    </motion.div>
  )
}

