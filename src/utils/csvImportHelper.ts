import * as XLSX from "xlsx"

export interface ImportedRow {
  [key: string]: string
}

export interface ImportResult {
  success: boolean
  data?: ImportedRow[]
  headers?: string[]
  error?: string
  message?: string
}

/**
 * Simple CSV parser - manual parsing
 */
function parseCSVText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim())
  if (lines.length < 2) {
    throw new Error("CSV minimal harus memiliki header dan 1 baris data")
  }

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""))

  const rows: string[][] = lines.slice(1).map((line) => {
    const values: string[] = []
    let current = ""
    let inQuotes = false

    for (let j = 0; j < line.length; j++) {
      const char = line[j]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === "," && !inQuotes) {
        values.push(current.trim().replace(/^"|"$/g, ""))
        current = ""
      } else {
        current += char
      }
    }
    values.push(current.trim().replace(/^"|"$/g, ""))
    return values
  })

  return { headers, rows }
}

/**
 * Parse file (CSV or Excel)
 * Supports: .csv, .xlsx, .xls
 */
export async function parseFile(file: File): Promise<ImportResult> {
  try {
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith(".csv")) {
      return await parseCSV(file)
    } else if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
      return await parseExcel(file)
    } else {
      return {
        success: false,
        error: "Format file tidak didukung. Gunakan .csv, .xlsx, atau .xls",
      }
    }
  } catch (err) {
    return {
      success: false,
      error: `Gagal membaca file: ${String(err)}`,
    }
  }
}

/**
 * Parse CSV file
 */
async function parseCSV(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let text = e.target?.result as string
        if (text.startsWith("\ufeff")) text = text.substring(1)

        const { headers, rows } = parseCSVText(text)
        const data: ImportedRow[] = rows.map((row) => {
          const obj: ImportedRow = {}
          headers.forEach((header, idx) => {
            obj[header] = row[idx] || ""
          })
          return obj
        })

        console.log("✓ CSV parsed:", headers.length, "columns,", data.length, "rows")
        resolve({
          success: true,
          data,
          headers,
          message: `CSV berhasil dibaca: ${data.length} baris data`,
        })
      } catch (err) {
        resolve({
          success: false,
          error: `Error parsing CSV: ${String(err)}`,
        })
      }
    }
    reader.onerror = () => {
      resolve({ success: false, error: "Gagal membaca file" })
    }
    reader.readAsText(file, "UTF-8")
  })
}

/**
 * Parse Excel file (.xlsx, .xls)
 */
async function parseExcel(file: File): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target?.result as ArrayBuffer
        const workbook = XLSX.read(data, { type: "array" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]

        const jsonData = XLSX.utils.sheet_to_json<ImportedRow>(worksheet, {
          defval: "",
        })

        if (jsonData.length === 0) {
          resolve({
            success: false,
            error: "Sheet kosong atau tidak ada data yang dapat dibaca",
          })
          return
        }

        const headers = Object.keys(jsonData[0]).map((h) => h.trim())
        console.log("✓ Excel parsed:", headers.length, "columns,", jsonData.length, "rows")

        resolve({
          success: true,
          data: jsonData,
          headers,
          message: `Excel berhasil dibaca: ${jsonData.length} baris data dari sheet "${sheetName}"`,
        })
      } catch (err) {
        resolve({
          success: false,
          error: `Error parsing Excel: ${String(err)}`,
        })
      }
    }
    reader.onerror = () => {
      resolve({ success: false, error: "Gagal membaca file" })
    }
    reader.readAsArrayBuffer(file)
  })
}

/**
 * Find best matching header from available headers
 * Uses fuzzy matching and aliases
 */
export function findBestHeaderMatch(
  fieldKey: string,
  availableHeaders: string[],
  defaultName: string,
): string {
  if (availableHeaders.includes(defaultName)) return defaultName

  const found = availableHeaders.find(
    (h) => h.toLowerCase() === defaultName.toLowerCase(),
  )
  if (found) return found

  const lowerHeaders = availableHeaders.map((h) => h.toLowerCase())
  const aliases: Record<string, string[]> = {
    name: ["nama barang", "nama", "barang", "item", "name", "asset name"],
    category: ["kategori", "category", "tipe", "type"],
    purchaseDate: [
      "tanggal beli",
      "tanggal",
      "tgl beli",
      "date",
      "purchase date",
    ],
    price: ["harga", "price", "nilai", "cost"],
    location: ["lokasi", "location", "tempat", "posisi"],
    status: ["status", "keadaan"],
    source: ["sumber", "source", "asal"],
    description: [
      "kondisi",
      "keterangan",
      "deskripsi",
      "description",
      "condition",
    ],
  }

  const searchAliases = aliases[fieldKey] || []
  for (const alias of searchAliases) {
    const idx = lowerHeaders.findIndex(
      (lh) => lh.includes(alias) || alias.includes(lh),
    )
    if (idx !== -1) return availableHeaders[idx]
  }

  return ""
}
