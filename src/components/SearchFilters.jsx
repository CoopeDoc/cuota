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
    ? 'Todas'
    : `${selectedWarehouses.size} Seleccionadas`;

  return (
    <>
      {/* Search Controls */}
      <div className="glass-panel p-6 rounded-2xl mb-8 shadow-2xl border border-gray-700/50 backdrop-blur-xl relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Search Input */}
          <div className="md:col-span-2 relative group">
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Código o Descripción</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej: 59267 o Taladro..."
                className="w-full bg-gray-800/50 text-white border border-gray-600 rounded-xl px-4 py-3 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Warehouse Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Bodega</label>
            <div className="relative z-50">
              <button
                onClick={() => setWarehouseDropdownOpen(!warehouseDropdownOpen)}
                className="w-full bg-gray-800/50 text-white border border-gray-600 rounded-xl px-4 py-3 flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <span className={`truncate ${selectedWarehouses.size === 0 ? 'text-gray-400' : 'text-white'}`}>
                  {warehouseButtonText}
                </span>
                <svg
                  className={`w-4 h-4 ml-2 text-gray-400 transition-transform ${warehouseDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {warehouseDropdownOpen && (
                <div className="absolute z-20 w-full mt-2 bg-gray-900 border border-gray-600 rounded-xl shadow-2xl overflow-hidden max-h-96 flex flex-col backdrop-blur-3xl">
                  {/* Search Input */}
                  <div className="p-3 border-b border-gray-700 bg-gray-800/80 sticky top-0">
                    <input
                      type="text"
                      placeholder="Buscar bodega..."
                      className="w-full bg-gray-800 text-sm text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:border-indigo-500 placeholder-gray-500"
                      value={warehouseSearch}
                      onChange={(e) => setWarehouseSearch(e.target.value)}
                      autoFocus
                    />
                  </div>
                  {/* Checkbox List */}
                  <div className="overflow-y-auto p-2 space-y-1 bg-gray-900/90 flex-1 custom-scrollbar">
                    {filteredWarehouses.map((wh) => {
                      const isSelected = selectedWarehouses.has(wh);
                      return (
                        <div
                          key={wh}
                          onClick={() => toggleWarehouse(wh)}
                          className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={isSelected}
                            className="h-4 w-4 text-indigo-500 rounded border-gray-600 bg-gray-800 focus:ring-indigo-500 focus:ring-offset-gray-900"
                          />
                          <span className="text-sm text-gray-300">{wh}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Footer */}
                  <div className="p-2 border-t border-gray-700 bg-gray-800/90 text-xs flex justify-between text-gray-400">
                    <button
                      onClick={selectAllWarehouses}
                      className="hover:text-indigo-400 transition-colors font-semibold"
                    >
                      Seleccionar Todas
                    </button>
                    <button
                      onClick={clearWarehouses}
                      className="hover:text-red-400 transition-colors font-semibold"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Classification Filter */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Clasificación</label>
            <select
              className="w-full bg-gray-800/50 text-white border border-gray-600 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 cursor-pointer"
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

        {/* Stats / Info Bar */}
        <div className="mt-6 flex justify-between items-center border-t border-gray-700 pt-4 text-sm text-gray-400">
          <span>
            <span className="font-bold text-white">{filteredCount}</span> productos encontrados.
            <span className="ml-4 text-indigo-400">
              Total Unidades: <span className="font-bold text-white">{totalStock.toLocaleString()}</span>
            </span>
          </span>
          <button
            onClick={onRefresh}
            className="hover:text-white transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refrescar Datos
          </button>
        </div>
      </div>
    </>
  );
}