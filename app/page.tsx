"use client"

import { useState, useRef, useEffect } from "react"
import { DumpObject } from "@/components/dump-object"
import { UploadModal } from "@/components/upload-modal"
import { InventoryModal } from "@/components/inventory-modal"
import { DetailModal } from "@/components/detail-modal"
import { CollectionBag } from "@/components/collection-bag"
import { DumpTruckIcon } from "@/components/icons/dump-truck"
import { AmbientSoundPlayer } from "@/components/ambient-sound-player"

export interface DumpItem {
  id: string
  imageUrl: string
  name: string
  size: "small" | "medium" | "large"
  weight: "light" | "mid" | "heavy"
  lore: string
  foundAt: string
  dateGenerated: string
  rarity: "common" | "rare" | "ultra rare"
  position: { x: number; y: number }
  rotation: number
  zIndex: number
  homePosition: { x: number; y: number } // Add home position for return animation
}

export default function Home() {
  const [objects, setObjects] = useState<DumpItem[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [selectedObject, setSelectedObject] = useState<DumpItem | null>(null)
  const [collectionBag, setCollectionBag] = useState<DumpItem[]>([])
  const containerRef = useRef<HTMLDivElement>(null)
  const draggedObjectsRef = useRef<Set<string>>(new Set())
  const [scrollX, setScrollX] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem("dumpObjects")
    if (saved) {
      setObjects(JSON.parse(saved))
    }
    const savedBag = localStorage.getItem("collectionBag")
    if (savedBag) {
      setCollectionBag(JSON.parse(savedBag))
    }
  }, [])

  useEffect(() => {
    if (objects.length > 0) {
      localStorage.setItem("dumpObjects", JSON.stringify(objects))
    }
  }, [objects])

  useEffect(() => {
    localStorage.setItem("collectionBag", JSON.stringify(collectionBag))
  }, [collectionBag])

  useEffect(() => {
    if (objects.length === 0) return

    setObjects((prevObjects) =>
      prevObjects.map((obj) => ({
        ...obj,
        zIndex: Math.floor(obj.position.y),
      })),
    )
  }, [objects.length])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const handleScroll = () => {
      setScrollX(container.scrollLeft)
    }

    container.addEventListener("scroll", handleScroll)
    return () => container.removeEventListener("scroll", handleScroll)
  }, [])

  const handleAddObjects = (newObjects: DumpItem[]) => {
    setObjects((prev) => [...prev, ...newObjects])
  }

  const handleDeleteObject = (id: string) => {
    setObjects((prev) => prev.filter((obj) => obj.id !== id))
    setCollectionBag((prev) => prev.filter((obj) => obj.id !== id))
  }

  const handleClearDump = () => {
    setObjects([])
    setCollectionBag([])
    localStorage.removeItem("dumpObjects")
    localStorage.removeItem("collectionBag")
  }

  const handleDoubleClick = (object: DumpItem) => {
    setSelectedObject(object)
    setDetailModalOpen(true)
  }

  const handleUpdatePosition = (id: string, position: { x: number; y: number }, rotation: number) => {
    setObjects((prev) => prev.map((obj) => (obj.id === id ? { ...obj, position, rotation } : obj)))
  }

  const handleDragStart = (id: string) => {
    draggedObjectsRef.current.add(id)
  }

  const handleDragEnd = (id: string) => {
    draggedObjectsRef.current.delete(id)
  }

  const handleAddToBag = (object: DumpItem) => {
    if (collectionBag.length < 10 && !collectionBag.find((item) => item.id === object.id)) {
      setCollectionBag((prev) => [...prev, object])
    }
  }

  const handleRemoveFromBag = (id: string) => {
    setCollectionBag((prev) => prev.filter((obj) => obj.id !== id))
  }

  const handleScrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -300, behavior: "smooth" })
    }
  }

  const handleScrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 300, behavior: "smooth" })
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          transform: `translateX(${scrollX * 0.3}px)`,
          transition: "transform 0.1s ease-out",
        }}
      >
        <div
          className="h-full w-[200vw] bg-cover bg-center"
          style={{
            backgroundImage: "url(/images/dumpdrop.png)",
            backgroundSize: "auto 100%",
            backgroundRepeat: "repeat-x",
          }}
        />
      </div>

      <header className="absolute top-0 left-0 right-0 z-[60] flex items-center justify-between p-6">
        <button
          onClick={() => setUploadModalOpen(true)}
          className="group flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 transition-all hover:bg-white/20"
          aria-label="Add objects to dump"
        >
          <DumpTruckIcon className="h-5 w-5 text-foreground" />
        </button>

        <h1 className="text-2xl font-serif text-foreground tracking-tight">the dump</h1>

        <div className="flex items-center gap-4">
          <AmbientSoundPlayer />
          <button
            onClick={() => setInventoryModalOpen(true)}
            className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-foreground transition-all hover:bg-white/20"
          >
            inventory ({objects.length})
          </button>
        </div>
      </header>

      <div ref={containerRef} className="relative h-full w-full overflow-x-auto overflow-y-hidden z-10">
        {objects.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-foreground/60 text-lg font-serif">the dump is empty</p>
              <p className="text-foreground/40 text-sm">click the truck to add your first objects</p>
            </div>
          </div>
        ) : (
          objects.map((object) => (
            <DumpObject
              key={object.id}
              object={object}
              onDoubleClick={handleDoubleClick}
              onUpdatePosition={handleUpdatePosition}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              containerRef={containerRef}
            />
          ))
        )}
      </div>

      {objects.length > 0 && (
        <>
          <button
            onClick={handleScrollLeft}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-white/10 backdrop-blur-sm p-3 text-foreground/60 transition-all hover:bg-white/20 hover:text-foreground"
            aria-label="Scroll left"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button
            onClick={handleScrollRight}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-40 rounded-full bg-white/10 backdrop-blur-sm p-3 text-foreground/60 transition-all hover:bg-white/20 hover:text-foreground"
            aria-label="Scroll right"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </>
      )}

      <CollectionBag items={collectionBag} onRemove={handleRemoveFromBag} />

      <UploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onAddObjects={handleAddObjects}
        existingCount={objects.length}
      />

      <InventoryModal
        open={inventoryModalOpen}
        onClose={() => setInventoryModalOpen(false)}
        objects={objects}
        onDelete={handleDeleteObject}
        onClear={handleClearDump}
        onView={(obj) => {
          setSelectedObject(obj)
          setDetailModalOpen(true)
          setInventoryModalOpen(false)
        }}
      />

      <DetailModal
        open={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        object={selectedObject}
        onAddToBag={handleAddToBag}
        isInBag={collectionBag.some((item) => item.id === selectedObject?.id)}
      />
    </div>
  )
}
