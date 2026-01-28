import { useState, useEffect, useMemo, useCallback } from 'react';
import Papa from 'papaparse';
import ProductTable from './components/ProductTable';
import SearchFilters from './components/SearchFilters';
import QuotaModal from './components/QuotaModal';
import './App.css';

const CSV_FILE = '/Consulta Existencia en Bodega (1).csv';
const MAX_RESULTS = 100;

function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWarehouses, setSelectedWarehouses] = useState(new Set());
  const [selectedClassification, setSelectedClassification] = useState('');
  const [modalProduct, setModalProduct] = useState(null);

  // Load CSV
  useEffect(() => {
    Papa.parse(CSV_FILE, {
      download: true,
      header: true,
      skipEmptyLines: true,
      encoding: 'ISO-8859-1',
      transformHeader: h => h.trim(),
      complete: (results) => {
        if (results.data?.length > 0) {
          const headers = Object.keys(results.data[0]);
          const codeKey = headers.find(h => /art.culo/i.test(h)) || 'Artículo';
          const descKey = headers.find(h => /descripci.n.*art.culo/i.test(h)) || 'Descripción Artículo';
          const warehouseKey = headers.find(h => /^bodega$/i.test(h)) || 'Bodega';
          const warehouseDescKey = headers.find(h => /descripci.n.*bodega/i.test(h)) || 'Descripción Bodega';
          const classKey = headers.find(h => /clasificacion1/i.test(h)) || 'Clasificacion1';
          const stockKey = headers.find(h => /cant.*disp/i.test(h)) || 'Cant. Disponible';
          const priceKey = headers.find(h => /precio_venta/i.test(h)) || 'PRECIO_VENTA';

          const mapped = results.data.map(item => ({
            code: item[codeKey],
            description: item[descKey],
            warehouse: item[warehouseKey],
            warehouseDesc: item[warehouseDescKey],
            classification: item[classKey],
            stock: item[stockKey],
            price: item[priceKey],
          }));
          setProducts(mapped);
        }
        setLoading(false);
      },
      error: () => setLoading(false)
    });
  }, []);

  // Extract unique values for filters
  const { warehouseOptions, classificationOptions } = useMemo(() => {
    const wh = new Set();
    const cl = new Set();
    products.forEach(p => {
      if (p.warehouse) {
        const label = p.warehouseDesc ? `${p.warehouse} - ${p.warehouseDesc}` : p.warehouse;
        wh.add(label);
      }
      if (p.classification) cl.add(p.classification);
    });
    return {
      warehouseOptions: Array.from(wh).sort(),
      classificationOptions: Array.from(cl).sort()
    };
  }, [products]);

  // Filter products
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return products.filter(item => {
      const code = (item.code || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const whDesc = (item.warehouseDesc || '').toLowerCase();
      const whLabel = item.warehouseDesc ? `${item.warehouse} - ${item.warehouseDesc}` : item.warehouse;

      const matchSearch = !query || code.includes(query) || desc.includes(query) || whDesc.includes(query);
      const matchWh = selectedWarehouses.size === 0 || selectedWarehouses.has(whLabel);
      const matchClass = !selectedClassification || item.classification === selectedClassification;

      return matchSearch && matchWh && matchClass;
    });
  }, [products, searchQuery, selectedWarehouses, selectedClassification]);

  const totalStock = useMemo(() => 
    filteredProducts.reduce((sum, p) => sum + (parseFloat(p.stock) || 0), 0),
    [filteredProducts]
  );

  const handleOpenModal = useCallback((product) => {
    setModalProduct(product);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalProduct(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Animated Background Blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-1/3 w-96 h-96 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="relative z-10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-indigo-500 mb-2">
              Explorador de Inventario
            </h1>
            <p className="text-gray-400 text-lg">Busca, filtra y calcula cuotas al instante.</p>
          </header>

          {/* Filters */}
          <SearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            warehouseOptions={warehouseOptions}
            selectedWarehouses={selectedWarehouses}
            onWarehousesChange={setSelectedWarehouses}
            classificationOptions={classificationOptions}
            selectedClassification={selectedClassification}
            onClassificationChange={setSelectedClassification}
            filteredCount={filteredProducts.length}
            totalStock={totalStock}
            onRefresh={() => window.location.reload()}
          />

          {/* Table */}
          <ProductTable
            products={filteredProducts.slice(0, MAX_RESULTS)}
            loading={loading}
            onOpenQuota={handleOpenModal}
            maxResults={MAX_RESULTS}
          />

          {/* Modal */}
          {modalProduct && (
            <QuotaModal
              product={modalProduct}
              onClose={handleCloseModal}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
