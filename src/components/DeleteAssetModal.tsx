import { AlertTriangle } from "lucide-react"
import { Asset } from "../types"

interface DeleteAssetModalProps {
  asset: Asset
  onConfirm: () => void
  onClose: () => void
}

export default function DeleteAssetModal({
  asset,
  onConfirm,
  onClose,
}: DeleteAssetModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm rounded-none border border-zinc-850 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex h-12 w-12 items-center justify-center rounded-none bg-red-950/40 text-red-500 border border-red-900/50 mx-auto">
          <AlertTriangle size={20} />
        </div>
        <div className="mt-4 text-center">
          <h3 className="text-base font-bold text-white">Hapus Aset ini?</h3>
          <p className="text-xs text-zinc-500 mt-2">
            Apakah Anda yakin ingin menghapus aset{" "}
            <span className="font-semibold text-white">{asset.name}</span> (
            {asset.id})? Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
        <div className="flex justify-center gap-3 pt-6 mt-4 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="rounded-none border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="rounded-none bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 active:scale-95 transition-all"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}
