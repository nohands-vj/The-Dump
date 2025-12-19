"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DumpItem } from "@/app/page"

interface UploadModalProps {
  open: boolean
  onClose: () => void
  onAddObjects: (objects: DumpItem[]) => void
  existingCount: number
}

export function UploadModal({ open, onClose, onAddObjects, existingCount }: UploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    setFiles(selectedFiles)

    // Create previews
    const newPreviews = selectedFiles.map((file) => URL.createObjectURL(file))
    setPreviews(newPreviews)
  }

  const generateMetadata = (
    filename: string,
  ): Omit<DumpItem, "id" | "imageUrl" | "position" | "rotation" | "zIndex"> => {
    const weights: ("light" | "mid" | "heavy")[] = ["light", "mid", "heavy"]
    const rarities: ("common" | "rare" | "ultra rare")[] = ["common", "rare", "ultra rare"]

    // Fun, playful names for objects
    const funNames = [
      "Little Squid",
      "Ed the Squid",
      "Squidy McSquidface",
      "Tiny Tim",
      "Captain Whiskers",
      "Professor Pickles",
      "Lady Luminous",
      "Sir Sparkles",
      "The Wanderer",
      "Dusty Pete",
      "Golden Gary",
      "Ruby Rose",
      "Mysterious Mo",
      "Lucky Lou",
      "Ancient Annie",
      "Forgetful Fred",
      "Curious Cora",
      "Brave Betty",
      "Silent Sam",
      "Wise Willow",
      "Dancing Dave",
      "Sleepy Steve",
      "Happy Harold",
      "Grumpy Gus",
      "Sneaky Sally",
      "Bouncing Bob",
      "Shiny Sharon",
      "Old Oliver",
      "Young Yuki",
      "Rusty Rick",
    ]

    const name = funNames[Math.floor(Math.random() * funNames.length)]

    // Generate interesting lore
    const loreTemplates = [
      "Whispers of forgotten dreams cling to its surface.",
      "Found at the edge of reality itself.",
      "Time seems to bend around its presence.",
      "Salvaged from the ruins of yesterday.",
      "Its shadow tells stories the light conceals.",
      "Once held by hands now turned to dust.",
      "The wind carries secrets about this relic.",
      "Echoes of distant laughter emanate from within.",
      "Collectors have sought this for centuries past.",
      "Its origin remains shrouded in eternal mystery.",
    ]

    return {
      name,
      size: "large", // All objects default to large
      weight: weights[Math.floor(Math.random() * weights.length)],
      lore: loreTemplates[Math.floor(Math.random() * loreTemplates.length)],
      foundAt: "Midjourney",
      dateGenerated: new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
    }
  }

  const getNaturalPilePosition = (size: "small" | "medium" | "large", globalIndex: number) => {
    const sizeMap = { small: 71, medium: 107, large: 160 }
    const objectSize = sizeMap[size]

    // Use window dimensions only on client-side
    const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
    const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

    // Start from bottom of screen
    const bottomMargin = 20
    const baselineY = screenHeight - objectSize / 2 - bottomMargin

    // Arrange in rows across full width
    const objectsPerRow = 14
    const rowIndex = Math.floor(globalIndex / objectsPerRow)
    const colIndex = globalIndex % objectsPerRow

    // Distribute evenly across 95% of screen width
    const usableWidth = screenWidth * 0.95
    const marginLeft = screenWidth * 0.025
    const horizontalSpacing = usableWidth / objectsPerRow
    const baseX = marginLeft + colIndex * horizontalSpacing + horizontalSpacing / 2

    // Stack upward with exactly 7% overlap
    const overlapFactor = 0.93 // 1 - 0.07 = 0.93 (7% overlap)
    const verticalSpacing = objectSize * overlapFactor
    const baseY = baselineY - rowIndex * verticalSpacing

    // Minimal random scatter for natural appearance (±5% of object size)
    const scatterX = (Math.random() - 0.5) * objectSize * 0.1
    const scatterY = (Math.random() - 0.5) * objectSize * 0.1

    // Final positions with bounds
    const x = Math.max(objectSize / 2 + 10, Math.min(screenWidth - objectSize / 2 - 10, baseX + scatterX))
    const y = Math.max(objectSize / 2 + 80, baseY + scatterY)

    return { x, y }
  }

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const img = new Image()
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Resize image to max 800px while maintaining aspect ratio
          const maxSize = 800
          let width = img.width
          let height = img.height

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to base64 with quality 0.8 (80%)
          const compressed = canvas.toDataURL('image/jpeg', 0.8)
          resolve(compressed)
        }
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }

  const handleAddToDisplay = async () => {
    setIsAnalyzing(true)

    try {
      const newObjects: DumpItem[] = await Promise.all(
        files.map(async (file, index) => {
          const imageUrl = await compressImage(file)

          const metadata = generateMetadata(file.name)

          const globalIndex = existingCount + index
          const homePosition = getNaturalPilePosition(metadata.size, globalIndex)

          const baseZIndex = Math.floor(1000 - homePosition.y)

          return {
            id: `${Date.now()}-${index}`,
            imageUrl,
            ...metadata,
            position: homePosition,
            homePosition,
            rotation: (Math.random() - 0.5) * 24,
            zIndex: baseZIndex,
          }
        }),
      )

      onAddObjects(newObjects)
      setFiles([])
      setPreviews([])
      setIsAnalyzing(false)
      onClose()
    } catch (error) {
      console.error('Failed to add objects:', error)
      alert('Failed to add objects. Try uploading fewer or smaller images.')
      setIsAnalyzing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Add to the Dump</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="space-y-2">
                <p className="text-foreground font-medium">Drop PNG images here</p>
                <p className="text-muted-foreground text-sm">or click to browse</p>
              </div>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {previews.length} object{previews.length > 1 ? "s" : ""} ready to add
              </p>
              <div className="grid grid-cols-4 gap-4">
                {previews.map((preview, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </div>
                ))}
              </div>

              <Button onClick={handleAddToDisplay} className="w-full" size="lg" disabled={isAnalyzing}>
                {isAnalyzing ? "Analyzing objects..." : "Add to Dump"}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
