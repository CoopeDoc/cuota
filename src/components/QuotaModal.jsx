import { useState, useMemo, memo } from 'react';

const AmortRow = memo(function AmortRow({ row, isLast }) {
  return (
    <tr className={`hover:bg-slate-700/30 transition-colors ${isLast ? 'bg-sky-900/20' : ''}`}>
      <td className="px-4 py-2.5 text-slate-500 text-xs">{row.numero}</td>
      <td className="px-4 py-2.5 text-right font-semibold text-white text-sm">¢{row.pago}</td>
      <td className="px-4 py-2.5 text-right text-red-300 hidden sm:table-cell text-xs">¢{row.interes}</td>
      <td className="px-4 py-2.5 text-right text-emerald-300 hidden sm:table-cell text-xs">¢{row.capital}</td>
      <td className="px-4 py-2.5 text-right text-slate-400 text-xs">¢{row.saldoFinal}</td>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-panel w-full max-w-5xl rounded-xl shadow-2xl transform scale-100 transition-all flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-700/50 flex justify-between items-center bg-slate-800/60">
          <div>
            <h2 className="text-xl font-bold text-white">Calculadora de Cuotas</h2>
            <p className="text-xs text-slate-400 mt-1">
              <span className="font-mono font-semibold text-sky-400">{product.code}</span> - {product.description}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors bg-slate-700/50 hover:bg-slate-600/50 p-2 rounded-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 space-y-3">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Configuración</h3>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">Prima (Pago Inicial)</label>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    {[15, 20, 25, 30].map((p) => (
                      <button
                        key={p}
                        onClick={() => setPrimaPct(p)}
                        className={`flex-1 py-1.5 text-xs rounded transition-all ${
                          primaPct === p
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {p}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">Tasa de Interés Anual</label>
                  <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-700">
                    {[33, 36, 39].map((t) => (
                      <button
                        key={t}
                        onClick={() => setTasaAnual(t)}
                        className={`flex-1 py-1.5 text-xs rounded transition-all ${
                          tasaAnual === t
                            ? 'bg-sky-600 text-white shadow-md'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-500 mb-2">Plazo (Meses)</label>
                  <select
                    value={meses}
                    onChange={(e) => setMeses(parseInt(e.target.value))}
                    className="w-full bg-slate-900 text-white text-sm border border-slate-700 rounded-lg px-3 py-2 focus:ring-2 focus:ring-sky-500 outline-none cursor-pointer"
                  >
                    {[3, 6, 12, 18, 24, 30, 36, 48].map((m) => (
                      <option key={m} value={m}>
                        {m} Meses
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-gradient-to-br from-sky-900/40 to-cyan-900/40 p-5 rounded-lg border border-sky-700/30 shadow-lg">
                <div className="mb-3">
                  <span className="text-sky-300 text-xs font-semibold uppercase tracking-wider">Cuota Mensual</span>
                </div>
                <div className="text-3xl font-bold text-white mb-4">
                  ¢{formatCurrency(calc.resumen.pagoMensual)}
                </div>

                <div className="space-y-2 text-xs border-t border-sky-700/30 pt-4">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio de Lista</span>
                    <span className="text-white font-medium">¢{formatCurrency(calc.resumen.montoPrestamo)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Prima ({primaPct}%)</span>
                    <span className="text-emerald-400 font-medium">- ¢{formatCurrency(calc.resumen.prima)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-sky-700/20">
                    <span className="text-sky-300">Monto a Financiar</span>
                    <span className="text-white font-semibold">¢{formatCurrency(calc.resumen.montoFinanciar)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Intereses Totales</span>
                    <span>¢{formatCurrency(calc.resumen.totalIntereses)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col bg-slate-800/30 rounded-lg border border-slate-700/50 overflow-hidden">
              <div className="p-3 border-b border-slate-700/50 bg-slate-800/80">
                <h3 className="font-semibold text-slate-300 text-sm">
                  Tabla de Amortización <span className="text-xs font-normal text-slate-500 ml-2">({meses} meses)</span>
                </h3>
              </div>
              <div className="overflow-y-auto flex-1 custom-scrollbar">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 uppercase bg-slate-900/50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium text-right">Cuota</th>
                      <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Interés</th>
                      <th className="px-4 py-3 font-medium text-right hidden sm:table-cell">Principal</th>
                      <th className="px-4 py-3 font-medium text-right">Saldo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50 text-slate-300 font-mono">
                    {calc.tabla.map((row) => (
                      <AmortRow key={row.numero} row={row} isLast={row.numero === meses} />
                    ))}
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
