"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import type { DumpItem } from "@/app/page"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

interface DetailModalProps {
  open: boolean
  onClose: () => void
  object: DumpItem | null
  onAddToBag: (object: DumpItem) => void
  isInBag: boolean
}

export function DetailModal({ open, onClose, object, onAddToBag, isInBag }: DetailModalProps) {
  if (!object) return null

  return (
    <div className="relative z-[99999]">
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted flex items-center justify-center">
              <Image
                src={object.imageUrl || "/placeholder.svg"}
                alt={object.name}
                width={400}
                height={400}
                className="object-contain p-8"
              />
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-3xl mb-2">{object.name}</h2>
                <div className="flex gap-2">
                  <Badge variant="secondary">{object.rarity}</Badge>
                  <Badge variant="outline">{object.size}</Badge>
                  <Badge variant="outline">{object.weight}</Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lore</p>
                  <p className="text-foreground italic">{object.lore}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Found At</p>
                    <p className="text-foreground">{object.foundAt}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Date</p>
                    <p className="text-foreground">{object.dateGenerated}</p>
                  </div>
                </div>
              </div>

              <Button onClick={() => onAddToBag(object)} disabled={isInBag} className="w-full" size="lg">
                {isInBag ? "Already in Collection" : "Add to Collection"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
