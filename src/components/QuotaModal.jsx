import { useState, useMemo, memo } from 'react';

// Memoized table row for performance
const AmortRow = memo(function AmortRow({ row }) {
  return (
    <tr className="hover:bg-gray-700/30 transition-colors">
      <td className="px-4 py-3 text-gray-500">{row.numero}</td>
      <td className="px-4 py-3 text-right font-bold text-white">¢{row.pago}</td>
      <td className="px-4 py-3 text-right text-red-300 hidden sm:table-cell">¢{row.interes}</td>
      <td className="px-4 py-3 text-right text-green-300 hidden sm:table-cell">¢{row.capital}</td>
      <td className="px-4 py-3 text-right text-gray-400">¢{row.saldoFinal}</td>
    </tr>
  );
});

function formatCurrency(num) {
  return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function calcularPrestamo(precio, tasaAnual, meses, primaPorcentaje) {
  const prima = precio * (primaPorcentaje / 100);
  const montoFinanciar = precio - prima;
  const tasaMensual = tasaAnual / 100 / 12;

  let cuotaMensual = 0;
  if (tasaMensual === 0) {
    cuotaMensual = montoFinanciar / meses;
  } else {
    const factor = Math.pow(1 + tasaMensual, meses);
    cuotaMensual = montoFinanciar * ((tasaMensual * factor) / (factor - 1));
  }

  let saldoActual = montoFinanciar;
  let totalIntereses = 0;
  const tabla = [];

  for (let i = 1; i <= meses; i++) {
    const interesMes = saldoActual * tasaMensual;
    let capitalMes = cuotaMensual - interesMes;
    if (capitalMes > saldoActual) capitalMes = saldoActual;
    saldoActual -= capitalMes;
    if (saldoActual < 0) saldoActual = 0;
    totalIntereses += interesMes;

    tabla.push({
      numero: i,
      pago: formatCurrency(cuotaMensual),
      interes: formatCurrency(interesMes),
      capital: formatCurrency(capitalMes),
      saldoFinal: formatCurrency(saldoActual)
    });
  }

  return {
    resumen: {
      montoPrestamo: precio,
      prima,
      montoFinanciar,
      pagoMensual: cuotaMensual,
      totalIntereses
    },
    tabla
  };
}

export default function QuotaModal({ product, onClose }) {
  const [primaPct, setPrimaPct] = useState(20);
  const [tasaAnual, setTasaAnual] = useState(36);
  const [meses, setMeses] = useState(24);

  const price = parseFloat(String(product.price).replace(/[^\d.]/g, '')) || 0;

  const calc = useMemo(() => {
    if (price <= 0) return null;
    return calcularPrestamo(price, tasaAnual, meses, primaPct);
  }, [price, tasaAnual, meses, primaPct]);

  if (!calc) return null;

  return (
    <div
      className="fixed inset-0 z-50 hidden flex items-center justify-center bg-black/95 transition-opacity opacity-100 pointer-events-auto p-4"
      style={{ display: 'flex' }}
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-5xl rounded-2xl shadow-2xl transform scale-100 transition-transform duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/40">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Calculadora de Cuotas</h2>
            <p className="text-sm text-gray-400 mt-1">
              Producto: <span className="font-mono font-bold text-indigo-300">{product.code}</span> - {product.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Controls & Summary */}
            <div className="lg:col-span-1 space-y-6">
              {/* Controls */}
              <div className="bg-gray-800/50 p-5 rounded-xl border border-gray-700 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Configuración</h3>

                {/* Prima Select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Prima (Pago Inicial)</label>
                  <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                    {[15, 20, 25, 30].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrimaPct(p)}
                        className={`flex-1 py-1.5 text-sm rounded ${
                          primaPct === p
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tasa Select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Tasa de Interés Anual</label>
                  <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                    {[33, 36, 39].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTasaAnual(t)}
                        className={`flex-1 py-1.5 text-sm rounded ${
                          tasaAnual === t
                            ? 'bg-indigo-600 text-white shadow'
                            : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plazo Select */}
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Plazo (Meses)</label>
                  <select
                    value={meses}
                    onChange={(e) => setMeses(parseInt(e.target.value))}
                    className="w-full bg-gray-900 text-white text-sm border border-gray-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    {[3, 6, 12, 18, 24, 30, 36, 48].map((m) => (
                      <option key={m} value={m}>
                        {m} Meses
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Financial Summary Card */}
              <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 p-6 rounded-2xl border border-indigo-500/20 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-indigo-200 text-sm">Cuota Mensual Estimada</span>
                </div>
                <div className="text-4xl font-bold text-white mb-1 tracking-tight">
                  ¢{formatCurrency(calc.resumen.pagoMensual)}
                </div>

                <div className="mt-6 space-y-2 text-sm border-t border-white/10 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Precio de Lista</span>
                    <span className="text-white font-medium">¢{formatCurrency(calc.resumen.montoPrestamo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Prima ({primaPct}%)</span>
                    <span className="text-green-400 font-medium">- ¢{formatCurrency(calc.resumen.prima)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-white/5">
                    <span className="text-indigo-200">Monto a Financiar</span>
                    <span className="text-white font-bold">¢{formatCurrency(calc.resumen.montoFinanciar)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 pt-1">
                    <span>Intereses Totales</span>
                    <span>¢{formatCurrency(calc.resumen.totalIntereses)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Table */}
            <div className="lg:col-span-2 flex flex-col h-full bg-gray-800/30 rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="p-4 border-b border-gray-700/50 bg-gray-800/80 backdrop-blur sticky top-0 z-10">
                <h3 className="font-semibold text-gray-300">
                  Tabla de Amortización <span className="text-sm font-normal text-gray-500 ml-2">({meses} meses)</span>
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-900/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium text-right">Cuota</th>
                      <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Interés</th>
                      <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Abono Principal</th>
                      <th className="px-4 py-3 font-medium text-right">Saldo Restante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/50 text-gray-300 font-mono text-xs">
                    {calc.tabla.map((row) => {
                      const isLast = row.numero === meses;
                      return (
                        <AmortRow key={row.numero} row={row} />
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
