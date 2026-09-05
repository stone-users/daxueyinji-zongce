import { openDB } from 'idb'
import { EVIDENCE_DB_NAME } from './session'

/** 读取 IndexedDB 中已存佐证文件的键集合（key = itemRef）。失败时返回空集，按“未传”显示。 */
export async function loadEvidenceKeys(): Promise<Set<string>> {
  try {
    // 必须与向导侧（engine/session）同版本同结构建库，否则抢先建出无 store 的空库会让向导侧事务报错
    const db = await openDB(EVIDENCE_DB_NAME, 1, {
      upgrade(d) {
        d.createObjectStore('evidence')
      },
    })
    if (!db.objectStoreNames.contains('evidence')) {
      db.close()
      return new Set()
    }
    const keys = await db.getAllKeys('evidence')
    db.close()
    return new Set(keys.map(String))
  } catch {
    return new Set()
  }
}
