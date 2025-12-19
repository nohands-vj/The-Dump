"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import type { DumpItem } from "@/app/page"
import Image from "next/image"

interface DumpObjectProps {
  object: DumpItem
  onDoubleClick: (object: DumpItem) => void
  onUpdatePosition: (id: string, position: { x: number; y: number }, rotation: number) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function DumpObject({ object, onDoubleClick, onUpdatePosition, containerRef }: DumpObjectProps) {
  const objectRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const dragStartTime = useRef(0)
  const dragPosition = useRef({ x: object.position.x, y: object.position.y })
  const dragThreshold = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })
  const isReturning = useRef(false)

  const sizeMap = {
    small: 71,
    medium: 107,
    large: 160,
  }

  const size = sizeMap[object.size]

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    dragStartTime.current = Date.now()
    dragThreshold.current = false
    startPos.current = { x: e.clientX, y: e.clientY }
    isReturning.current = false

    const objectRect = objectRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (objectRect && containerRect) {
      setOffset({
        x: e.clientX - objectRect.left,
        y: e.clientY - objectRect.top,
      })
    }
    dragPosition.current = { x: object.position.x, y: object.position.y }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragThreshold.current) {
      const deltaX = Math.abs(e.clientX - startPos.current.x)
      const deltaY = Math.abs(e.clientY - startPos.current.y)

      if (deltaX > 3 || deltaY > 3) {
        dragThreshold.current = true
        setIsDragging(true)
      } else {
        return
      }
    }

    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const newX = e.clientX - containerRect.left - offset.x
    const newY = e.clientY - containerRect.top - offset.y

    dragPosition.current = { x: newX, y: newY }

    if (objectRef.current) {
      objectRef.current.style.left = `${newX}px`
      objectRef.current.style.top = `${newY}px`
    }
  }

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove)
    window.removeEventListener("mouseup", handleMouseUp)

    if (dragThreshold.current) {
      const dragDuration = Date.now() - dragStartTime.current

      if (dragDuration < 200) {
        onDoubleClick(object)
      } else {
        setIsDragging(false)
        onUpdatePosition(object.id, dragPosition.current, object.rotation)
      }
    } else {
      onDoubleClick(object)
    }

    dragThreshold.current = false
  }

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  useEffect(() => {
    if (objectRef.current && !isDragging && !isReturning.current) {
      objectRef.current.style.left = `${object.position.x}px`
      objectRef.current.style.top = `${object.position.y}px`
      objectRef.current.style.transform = `rotate(${object.rotation}deg)`
    }
  }, [object.position, object.rotation, isDragging])

  return (
    <div
      ref={objectRef}
      className="absolute cursor-grab active:cursor-grabbing"
      style={{
        left: object.position.x,
        top: object.position.y,
        width: size,
        height: size,
        zIndex: isDragging ? 9999 : object.zIndex,
        willChange: isDragging ? "transform, left, top" : "auto",
        filter: isHovered ? "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" : "drop-shadow(0 10px 25px rgba(0,0,0,0.25))",
        transform: isDragging ? `rotate(${object.rotation}deg) scale(1.05)` : `rotate(${object.rotation}deg)`,
        transition: isDragging ? "none" : "filter 0.3s ease, transform 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Image
        src={object.imageUrl || "/placeholder.svg"}
        alt={object.name}
        width={size}
        height={size}
        className="w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
  )
}
