"use client"

import { useEffect, useRef, useState } from "react"
import Matter from "matter-js"
import Image from "next/image"

interface Rock {
  id: string
  body: Matter.Body
  size: "small" | "medium" | "large"
  imageUrl: string
  soundUrl: string
  audioElement: HTMLAudioElement | null
}

export function RelaxMode() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const engineRef = useRef<Matter.Engine | null>(null)
  const renderRef = useRef<Matter.Render | null>(null)
  const rocksRef = useRef<Rock[]>([])
  const mouseConstraintRef = useRef<Matter.MouseConstraint | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (!canvasRef.current || typeof window === 'undefined') return

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

    // Add some initial rocks
    addRock(window.innerWidth * 0.3, 100, "large")
    addRock(window.innerWidth * 0.5, 150, "medium")
    addRock(window.innerWidth * 0.7, 200, "small")
    addRock(window.innerWidth * 0.4, 250, "medium")
    addRock(window.innerWidth * 0.6, 300, "large")

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
        const rock = rocksRef.current.find(r => r.body === pair.bodyA || r.body === pair.bodyB)
        if (rock && rock.audioElement) {
          // Calculate impact velocity
          const velocity = Matter.Body.getVelocity(rock.body)
          const speed = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y)

          // Only play sound if impact is significant enough
          if (speed > 2) {
            rock.audioElement.currentTime = 0
            rock.audioElement.volume = Math.min(speed / 20, 0.5)
            rock.audioElement.play().catch(() => {})
          }
        }
      })
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      Matter.Render.stop(render)
      Matter.World.clear(engine.world, false)
      Matter.Engine.clear(engine)

      // Clean up audio elements
      rocksRef.current.forEach(rock => {
        if (rock.audioElement) {
          rock.audioElement.pause()
          rock.audioElement = null
        }
      })
    }
  }, [])

  const addRock = (x: number, y: number, size: "small" | "medium" | "large") => {
    if (!engineRef.current) return

    const sizeMap = {
      small: { radius: 30, density: 0.001, soundUrl: "/sounds/chime-high.mp3" },
      medium: { radius: 50, density: 0.003, soundUrl: "/sounds/chime-mid.mp3" },
      large: { radius: 75, density: 0.005, soundUrl: "/sounds/chime-low.mp3" }
    }

    const config = sizeMap[size]

    // Create circular body for the rock
    const body = Matter.Bodies.circle(x, y, config.radius, {
      density: config.density,
      restitution: 0.6,
      friction: 0.3,
      render: {
        fillStyle: '#8B7355',
        strokeStyle: '#654321',
        lineWidth: 2
      }
    })

    // Create audio element (with error handling for missing files)
    let audio: HTMLAudioElement | null = null
    try {
      audio = new Audio(config.soundUrl)
      audio.volume = 0.3
      // Preload the audio
      audio.load()
    } catch (error) {
      console.warn(`Failed to load audio: ${config.soundUrl}`, error)
      audio = null
    }

    const rock: Rock = {
      id: `rock-${Date.now()}-${Math.random()}`,
      body,
      size,
      imageUrl: `/images/rock-${size}.png`,
      soundUrl: config.soundUrl,
      audioElement: audio
    }

    rocksRef.current.push(rock)
    Matter.World.add(engineRef.current.world, body)
  }

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Only add rocks on double click
    if (e.detail === 2) {
      const sizes: ("small" | "medium" | "large")[] = ["small", "medium", "large"]
      const randomSize = sizes[Math.floor(Math.random() * sizes.length)]
      addRock(e.clientX, e.clientY, randomSize)
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
          drag rocks to throw them • double-click to add more
        </p>
      </div>
    </div>
  )
}
