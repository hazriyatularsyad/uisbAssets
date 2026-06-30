import { Box, Wallet, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Asset, AssetCategory } from '../types';
import { formatIDR, formatIDRShort, formatDateID } from '../utils/assetHelpers';

interface DashboardProps {
  assets: Asset[];
  onViewAllAssets: () => void;
}

export default function Dashboard({ assets, onViewAllAssets }: DashboardProps) {
  // 1. Calculate Stats
  const totalAssets = assets.length;
  const totalValue = assets.reduce((sum, asset) => sum + asset.price, 0);
  
  // Critical assets (condition < 50%)
  const criticalAssets = assets.filter(asset => asset.condition < 50);
  const criticalAssetsCount = criticalAssets.length;

  // Formatting short & sub values
  const valueShort = formatIDRShort(totalValue);

  // 2. Category Distribution
  const categoryCounts = assets.reduce((acc, asset) => {
    acc[asset.category] = (acc[asset.category] || 0) + 1;
    return acc;
  }, {} as Record<AssetCategory, number>);

  const categories: AssetCategory[] = ['Alat Tulis Kantor', 'Furnitur', 'Peralatan IT'];
  const colors: Record<AssetCategory, string> = {
    'Alat Tulis Kantor': '#71717a', // zinc-500
    'Furnitur': '#a1a1aa',          // zinc-400
    'Peralatan IT': '#ffffff',      // white
  };

  const distribution = categories.map(cat => {
    const count = categoryCounts[cat] || 0;
    const percentage = totalAssets > 0 ? Math.round((count / totalAssets) * 100) : 0;
    return {
      category: cat,
      count,
      percentage,
      color: colors[cat],
    };
  });

  // Sort critical assets by condition ascending for maintenance list
  const sortedMaintenance = [...assets]
    .filter(asset => asset.condition < 50)
    .sort((a, b) => a.condition - b.condition)
    .slice(0, 5);

  // SVG Donut Calculations
  const r = 50;
  const cx = 80;
  const cy = 80;
  const circumference = 2 * Math.PI * r; // ~314.16

  let accumulatedPercentage = 0;

  return (
    <div id="dashboard-view" className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest mb-1">/ DASHBOARD</p>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white md:text-4xl">UISB ASSETS</h2>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
          Pantau kondisi aset kantor Anda secara real-time. Data dihitung otomatis berdasarkan tanggal beli.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div id="kpi-grid" className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* TOTAL ASET */}
        <div className="relative overflow-hidden rounded-none border border-zinc-850 bg-zinc-950 p-6 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Aset</span>
            <Box size={16} className="text-zinc-600" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight text-white">{totalAssets}</span>
            <span className="text-sm font-medium text-zinc-500">unit</span>
          </div>
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-none bg-zinc-900/10 blur-xl" />
        </div>

        {/* TOTAL VALUE */}
        <div className="relative overflow-hidden rounded-none border border-zinc-850 bg-zinc-950 p-6 shadow-xl shadow-black/10">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total Nilai Aset</span>
            <Wallet size={16} className="text-zinc-600" />
          </div>
          <div className="mt-4 flex flex-col">
            <span className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              {valueShort.value}
            </span>
            {valueShort.sub && (
              <span className="mt-1 text-xs text-zinc-500 font-mono">{valueShort.sub}</span>
            )}
          </div>
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-none bg-zinc-900/10 blur-xl" />
        </div>

        {/* CRITICAL CONDITION */}
        <div className="relative overflow-hidden rounded-none border border-zinc-850 bg-zinc-950 p-6 shadow-xl shadow-black/10 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Aset Kondisi Kritis</span>
            <AlertTriangle size={16} className={criticalAssetsCount > 0 ? 'text-red-500 animate-pulse' : 'text-zinc-600'} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl font-extrabold tracking-tight ${criticalAssetsCount > 0 ? 'text-red-500' : 'text-white'}`}>
              {criticalAssetsCount}
            </span>
            <span className="text-sm font-medium text-zinc-500">barang</span>
          </div>
          <div className="mt-1.5 text-xs text-zinc-500">
            Kondisi &lt; 50%
          </div>
          <div className="absolute -bottom-4 -right-4 h-16 w-16 rounded-none bg-red-950/10 blur-xl" />
        </div>
      </div>

      {/* Visualizations and Lists */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Left Side: Distribution Donut Chart */}
        <div className="rounded-none border border-zinc-850 bg-zinc-950/60 p-6 shadow-xl lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider uppercase">Distribusi Aset per Kategori</h3>
            <p className="text-xs text-zinc-500 mt-1">Perbandingan jumlah aset berdasarkan kategori.</p>
          </div>

          {/* Custom SVG Donut Chart */}
          <div className="flex flex-col items-center justify-center my-8">
            <div className="relative h-40 w-40">
              {totalAssets > 0 ? (
                <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
                  {distribution.map((item) => {
                    const pct = item.percentage;
                    if (pct === 0) return null;

                    const strokeDashoffset = circumference - (pct * circumference) / 100;
                    const rotation = (accumulatedPercentage * 360) / 100;
                    accumulatedPercentage += pct;

                    return (
                      <circle
                        key={item.category}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="transparent"
                        stroke={item.color}
                        strokeWidth="20"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transformOrigin: 'center',
                          transform: `rotate(${rotation}deg)`,
                          transition: 'stroke-dashoffset 0.5s ease',
                        }}
                        className="hover:stroke-[24] transition-all duration-200 cursor-pointer"
                      />
                    );
                  })}
                  {/* Inside hole */}
                  <circle cx={cx} cy={cy} r="35" fill="#09090b" />
                </svg>
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-none border border-dashed border-zinc-800 text-xs text-zinc-600">
                  Tidak ada data
                </div>
              )}
              {totalAssets > 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-white">{totalAssets}</span>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Total</span>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 border-t border-zinc-900 pt-4">
            {distribution.map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-none" style={{ backgroundColor: item.color }} />
                  <span className="text-zinc-400 font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-zinc-600 font-mono">{item.count} unit</span>
                  <span className="text-white font-bold font-mono w-8 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Maintenance Needed (Lowest Condition Assets) */}
        <div className="rounded-none border border-zinc-850 bg-zinc-950/60 p-6 shadow-xl lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wider uppercase">5 Aset Perlu Perawatan</h3>
                <p className="text-xs text-zinc-500 mt-1">Diurutkan berdasarkan kondisi terendah.</p>
              </div>
              <button
                id="view-all-maintenance"
                onClick={onViewAllAssets}
                className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Lihat semua
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-900 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    <th className="pb-3 pr-2">Kode Aset</th>
                    <th className="pb-3">Nama Barang</th>
                    <th className="pb-3 hidden sm:table-cell">Tanggal Beli</th>
                    <th className="pb-3 text-right">Kondisi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  {sortedMaintenance.length > 0 ? (
                    sortedMaintenance.map((asset) => (
                      <tr key={asset.id} className="group hover:bg-zinc-900/10">
                        <td className="py-3.5 pr-2 font-mono text-zinc-400 group-hover:text-white transition-colors">
                          {asset.id}
                        </td>
                        <td className="py-3.5">
                          <div className="font-semibold text-white">{asset.name}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{asset.location}</div>
                        </td>
                        <td className="py-3.5 text-zinc-400 hidden sm:table-cell">
                          {formatDateID(asset.purchaseDate)}
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center justify-end gap-3">
                            {/* Simple Condition Meter */}
                            <div className="w-16 bg-zinc-900 h-1 rounded-none overflow-hidden hidden sm:block">
                              <div
                                className={`h-full rounded-none ${
                                  asset.condition < 25
                                    ? 'bg-red-500'
                                    : asset.condition < 50
                                    ? 'bg-orange-500'
                                    : 'bg-yellow-500'
                                }`}
                                style={{ width: `${asset.condition}%` }}
                              />
                            </div>
                            <span
                              className={`font-bold font-mono text-right w-10 ${
                                asset.condition < 25
                                  ? 'text-red-500'
                                  : asset.condition < 50
                                  ? 'text-orange-500'
                                  : 'text-yellow-500'
                              }`}
                            >
                              {asset.condition}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-zinc-600">
                        Tidak ada aset dengan kondisi kritis saat ini. Bagus!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border-t border-zinc-900 pt-4 mt-4 text-[10px] text-zinc-600 flex justify-between items-center">
            <span>Sistem Pemantauan Aset Otomatis</span>
            <span>Update Terakhir: Hari ini</span>
          </div>
        </div>

      </div>
    </div>
  );
}
