import { initializeApp, getApps, getApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase configuration
// These values will come from your Firebase project settings
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Log Firebase configuration status (without exposing sensitive values)
console.log('🔥 Firebase Configuration Status:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  projectId: firebaseConfig.projectId, // Safe to log, not sensitive
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  timestamp: new Date().toISOString(),
})

// Check if Firebase config is valid
const isConfigValid = Object.values(firebaseConfig).every(val => val && val !== 'undefined')

if (!isConfigValid) {
  console.error('❌ Firebase configuration is invalid or missing!')
  console.error('Missing or invalid config values:', {
    apiKey: !firebaseConfig.apiKey ? 'MISSING' : 'OK',
    authDomain: !firebaseConfig.authDomain ? 'MISSING' : 'OK',
    projectId: !firebaseConfig.projectId ? 'MISSING' : 'OK',
    storageBucket: !firebaseConfig.storageBucket ? 'MISSING' : 'OK',
    messagingSenderId: !firebaseConfig.messagingSenderId ? 'MISSING' : 'OK',
    appId: !firebaseConfig.appId ? 'MISSING' : 'OK',
  })
}


// Initialize Firebase (only once)
let app
try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
  console.log('✅ Firebase app initialized successfully')
} catch (error) {
  console.error('❌ Failed to initialize Firebase app:', error)
  throw error
}

// Initialize services
export const db = getFirestore(app)
export const storage = getStorage(app)
console.log('✅ Firestore and Storage services initialized')

export default app
