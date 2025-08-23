"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { adminApi } from "@/lib/api";
import type { Category } from "@/types/api";


export default function AdminCategoriesPage() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");


  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    (async () => {
      try {
        setLoading(true);
        const data = await adminApi.getCategories();
        setCategories(data);
      } catch (err) {
        toast({ title: 'Error', description: err instanceof Error ? err.message : 'Failed to load categories', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    })();
  }, [user, toast]);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Button onClick={() => router.push("/admin/categories/new")}>
          Add New Category
        </Button>
      </div>

      <div className="mb-6">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-md bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {category.name}
                  <Badge variant="secondary" className="ml-2">
                    {(category.products?.length ?? 0)} products
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {category.description || "No description available"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/categories/${category.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/products?category=${category.id}`)}
                  >
                    View Products
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={async () => {
                      if (confirm('Are you sure you want to delete this category? This action cannot be undone.')) {
                        try {
                          await adminApi.deleteCategory(category.id)
                          setCategories(categories.filter(c => c.id !== category.id))
                          toast({ title: 'Category deleted' })
                        } catch (e) {
                          toast({ title: 'Error', description: 'Failed to delete category', variant: 'destructive' })
                        }
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!loading && filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? "No categories found matching your search." : "No categories available."}
        </div>
      )}

    </div>
  );
}