import { auth } from '@/auth'
import { put } from '@vercel/blob'
import { writeFile } from 'fs/promises'
import { NextResponse } from 'next/server'
import path from 'path'

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Try Vercel Blob first, fallback to local storage
    try {
      if (process.env.BLOB_READ_WRITE_TOKEN) {
        const blob = await put(file.name, buffer, {
          access: 'public',
          contentType: file.type,
          addRandomSuffix: true, // Ensure unique filenames
        })

        return NextResponse.json({ url: blob.url })
      }
      throw new Error('Vercel Blob not configured')
    } catch (blobError) {
      // Fallback to local storage
      console.log('Falling back to local storage:', blobError)

      const timestamp = Date.now()
      const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`
      const filepath = path.join(process.cwd(), 'public', 'uploads', filename)

      // Ensure uploads directory exists
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')
      try {
        const { mkdir } = await import('fs/promises')
        await mkdir(uploadDir, { recursive: true })
      } catch (err) {
        // Directory might already exist
      }

      await writeFile(filepath, buffer)

      const url = `/uploads/${filename}`
      return NextResponse.json({ url })
    }
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 })
    }

    // If it's a Vercel Blob URL, delete from Vercel Blob
    if (url.includes('blob.vercel-storage.com')) {
      try {
        const { del } = await import('@vercel/blob')
        await del(url)
      } catch (error) {
        console.error('Error deleting from Vercel Blob:', error)
      }
    } else if (url.startsWith('/uploads/')) {
      // Delete from local storage
      try {
        const { unlink } = await import('fs/promises')
        const filepath = path.join(process.cwd(), 'public', url)
        await unlink(filepath)
      } catch (error) {
        console.error('Error deleting local file:', error)
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 })
  }
}
