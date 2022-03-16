import { getDownloadURL, listAll, ref } from "firebase/storage";
import { getFirebaseApp } from "~/mechanics/firebase/init";

export async function fetchSchematics(): Promise<string[]> {
  const { storage } = getFirebaseApp()

  const storageRef = ref(storage, 'planet_schematics')
    
  const res = await listAll(storageRef)
   
  return res.items.map(item => item.name)
}


export async function loadSchematic(filename: string): Promise<string> {
  const fileRef = ref(getFirebaseApp().storage, `planet_schematics/${filename}`)

  const url = await getDownloadURL(fileRef)
  const req = await fetch(url)
  const data = await req.json()

  return JSON.stringify(data)
}
