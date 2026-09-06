import { openDB } from 'idb'
import { EVIDENCE_DB_NAME } from './session'

/** 与向导侧（engine/session）同版本同结构建库，否则抢先建出无 store 的空库会让向导侧事务报错 */
async function openEvidenceDB() {
  return openDB(EVIDENCE_DB_NAME, 1, {
    upgrade(d) {
      d.createObjectStore('evidence')
    },
  })
}

/** 读取 IndexedDB 中已存佐证文件的键集合（key = itemRef）。失败时返回空集，按“未传”显示。 */
export async function loadEvidenceKeys(): Promise<Set<string>> {
  try {
    const db = await openEvidenceDB()
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

export interface EvidenceFile {
  key: string // itemRef（模块/章节/条目#序号）
  blob: Blob
  name: string
  size: number
  type: string
}

/** 读取全部佐证文件（含内容），供分类清单与打包下载用；失败返回空数组 */
export async function loadEvidenceFiles(): Promise<EvidenceFile[]> {
  try {
    const db = await openEvidenceDB()
    if (!db.objectStoreNames.contains('evidence')) {
      db.close()
      return []
    }
    const keys = (await db.getAllKeys('evidence')).map(String)
    const blobs = (await db.getAll('evidence')) as Blob[]
    db.close()
    return keys
      .map((key, i) => {
        const blob = blobs[i]
        if (!blob) return null
        // IndexedDB 结构化克隆保留 File 的 name/type；非 File 的 Blob 退化为通用文件名
        const name = 'name' in blob && typeof (blob as File).name === 'string' ? (blob as File).name : '佐证文件'
        return { key, blob, name, size: blob.size, type: blob.type }
      })
      .filter((x): x is EvidenceFile => x !== null)
  } catch {
    return []
  }
}
