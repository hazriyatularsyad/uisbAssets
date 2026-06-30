import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import AssetList from './components/AssetList';
import { Asset } from './types';
import { INITIAL_ASSETS } from './data/mockAssets';
import { calculateAssetCondition } from './utils/assetHelpers';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets'>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);

  // 1. Initial State Loading from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('assetgrid_assets');
    if (saved) {
      try {
        setAssets(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse assets from localStorage, loading initial data', e);
        setAssets(INITIAL_ASSETS);
      }
    } else {
      setAssets(INITIAL_ASSETS);
    }
  }, []);

  // 2. Persist State to LocalStorage on Change
  useEffect(() => {
    if (assets.length > 0) {
      localStorage.setItem('assetgrid_assets', JSON.stringify(assets));
    }
  }, [assets]);

  // Helper to generate the next AST-XXXX code
  const getNextAssetId = (currentAssets: Asset[]): string => {
    if (currentAssets.length === 0) return 'AST-0001';
    
    // Extract numbers from AST-XXXX format
    const ids = currentAssets
      .map((a) => {
        const parts = a.id.split('-');
        if (parts.length === 2) {
          const num = parseInt(parts[1], 10);
          return isNaN(num) ? 0 : num;
        }
        return 0;
      });
    
    const maxId = Math.max(...ids, 0);
    const nextId = maxId + 1;
    return `AST-${String(nextId).padStart(4, '0')}`;
  };

  // CRUD Actions
  const handleAddAsset = (newAssetData: Omit<Asset, 'id' | 'condition'>) => {
    const nextId = getNextAssetId(assets);
    const computedCondition = calculateAssetCondition(newAssetData.purchaseDate, newAssetData.category);

    const newAsset: Asset = {
      ...newAssetData,
      id: nextId,
      condition: computedCondition,
    };

    const updated = [newAsset, ...assets];
    setAssets(updated);
    localStorage.setItem('assetgrid_assets', JSON.stringify(updated));
  };

  const handleEditAsset = (updatedAsset: Asset) => {
    const updated = assets.map((a) => (a.id === updatedAsset.id ? updatedAsset : a));
    setAssets(updated);
    localStorage.setItem('assetgrid_assets', JSON.stringify(updated));
  };

  const handleDeleteAsset = (id: string) => {
    const updated = assets.filter((a) => a.id !== id);
    setAssets(updated);
    localStorage.setItem('assetgrid_assets', JSON.stringify(updated));
  };

  return (
    <div id="app-container" className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 font-sans md:flex-row bg-grid-pattern">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail="admin@office"
      />

      {/* Main Content Area */}
      <main id="main-content" className="flex-1 px-4 py-8 sm:px-6 md:px-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {activeTab === 'dashboard' ? (
          <Dashboard
            assets={assets}
            onViewAllAssets={() => setActiveTab('assets')}
          />
        ) : (
          <AssetList
            assets={assets}
            onAddAsset={handleAddAsset}
            onEditAsset={handleEditAsset}
            onDeleteAsset={handleDeleteAsset}
          />
        )}
      </main>
    </div>
  );
}
