"use client"

import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"
import { getAllDumpObjects } from "@/lib/storage"
import type { DumpItem } from "@/app/page"

interface PhysicsObject {
  id: string
  body: Matter.Body
  dumpItem: DumpItem
  audioElement: HTMLAudioElement | null
  imageElement: HTMLImageElement | null
}

export function RelaxMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const objectsRef = useRef<PhysicsObject[]>([])
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)
  const [mounted, setMounted] = useState(false)
  const [dumpItems, setDumpItems] = useState<DumpItem[]>([])

  // Load dump objects from Firestore
  useEffect(() => {
    const loadObjects = async () => {
      try {
        const objects = await getAllDumpObjects()
        setDumpItems(objects)
      } catch (error) {
        console.error('Failed to load dump objects for relax mode:', error)
      }
    }
    loadObjects()
  }, [])

  useEffect(() => {
    setMounted(true)
    if (!canvasRef.current || typeof window === 'undefined' || dumpItems.length === 0) return

    // Create engine
    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1 }
    })
    engineRef.current = engine

    // Create renderer
    const render = Matter.Render.create({
      canvas: canvasRef.current,
      engine: engine,
      options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
      }
    })
    renderRef.current = render

    // Create ground
    const ground = Matter.Bodies.rectangle(
      window.innerWidth / 2,
      window.innerHeight - 10,
      window.innerWidth,
      20,
      {
        isStatic: true,
        render: {
          fillStyle: 'rgba(139, 92, 69, 0.3)'
        }
      }
    )

    // Create walls
    const leftWall = Matter.Bodies.rectangle(
      10,
      window.innerHeight / 2,
      20,
      window.innerHeight,
      {
        isStatic: true,
        render: {
          fillStyle: 'rgba(139, 92, 69, 0.3)'
        }
      }
    )

    const rightWall = Matter.Bodies.rectangle(
      window.innerWidth - 10,
      window.innerHeight / 2,
      20,
      window.innerHeight,
      {
        isStatic: true,
        render: {
          fillStyle: 'rgba(139, 92, 69, 0.3)'
        }
      }
    )

    Matter.World.add(engine.world, [ground, leftWall, rightWall])

    // Add mouse control
    const mouse = Matter.Mouse.create(canvasRef.current)
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    })
    mouseConstraintRef.current = mouseConstraint
    Matter.World.add(engine.world, mouseConstraint)

    // Keep the mouse in sync with rendering
    render.mouse = mouse

    // Run the engine
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)
    Matter.Render.run(render)

    // Add random dump objects on load
    const numInitialObjects = Math.min(12, dumpItems.length)
    for (let i = 0; i < numInitialObjects; i++) {
      const randomItem = dumpItems[Math.floor(Math.random() * dumpItems.length)]
      const x = window.innerWidth * (0.2 + Math.random() * 0.6)
      const y = 100 + i * 80
      addDumpObject(x, y, randomItem)
    }

    // Handle window resize
    const handleResize = () => {
      if (renderRef.current && canvasRef.current) {
        renderRef.current.canvas.width = window.innerWidth
        renderRef.current.canvas.height = window.innerHeight
        renderRef.current.options.width = window.innerWidth
        renderRef.current.options.height = window.innerHeight
        Matter.Render.setPixelRatio(renderRef.current, window.devicePixelRatio)
      }
    }

    window.addEventListener('resize', handleResize)

    // Listen for collisions to play sounds
    Matter.Events.on(engine, 'collisionStart', (event) => {
      event.pairs.forEach((pair) => {
        const obj = objectsRef.current.find(o => o.body === pair.bodyA || o.body === pair.bodyB)
        if (obj && obj.audioElement) {
          // Calculate impact velocity
          const velocity = Matter.Body.getVelocity(obj.body)
          const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

          // Only play sound if impact is significant enough
          if (speed > 2) {
            obj.audioElement.currentTime = 0
            obj.audioElement.volume = Math.min(speed / 15, 0.4)
            obj.audioElement.play().catch(() => {})
          }
        }
      })
    })

    // Custom render loop to draw images
    Matter.Events.on(render, 'afterRender', () => {
      const context = render.canvas.getContext('2d')
      if (!context) return

      objectsRef.current.forEach(obj => {
        if (!obj.imageElement || !obj.imageElement.complete) return

        const pos = obj.body.position
        const angle = obj.body.angle
        const radius = obj.body.circleRadius || 80

        context.save()
        context.translate(pos.x, pos.y)
        context.rotate(angle)

        // Draw image centered
        const imageSize = radius * 2
        context.drawImage(
          obj.imageElement,
          -imageSize / 2,
          -imageSize / 2,
          imageSize,
          imageSize
        )

        context.restore()
      })
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      Matter.Render.stop(render)
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)

      // Clean up audio and image elements
      objectsRef.current.forEach(obj => {
        if (obj.audioElement) {
          obj.audioElement.pause()
          obj.audioElement = null
        }
        obj.imageElement = null
      })
    }
  }, [dumpItems])

  const addDumpObject = (x: number, y: number, item: DumpItem) => {
    if (!engineRef.current) return

    // Size configuration based on item size
    const sizeMap = {
      small: { radius: 35, densityMultiplier: 0.8 },
      medium: { radius: 60, densityMultiplier: 1.0 },
      large: { radius: 80, densityMultiplier: 1.2 }
    }

    // Weight configuration (affects density)
    const weightMap = {
      light: 0.001,
      mid: 0.003,
      heavy: 0.006
    }

    // Spa sound library - calming tones
    const spaSound = [
      "/The-Dump/sounds/spa_#1-1766425239841.mp3",
      "/The-Dump/sounds/spa_#2-1766425247556.mp3",
      "/The-Dump/sounds/spa_souns_#2-1766425219002.mp3",
      "/The-Dump/sounds/spa_souns_#4-1766425206462.mp3",
      "/The-Dump/sounds/chime_#3-1766425332748.mp3",
      "/The-Dump/sounds/gong_#3-1766425283617.mp3",
      "/The-Dump/sounds/gong_#3-1766425310235.mp3",
      "/The-Dump/sounds/gong_#4-1766425314672.mp3"
    ]

    const sizeConfig = sizeMap[item.size]
    const baseDensity = weightMap[item.weight]
    const density = baseDensity * sizeConfig.densityMultiplier
    const randomSound = spaSound[Math.floor(Math.random() * spaSound.length)]

    // Create circular body
    const body = Matter.Bodies.circle(x, y, sizeConfig.radius, {
      density: density,
      restitution: 0.5, // Bounciness
      friction: 0.4,
      frictionAir: 0.01,
      render: {
        fillStyle: 'rgba(200, 200, 200, 0.1)', // Nearly invisible - image will show
        strokeStyle: 'transparent',
        lineWidth: 0,
        sprite: {
          texture: item.imageUrl,
          xScale: 1,
          yScale: 1
        }
      }
    })

    // Preload image
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.src = item.imageUrl

    // Create audio element
    let audio: HTMLAudioElement | null = null
    try {
      audio = new Audio(randomSound)
      audio.volume = 0.25
      audio.load()
    } catch (error) {
      console.warn(`Failed to load audio: ${randomSound}`, error)
      audio = null
    }

    const physicsObj: PhysicsObject = {
      id: `physics-${item.id}-${Date.now()}`,
      body,
      dumpItem: item,
      audioElement: audio,
      imageElement: img
    }

    objectsRef.current.push(physicsObj)
    Matter.World.add(engineRef.current.world, body)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only add objects on double click
    if (e.detail === 2 && dumpItems.length > 0) {
      const randomItem = dumpItems[Math.floor(Math.random() * dumpItems.length)]
      addDumpObject(e.clientX, e.clientY, randomItem)
    }
  }

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full"
        style={{ cursor: 'grab' }}
      />

      <div className="absolute top-24 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-foreground/60 text-sm font-serif bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
          drag objects to throw them • double-click to add more • listen to the calming sounds
        </p>
      </div>

      {dumpItems.length === 0 && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
          <p className="text-foreground/60 text-lg font-serif">Loading objects...</p>
        </div>
      )}
    </div>
  )
}
