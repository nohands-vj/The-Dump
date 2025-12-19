import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { storage, db } from './firebase'
import type { DumpItem } from '@/app/page'

/**
 * Upload an image file to Firebase Storage
 * @param file - The image file to upload
 * @param fileName - Unique filename for the image
 * @returns The download URL of the uploaded image
 */
export async function uploadImage(file: File, fileName: string): Promise<string> {
  const storageRef = ref(storage, `dump-objects/${fileName}`)

  // Upload the file
  await uploadBytes(storageRef, file)

  // Get the download URL
  const downloadURL = await getDownloadURL(storageRef)
  return downloadURL
}

/**
 * Compress and upload an image to Firebase Storage
 * @param file - The image file to compress and upload
 * @param fileName - Unique filename for the image
 * @returns The download URL of the uploaded image
 */
export async function compressAndUploadImage(file: File, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = async () => {
        try {
          // Create canvas for compression
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          if (!ctx) {
            reject(new Error('Could not get canvas context'))
            return
          }

          // Resize image to max 800px while maintaining aspect ratio
          const maxSize = 800
          let width = img.width
          let height = img.height

          if (width > height && width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          } else if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }

          canvas.width = width
          canvas.height = height

          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height)

          // Convert to blob with quality 0.8 (80%)
          canvas.toBlob(
            async (blob) => {
              if (!blob) {
                reject(new Error('Failed to compress image'))
                return
              }

              // Upload to Firebase Storage
              const storageRef = ref(storage, `dump-objects/${fileName}`)
              await uploadBytes(storageRef, blob)
              const downloadURL = await getDownloadURL(storageRef)
              resolve(downloadURL)
            },
            'image/jpeg',
            0.8
          )
        } catch (error) {
          reject(error)
        }
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}

/**
 * Save a dump object to Firestore
 * @param object - The dump object to save
 * @returns The ID of the created document
 */
export async function saveDumpObject(object: DumpItem): Promise<string> {
  const docRef = await addDoc(collection(db, 'dumpObjects'), object)
  return docRef.id
}

/**
 * Get all dump objects from Firestore
 * @returns Array of all dump objects
 */
export async function getAllDumpObjects(): Promise<DumpItem[]> {
  const querySnapshot = await getDocs(collection(db, 'dumpObjects'))
  const objects: DumpItem[] = []

  querySnapshot.forEach((doc) => {
    objects.push({ ...doc.data(), firestoreId: doc.id } as DumpItem)
  })

  return objects
}

/**
 * Update a dump object's position in Firestore
 * @param firestoreId - The Firestore document ID
 * @param position - New position {x, y}
 * @param rotation - New rotation angle
 */
export async function updateDumpObjectPosition(
  firestoreId: string,
  position: { x: number; y: number },
  rotation: number
) {
  const docRef = doc(db, 'dumpObjects', firestoreId)
  await updateDoc(docRef, { position, rotation })
}

/**
 * Delete a dump object from Firestore
 * @param firestoreId - The Firestore document ID
 */
export async function deleteDumpObject(firestoreId: string) {
  const docRef = doc(db, 'dumpObjects', firestoreId)
  await deleteDoc(docRef)
}
