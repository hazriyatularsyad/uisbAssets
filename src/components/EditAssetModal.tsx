import { X } from "lucide-react"
import { useState, FormEvent, useRef, useEffect } from "react"
import { Asset, AssetCategory, AssetStatus, AssetSource } from "../types"
import { calculateAssetCondition } from "../utils/assetHelpers"

const CATEGORIES: AssetCategory[] = [
  "Peralatan IT",
  "Furnitur",
  "Alat Tulis Kantor",
  "Kendaraan",
  "Lainnya",
]
const SOURCES: AssetSource[] = ["Hibah", "Yayasan", "Pemerintah"]
const inputClass =
  "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
const labelClass =
  "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"

interface EditAssetModalProps {
  asset: Asset
  onEdit: (asset: Asset, receiptFiles?: File[]) => void
  onClose: () => void
}

export default function EditAssetModal({
  asset,
  onEdit,
  onClose,
}: EditAssetModalProps) {
  const [formName, setFormName] = useState(asset.name)
  const [formCategory, setFormCategory] = useState<AssetCategory>(
    asset.category,
  )
  const [formPurchaseDate, setFormPurchaseDate] = useState(asset.purchaseDate)
  const [formPrice, setFormPrice] = useState<number>(asset.price)
  const [formLocation, setFormLocation] = useState(asset.location)
  const [formStatus, setFormStatus] = useState<AssetStatus>(asset.status)
  const [formSource, setFormSource] = useState<AssetSource>(
    asset.source || "Hibah",
  )
  const [formDescription, setFormDescription] = useState(
    asset.description || "",
  )
  const [formCondition, setFormCondition] = useState<number>(asset.condition)
  const [receiptFiles, setReceiptFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [existingImages, setExistingImages] = useState<string[]>(
    asset.images || [],
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newFiles = Array.from(files)
      const validFiles = newFiles.filter((file) =>
        file.type.startsWith("image/"),
      )

      if (validFiles.length > 0) {
        setReceiptFiles((prev) => [...prev, ...validFiles])

        const previews = validFiles.map((file) => URL.createObjectURL(file))
        setImagePreviews((prev) => [...prev, ...previews])
      }
    }
  }

  const removeFile = (index: number) => {
    const newFiles = [...receiptFiles]
    newFiles.splice(index, 1)
    setReceiptFiles(newFiles)

    const preview = imagePreviews[index]
    if (preview) URL.revokeObjectURL(preview)

    const newPreviews = [...imagePreviews]
    newPreviews.splice(index, 1)
    setImagePreviews(newPreviews)
  }

  const removeExistingImage = (index: number) => {
    const newImages = [...existingImages]
    newImages.splice(index, 1)
    setExistingImages(newImages)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formLocation.trim() || !formPurchaseDate) {
      alert("Harap isi semua kolom wajib!")
      return
    }
    onEdit(
      {
        ...asset,
        name: formName,
        category: formCategory,
        purchaseDate: formPurchaseDate,
        price: Number(formPrice),
        location: formLocation,
        status: formStatus,
        source: formSource,
        condition: formCondition,
        description: formDescription,
        images: existingImages,
      },
      receiptFiles.length > 0 ? receiptFiles : undefined,
    )
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl flex flex-col my-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 cursor-pointer hover:text-white"
        >
          <X size={16} />
        </button>
        <h3 className="text-lg font-bold text-white tracking-tight">
          Edit Aset:{" "}
          <span className="text-zinc-400 font-mono text-sm">{asset.id}</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Ubah rincian informasi aset kantor di bawah ini.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
            <div>
              <label className={labelClass}>Kondisi (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={formCondition}
                onChange={(e) => setFormCondition(Number(e.target.value))}
                className={`${inputClass} font-mono`}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Tanggal Beli</label>
              <input
                type="date"
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
                min={0}
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
            <label className={labelClass}>
              Perbarui Bukti Pembelian (gambar)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              className={inputClass}
            />
            <p className="text-[10px] text-zinc-500 mt-1">
              Anda dapat memilih beberapa gambar sekaligus
            </p>

            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover border border-zinc-800"
                    />
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 bg-red-600 cursor-pointer text-white rounded-none p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[9px] px-1 py-0.5 truncate">
                      {receiptFiles[index]?.name}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {asset.images && asset.images.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-zinc-500 mb-2 uppercase tracking-wider">
                  Gambar Saat Ini
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {asset.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img}
                        alt={`Existing ${index + 1}`}
                        className="w-full h-24 object-cover border border-zinc-800"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute top-1 right-1 bg-red-600 text-white cursor-pointer rounded-none p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 mt-auto border-t border-zinc-900 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="rounded-none border border-zinc-850 px-4 py-2 text-xs cursor-pointer font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-none bg-white px-4 py-2 text-xs font-bold text-black cursor-pointer hover:bg-zinc-200"
            >
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
