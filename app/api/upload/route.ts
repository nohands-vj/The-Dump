import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// This API route only works in development mode
// In production (static export), this won't be available
export async function POST(request: NextRequest) {
  // Only allow uploads in development mode
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Uploads are only allowed in development mode' },
      { status: 403 }
    )
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileName = formData.get('fileName') as string

    if (!file || !fileName) {
      return NextResponse.json({ error: 'Missing file or fileName' }, { status: 400 })
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure the dump-objects directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'dump-objects')
    await mkdir(uploadDir, { recursive: true })

    // Write file to public/dump-objects/
    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    // Return the public URL path (with basePath)
    const publicUrl = `/The-Dump/dump-objects/${fileName}`

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}
