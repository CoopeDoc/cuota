import { useState, useMemo } from 'react';

export default function SearchFilters({
  searchQuery,
  onSearchChange,
  warehouseOptions,
  selectedWarehouses,
  onWarehousesChange,
  classificationOptions,
  selectedClassification,
  onClassificationChange,
  filteredCount,
  totalStock,
  onRefresh
}) {
  const [warehouseDropdownOpen, setWarehouseDropdownOpen] = useState(false);
  const [warehouseSearch, setWarehouseSearch] = useState('');

  const filteredWarehouses = useMemo(() => {
    const term = warehouseSearch.toLowerCase();
    return warehouseOptions.filter(w => w.toLowerCase().includes(term));
  }, [warehouseOptions, warehouseSearch]);

  const toggleWarehouse = (wh) => {
    const newSet = new Set(selectedWarehouses);
    if (newSet.has(wh)) {
      newSet.delete(wh);
    } else {
      newSet.add(wh);
    }
    onWarehousesChange(newSet);
  };

  const selectAllWarehouses = () => {
    onWarehousesChange(new Set(warehouseOptions));
  };

  const clearWarehouses = () => {
    onWarehousesChange(new Set());
  };

  const warehouseButtonText = selectedWarehouses.size === 0 || selectedWarehouses.size === warehouseOptions.length
    ? 'Todas las bodegas'
    : `${selectedWarehouses.size} seleccionada${selectedWarehouses.size > 1 ? 's' : ''}`;

  return (
    <div className="glass-panel p-5 rounded-xl mb-6 shadow-lg relative z-30">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-5 relative">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Buscar Producto
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Código, nombre o descripción..."
              className="w-full bg-slate-800/60 text-white border border-slate-600 rounded-lg px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder-slate-500 text-sm"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <svg className="w-5 h-5 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        <div className="md:col-span-4">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Bodega
          </label>
          <div className="relative z-50">
            <button
              onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
              className="w-full bg-slate-800/60 text-white border border-slate-600 rounded-lg px-4 py-2.5 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all text-sm"
            >
              <span className={`truncate ${selectedWarehouses.size === 0 ? 'text-slate-500' : 'text-white'}`}>
                {warehouseButtonText}
              </span>
              <svg
                className={`w-4 h-4 ml-2 text-slate-400 transition-transform ${warehouseDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {warehouseDropdownOpen && (
              <div className="absolute z-20 w-full mt-2 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl overflow-hidden max-h-80 flex flex-col">
                <div className="p-3 border-b border-slate-700 bg-slate-800/90">
                  <input
                    type="text"
                    placeholder="Buscar bodega..."
                    className="w-full bg-slate-800 text-sm text-white rounded-md px-3 py-2 border border-slate-600 focus:outline-none focus:border-sky-500 placeholder-slate-500"
                    value={warehouseSearch}
                    onChange={(e) => setWarehouseSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="overflow-y-auto p-2 space-y-1 bg-slate-900/95 flex-1 custom-scrollbar">
                  {filteredWarehouses.map((wh) => {
                    const isSelected = selectedWarehouses.has(wh);
                    return (
                      <div
                        key={wh}
                        onClick={() => toggleWarehouse(wh)}
                        className="flex items-center space-x-3 p-2 hover:bg-slate-800 rounded-md cursor-pointer transition-colors"
                      >
                        <input
                          type="checkbox"
                          readOnly
                          checked={isSelected}
                          className="h-4 w-4 text-sky-500 rounded border-slate-600 bg-slate-800 focus:ring-sky-500"
                        />
                        <span className="text-sm text-slate-300">{wh}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="p-2 border-t border-slate-700 bg-slate-800/90 text-xs flex justify-between">
                  <button
                    onClick={selectAllWarehouses}
                    className="text-sky-400 hover:text-sky-300 transition-colors font-semibold"
                  >
                    Seleccionar Todas
                  </button>
                  <button
                    onClick={clearWarehouses}
                    className="text-red-400 hover:text-red-300 transition-colors font-semibold"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="md:col-span-3">
          <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Clasificación
          </label>
          <select
            className="w-full bg-slate-800/60 text-white border border-slate-600 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all cursor-pointer text-sm"
            value={selectedClassification}
            onChange={(e) => onClassificationChange(e.target.value)}
          >
            <option value="">Todas</option>
            {classificationOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-t border-slate-700 pt-4">
        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
            <span className="text-slate-400">
              <span className="font-bold text-white">{filteredCount}</span> productos
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-slate-400">
              <span className="font-bold text-white">{totalStock.toLocaleString()}</span> unidades
            </span>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 text-sm group"
        >
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Actualizar
        </button>
      </div>
    </div>
  );
}
