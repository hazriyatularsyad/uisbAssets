import { X, Upload, Download } from "lucide-react"
import { useState, FormEvent, ChangeEvent } from "react"
import { Asset, AssetCategory, AssetStatus, AssetSource } from "../types"
import { calculateAssetCondition } from "../utils/assetHelpers"
import { generateCSVContent, downloadCSV } from "../utils/csvTemplate"

interface ImportAssetModalProps {
  onImport: (assets: Omit<Asset, "id" | "condition">[]) => void | Promise<void>
  onClose: () => void
}

interface CSVRow {
  [key: string]: string
}

const REQUIRED_COLUMNS = [
  "Nama Barang",
  "Kategori",
  "Tanggal Beli",
  "Harga",
  "Sumber",
  "Lokasi",
]

const detectDelimiter = (headerLine: string): string => {
  const commaCount = (headerLine.match(/,/g) || []).length
  const semicolonCount = (headerLine.match(/;/g) || []).length
  const tabCount = (headerLine.match(/\t/g) || []).length
  
  if (semicolonCount > commaCount && semicolonCount > tabCount) return ";"
  if (tabCount > commaCount && tabCount > semicolonCount) return "\t"
  return ","
}

export default function ImportAssetModal({
  onImport,
  onClose,
}: ImportAssetModalProps) {
  const [fileName, setFileName] = useState("")
  const [importData, setImportData] = useState<CSVRow[]>([])
  const [mappedAssets, setMappedAssets] = useState<
    Omit<Asset, "id" | "condition">[]
  >([])
  const [step, setStep] = useState<"upload" | "preview">("upload")
  const [isImporting, setIsImporting] = useState(false)
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({
    name: "Nama Barang",
    category: "Kategori",
    purchaseDate: "Tanggal Beli",
    price: "Harga",
    location: "Lokasi",
    status: "Status",
    source: "Sumber",
    description: "Kondisi",
  })
  const [availableColumns, setAvailableColumns] = useState<string[]>([])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        let text = event.target?.result as string
        // Remove UTF-8 BOM if present
        if (text.startsWith("\ufeff")) {
          text = text.substring(1)
        }
        
        const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)

        if (lines.length < 2) {
          alert("File CSV harus memiliki header dan minimal 1 baris data")
          return
        }

        const headerLine = lines[0]
        const delimiter = detectDelimiter(headerLine)
        let headers: string[] = []
        
        if (headerLine.includes('"')) {
          let current = ""
          let inQuotes = false
          for (let i = 0; i < headerLine.length; i++) {
            const char = headerLine[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === delimiter && !inQuotes) {
              headers.push(current.trim().replace(/^"|"$/g, ""))
              current = ""
            } else {
              current += char
            }
          }
          headers.push(current.trim().replace(/^"|"$/g, ""))
        } else {
          headers = headerLine.split(delimiter).map((h) => h.trim())
        }

        console.log("=== CSV PARSING ===")
        console.log("Headers found:", headers)
        console.log("Total lines:", lines.length)
        console.log("Detected delimiter:", delimiter)

        const missingColumns = REQUIRED_COLUMNS.filter(
          (reqCol) => !headers.some((h) => h.toLowerCase() === reqCol.toLowerCase()),
        )

        if (missingColumns.length > 0) {
          alert(
            `Kolom wajib tidak ditemukan:\n${missingColumns.join("\n")}\n\nKolom yang ditemukan:\n${headers.join("\n")}`,
          )
          return
        }

        setAvailableColumns(headers)

        const dataRows: CSVRow[] = lines.slice(1).map((line, lineIdx) => {
          const obj: CSVRow = {}
          let values: string[] = []
          let current = ""
          let inQuotes = false

          for (let i = 0; i < line.length; i++) {
            const char = line[i]
            if (char === '"') {
              inQuotes = !inQuotes
            } else if (char === delimiter && !inQuotes) {
              values.push(current.trim().replace(/^"|"$/g, ""))
              current = ""
            } else {
              current += char
            }
          }
          values.push(current.trim().replace(/^"|"$/g, ""))

          headers.forEach((header, idx) => {
            obj[header] = values[idx] || ""
          })
          
          if (lineIdx < 2) {
            console.log(`Row ${lineIdx + 1}:`, obj)
          }
          
          return obj
        })

        setImportData(dataRows)

        // Set mapping dengan fuzzy/case-insensitive matching
        const findBestHeaderMatch = (fieldKey: string, defaultName: string) => {
          if (headers.includes(defaultName)) return defaultName
          
          const found = headers.find((h) => h.toLowerCase() === defaultName.toLowerCase())
          if (found) return found
          
          const lowerHeaders = headers.map((h) => h.toLowerCase())
          const aliases: Record<string, string[]> = {
            name: ["nama barang", "nama", "barang", "item", "name", "asset name"],
            category: ["kategori", "category", "tipe", "type"],
            purchaseDate: ["tanggal beli", "tanggal", "tgl beli", "date", "purchase date"],
            price: ["harga", "price", "nilai", "cost"],
            location: ["lokasi", "location", "tempat", "posisi"],
            status: ["status", "keadaan"],
            source: ["sumber", "source", "asal"],
            description: ["kondisi", "keterangan", "deskripsi", "description", "condition"],
          }
          
          const searchAliases = aliases[fieldKey] || []
          for (const alias of searchAliases) {
            const idx = lowerHeaders.findIndex((lh) => lh.includes(alias) || alias.includes(lh))
            if (idx !== -1) return headers[idx]
          }
          
          return ""
        }

        const autoMapping: Record<string, string> = {
          name: findBestHeaderMatch("name", "Nama Barang"),
          category: findBestHeaderMatch("category", "Kategori"),
          purchaseDate: findBestHeaderMatch("purchaseDate", "Tanggal Beli"),
          price: findBestHeaderMatch("price", "Harga"),
          location: findBestHeaderMatch("location", "Lokasi"),
          status: findBestHeaderMatch("status", "Status"),
          source: findBestHeaderMatch("source", "Sumber"),
          description: findBestHeaderMatch("description", "Kondisi"),
        }

        console.log("File parsed successfully:")
        console.log("- Headers:", headers)
        console.log("- Data rows:", dataRows.length)
        console.log("- First row:", dataRows[0])
        console.log("- Mapping:", autoMapping)

        setColumnMapping(autoMapping)
        setStep("preview")
      } catch (err) {
        alert("Gagal membaca file CSV: " + String(err))
      }
    }

    reader.readAsText(file)
  }

  const mapRowToAsset = (row: CSVRow): Omit<Asset, "id" | "condition"> | null => {
    const getName = () => {
      const val = row[columnMapping.name]
      return val ? val.trim() : ""
    }
    const getCategory = () => {
      const val = (row[columnMapping.category] || "Lainnya").trim()
      const categories: AssetCategory[] = [
        "Peralatan IT",
        "Furnitur",
        "Alat Tulis Kantor",
        "Kendaraan",
        "Lainnya",
      ]
      return (
        categories.find((c) => c.toLowerCase() === val.toLowerCase()) ||
        categories.find((c) => c.toLowerCase().includes(val.toLowerCase())) ||
        "Lainnya"
      )
    }
    const getPurchaseDate = () => {
      const val = row[columnMapping.purchaseDate]
      if (!val || !val.trim()) return new Date().toISOString().split("T")[0]
      const parsed = new Date(val.trim())
      return isNaN(parsed.getTime())
        ? new Date().toISOString().split("T")[0]
        : parsed.toISOString().split("T")[0]
    }
    const getPrice = () => {
      const val = (row[columnMapping.price] || "0").trim()
      return parseInt(val.replace(/[^\d]/g, "")) || 0
    }
    const getLocation = () => {
      const val = row[columnMapping.location]
      return val ? val.trim() : ""
    }
    const getStatus = () => {
      const val = (row[columnMapping.status] || "Tersedia").trim()
      const statuses: AssetStatus[] = ["Tersedia", "Digunakan", "Rusak"]
      return (
        statuses.find((s) => s.toLowerCase() === val.toLowerCase()) ||
        statuses.find((s) => s.toLowerCase().includes(val.toLowerCase())) ||
        "Tersedia"
      )
    }
    const getSource = () => {
      const val = (row[columnMapping.source] || "Hibah").trim()
      const sources: AssetSource[] = ["Hibah", "Yayasan", "Pemerintah"]
      return (
        sources.find((s) => s.toLowerCase() === val.toLowerCase()) ||
        sources.find((s) => s.toLowerCase().includes(val.toLowerCase())) ||
        "Hibah"
      )
    }
    const getDescription = () => {
      const val = row[columnMapping.description]
      return val ? val.trim() : ""
    }

    const name = getName()
    const location = getLocation()

    if (!name || !location) {
      console.log(`REJECTED - name: "${name}", location: "${location}"`)
      console.log("Row data:", row)
      console.log("Mapping:", columnMapping)
      console.log("Available keys in row:", Object.keys(row))
      return null
    }

    return {
      name,
      category: getCategory(),
      purchaseDate: getPurchaseDate(),
      price: getPrice(),
      location,
      status: getStatus(),
      source: getSource(),
      description: getDescription(),
    }
  }

  const handlePreview = () => {
    if (importData.length === 0) {
      alert("Tidak ada data yang dimuat")
      return
    }

    console.log("=== PREVIEW DEBUG ===")
    console.log("Import data length:", importData.length)
    console.log("Column mapping:", columnMapping)
    console.log("First 3 rows:", importData.slice(0, 3))

    const assets = importData
      .map((row, idx) => {
        const asset = mapRowToAsset(row)
        console.log(`Row ${idx}:`, asset ? "✓ VALID" : "✗ REJECTED", row)
        return asset
      })
      .filter((a) => a !== null) as Omit<Asset, "id" | "condition">[]

    console.log("Valid assets:", assets.length)

    if (assets.length === 0) {
      const sampleRow = importData[0]
      const debugInfo = `Debug Info:\n\nData dimuat: ${importData.length} baris\n\nSample row:\n${JSON.stringify(sampleRow, null, 2)}\n\nColumn mapping:\n${JSON.stringify(columnMapping, null, 2)}\n\nChecking name: "${sampleRow[columnMapping.name] || "EMPTY"}"\nChecking location: "${sampleRow[columnMapping.location] || "EMPTY"}"`

      alert(
        `Tidak ada data yang valid untuk diimport.\n\n${debugInfo}`,
      )
      return
    }

    setMappedAssets(assets)
  }

  const handleImport = async (e: FormEvent) => {
    e.preventDefault()
    if (mappedAssets.length === 0) {
      alert("Tidak ada aset untuk diimport")
      return
    }

    setIsImporting(true)
    try {
      await onImport(mappedAssets)
      onClose()
    } catch (err) {
      alert("Gagal mengimport aset: " + String(err))
    } finally {
      setIsImporting(false)
    }
  }

  const labelClass =
    "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
  const inputClass =
    "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => !isImporting && onClose()}
      />
      <div className="relative w-full max-w-3xl rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          disabled={isImporting}
          className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X size={16} />
        </button>

        <h3 className="text-lg font-bold text-white tracking-tight mb-4">
          Import Aset dari Excel/CSV
        </h3>

        {step === "upload" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handlePreview()
            }}
            className="space-y-4"
          >
            <div>
              <label className={labelClass}>Pilih File CSV/Excel *</label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  required
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => {
                    const content = generateCSVContent(true)
                    downloadCSV(content, "template-aset-sample.csv")
                  }}
                  title="Download template CSV dengan contoh data"
                  className="flex-shrink-0 rounded-none border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer whitespace-nowrap"
                >
                  <Download size={16} />
                </button>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Format: CSV atau Excel. Kolom wajib: Nama Barang, Kategori, Tanggal Beli, Harga, Sumber, Lokasi
              </p>
            </div>

            {fileName && importData.length > 0 && (
              <div className="rounded-none border border-zinc-800 bg-zinc-900/40 p-4">
                <p className="text-sm text-zinc-300 mb-3">
                  <strong>{fileName}</strong> - {importData.length} baris data
                </p>

                <div className="space-y-3">
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Mapping Kolom
                  </p>
                  {Object.entries(columnMapping).map(([field, header]) => (
                    <div key={field}>
                      <label className="text-[10px] text-zinc-500 uppercase tracking-wider">
                        {field}
                      </label>
                      <select
                        value={header}
                        onChange={(e) =>
                          setColumnMapping((prev) => ({
                            ...prev,
                            [field]: e.target.value,
                          }))
                        }
                        className={inputClass}
                      >
                        <option value="">-- Tidak Ada --</option>
                        {availableColumns.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={importData.length === 0}
                className="flex-1 rounded-none border border-zinc-800 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Lanjut ke Preview
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleImport} className="space-y-4">
            <div className="rounded-none border border-zinc-800 bg-zinc-900/40 p-4">
              <p className="text-sm text-zinc-300 mb-3">
                Preview {mappedAssets.length} aset yang akan diimport:
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      <th className="p-2 text-left">Nama Barang</th>
                      <th className="p-2 text-left">Kategori</th>
                      <th className="p-2 text-left">Tanggal Beli</th>
                      <th className="p-2 text-right">Harga</th>
                      <th className="p-2 text-left">Sumber</th>
                      <th className="p-2 text-left">Lokasi</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Kondisi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {mappedAssets.slice(0, 5).map((asset, idx) => (
                      <tr key={idx} className="hover:bg-zinc-900/20">
                        <td className="p-2 text-zinc-300">{asset.name}</td>
                        <td className="p-2 text-zinc-400">{asset.category}</td>
                        <td className="p-2 text-zinc-400">{asset.purchaseDate}</td>
                        <td className="p-2 text-right font-mono text-zinc-300">
                          {asset.price.toLocaleString("id-ID")}
                        </td>
                        <td className="p-2 text-zinc-400">{asset.source}</td>
                        <td className="p-2 text-zinc-400">{asset.location}</td>
                        <td className="p-2 text-zinc-400">{asset.status}</td>
                        <td className="p-2 text-zinc-400">{asset.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {mappedAssets.length > 5 && (
                <p className="text-[10px] text-zinc-500 mt-2">
                  ... dan {mappedAssets.length - 5} aset lainnya
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                disabled={isImporting}
                onClick={() => {
                  setStep("upload")
                  setMappedAssets([])
                }}
                className="flex-1 rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Kembali
              </button>
              <button
                type="submit"
                disabled={isImporting}
                className="flex-1 flex items-center justify-center gap-2 rounded-none border border-zinc-800 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? (
                  <>
                    <span className="h-3 w-3 animate-spin rounded-full border border-zinc-950 border-t-transparent" />
                    Sedang Mengimport...
                  </>
                ) : (
                  <>
                    <Upload size={14} />
                    Import {mappedAssets.length} Aset
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
