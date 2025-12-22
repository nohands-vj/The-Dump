/**
 * Auto-populate Firestore with images from /public/dump-objects/
 *
 * This runs in the browser (no Node.js needed!) and automatically creates
 * Firestore entries for any images in the dump-objects folder that don't
 * already have database entries.
 */

import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from './firebase'

// List of all images in /public/dump-objects/ (update this list when adding new images)
// This will be auto-generated from the folder contents
const DUMP_OBJECT_IMAGES = [
  // Images will be listed here - we'll populate this automatically
]

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
  "Moldy Martha",
  "Crusty Carl",
  "Tarnished Tina",
  "Scratched Sarah",
  "Dented Dan",
  "Chipped Charlie",
  "Cracked Crystal",
  "Weathered Walter",
  "Faded Fiona",
  "Stained Stanley",
]

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
  "Discovered in the depths of an ancient landfill.",
  "Said to bring good fortune to those who find it.",
  "A remnant from a world long forgotten.",
  "Its texture tells a thousand untold stories.",
  "Holds memories of places that no longer exist.",
]

const weights: ("light" | "mid" | "heavy")[] = ["light", "mid", "heavy"]

function getNaturalPilePosition(globalIndex: number) {
  const objectSize = 160 // large size
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080

  const bottomMargin = 20
  const baselineY = screenHeight - objectSize / 2 - bottomMargin

  const objectsPerRow = 14
  const rowIndex = Math.floor(globalIndex / objectsPerRow)
  const colIndex = globalIndex % objectsPerRow

  const usableWidth = screenWidth * 0.95
  const marginLeft = screenWidth * 0.025
  const horizontalSpacing = usableWidth / objectsPerRow
  const baseX = marginLeft + colIndex * horizontalSpacing + horizontalSpacing / 2

  const overlapFactor = 0.93
  const verticalSpacing = objectSize * overlapFactor
  const baseY = baselineY - rowIndex * verticalSpacing

  const scatterX = (Math.random() - 0.5) * objectSize * 0.1
  const scatterY = (Math.random() - 0.5) * objectSize * 0.1

  const x = Math.max(objectSize / 2 + 10, Math.min(screenWidth - objectSize / 2 - 10, baseX + scatterX))
  const y = Math.max(objectSize / 2 + 80, baseY + scatterY)

  return { x, y }
}

/**
 * Auto-populate Firestore with images from dump-objects folder
 * Call this once after uploading new images
 */
export async function autoPopulateFirestore(imageFileNames: string[]): Promise<number> {
  try {
    // Get existing objects from Firestore
    const existingObjects = await getDocs(collection(db, 'dumpObjects'))
    const existingUrls = new Set(existingObjects.docs.map(doc => doc.data().imageUrl))

    let addedCount = 0
    const usedNames = new Set<string>()

    for (let i = 0; i < imageFileNames.length; i++) {
      const fileName = imageFileNames[i]
      const imageUrl = `/The-Dump/dump-objects/${fileName}`

      // Skip if already exists in Firestore
      if (existingUrls.has(imageUrl)) {
        continue
      }

      // Generate unique name
      let name: string
      do {
        name = funNames[Math.floor(Math.random() * funNames.length)]
      } while (usedNames.has(name) && usedNames.size < funNames.length)
      usedNames.add(name)

      const lore = loreTemplates[Math.floor(Math.random() * loreTemplates.length)]
      const weight = weights[Math.floor(Math.random() * weights.length)]
      const position = getNaturalPilePosition(existingObjects.docs.length + addedCount)
      const rotation = (Math.random() - 0.5) * 24
      const zIndex = Math.floor(1000 - position.y)

      const dateGenerated = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      const dumpObject = {
        imageUrl,
        name,
        size: "large",
        weight,
        lore,
        foundAt: "Midjourney",
        dateGenerated,
        rarity: "common", // All objects are common as requested
        position,
        homePosition: position,
        rotation,
        zIndex,
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, 'dumpObjects'), dumpObject)
      addedCount++

      console.log(`✅ Added to Firestore: ${name} (${fileName})`)
    }

    return addedCount
  } catch (error) {
    console.error('Failed to auto-populate Firestore:', error)
    throw error
  }
}

/**
 * Check if auto-population is needed
 */
export async function checkAutoPopulationNeeded(): Promise<boolean> {
  try {
    const existingObjects = await getDocs(collection(db, 'dumpObjects'))
    // If we have fewer than 10 objects, might need population
    return existingObjects.docs.length < 10
  } catch (error) {
    console.error('Failed to check auto-population status:', error)
    return false
  }
}
