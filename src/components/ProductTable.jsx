import { memo } from 'react';

const ProductRow = memo(function ProductRow({ product, onOpenQuota }) {
  const formatPrice = (p) => {
    if (!p) return '0.00';
    const num = parseFloat(String(p).replace(/[^\d.]/g, ''));
    return isNaN(num) ? '0.00' : num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
    
  const warehouseDisplay = product.warehouseDesc
    ? `${product.warehouse} - ${product.warehouseDesc}`
    : product.warehouse || '-';
    
  return (
    <tr className="text-sm text-gray-300 hover:text-white transition-colors cursor-pointer group border-b border-gray-700/50 hover:bg-gray-700/30">
      <td className="p-4 font-mono text-indigo-300 font-bold">{product.code || '-'}</td>
      <td className="p-4">{product.description || '-'}</td>
      <td className="p-4 text-xs uppercase tracking-wider text-gray-400">{warehouseDisplay}</td>
      <td className="p-4 text-xs">{product.classification || '-'}</td>
      <td className={`p-4 text-right font-mono ${parseInt(product.stock) > 0 ? 'text-green-400' : 'text-red-400'}`}>
        {product.stock || '0'}
      </td>
      <td className="p-4 text-right font-mono text-yellow-300 font-bold">¢{formatPrice(product.price)}</td>
      <td className="p-4 text-center">
        <button
          onClick={() => onOpenQuota(product)}
          className="bg-indigo-600/80 hover:bg-indigo-500 text-white px-3 py-1 rounded-lg text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105"
        >
          Cuotas
        </button>
      </td>
    </tr>
  );
});

export default function ProductTable({ products, loading, onOpenQuota, maxResults }) {
  if (loading) {
    return (
      <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-md p-8 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
        <div className="text-gray-400 text-base font-semibold">Cargando datos...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-gray-700/50 backdrop-blur-md">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-800/60 text-gray-300 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold border-b border-gray-700">Código</th>
              <th className="p-4 font-semibold border-b border-gray-700 w-1/3">Descripción</th>
              <th className="p-4 font-semibold border-b border-gray-700">Bodega</th>
              <th className="p-4 font-semibold border-b border-gray-700">Clasificación</th>
              <th className="p-4 font-semibold border-b border-gray-700 text-right">Cant. Disp.</th>
              <th className="p-4 font-semibold border-b border-gray-700 text-right">Precio Venta</th>
              <th className="p-4 font-semibold border-b border-gray-700 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody id="resultsBody" className="divide-y divide-gray-700/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No se encontraron resultados.
                </td>
              </tr>
            ) : (
              products.map((product, idx) => (
                <ProductRow
                  key={`${product.code}-${idx}`}
                  product={product}
                  onOpenQuota={onOpenQuota}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination / Load More */}
      <div id="paginationConfig" className="p-4 text-center border-t border-gray-700/50">
        <p className="text-sm text-gray-500">
          {products.length > 0 && maxResults && products.length >= maxResults
            ? `Mostrando primeros ${maxResults} resultados para optimizar rendimiento.`
            : ''}
        </p>
      </div>
    </div>
  );
}
