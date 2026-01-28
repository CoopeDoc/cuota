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
    <tr className="text-sm text-slate-300 hover:text-white transition-colors group border-b border-slate-700/50 hover:bg-slate-700/20">
      <td className="p-3 font-mono text-sky-400 font-semibold text-xs">{product.code || '-'}</td>
      <td className="p-3 text-sm">{product.description || '-'}</td>
      <td className="p-3 text-xs text-slate-400">{warehouseDisplay}</td>
      <td className="p-3 text-xs text-slate-500">{product.classification || '-'}</td>
      <td className={`p-3 text-right font-mono text-sm font-medium ${parseInt(product.stock) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
        {product.stock || '0'}
      </td>
      <td className="p-3 text-right font-mono text-sm font-semibold text-amber-400">¢{formatPrice(product.price)}</td>
      <td className="p-3 text-center">
        <button
          onClick={() => onOpenQuota(product)}
          className="bg-sky-600/90 hover:bg-sky-500 text-white px-3 py-1.5 rounded-md text-xs font-semibold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
        >
          Calcular
        </button>
      </td>
    </tr>
  );
});

export default function ProductTable({ products, loading, onOpenQuota, maxResults }) {
  if (loading) {
    return (
      <div className="glass-panel rounded-xl overflow-hidden shadow-xl p-8 text-center">
        <div className="w-12 h-12 border-4 border-slate-600/30 border-t-sky-500 rounded-full animate-spin mx-auto mb-4"></div>
        <div className="text-slate-400 text-sm font-medium">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/60 text-slate-300 text-xs uppercase tracking-wider">
              <th className="p-3 font-semibold border-b border-slate-700">Código</th>
              <th className="p-3 font-semibold border-b border-slate-700 w-1/3">Descripción</th>
              <th className="p-3 font-semibold border-b border-slate-700">Bodega</th>
              <th className="p-3 font-semibold border-b border-slate-700">Clasificación</th>
              <th className="p-3 font-semibold border-b border-slate-700 text-right">Disponible</th>
              <th className="p-3 font-semibold border-b border-slate-700 text-right">Precio</th>
              <th className="p-3 font-semibold border-b border-slate-700 text-center">Cuotas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {products.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No se encontraron productos con los filtros aplicados.
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
      {products.length > 0 && maxResults && products.length >= maxResults && (
        <div className="p-3 text-center border-t border-slate-700/50 bg-slate-800/30">
          <p className="text-xs text-slate-500">
            Mostrando los primeros {maxResults} resultados para optimizar el rendimiento.
          </p>
        </div>
      )}
    </div>
  );
}
