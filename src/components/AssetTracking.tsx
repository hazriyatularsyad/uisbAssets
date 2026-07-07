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
  const [returnedBy, setReturnedBy] = useState("")
  const [receivedBy, setReceivedBy] = useState("")
  const [returnDate, setReturnDate] = useState(
    new Date().toISOString().split("T")[0],
  )

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
    if (!returnedBy || !receivedBy || !returnDate) {
      alert("Harap isi semua kolom wajib!")
      return
    }

    const updated = loans.map((l) =>
      l.id === loanId
        ? {
            ...l,
            returnedAt: new Date().toISOString(),
            returnedBy,
            receivedBy,
            returnDate,
          }
        : l,
    )
    setLoans(updated)
    localStorage.setItem("assetgrid_loans", JSON.stringify(updated))
    setReturnConfirmId(null)
    setReturnedBy("")
    setReceivedBy("")
    setReturnDate(new Date().toISOString().split("T")[0])
  }

  const labelClass =
    "block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5"
  const inputClass =
    "w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"

  return (
    <div className="space-y-6">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <h2 className="text-lg md:text-2xl font-bold text-white tracking-tight">
          Tracking Aset
        </h2>
        <p className="text-xs md:text-sm text-zinc-500 mt-1">
          Kelola peminjaman dan pengembalian aset
        </p>
      </div>
      <button
        onClick={() => setShowAddModal(true)}
        className="w-full md:w-auto flex items-center justify-center gap-2 px-3 md:px-4 py-2.5 text-xs md:text-sm font-semibold rounded-none border border-zinc-800 bg-white text-zinc-950 hover:bg-zinc-100 transition cursor-pointer"
      >
        <Plus size={16} />
        Tambah Pinjaman
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
        <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 tracking-tight">
          Aset Sedang Dipinjam ({activeLloans.length})
        </h3>
        {activeLloans.length === 0 ? (
          <div className="rounded-none border border-zinc-800 bg-zinc-900/40 p-4 md:p-8 text-center text-zinc-500 text-xs md:text-sm">
            Tidak ada aset yang sedang dipinjam
          </div>
        ) : (
          <div className="grid gap-2 md:gap-4">
            {activeLloans.map((loan) => (
              <div
                key={loan.id}
                className="rounded-none border border-zinc-800 bg-zinc-900/40 p-3 md:p-4 space-y-2 md:space-y-3"
              >
                <div className="flex items-start justify-between gap-2 md:gap-4">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-white text-sm md:text-base truncate">
                      {loan.assetName}
                    </h4>
                    <p className="text-[10px] text-zinc-500 font-mono">
                      {loan.assetId}
                    </p>
                  </div>
                  <span className="inline-flex flex-shrink-0 items-center px-2 md:px-2.5 py-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wider bg-blue-950/40 text-blue-400 border border-blue-900/50 rounded-none whitespace-nowrap">
                    Dipinjam
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                  <div>
                    <p className="text-[9px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5 md:mb-1">
                      Nama Peminjam
                    </p>
                    <p className="text-zinc-300 text-xs md:text-sm">{loan.borrowerName}</p>
                  </div>
                  <div>
                    <p className="text-[9px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5 md:mb-1">
                      Tanggal Pinjam
                    </p>
                    <p className="text-zinc-300 text-xs md:text-sm">
                      {formatDateID(loan.borrowDate)}
                    </p>
                  </div>
                  {loan.notes && (
                    <div className="col-span-2">
                      <p className="text-[9px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5 md:mb-1">
                        Kebutuhan
                      </p>
                      <p className="text-zinc-300 text-xs md:text-sm">{loan.notes}</p>
                    </div>
                  )}
                  <div className="col-span-2">
                    <p className="text-[9px] md:text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5 md:mb-1">
                      Lokasi Saat Ini
                    </p>
                    <p className="text-zinc-300 text-xs md:text-sm">{loan.loanLocation}</p>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 md:pt-3 border-t border-zinc-800">
                  <button
                    onClick={() => setReturnConfirmId(loan.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-none border border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-900/50 transition cursor-pointer"
                  >
                    <Check size={14} />
                    Kembalikan
                  </button>
                </div>

                {returnConfirmId === loan.id && (
                  <div className="rounded-none border border-emerald-900/50 bg-emerald-950/20 p-3 space-y-3">
                    <p className="text-sm text-emerald-300 font-semibold">
                      Konfirmasi Pengembalian Aset
                    </p>
                    
                    <div>
                      <label className={labelClass}>Nama yang Mengembalikan *</label>
                      <input
                        type="text"
                        required
                        value={returnedBy}
                        onChange={(e) => setReturnedBy(e.target.value)}
                        className={inputClass}
                        placeholder="Nama orang yang mengembalikan aset"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Nama Penerima *</label>
                      <input
                        type="text"
                        required
                        value={receivedBy}
                        onChange={(e) => setReceivedBy(e.target.value)}
                        className={inputClass}
                        placeholder="Nama orang yang menerima pengembalian"
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Tanggal Pengembalian *</label>
                      <input
                        type="date"
                        required
                        value={returnDate}
                        onChange={(e) => setReturnDate(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => {
                          setReturnConfirmId(null)
                          setReturnedBy("")
                          setReceivedBy("")
                          setReturnDate(new Date().toISOString().split("T")[0])
                        }}
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

      {/* Returned Loans History */}
      {returnedLoans.length > 0 && (
        <div>
          <h3 className="text-base md:text-lg font-semibold text-white mb-3 md:mb-4 tracking-tight">
            Riwayat Pengembalian ({returnedLoans.length})
          </h3>
          <div className="space-y-2 md:space-y-3">
            {returnedLoans.map((loan, idx) => (
              <div
                key={loan.id}
                className="rounded-none border border-zinc-800 bg-zinc-900/20 p-2 md:p-3 lg:p-4"
              >
                {/* Header dengan Nomor & Status */}
                <div className="flex items-center justify-between gap-2 mb-2 md:mb-3">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-none bg-zinc-800 text-zinc-300 text-[9px] md:text-[10px] font-bold flex-shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-xs md:text-sm truncate">{loan.assetName}</p>
                      <p className="text-[8px] md:text-[9px] text-zinc-500 font-mono truncate">{loan.assetId}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 md:px-2.5 py-0.5 md:py-1 text-[8px] md:text-[9px] font-bold uppercase tracking-wider bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 rounded-none whitespace-nowrap flex-shrink-0">
                    Selesai
                  </span>
                </div>

                {/* Content Grid - Semua data visible di semua breakpoint */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-1.5 md:gap-2 lg:gap-3 text-[8px] md:text-[9px] lg:text-sm">
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Peminjam</p>
                    <p className="text-zinc-300 text-xs truncate">{loan.borrowerName}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Lokasi</p>
                    <p className="text-zinc-300 text-xs truncate">{loan.loanLocation}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Tgl Pinjam</p>
                    <p className="text-zinc-300 text-xs">{formatDateID(loan.borrowDate)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Tgl Kembali</p>
                    <p className="text-zinc-300 text-xs">{loan.returnDate ? formatDateID(loan.returnDate) : "-"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Kembali Oleh</p>
                    <p className="text-zinc-300 text-xs truncate">{loan.returnedBy || "-"}</p>
                  </div>
                  <div>
                    <p className="text-zinc-600 uppercase tracking-wider font-semibold mb-0.5">Terima Oleh</p>
                    <p className="text-zinc-300 text-xs truncate">{loan.receivedBy || "-"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
