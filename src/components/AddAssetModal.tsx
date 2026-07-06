import { X } from "lucide-react"
import { useState, FormEvent, ChangeEvent } from "react"
import { Asset, AssetCategory, AssetStatus, AssetSource } from "../types"

const CATEGORIES: AssetCategory[] = [
  "Peralatan IT",
  "Furnitur",
  "Alat Tulis Kantor",
  "Lainnya",
]
const SOURCES: AssetSource[] = ["Hibah", "Yayasan", "Pemerintah"]
const inputClass =
  "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
const labelClass =
  "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"

interface AddAssetModalProps {
  onAdd: (
    asset: Omit<Asset, "id" | "condition">,
    receiptFiles?: File[] | null,
  ) => void
  onClose: () => void
}

export default function AddAssetModal({ onAdd, onClose }: AddAssetModalProps) {
  const [formName, setFormName] = useState("")
  const [formCategory, setFormCategory] =
    useState<AssetCategory>("Peralatan IT")
  const [formPurchaseDate, setFormPurchaseDate] = useState(
    new Date().toISOString().split("T")[0],
  )
  const [formPrice, setFormPrice] = useState<number>(0)
  const [formLocation, setFormLocation] = useState("")
  const [formStatus, setFormStatus] = useState<AssetStatus>("Tersedia")
  const [formSource, setFormSource] = useState<AssetSource>("Hibah")
  const [formDescription, setFormDescription] = useState("")
  const [receiptFiles, setReceiptFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter((file) => file.type.startsWith("image/"))

    if (validFiles.length === 0) return

    setReceiptFiles((prev) => [...prev, ...validFiles])
    setImagePreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => URL.createObjectURL(file)),
    ])
  }

  const removeFile = (index: number) => {
    const preview = imagePreviews[index]
    if (preview) URL.revokeObjectURL(preview)

    const newFiles = [...receiptFiles]
    newFiles.splice(index, 1)
    setReceiptFiles(newFiles)

    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formLocation.trim() || !formPurchaseDate) {
      alert("Harap isi semua kolom wajib!")
      return
    }
    onAdd(
      {
        name: formName,
        category: formCategory,
        purchaseDate: formPurchaseDate,
        price: Number(formPrice),
        location: formLocation,
        status: formStatus,
        source: formSource,
        description: formDescription,
      },
      receiptFiles.length > 0 ? receiptFiles : null,
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 mt-70">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Tambah Aset Baru
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Sistem akan menghitung kondisi aset secara otomatis berdasarkan
          tanggal beli.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className={labelClass}>Nama Barang *</label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Kategori</label>
              <select
                value={formCategory}
                onChange={(e) =>
                  setFormCategory(e.target.value as AssetCategory)
                }
                className={inputClass}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                className={inputClass}
                
              >
                <option value="Tersedia">Tersedia</option>
                <option value="Digunakan">Digunakan</option>
                <option value="Rusak">Rusak</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tanggal Beli *</label>
              <input
                type="date"
                required
                value={formPurchaseDate}
                onChange={(e) => setFormPurchaseDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Harga (IDR) *</label>
              <input
                type="number"
                required
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Sumber Dana</label>
              <select
                value={formSource}
                onChange={(e) => setFormSource(e.target.value as AssetSource)}
                className={inputClass}
              >
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                Lokasi Ruang / Penanggung Jawab *
              </label>
              <input
                type="text"
                required
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Keterangan / Spesifikasi</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div>
            <label className={labelClass}>Input Foto Asset & Receipt *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={handleFileChange}
              className={inputClass}
            />
            <p className="mt-1 text-[10px] text-zinc-500">
              Anda dapat memilih beberapa gambar sekaligus.
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="h-24 w-full object-cover border border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute right-1 top-1 rounded-none bg-red-600 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 truncate bg-black/60 px-1 py-0.5 text-[9px] text-white">
                      {receiptFiles[index]?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-none bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200"
            >
              Simpan Aset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
