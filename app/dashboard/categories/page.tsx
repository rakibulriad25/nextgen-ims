'use client'

import { ImageUpload } from '@/components/image-upload'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/lib/actions/category'
import { categorySchema } from '@/lib/validations'
import { zodResolver } from '@hookform/resolvers/zod'
import { Edit, FolderIcon, Plus, Sparkles, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import type { z } from 'zod'

type CategoryForm = z.infer<typeof categorySchema>

export default function CategoriesPage() {
  const [categories, setCategories] = useState<
    { _id: string; name: string; description: string; iconUrl?: string }[]
  >([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<{
    _id: string
    name: string
    description: string
    iconUrl?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([])
  const [aiLoading, setAiLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  })

  const loadCategories = async () => {
    setLoading(true)
    const data = await getCategories()
    setCategories(data)
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const result = await deleteCategory(id)
      if (result.success) {
        toast.success('Category deleted successfully')
        loadCategories()
      } else {
        toast.error(result.error)
      }
    }
  }

  const handleEdit = (category: { _id: string; name: string; description: string }) => {
    setSelectedCategory(category)
    reset(category)
    setIsDialogOpen(true)
  }

  const handleAdd = () => {
    setSelectedCategory(null)
    reset({ name: '', description: '' })
    setIsDialogOpen(true)
    fetchAiSuggestions()
  }

  const fetchAiSuggestions = async () => {
    setAiLoading(true)
    try {
      const existingNames = categories.map((c) => c.name)
      const response = await fetch('/api/ai/suggest-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ existingCategories: existingNames }),
      })
      const data = await response.json()
      if (data.suggestions) {
        setAiSuggestions(data.suggestions)
      }
    } catch {
      console.error('Failed to fetch AI suggestions')
    } finally {
      setAiLoading(false)
    }
  }

  const onSubmit = async (data: CategoryForm) => {
    const result = selectedCategory
      ? await updateCategory(selectedCategory._id, data)
      : await createCategory(data)

    if (result.success) {
      toast.success(`Category ${selectedCategory ? 'updated' : 'created'} successfully`)
      loadCategories()
      setIsDialogOpen(false)
      reset()
    } else {
      toast.error(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categories</h1>
          <p className="text-gray-500 mt-2">Manage product categories</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-gray-500">Loading...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category._id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {category.iconUrl ? (
                          <div className="relative w-8 h-8 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={category.iconUrl}
                              alt={category.name}
                              fill
                              className="object-cover"
                              unoptimized={category.iconUrl.startsWith('/uploads/')}
                            />
                          </div>
                        ) : (
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <FolderIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <span>{category.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
              {!selectedCategory && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Sparkles className="h-3 w-3" />
                    {aiLoading ? 'Loading suggestions...' : 'Popular categories:'}
                  </div>
                  {!aiLoading && aiSuggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {aiSuggestions.map((suggestion) => (
                        <Badge
                          key={suggestion}
                          variant="secondary"
                          className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                          onClick={() => setValue('name', suggestion)}
                        >
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input id="description" {...register('description')} />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>
            <ImageUpload
              label="Category Icon (Optional)"
              value={watch('iconUrl')}
              onChange={(url) => setValue('iconUrl', url)}
              description="Upload an icon to visually represent this category"
            />
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
