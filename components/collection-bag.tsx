"use client"

import { useState } from "react"
import type { DumpItem } from "@/app/page"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Download, X, Package } from "lucide-react"

interface CollectionBagProps {
  items: DumpItem[]
  onRemove: (id: string) => void
}

export function CollectionBag({ items, onRemove }: CollectionBagProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleDownload = async () => {
    // Create a temporary container
    const container = document.createElement("div")
    container.style.position = "fixed"
    container.style.left = "-9999px"
    document.body.appendChild(container)

    // Download each image
    for (const item of items) {
      const link = document.createElement("a")
      link.href = item.imageUrl
      link.download = `${item.name}.png`
      link.click()
      await new Promise((resolve) => setTimeout(resolve, 100))
    }

    document.body.removeChild(container)
  }

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-4 py-3 shadow-lg hover:bg-primary/90 transition-all"
      >
        <Package className="h-5 w-5" />
        <span className="font-medium">Collection</span>
        {items.length > 0 && (
          <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-accent text-accent-foreground text-xs font-bold">
            {items.length}
          </span>
        )}
      </button>

      {/* Bag Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 rounded-lg bg-card border border-border shadow-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg">Collection Bag</h3>
            <p className="text-sm text-muted-foreground">{items.length}/10</p>
          </div>

          {items.length === 0 ? (
            <p className="text-center text-muted-foreground py-8 text-sm">
              Double-click objects to add them to your collection
            </p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="relative group aspect-square rounded-md overflow-hidden bg-muted">
                    <Image
                      src={item.imageUrl || "/placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain p-2"
                    />
                    <button
                      onClick={() => onRemove(item.id)}
                      className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>

              <Button onClick={handleDownload} className="w-full" disabled={items.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                Download Collection
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
