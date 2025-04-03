"use server"

import { NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { verifyAuth } from "@/lib/auth"

export async function POST(request) {
  try {
    // Verify admin authentication
    const { user, error } = await verifyAuth(request)
    
    if (error || user?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      )
    }

    const data = await request.formData()
    const file = data.get("file")

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      )
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 5MB limit" },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPEG, PNG, and WebP images are allowed" },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.toLowerCase()
    const extension = originalName.split(".").pop()
    const filename = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`
    
    // Save file to public/uploads directory
    const uploadDir = join(process.cwd(), "public", "uploads")
    
    try {
      // Create uploads directory if it doesn't exist
      await mkdir(uploadDir, { recursive: true })
      
      const filepath = join(uploadDir, filename)
      await writeFile(filepath, buffer)
    } catch (error) {
      console.error("Error saving file:", error)
      return NextResponse.json(
        { error: "Failed to save file" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      message: "File uploaded successfully" 
    })
  } catch (error) {
    console.error("Error uploading file:", error)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    )
  }
}
