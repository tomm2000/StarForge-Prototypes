import { getDownloadURL, listAll, ref } from "firebase/storage";
import { getFirebaseApp } from "~/mechanics/firebase/init";

/** loads the available materials and returns a list of them */
export async function fetchMaterials(): Promise<string[]> {
  const { storage } = getFirebaseApp()

  const storageRef = ref(storage, 'planet_materials')
    
  const res = await listAll(storageRef)
   
  return res.items.map(item => item.name)
}

/** returns the url for the given material */
export async function getMaterialUrl(filename: string): Promise<string> {
  const fileRef = ref(getFirebaseApp().storage, `planet_materials/${filename}`)

  const url = await getDownloadURL(fileRef)

  return url
}

/** loads the given material, return a json string of such material */
export async function loadMaterial(filename: string): Promise<string> {
  const fileRef = ref(getFirebaseApp().storage, `planet_materials/${filename}`)

  const url = await getDownloadURL(fileRef)
  const req = await fetch(url)
  const data = await req.json()

  return JSON.stringify(data)
}
