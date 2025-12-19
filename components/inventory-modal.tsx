"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DumpItem } from "@/app/page"
import Image from "next/image"
import { Trash2, Eye } from "lucide-react"

interface InventoryModalProps {
  open: boolean
  onClose: () => void
  objects: DumpItem[]
  onDelete: (id: string) => void
  onClear: () => void
  onView: (object: DumpItem) => void
}

export function InventoryModal({ open, onClose, objects, onDelete, onClear, onView }: InventoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl flex items-center justify-between">
            <span>Inventory</span>
            {objects.length > 0 && (
              <Button variant="destructive" size="sm" onClick={onClear}>
                Clear All
              </Button>
            )}
          </DialogTitle>
        </DialogHeader>

        {objects.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-muted-foreground">No objects in the dump yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {objects.map((object) => (
              <div
                key={object.id}
                className="group relative aspect-square rounded-lg overflow-hidden bg-muted border border-border hover:border-foreground/20 transition-all"
              >
                <Image
                  src={object.imageUrl || "/placeholder.svg"}
                  alt={object.name}
                  fill
                  className="object-contain p-4"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="sm" variant="secondary" onClick={() => onView(object)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(object.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-2">
                  <p className="text-white text-xs font-medium truncate">{object.name}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
