/**
 * Auto-populate Firestore with dump objects from /public/dump-objects/
 *
 * This script scans the dump-objects folder and creates Firestore entries
 * for any images that don't already exist in the database.
 *
 * Run with: npx ts-node scripts/populate-firestore.ts
 */

import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import * as fs from 'fs'
import * as path from 'path'

// Firebase config
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

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

// Lore templates
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

const weights: ("light" | "mid" | "heavy")[] = ["light", "mid", "heavy"]

function getNaturalPilePosition(globalIndex: number) {
  const objectSize = 160 // large size
  const screenWidth = 1920
  const screenHeight = 1080

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

async function populateFirestore() {
  try {
    console.log('🔍 Scanning /public/dump-objects/ for images...')

    const dumpObjectsPath = path.join(process.cwd(), 'public', 'dump-objects')
    const files = fs.readdirSync(dumpObjectsPath)
    const imageFiles = files.filter(file =>
      /\.(png|jpg|jpeg)$/i.test(file) && file !== '.DS_Store'
    )

    console.log(`📦 Found ${imageFiles.length} images`)

    if (imageFiles.length === 0) {
      console.log('⚠️  No images found. Upload images to /public/dump-objects/ first.')
      return
    }

    // Check existing objects in Firestore
    const existingObjects = await getDocs(collection(db, 'dumpObjects'))
    const existingUrls = new Set(existingObjects.docs.map(doc => doc.data().imageUrl))

    let addedCount = 0

    for (let i = 0; i < imageFiles.length; i++) {
      const fileName = imageFiles[i]
      const imageUrl = `/The-Dump/dump-objects/${fileName}`

      // Skip if already exists
      if (existingUrls.has(imageUrl)) {
        console.log(`⏭️  Skipping ${fileName} (already in Firestore)`)
        continue
      }

      // Get file stats for creation date
      const filePath = path.join(dumpObjectsPath, fileName)
      const stats = fs.statSync(filePath)
      const dateGenerated = stats.birthtime.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      // Generate metadata
      const name = funNames[Math.floor(Math.random() * funNames.length)]
      const lore = loreTemplates[Math.floor(Math.random() * loreTemplates.length)]
      const weight = weights[Math.floor(Math.random() * weights.length)]
      const position = getNaturalPilePosition(existingObjects.docs.length + addedCount)
      const rotation = (Math.random() - 0.5) * 24
      const zIndex = Math.floor(1000 - position.y)

      // Create Firestore document
      const dumpObject = {
        imageUrl,
        name,
        size: "large",
        weight,
        lore,
        foundAt: "Midjourney",
        dateGenerated,
        rarity: "common", // All items are common as requested
        position,
        homePosition: position,
        rotation,
        zIndex,
        createdAt: new Date().toISOString(),
      }

      await addDoc(collection(db, 'dumpObjects'), dumpObject)
      console.log(`✅ Added: ${name} (${fileName})`)
      addedCount++
    }

    console.log(`\n🎉 Successfully added ${addedCount} objects to Firestore!`)
    if (addedCount === 0) {
      console.log('✨ All images already have Firestore entries.')
    }

  } catch (error) {
    console.error('❌ Error populating Firestore:', error)
    process.exit(1)
  }
}

populateFirestore()
