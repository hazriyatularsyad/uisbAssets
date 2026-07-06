import { X, Plus, Check } from "lucide-react"
import { useState, FormEvent } from "react"
import { Asset, AssetLoan } from "../types"
import { formatDateID } from "../utils/assetHelpers"

interface AssetTrackingProps {
  assets: Asset[]
}

export default function AssetTracking({ assets }: AssetTrackingProps) {
  const [loans, setLoans] = useState<AssetLoan[]>(() => {
    const saved = localStorage.getItem("assetgrid_loans")
    return saved ? JSON.parse(saved) : []
  })

  const [showAddModal, setShowAddModal] = useState(false)
  const [formAssetId, setFormAssetId] = useState("")
  const [formBorrowerName, setFormBorrowerName] = useState("")
  const [formBorrowDate, setFormBorrowDate] = useState(
    new Date().toISOString().split("T")[0],
  )
  const [formLoanLocation, setFormLoanLocation] = useState("")
  const [formNotes, setFormNotes] = useState("")
  const [returnConfirmId, setReturnConfirmId] = useState<string | null>(null)

  const activeLloans = loans.filter((l) => !l.returnedAt)
  const returnedLoans = loans.filter((l) => l.returnedAt)

  const getAssetName = (assetId: string) => {
    return assets.find((a) => a.id === assetId)?.name || assetId
  }

  const handleAddLoan = (e: FormEvent) => {
    e.preventDefault()

    if (!formAssetId || !formBorrowerName || !formLoanLocation) {
      alert("Harap isi semua kolom wajib!")
      return
    }

    const newLoan: AssetLoan = {
      id: `LOAN-${Date.now()}`,
      assetId: formAssetId,
      assetName: getAssetName(formAssetId),
      borrowerName: formBorrowerName,
      borrowDate: formBorrowDate,
      loanLocation: formLoanLocation,
      notes: formNotes || undefined,
      returnedAt: null,
    }

    const updated = [newLoan, ...loans]
    setLoans(updated)
    localStorage.setItem("assetgrid_loans", JSON.stringify(updated))

    // Reset form
    setFormAssetId("")
    setFormBorrowerName("")
    setFormBorrowDate(new Date().toISOString().split("T")[0])
    setFormLoanLocation("")
    setFormNotes("")
    setShowAddModal(false)
  }

  const handleReturnAsset = (loanId: string) => {
    const updated = loans.map((l) =>
      l.id === loanId ? { ...l, returnedAt: new Date().toISOString() } : l,
    )
    setLoans(updated)
    localStorage.setItem("assetgrid_loans", JSON.stringify(updated))
    setReturnConfirmId(null)
  }

  const labelClass =
    "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
  const inputClass =
    "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Tracking Aset
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Pantau aset yang sedang dipinjam dan lokasi terkini
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800 transition cursor-pointer"
        >
          <Plus size={16} />
          Tambah Peminjaman
        </button>
      </div>

      {/* Add Loan Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative w-full max-w-lg rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-lg font-bold text-white tracking-tight mb-4">
              Tambah Peminjaman Aset
            </h3>

            <form onSubmit={handleAddLoan} className="space-y-4">
              <div>
                <label className={labelClass}>Pilih Aset *</label>
                <select
                  required
                  value={formAssetId}
                  onChange={(e) => setFormAssetId(e.target.value)}
                  className={inputClass}
                >
                  <option value="">-- Pilih Aset --</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} ({asset.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>Nama Peminjam *</label>
                <input
                  type="text"
                  required
                  value={formBorrowerName}
                  onChange={(e) => setFormBorrowerName(e.target.value)}
                  className={inputClass}
                  placeholder="Nama orang yang meminjam"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Tanggal Pinjam *</label>
                  <input
                    type="date"
                    required
                    value={formBorrowDate}
                    onChange={(e) => setFormBorrowDate(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Lokasi Peminjaman *</label>
                  <input
                    type="text"
                    required
                    value={formLoanLocation}
                    onChange={(e) => setFormLoanLocation(e.target.value)}
                    className={inputClass}
                    placeholder="Ruang atau lokasi"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Catatan</label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className={`${inputClass} resize-none`}
                  placeholder="Catatan tambahan (opsional)"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 rounded-none border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-zinc-300 hover:bg-zinc-800 hover:text-white transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-none border border-zinc-800 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-950 hover:bg-zinc-100 transition cursor-pointer"
                >
                  Tambah
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Loans */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4 tracking-tight">
          Aset Sedang Dipinjam ({activeLloans.length})
        </h3>
        {activeLloans.length === 0 ? (
          <div className="rounded-none border border-zinc-800 bg-zinc-900/40 p-8 text-center text-zinc-500">
            Tidak ada aset yang sedang dipinjam
          </div>
        ) : (
          <div className="grid gap-4">
            {activeLloans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-none border border-zinc-800 bg-zinc-900/40 p-4 space-y-3"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-base">
                      {loan.assetName}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {loan.assetId}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-blue-950/40 text-blue-400 border border-blue-900/50 rounded-none">
                    Dipinjam
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                      Nama Peminjam
                    </p>
                    <p className="text-zinc-300">{loan.borrowerName}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                      Tanggal Pinjam
                    </p>
                    <p className="text-zinc-300">
                      {formatDateID(loan.borrowDate)}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                      Lokasi Saat Ini
                    </p>
                    <p className="text-zinc-300">{loan.loanLocation}</p>
                  </div>
                  {loan.notes && (
                    <div className="col-span-2">
                      <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-1">
                        Kebutuhan
                      </p>
                      <p className="text-zinc-300">{loan.notes}</p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-800">
                  <button
                    onClick={() => setReturnConfirmId(loan.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-none border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-900/50 transition cursor-pointer"
                  >
                    <Check size={14} />
                    Kembalikan
                  </button>
                </div>

                {returnConfirmId === loan.id && (
                  <div className="rounded-none border border-emerald-900/50 bg-emerald-950/20 p-3 space-y-2">
                    <p className="text-sm text-emerald-300">
                      Konfirmasi pengembalian aset?
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setReturnConfirmId(null)}
                        className="flex-1 py-2 text-xs font-semibold rounded-none border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 transition cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        onClick={() => handleReturnAsset(loan.id)}
                        className="flex-1 py-2 text-xs font-semibold rounded-none border border-emerald-800 bg-emerald-950/40 text-emerald-300 hover:bg-emerald-950/60 transition cursor-pointer"
                      >
                        Konfirmasi
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
