import { Asset } from '../types';
import { calculateAssetCondition } from '../utils/assetHelpers';

export const INITIAL_ASSETS: Asset[] = [
  {
    id: 'AST-0001',
    name: 'MacBook Pro 14" M4',
    category: 'Peralatan IT',
    purchaseDate: '2026-06-20',
    price: 38500000,
    location: 'Ruang Direksi',
    status: 'Digunakan',
    condition: 100,
    description: 'Laptop kerja Direktur Utama, spesifikasi M4 Max, 32GB RAM.'
  },
  {
    id: 'AST-0002',
    name: 'Monitor Dell UltraSharp 27"',
    category: 'Peralatan IT',
    purchaseDate: '2026-02-14', // 4 months ago -> ~93%
    price: 9200000,
    location: 'Tim Desain',
    status: 'Tersedia',
    condition: 93,
    description: 'Monitor 4K warna akurat untuk tim UI/UX Desainer.'
  },
  {
    id: 'AST-0003',
    name: 'Kursi Ergonomis Herman Miller',
    category: 'Furnitur',
    purchaseDate: '2024-08-11', // 22 months ago. Lifespan 120m -> ~81%
    price: 18500000,
    location: 'Lantai 3 - Engineering',
    status: 'Digunakan',
    condition: 81,
    description: 'Kursi ergonomis Aeron Chair untuk Lead Developer.'
  },
  {
    id: 'AST-0004',
    name: 'ThinkPad X1 Carbon Gen 12',
    category: 'Peralatan IT',
    purchaseDate: '2025-08-26', // 10 months ago -> ~83%
    price: 32000000,
    location: 'Tim Backend',
    status: 'Digunakan',
    condition: 83,
    description: 'Laptop teringan untuk Senior Dev Ops Eng.'
  },
  {
    id: 'AST-0005',
    name: 'Meja Standing Adjustable',
    category: 'Furnitur',
    purchaseDate: '2025-05-19', // 13 months ago. Lifespan 120m -> ~89%
    price: 6800000,
    location: 'Lantai 2 - Product',
    status: 'Digunakan',
    condition: 89,
    description: 'Meja kerja elektrik tinggi rendah otomatis.'
  },
  {
    id: 'AST-0006',
    name: 'Printer Laser HP M404dn',
    category: 'Peralatan IT',
    purchaseDate: '2024-11-07', // 19 months ago -> ~68%
    price: 4200000,
    location: 'Ruang Cetak',
    status: 'Tersedia',
    condition: 68,
    description: 'Printer monokrom duplex cepat untuk seluruh kantor.'
  },
  {
    id: 'AST-0007',
    name: 'Lemari Arsip Besi 4 Pintu',
    category: 'Furnitur',
    purchaseDate: '2022-12-17', // 42 months ago -> ~65%
    price: 3500000,
    location: 'Ruang Arsip',
    status: 'Digunakan',
    condition: 65,
    description: 'Lemari kabinet dokumen keuangan dan legalitas.'
  },
  {
    id: 'AST-0011',
    name: 'Mesin Penghancur Kertas Fellowes',
    category: 'Alat Tulis Kantor',
    purchaseDate: '2025-06-26', // exactly 12 months ago. Lifespan 24m -> ~50% (Screenshot says 48% with date 04 Jul 2022, which was years ago)
    price: 3250000,
    location: 'Ruang Admin',
    status: 'Digunakan',
    condition: 48,
    description: 'Mesin penghancur dokumen rahasia HRD.'
  },
  {
    id: 'AST-0012',
    name: 'Whiteboard Magnetik 2x1.2m',
    category: 'Furnitur',
    purchaseDate: '2019-12-21', // old Furnitur -> ~34%
    price: 1500000,
    location: 'Ruang Meeting B',
    status: 'Digunakan',
    condition: 34,
    description: 'Papan tulis magnetik besar ruang rapat.'
  },
  {
    id: 'AST-0013',
    name: 'AC Daikin 1.5 PK',
    category: 'Peralatan IT', // classified under server/IT room
    purchaseDate: '2022-07-10', // 47 months ago -> ~21%
    price: 7500000,
    location: 'Ruang Server',
    status: 'Digunakan',
    condition: 21,
    description: 'Pendingin ruangan server utama agar suhu tetap terjaga.'
  },
  {
    id: 'AST-0014',
    name: 'Kursi Lipat Chitose',
    category: 'Furnitur',
    purchaseDate: '2017-10-02', // very old Furnitur -> ~24%
    price: 450000,
    location: 'Gudang',
    status: 'Digunakan',
    condition: 24,
    description: 'Kursi lipat cadangan acara kantor.'
  },
  {
    id: 'AST-0015',
    name: 'Telepon IP Polycom VVX 250',
    category: 'Peralatan IT',
    purchaseDate: '2019-10-08', // 80 months ago -> 0%
    price: 2500000,
    location: 'Reception',
    status: 'Rusak',
    condition: 0,
    description: 'Telepon VOIP meja receptionist, saat ini rusak.'
  }
];
