import { listAll, ref } from "firebase/storage";
import { getFirebaseApp } from "~/mechanics/firebase/init";

export async function fetchSchematics(): Promise<string[]> {
  const { storage } = getFirebaseApp()

  const storageRef = ref(storage, 'planet_schematics')
    
  const res = await listAll(storageRef)
   
  return res.items.map(item => item.name)
}