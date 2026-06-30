import { Search, Plus, Edit2, Trash2, X, AlertTriangle } from 'lucide-react';
import { useState, FormEvent } from 'react';
import { Asset, AssetCategory, AssetStatus } from '../types';
import { formatIDR, formatDateID, calculateAssetCondition } from '../utils/assetHelpers';

interface AssetListProps {
  assets: Asset[];
  onAddAsset: (asset: Omit<Asset, 'id' | 'condition'>) => void;
  onEditAsset: (asset: Asset) => void;
  onDeleteAsset: (id: string) => void;
}

export default function AssetList({ assets, onAddAsset, onEditAsset, onDeleteAsset }: AssetListProps) {
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'Semua'>('Semua');
  const [selectedStatus, setSelectedStatus] = useState<AssetStatus | 'Semua'>('Semua');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected Asset for Editing/Deleting
  const [currentAsset, setCurrentAsset] = useState<Asset | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<AssetCategory>('Peralatan IT');
  const [formPurchaseDate, setFormPurchaseDate] = useState('');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formLocation, setFormLocation] = useState('');
  const [formStatus, setFormStatus] = useState<AssetStatus>('Tersedia');
  const [formDescription, setFormDescription] = useState('');

  // Handle opening add modal
  const openAddModal = () => {
    // Reset form to defaults
    setFormName('');
    setFormCategory('Peralatan IT');
    const todayStr = new Date().toISOString().split('T')[0];
    setFormPurchaseDate(todayStr);
    setFormPrice(0);
    setFormLocation('');
    setFormStatus('Tersedia');
    setFormDescription('');
    setIsAddModalOpen(true);
  };

  // Handle opening edit modal
  const openEditModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setFormName(asset.name);
    setFormCategory(asset.category);
    setFormPurchaseDate(asset.purchaseDate);
    setFormPrice(asset.price);
    setFormLocation(asset.location);
    setFormStatus(asset.status);
    setFormDescription(asset.description || '');
    setIsEditModalOpen(true);
  };

  // Handle opening delete modal
  const openDeleteModal = (asset: Asset) => {
    setCurrentAsset(asset);
    setIsDeleteModalOpen(true);
  };

  // Form Submission
  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formLocation.trim() || !formPurchaseDate) {
      alert('Harap isi semua kolom wajib!');
      return;
    }
    onAddAsset({
      name: formName,
      category: formCategory,
      purchaseDate: formPurchaseDate,
      price: Number(formPrice),
      location: formLocation,
      status: formStatus,
      description: formDescription
    });
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!currentAsset) return;
    if (!formName.trim() || !formLocation.trim() || !formPurchaseDate) {
      alert('Harap isi semua kolom wajib!');
      return;
    }

    // Auto calculate condition on save based on date and category
    const computedCondition = calculateAssetCondition(formPurchaseDate, formCategory);

    onEditAsset({
      ...currentAsset,
      name: formName,
      category: formCategory,
      purchaseDate: formPurchaseDate,
      price: Number(formPrice),
      location: formLocation,
      status: formStatus,
      condition: computedCondition,
      description: formDescription
    });
    setIsEditModalOpen(false);
    setCurrentAsset(null);
  };

  const handleDeleteConfirm = () => {
    if (currentAsset) {
      onDeleteAsset(currentAsset.id);
      setIsDeleteModalOpen(false);
      setCurrentAsset(null);
    }
  };

  // Filtering Logic
  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'Semua' || asset.category === selectedCategory;
    const matchesStatus = selectedStatus === 'Semua' || asset.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div id="assets-view" className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">/ MANAJEMEN ASET</p>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">Daftar Aset</h2>
          <p className="mt-1 text-sm text-zinc-400">
            Kelola seluruh aset kantor. Kondisi terhitung otomatis dari tanggal beli.
          </p>
        </div>
        <button
          id="btn-add-asset"
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 rounded-none bg-white px-4 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus size={16} />
          Tambah Aset
        </button>
      </div>

      {/* Search and Filters Panel */}
      <div id="filters-panel" className="rounded-none border border-zinc-850 bg-zinc-950 p-5 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="search-assets"
            type="text"
            placeholder="Cari kode, nama, atau lokasi aset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-none border border-zinc-900 bg-zinc-900/40 py-2.5 pr-4 pl-11 text-sm text-white placeholder-zinc-500 outline-none focus:border-zinc-700 focus:bg-zinc-900/60 transition-all font-medium"
          />
        </div>

        {/* Categories & Status Filters Row */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center justify-between pt-2">
          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kategori:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['Semua', 'Peralatan IT', 'Furnitur', 'Alat Tulis Kantor'] as const).map((cat) => (
                <button
                  id={`filter-category-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-none px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Status:</span>
            <div className="flex flex-wrap gap-1.5">
              {(['Semua', 'Tersedia', 'Digunakan', 'Rusak'] as const).map((stat) => (
                <button
                  id={`filter-status-${stat.toLowerCase()}`}
                  key={stat}
                  onClick={() => setSelectedStatus(stat)}
                  className={`rounded-none px-3 py-1.5 text-xs font-semibold transition-all ${
                    selectedStatus === stat
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'bg-transparent text-zinc-400 hover:bg-zinc-900 hover:text-white border border-zinc-900'
                  }`}
                >
                  {stat}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Asset Table Container */}
      <div id="assets-table-container" className="overflow-hidden rounded-none border border-zinc-850 bg-zinc-950/60 shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                <th className="py-4 px-5">Kode Aset</th>
                <th className="py-4 px-4">Nama Barang</th>
                <th className="py-4 px-4">Kategori</th>
                <th className="py-4 px-4 hidden sm:table-cell">Tanggal Beli</th>
                <th className="py-4 px-4 hidden md:table-cell">Harga</th>
                <th className="py-4 px-4 hidden sm:table-cell">Lokasi</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-4 text-right">Kondisi</th>
                <th className="py-4 px-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/50">
              {filteredAssets.length > 0 ? (
                filteredAssets.map((asset) => (
                  <tr key={asset.id} className="group hover:bg-zinc-900/10">
                    {/* ID */}
                    <td className="py-4 px-5 font-mono font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {asset.id}
                    </td>
                    
                    {/* Name */}
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{asset.name}</div>
                      {/* Responsive subtitle location */}
                      <div className="text-[10px] text-zinc-500 mt-0.5 sm:hidden">{asset.location}</div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4 text-zinc-400 font-medium">
                      {asset.category}
                    </td>

                    {/* Purchase Date */}
                    <td className="py-4 px-4 text-zinc-400 hidden sm:table-cell font-medium">
                      {formatDateID(asset.purchaseDate)}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-zinc-300 hidden md:table-cell font-mono">
                      {formatIDR(asset.price)}
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 text-zinc-400 hidden sm:table-cell font-medium">
                      {asset.location}
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center rounded-none px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                          asset.status === 'Tersedia'
                            ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                            : asset.status === 'Digunakan'
                            ? 'bg-blue-950/40 text-blue-400 border border-blue-900/50'
                            : 'bg-red-950/40 text-red-400 border border-red-900/50'
                        }`}
                      >
                        {asset.status}
                      </span>
                    </td>

                    {/* Condition */}
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-3">
                        <div className="w-16 bg-zinc-900 h-1 rounded-none overflow-hidden hidden lg:block">
                          <div
                            className={`h-full rounded-none ${
                              asset.condition >= 75
                                ? 'bg-emerald-500'
                                : asset.condition >= 50
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${asset.condition}%` }}
                          />
                        </div>
                        <span
                          className={`font-bold font-mono text-right w-10 ${
                            asset.condition >= 75
                              ? 'text-emerald-400'
                              : asset.condition >= 50
                              ? 'text-yellow-500'
                              : 'text-red-400'
                          }`}
                        >
                          {asset.condition}%
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          id={`btn-edit-${asset.id}`}
                          onClick={() => openEditModal(asset)}
                          className="rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white transition-all"
                          title="Edit Aset"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          id={`btn-delete-${asset.id}`}
                          onClick={() => openDeleteModal(asset)}
                          className="rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-red-400 transition-all"
                          title="Hapus Aset"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-zinc-600 font-medium">
                    Tidak ada aset yang cocok dengan filter atau pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ==================== ADD ASSET MODAL ==================== */}
      {isAddModalOpen && (
        <div id="add-asset-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsAddModalOpen(false)} />
          {/* Modal Box */}
          <div className="relative w-full max-w-lg rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-scale-up">
            <button
              id="close-add-modal"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold text-white tracking-tight">Tambah Aset Baru</h3>
            <p className="text-xs text-zinc-500 mt-1">Sistem akan menghitung kondisi aset secara otomatis berdasarkan tanggal beli.</p>

            <form onSubmit={handleAddSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Barang *</label>
                <input
                  id="input-add-name"
                  type="text"
                  required
                  placeholder="Contoh: Asus ROG Strix G16"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kategori</label>
                  <select
                    id="input-add-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AssetCategory)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  >
                    <option value="Peralatan IT">Peralatan IT</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Alat Tulis Kantor">Alat Tulis Kantor</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    id="input-add-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Digunakan">Digunakan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-4">
                {/* Purchase Date */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal Beli *</label>
                  <input
                    id="input-add-date"
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Harga (IDR) *</label>
                  <input
                    id="input-add-price"
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700 font-mono"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Lokasi Ruang / Penanggung Jawab *</label>
                <input
                  id="input-add-location"
                  type="text"
                  required
                  placeholder="Contoh: Ruang Server / Tim QA"
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Keterangan / Spesifikasi</label>
                <textarea
                  id="input-add-description"
                  rows={2}
                  placeholder="Detail tambahan mengenai kondisi fisik, spesifikasi, dsb."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-cancel-add"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-none border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-add"
                  type="submit"
                  className="rounded-none bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  Simpan Aset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== EDIT ASSET MODAL ==================== */}
      {isEditModalOpen && (
        <div id="edit-asset-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsEditModalOpen(false)} />
          {/* Modal Box */}
          <div className="relative w-full max-w-lg rounded-none border border-zinc-800 bg-zinc-950 p-6 shadow-2xl animate-scale-up">
            <button
              id="close-edit-modal"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-4 right-4 rounded-none p-1.5 text-zinc-400 hover:bg-zinc-900 hover:text-white"
            >
              <X size={16} />
            </button>
            <h3 className="text-lg font-bold text-white tracking-tight">Edit Aset: <span className="text-zinc-400 font-mono text-sm">{currentAsset?.id}</span></h3>
            <p className="text-xs text-zinc-500 mt-1">Ubah rincian informasi aset kantor di bawah ini.</p>

            <form onSubmit={handleEditSubmit} className="mt-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Nama Barang *</label>
                <input
                  id="input-edit-name"
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Kategori</label>
                  <select
                    id="input-edit-category"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as AssetCategory)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  >
                    <option value="Peralatan IT">Peralatan IT</option>
                    <option value="Furnitur">Furnitur</option>
                    <option value="Alat Tulis Kantor">Alat Tulis Kantor</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Status</label>
                  <select
                    id="input-edit-status"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssetStatus)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  >
                    <option value="Tersedia">Tersedia</option>
                    <option value="Digunakan">Digunakan</option>
                    <option value="Rusak">Rusak</option>
                  </select>
                </div>
              </div>

              {/* Grid 2 Cols */}
              <div className="grid grid-cols-2 gap-4">
                {/* Purchase Date */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Tanggal Beli *</label>
                  <input
                    id="input-edit-date"
                    type="date"
                    required
                    value={formPurchaseDate}
                    onChange={(e) => setFormPurchaseDate(e.target.value)}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Harga (IDR) *</label>
                  <input
                    id="input-edit-price"
                    type="number"
                    required
                    min={0}
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700 font-mono"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Lokasi Ruang / Penanggung Jawab *</label>
                <input
                  id="input-edit-location"
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Keterangan / Spesifikasi</label>
                <textarea
                  id="input-edit-description"
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-none border border-zinc-900 bg-zinc-900/60 px-3 py-2 text-sm text-white outline-none focus:border-zinc-700 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900">
                <button
                  id="btn-cancel-edit"
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-none border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-edit"
                  type="submit"
                  className="rounded-none bg-white px-4 py-2 text-xs font-bold text-black hover:bg-zinc-200"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== DELETE ASSET MODAL ==================== */}
      {isDeleteModalOpen && (
        <div id="delete-asset-modal" className="fixed inset-0 z-50 flex items-center justify-center px-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)} />
          {/* Modal Box */}
          <div className="relative w-full max-w-sm rounded-none border border-zinc-850 bg-zinc-950 p-6 shadow-2xl animate-scale-up">
            <div className="flex h-12 w-12 items-center justify-center rounded-none bg-red-950/40 text-red-500 border border-red-900/50 mx-auto">
              <AlertTriangle size={20} />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-base font-bold text-white">Hapus Aset ini?</h3>
              <p className="text-xs text-zinc-500 mt-2">
                Apakah Anda yakin ingin menghapus aset <span className="font-semibold text-white">{currentAsset?.name}</span> ({currentAsset?.id})? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-3 pt-6 mt-4 border-t border-zinc-900">
              <button
                id="btn-cancel-delete"
                onClick={() => setIsDeleteModalOpen(false)}
                className="rounded-none border border-zinc-850 px-4 py-2 text-xs font-semibold text-zinc-400 hover:bg-zinc-900 hover:text-white"
              >
                Batal
              </button>
              <button
                id="btn-confirm-delete"
                onClick={handleDeleteConfirm}
                className="rounded-none bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 active:scale-95 transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
