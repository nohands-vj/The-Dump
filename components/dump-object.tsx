"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import type { DumpItem } from "@/app/page"

interface DumpObjectProps {
  object: DumpItem
  onDoubleClick: (object: DumpItem) => void
  onUpdatePosition: (id: string, position: { x: number; y: number }, rotation: number) => void
  onDragStart?: (id: string) => void
  onDragEnd?: (id: string) => void
  containerRef: React.RefObject<HTMLDivElement>
}

export function DumpObject({ object, onDoubleClick, onUpdatePosition, onDragStart, onDragEnd, containerRef }: DumpObjectProps) {
  const objectRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  // Use a ref for offset so event handlers always read the latest value,
  // avoiding the stale closure bug that caused objects to jump to the mouse position.
  const offsetRef = useRef({ x: 0, y: 0 })
  const dragStartTime = useRef(0)
  const dragPosition = useRef({ x: object.position.x, y: object.position.y })
  const dragThreshold = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  // Keep latest callbacks and object accessible inside stable event handler refs
  const onDoubleClickRef = useRef(onDoubleClick)
  const onUpdatePositionRef = useRef(onUpdatePosition)
  const onDragStartRef = useRef(onDragStart)
  const onDragEndRef = useRef(onDragEnd)
  const objectDataRef = useRef(object)
  useEffect(() => {
    onDoubleClickRef.current = onDoubleClick
    onUpdatePositionRef.current = onUpdatePosition
    onDragStartRef.current = onDragStart
    onDragEndRef.current = onDragEnd
    objectDataRef.current = object
  })

  const sizeMap = {
    small: 71,
    medium: 107,
    large: 160,
  }

  const size = sizeMap[object.size]

  // Stable handler refs — created once, always read latest data via other refs.
  // This prevents the stale closure issue where window event listeners would use
  // old state values from the render in which they were registered.
  const handleMouseMove = useRef((e: MouseEvent) => {
    if (!dragThreshold.current) {
      const deltaX = Math.abs(e.clientX - startPos.current.x)
      const deltaY = Math.abs(e.clientY - startPos.current.y)

      if (deltaX > 3 || deltaY > 3) {
        dragThreshold.current = true
        setIsDragging(true)
        onDragStartRef.current?.(objectDataRef.current.id)
      } else {
        return
      }
    }

    if (!containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    // Add scrollLeft so positions are in container coordinates, not viewport coordinates
    const scrollLeft = containerRef.current.scrollLeft
    const newX = e.clientX - containerRect.left + scrollLeft - offsetRef.current.x
    const newY = e.clientX - containerRect.top - offsetRef.current.y

    dragPosition.current = { x: newX, y: newY }

    if (objectRef.current) {
      objectRef.current.style.left = `${newX}px`
      objectRef.current.style.top = `${newY}px`
    }
  }).current

  // Store the mouseup handler separately to ensure proper cleanup
  const handleMouseUpFn = useRef<((e: MouseEvent) => void) | null>(null)

  const handleMouseUp = () => {
    if (handleMouseUpFn.current) {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUpFn.current)
      handleMouseUpFn.current = null
    }

    const obj = objectDataRef.current

    if (dragThreshold.current) {
      const dragDuration = Date.now() - dragStartTime.current

      if (dragDuration < 200) {
        // Quick flick: treat as a click, don't save the position
        setIsDragging(false)
        onDoubleClickRef.current(obj)
      } else {
        setIsDragging(false)
        onDragEndRef.current?.(obj.id)
        onUpdatePositionRef.current(obj.id, dragPosition.current, obj.rotation)
      }
    } else {
      // No movement at all: plain click
      setIsDragging(false)
      onDoubleClickRef.current(obj)
    }

    dragThreshold.current = false
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent event from bubbling to other objects

    // Clean up any existing listeners before adding new ones
    if (handleMouseUpFn.current) {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseup", handleMouseUpFn.current)
    }

    dragStartTime.current = Date.now()
    dragThreshold.current = false
    startPos.current = { x: e.clientX, y: e.clientY }

    const objectRect = objectRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()

    if (objectRect && containerRect) {
      // Store directly in a ref — no state update, no stale closure
      offsetRef.current = {
        x: e.clientX - objectRect.left,
        y: e.clientY - objectRect.top,
      }
    }
    dragPosition.current = { x: object.position.x, y: object.position.y }

    // Store the handler reference so we can remove it later
    handleMouseUpFn.current = handleMouseUp as any
    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseup", handleMouseUp)
  }

  useEffect(() => {
    return () => {
      // Clean up event listeners on unmount
      window.removeEventListener("mousemove", handleMouseMove)
      if (handleMouseUpFn.current) {
        window.removeEventListener("mouseup", handleMouseUpFn.current)
        handleMouseUpFn.current = null
      }
    }
  }, [handleMouseMove])

  useEffect(() => {
    if (objectRef.current && !isDragging) {
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
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={object.imageUrl || "/The-Dump/placeholder.svg"}
        alt={object.name}
        width={size}
        height={size}
        className="w-full h-full object-contain select-none pointer-events-none"
        draggable={false}
      />
    </div>
  )
}
