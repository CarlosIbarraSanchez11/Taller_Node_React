import { useState } from 'react'
import Layout from '../components/layout/Layout'
import { useAuth } from '../context/AuthContext'
import { configuracionRentabilidadMock } from '../services/mockData' // Importación centralizada

const GASTOS_LABELS = [
  { key: 'alquiler',     label: 'Alquiler' },
  { key: 'gestion',      label: 'Gestión' },
  { key: 'marketing',    label: 'Marketing' },
  { key: 'herramientas', label: 'Herramientas' },
  { key: 'transporte',   label: 'Transporte' },
]

export default function Rentabilidad() {
  const { user } = useAuth()
  const [matrix, setMatrix] = useState(configuracionRentabilidadMock)
  const [saved, setSaved] = useState(false)

  if (!user) return null

  const setVal = (key, val) => {
    setMatrix(m => ({ ...m, [key]: val }))
    setSaved(false)
  }

  const totalGastos = GASTOS_LABELS.reduce((acc, g) => acc + Number(matrix[g.key] || 0), 0)
  const utilidadFinal = Number(matrix.utilidad || 0)

  const handleGuardar = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
    // Aquí iría la lógica para persistir en el mock o API
    console.log("Nueva Matriz Maestra:", matrix)
  }

  const inputCls = "w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-[#1a3a5c] transition-all font-bold text-[#1a3a5c]"

  return (
    <Layout tituloNavbar="Configuración del Negocio">
      <div className="p-6 min-h-screen" style={{ background: '#f6f8fb' }}>
        
        {/* Header unificado */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a3a5c] tracking-tight">Matriz de Rentabilidad</h1>
            <p className="text-gray-400 text-sm">Define los porcentajes maestros para el cálculo de precios sugeridos</p>
          </div>
          <button onClick={handleGuardar}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg transition-all flex items-center gap-2 ${saved ? 'bg-green-600 text-white' : 'bg-[#1a3a5c] text-white hover:bg-[#243f66]'}`}>
            {saved ? '✓ CAMBIOS GUARDADOS' : 'ACTUALIZAR MATRIZ MAESTRA'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Columna Izquierda: Entradas de Gastos */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Gastos Operativos (%)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GASTOS_LABELS.map(g => (
                  <div key={g.key} className="p-4 bg-gray-50/50 border border-gray-100 rounded-2xl">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest">{g.label}</label>
                    <input type="number" value={matrix[g.key]} step="0.1"
                      onChange={e => setVal(g.key, e.target.value)}
                      className={inputCls} />
                  </div>
                ))}
                
                {/* Card de Resultado de Gastos */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col justify-center">
                  <label className="block text-[10px] font-bold text-blue-400 uppercase mb-1 tracking-widest">Carga Operativa Total</label>
                  <p className="text-3xl font-black text-blue-600">{totalGastos.toFixed(2)}%</p>
                </div>
              </div>
            </div>

            {/* Live Formula Preview */}
            <div className="bg-[#1a3a5c] p-5 rounded-2xl text-white shadow-xl relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-2">Fórmula de Precio sugerido activa</p>
                 <p className="text-sm font-medium leading-relaxed">
                   Costo Directo × <span className="text-yellow-400">(1 + {totalGastos}%)</span> Gastos × <span className="text-green-400">(1 + {utilidadFinal}%)</span> Utilidad
                 </p>
               </div>
               <div className="absolute -right-4 -bottom-4 opacity-10 text-8xl font-black">f(x)</div>
            </div>
          </div>

          {/* Columna Derecha: Utilidad y Resumen */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Margen Neto</h3>
              </div>
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-3 tracking-widest">Utilidad deseada (%)</p>
              <input type="number" value={matrix.utilidad} 
                onChange={e => setVal('utilidad', e.target.value)}
                className={`${inputCls} text-2xl py-4 text-green-600 border-green-100 bg-green-50/30 focus:border-green-500`} />
              
              <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-100">
                <p className="text-[11px] text-amber-700 leading-tight italic">
                  "Este margen se calcula sobre el costo operativo ya inflado. Asegura la rentabilidad neta del taller."
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}