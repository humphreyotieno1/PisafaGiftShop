"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { adminApi } from "@/lib/api"
import { useAuthContext } from "@/contexts/AuthContext"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EditCategoryPage({ params }: { params: { id: string } }) {
  const { id } = params
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuthContext()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: ''
  })

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/')
      return
    }
    fetchCategory()
  }, [user, id, router])

  const fetchCategory = async () => {
    try {
      setLoading(true)
      const categories = await adminApi.getCategories()
      const category = categories.find(cat => cat.id === parseInt(id))
      if (!category) {
        toast({ title: 'Error', description: 'Category not found', variant: 'destructive' })
        router.push('/admin/categories')
        return
      }
      setFormData({
        name: category.name,
        description: category.description || '',
        image_url: category.image_url || ''
      })
    } catch (error) {
      console.error('Error fetching category:', error)
      toast({ title: 'Error', description: 'Failed to load category', variant: 'destructive' })
      router.push('/admin/categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      setSaving(true)
      
      await adminApi.updateCategory(parseInt(id), { 
        name: formData.name, 
        description: formData.description || undefined, 
        image_url: formData.image_url || undefined 
      })
      toast({ title: 'Category Updated', description: 'The category has been successfully updated.' })
      
      router.push('/admin/categories')
    } catch (error) {
      console.error('Error updating category:', error)
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the category.'
      toast({ title: 'Error', description: errorMessage, variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (!user || user.role !== 'admin') {
    return null
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="icon">
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to categories</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Category</h1>
            <p className="text-muted-foreground">Update the category details</p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
          <CardDescription>Update the details for this category</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter category name"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input 
                  id="description" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="Enter description" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  name="image_url" 
                  value={formData.image_url} 
                  onChange={handleInputChange} 
                  placeholder="https://..." 
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/admin/categories')}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? 'Updating...' : 'Update Category'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
