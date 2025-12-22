"use client"

import { useState } from 'react'
import { autoPopulateFirestore } from '@/lib/auto-populate'
import { Button } from '@/components/ui/button'

/**
 * Admin page for managing dump objects
 * Visit: https://nohands-vj.github.io/The-Dump/admin
 */
export default function AdminPage() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<string>('')
  const [imageList, setImageList] = useState<string>('')

  const handleAutoPopulate = async () => {
    if (!imageList.trim()) {
      setResult('❌ Please paste the list of image filenames first!')
      return
    }

    setIsProcessing(true)
    setResult('⏳ Processing...')

    try {
      // Parse image filenames from the textarea (one per line)
      const fileNames = imageList
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && /\.(png|jpg|jpeg)$/i.test(line))

      if (fileNames.length === 0) {
        setResult('❌ No valid image filenames found. Make sure each line has a .png, .jpg, or .jpeg file.')
        setIsProcessing(false)
        return
      }

      const addedCount = await autoPopulateFirestore(fileNames)

      if (addedCount === 0) {
        setResult(`✅ All ${fileNames.length} images already have Firestore entries!`)
      } else {
        setResult(`🎉 Successfully added ${addedCount} new objects to Firestore!`)
      }
    } catch (error) {
      console.error('Auto-populate failed:', error)
      setResult(`❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-serif text-white mb-2">The Dump Admin</h1>
          <p className="text-white/60 mb-8">Auto-populate Firestore with your dump objects</p>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl text-white mb-4">Step 1: Get Image Filenames</h2>
              <div className="bg-black/20 rounded-lg p-4 text-white/80 text-sm font-mono mb-4">
                <p className="mb-2">After uploading images to GitHub, list them here (one per line):</p>
                <p className="text-white/60">Example:</p>
                <p className="text-green-400">rock-001.jpg</p>
                <p className="text-green-400">rock-002.jpg</p>
                <p className="text-green-400">stone-texture-01.png</p>
              </div>

              <textarea
                value={imageList}
                onChange={(e) => setImageList(e.target.value)}
                placeholder="Paste your image filenames here (one per line)..."
                className="w-full h-64 bg-black/30 text-white rounded-lg p-4 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>

            <div>
              <h2 className="text-xl text-white mb-4">Step 2: Auto-Generate Firestore Entries</h2>
              <p className="text-white/60 text-sm mb-4">
                This will create Firestore entries with auto-generated names, lore, and metadata.
                All items will be set to "common" rarity.
              </p>

              <Button
                onClick={handleAutoPopulate}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-6 text-lg"
              >
                {isProcessing ? '⏳ Processing...' : '🚀 Auto-Populate Firestore'}
              </Button>
            </div>

            {result && (
              <div className={`p-4 rounded-lg ${
                result.startsWith('❌') ? 'bg-red-500/20 text-red-200' :
                result.startsWith('⏳') ? 'bg-blue-500/20 text-blue-200' :
                'bg-green-500/20 text-green-200'
              }`}>
                <p className="font-semibold">{result}</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/20">
              <h2 className="text-xl text-white mb-4">How This Works</h2>
              <ul className="space-y-2 text-white/60 text-sm">
                <li>✅ Scans images in <code className="bg-black/30 px-2 py-1 rounded">/public/dump-objects/</code></li>
                <li>✅ Auto-generates random names and lore for each item</li>
                <li>✅ Sets all items to "common" rarity</li>
                <li>✅ Uses current date for dateGenerated</li>
                <li>✅ Positions items in natural pile layout</li>
                <li>✅ Skips images that already have Firestore entries</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
