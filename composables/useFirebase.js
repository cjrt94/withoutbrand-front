import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, getDocs, doc, getDoc, deleteDoc, updateDoc, query, orderBy } from 'firebase/firestore'
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { useRuntimeConfig } from '#imports'

let app
let db
let storage

function initFirebase() {
  if (!app) {
    const config = useRuntimeConfig()
    const firebaseConfig = {
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      storageBucket: config.public.firebaseStorageBucket,
      messagingSenderId: config.public.firebaseMessagingSenderId,
      appId: config.public.firebaseAppId
    }
    app = initializeApp(firebaseConfig)
    db = getFirestore(app)
    storage = getStorage(app)
  }
  return { app, db, storage }
}

export function useFirebase() {
  const { db, storage } = initFirebase()

  async function uploadDeck(file, name, brand) {
    const timestamp = Date.now()
    const fileName = `decks/${timestamp}_${file.name}`
    const fileRef = storageRef(storage, fileName)

    await uploadBytes(fileRef, file)
    const url = await getDownloadURL(fileRef)

    const deckDoc = await addDoc(collection(db, 'decks'), {
      name,
      brand,
      fileName,
      url,
      createdAt: new Date().toISOString()
    })

    return { id: deckDoc.id, name, brand, url, createdAt: new Date().toISOString() }
  }

  async function getDecks() {
    const q = query(collection(db, 'decks'), orderBy('createdAt', 'desc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  async function getDeck(id) {
    const snap = await getDoc(doc(db, 'decks', id))
    if (!snap.exists()) return null
    return { id: snap.id, ...snap.data() }
  }

  async function deleteDeck(id) {
    const deck = await getDeck(id)
    if (deck?.fileName) {
      const fileRef = storageRef(storage, deck.fileName)
      await deleteObject(fileRef).catch(() => {})
    }
    await deleteDoc(doc(db, 'decks', id))
  }

  async function getComments(deckId) {
    const q = query(collection(db, 'decks', deckId, 'comments'), orderBy('createdAt', 'asc'))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
  }

  async function addComment(deckId, { x, y, text, author }) {
    const docRef = await addDoc(collection(db, 'decks', deckId, 'comments'), {
      x,
      y,
      text,
      author: author || 'Anon',
      resolved: false,
      createdAt: new Date().toISOString()
    })
    return { id: docRef.id, x, y, text, author: author || 'Anon', resolved: false, createdAt: new Date().toISOString() }
  }

  async function resolveComment(deckId, commentId) {
    await updateDoc(doc(db, 'decks', deckId, 'comments', commentId), { resolved: true })
  }

  async function deleteComment(deckId, commentId) {
    await deleteDoc(doc(db, 'decks', deckId, 'comments', commentId))
  }

  return { uploadDeck, getDecks, getDeck, deleteDeck, getComments, addComment, resolveComment, deleteComment }
}
