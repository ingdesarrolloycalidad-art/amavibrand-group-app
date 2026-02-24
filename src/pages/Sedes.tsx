import React, { useEffect, useState } from 'react';
import { Header } from '../components/Layout';
import { db } from '../lib/firebase';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { 
  MapPin, 
  Search, 
  Edit3, 
  Save, 
  X, 
  ChevronRight, 
  Building2,
  DollarSign,
  Briefcase
} from 'lucide-react';

export default function Sedes() {
  const [sedes, setSedes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sedeEditando, setSedeEditando] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "sedes"), (snap) => {
      setSedes(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    if (!sedeEditando) return;
    try {
      const sedeRef = doc(db, "sedes", sedeEditando.id);
      const { id, ...dataToUpdate } = sedeEditando;
      await updateDoc(sedeRef, dataToUpdate);
      setSedeEditando(null);
      alert("Sede actualizada correctamente");
    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }
  };

  const sedesFiltradas = sedes.filter(s => 
    s.Cliente?.toLowerCase().includes(busqueda.toLowerCase()) ||
    s.NIT?.includes(busqueda)
  );

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      <Header title="Gestión de Sedes" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        {/* BUSCADOR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Buscar por cliente o NIT..."
            className="w-full bg-white border-none rounded-3xl py-4 pl-12 pr-4 shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-500"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* LISTADO DE SEDES */}
        <div className="space-y-3">
          {sedesFiltradas.map(sede => (
            <div 
              key={sede.id} 
              onClick={() => setSedeEditando(JSON.parse(JSON.stringify(sede)))}
              className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center justify-between active:scale-95 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                  <Building2 size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-800 text-xs uppercase">{sede.Cliente}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">NIT: {sede.NIT}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-300" />
            </div>
          ))}
        </div>
      </main>

      {/* MODAL DE EDICIÓN */}
      {sedeEditando && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md h-[90vh] overflow-y-auto rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl flex flex-col">
            
            {/* Header Modal */}
            <div className="p-6 border-b border-slate-50 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-black text-slate-800 text-sm uppercase">Editar Cliente</h3>
                <p className="text-[10px] font-bold text-blue-600 uppercase">{sedeEditando.Cliente}</p>
              </div>
              <button onClick={() => setSedeEditando(null)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* SECCIÓN CENTROS DE COSTO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Briefcase size={16} className="text-slate-400" />
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Centros de Costo (Tarifas Nómina)</h4>
                </div>

                {sedeEditando.CentroCosto?.map((cc: any, index: number) => (
                  <div key={index} className="bg-slate-50 p-4 rounded-3xl border border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] font-black text-slate-700 uppercase">{cc.nombre}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">ID: {cc.id?.slice(-5)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Diurna</label>
                        <input 
                          type="number"
                          className="w-full bg-white border-none rounded-xl p-2 text-[10px] font-bold"
                          value={cc.tarifas?.nomina?.Diurna || 0}
                          onChange={(e) => {
                            const newCC = [...sedeEditando.CentroCosto];
                            newCC[index].tarifas.nomina.Diurna = Number(e.target.value);
                            setSedeEditando({...sedeEditando, CentroCosto: newCC});
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Nocturna</label>
                        <input 
                          type="number"
                          className="w-full bg-white border-none rounded-xl p-2 text-[10px] font-bold"
                          value={cc.tarifas?.nomina?.Nocturna || 0}
                          onChange={(e) => {
                            const newCC = [...sedeEditando.CentroCosto];
                            newCC[index].tarifas.nomina.Nocturna = Number(e.target.value);
                            setSedeEditando({...sedeEditando, CentroCosto: newCC});
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Extra Diurna</label>
                        <input 
                          type="number"
                          className="w-full bg-white border-none rounded-xl p-2 text-[10px] font-bold"
                          value={cc.tarifas?.nomina?.ExtraDiurna || 0}
                          onChange={(e) => {
                            const newCC = [...sedeEditando.CentroCosto];
                            newCC[index].tarifas.nomina.ExtraDiurna = Number(e.target.value);
                            setSedeEditando({...sedeEditando, CentroCosto: newCC});
                          }}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] font-black text-slate-400 uppercase ml-2">Extra Nocturna</label>
                        <input 
                          type="number"
                          className="w-full bg-white border-none rounded-xl p-2 text-[10px] font-bold"
                          value={cc.tarifas?.nomina?.ExtraNocturna || 0}
                          onChange={(e) => {
                            const newCC = [...sedeEditando.CentroCosto];
                            newCC[index].tarifas.nomina.ExtraNocturna = Number(e.target.value);
                            setSedeEditando({...sedeEditando, CentroCosto: newCC});
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer Modal */}
            <div className="p-6 bg-slate-50 sticky bottom-0 border-t border-slate-100 flex gap-2">
              <button 
                onClick={handleSave}
                className="flex-1 bg-blue-600 text-white font-black text-[10px] uppercase py-4 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
              >
                <Save size={16} /> Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}