import { openDB } from 'idb'
import { EVIDENCE_DB_NAME } from './session'

/** 读取 IndexedDB 中已存佐证图片的键集合（key = itemRef）。失败时返回空集，按“未传”显示。 */
export async function loadEvidenceKeys(): Promise<Set<string>> {
  try {
    const db = await openDB(EVIDENCE_DB_NAME)
    const stores = Array.from(db.objectStoreNames)
    if (stores.length === 0) {
      db.close()
      return new Set()
    }
    const keys = await db.getAllKeys(stores[0])
    db.close()
    return new Set(keys.map(String))
  } catch {
    return new Set()
  }
}
