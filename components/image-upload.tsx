'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { ImageIcon, Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

interface ImageUploadProps {
  label: string
  value?: string
  onChange: (url: string | undefined) => void
  description?: string
}

export function ImageUpload({ label, value, onChange, description }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | undefined>(value)

  // Sync preview with value prop when it changes (e.g., when editing)
  useEffect(() => {
    setPreview(value)
  }, [value])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type. Only images are allowed.')
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      toast.error('File size too large. Maximum 5MB allowed.')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }

      const data = await response.json()
      setPreview(data.url)
      onChange(data.url)
      toast.success('Image uploaded successfully')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = async () => {
    if (!preview) return

    try {
      await fetch('/api/upload', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: preview }),
      })
    } catch (error) {
      console.error('Error deleting image:', error)
    }

    setPreview(undefined)
    onChange(undefined)
    toast.success('Image removed')
  }

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {description && <p className="text-sm text-gray-500">{description}</p>}

      {preview ? (
        <div className="space-y-2">
          <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-gray-50">
            <Image
              src={preview}
              alt={label}
              fill
              className="object-contain"
              unoptimized={preview.startsWith('/uploads/')}
            />
          </div>
          <Button type="button" variant="outline" size="sm" onClick={handleRemove}>
            <Trash2 className="h-4 w-4 mr-2" />
            Remove
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-center w-full h-48 border-2 border-dashed rounded-lg hover:bg-gray-50 transition-colors">
            <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {uploading ? (
                  <div className="flex flex-col items-center">
                    <Upload className="h-10 w-10 mb-3 text-gray-400 animate-pulse" />
                    <p className="text-sm text-gray-500">Uploading...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="h-10 w-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP or SVG (MAX. 5MB)</p>
                  </div>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
              />
            </label>
          </div>
        </div>
      )}
    </div>
  )
}
