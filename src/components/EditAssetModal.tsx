import { X } from "lucide-react"
import { useState, FormEvent } from "react"
import { Asset, AssetCategory, AssetStatus } from "../types"
import { calculateAssetCondition } from "../utils/assetHelpers"

const CATEGORIES: AssetCategory[] = [
  "Peralatan IT",
  "Furnitur",
  "Alat Tulis Kantor",
]
const inputClass =
  "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
const labelClass =
  "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"

interface EditAssetModalProps {
  asset: Asset
  onEdit: (asset: Asset) => void
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
  const [formDescription, setFormDescription] = useState(
    asset.description || "",
  )

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formLocation.trim() || !formPurchaseDate) {
      alert("Harap isi semua kolom wajib!")
      return
    }
    const computedCondition = calculateAssetCondition(
      formPurchaseDate,
      formCategory,
    )
    onEdit({
      ...asset,
      name: formName,
      category: formCategory,
      purchaseDate: formPurchaseDate,
      price: Number(formPrice),
      location: formLocation,
      status: formStatus,
      condition: computedCondition,
      description: formDescription,
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
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
          Edit Aset:{" "}
          <span className="text-zinc-400 font-mono text-sm">{asset.id}</span>
        </h3>
        <p className="text-xs text-zinc-500 mt-1">
          Ubah rincian informasi aset kantor di bawah ini.
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
                min={0}
                value={formPrice}
                onChange={(e) => setFormPrice(Number(e.target.value))}
                className={`${inputClass} font-mono`}
              />
            </div>
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
          <div>
            <label className={labelClass}>Keterangan / Spesifikasi</label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              className={`${inputClass} resize-none`}
            />
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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
