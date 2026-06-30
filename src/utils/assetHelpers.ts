import { Asset, AssetCategory } from '../types';

// Lifespan in months for each category
export const CATEGORY_LIFESPAN: Record<AssetCategory, number> = {
  'Peralatan IT': 60, // 5 years
  'Furnitur': 120,    // 10 years
  'Alat Tulis Kantor': 24 // 2 years
};

/**
 * Calculates the condition percentage of an asset based on its purchase date and category.
 * If the purchase date is in the future, it returns 100%.
 * If it has exceeded its lifespan, it returns 0%.
 */
export function calculateAssetCondition(purchaseDateStr: string, category: AssetCategory): number {
  if (!purchaseDateStr) return 100;
  
  const purchaseDate = new Date(purchaseDateStr);
  const today = new Date();
  
  if (isNaN(purchaseDate.getTime())) return 100;
  if (purchaseDate > today) return 100;
  
  // Calculate difference in months
  const yearsDiff = today.getFullYear() - purchaseDate.getFullYear();
  const monthsDiff = today.getMonth() - purchaseDate.getMonth();
  const totalMonths = (yearsDiff * 12) + monthsDiff;
  
  const lifespan = CATEGORY_LIFESPAN[category] || 60;
  const percentage = 100 - (totalMonths / lifespan) * 100;
  
  return Math.max(0, Math.min(100, Math.round(percentage)));
}

/**
 * Formats a number to IDR currency string (e.g., Rp 38.500.000)
 */
export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace('IDR', 'Rp').trim();
}

/**
 * Formats a number to IDR short string (e.g., Rp 151.25 Jt)
 */
export function formatIDRShort(amount: number): { value: string; sub: string } {
  if (amount >= 1_000_000_000) {
    const formatted = (amount / 1_000_000_000).toFixed(2);
    return {
      value: `Rp ${formatted} Milyar`,
      sub: formatIDR(amount)
    };
  } else if (amount >= 1_000_000) {
    const formatted = (amount / 1_000_000).toFixed(2);
    return {
      value: `Rp ${formatted} Jt`,
      sub: formatIDR(amount)
    };
  }
  return {
    value: formatIDR(amount),
    sub: ''
  };
}

/**
 * Formats YYYY-MM-DD date to IDR style (e.g., 20 Jun 2026 or 08 Okt 2019)
 */
export function formatDateID(dateStr: string): string {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  
  const day = String(date.getDate()).padStart(2, '0');
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
}
