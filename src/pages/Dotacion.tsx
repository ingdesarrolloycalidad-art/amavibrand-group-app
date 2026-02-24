import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Layout';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { 
  Package, 
  UserCheck, 
  Search, 
  Calendar, 
  Tag, 
  ChevronDown, 
  ChevronUp,
  Box,
  Truck,
  AlertCircle,
  History
} from 'lucide-react';

export default function SeccionDotacion() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'stock' | 'entregas'>('stock');
  const [stock, setStock] = useState<any[]>([]);
  const [entregasRaw, setEntregasRaw] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [personaExpandida, setPersonaExpandida] = useState<string | null>(null);

  useEffect(() => {
    const unsubStock = onSnapshot(collection(db, "dotacion"), (snap) => {
      setStock(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qEntregas = query(collection(db, "entregasEPP"), orderBy("fechaEntrega", "desc"));
    const unsubEntregas = onSnapshot(qEntregas, (snap) => {
      setEntregasRaw(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => { unsubStock(); unsubEntregas(); };
  }, []);

  // --- LÓGICA DE AGRUPAMIENTO Y FILTRADO ---
  const { stockFiltrado, entregasAgrupadas } = useMemo(() => {
    const term = busqueda.toLowerCase();

    // Filtrar Stock
    const sf = stock.filter(item => 
      item.tipo?.toLowerCase().includes(term) || 
      item.talla?.toLowerCase().includes(term)
    );

    // Agrupar Entregas por responsableId
    const grupos: Record<string, any> = {};
    
    entregasRaw.forEach(reg => {
      const id = reg.responsableId;
      if (!grupos[id]) {
        grupos[id] = {
          responsableId: id,
          responsableNombre: reg.responsableNombre,
          items: []
        };
      }
      grupos[id].items.push(reg);
    });

    // Filtrar Grupos por nombre o cédula
    const ea = Object.values(grupos).filter((persona: any) => 
      persona.responsableNombre?.toLowerCase().includes(term) || 
      persona.responsableId?.includes(term)
    );

    return { stockFiltrado: sf, entregasAgrupadas: ea };
  }, [stock, entregasRaw, busqueda]);

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      <Header title="Control de Dotación" />

      <main className="max-w-md mx-auto p-4 space-y-4">
        
        {/* BUSCADOR */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder={tab === 'stock' ? "Buscar implemento..." : "Buscar empleado o CC..."}
            className="w-full bg-white border-none rounded-3xl py-4 pl-12 pr-4 shadow-sm text-sm font-medium focus:ring-2 focus:ring-blue-500 transition-all"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        {/* TABS */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl">
          <button onClick={() => setTab('stock')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${tab === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <Box size={14} /> Stock
          </button>
          <button onClick={() => setTab('entregas')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${tab === 'entregas' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}>
            <Truck size={14} /> Por Personal
          </button>
        </div>

        {/* LISTADO */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-10 text-slate-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Consultando...</div>
          ) : (tab === 'stock' ? stockFiltrado : entregasAgrupadas).length === 0 ? (
            <div className="bg-white p-10 rounded-[2.5rem] text-center border border-dashed border-slate-300">
              <AlertCircle className="mx-auto text-slate-300 mb-2" size={32} />
              <p className="text-slate-500 text-xs font-bold">No hay registros</p>
            </div>
          ) : (
            tab === 'stock' 
              ? stockFiltrado.map(item => <StockCard key={item.id} item={item} />)
              : entregasAgrupadas.map((persona: any) => (
                  <PersonaEntregaCard 
                    key={persona.responsableId} 
                    persona={persona} 
                    isExpanded={personaExpandida === persona.responsableId}
                    onToggle={() => setPersonaExpandida(personaExpandida === persona.responsableId ? null : persona.responsableId)}
                  />
                ))
          )}
        </div>
      </main>
    </div>
  );
}

// --- COMPONENTE AGRUPADO POR PERSONA ---
function PersonaEntregaCard({ persona, isExpanded, onToggle }: any) {
  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden transition-all">
      {/* Cabecera Tocar para expandir */}
      <div 
        onClick={onToggle}
        className="p-5 flex items-center justify-between cursor-pointer active:bg-slate-50"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white">
            <UserCheck size={20} />
          </div>
          <div>
            <h4 className="font-black text-slate-800 text-xs uppercase">{persona.responsableNombre}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CC {persona.responsableId}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2.5 py-1 rounded-lg">
            {persona.items.length} {persona.items.length === 1 ? 'ÍTEM' : 'ÍTEMS'}
          </span>
          {isExpanded ? <ChevronUp size={18} className="text-slate-300" /> : <ChevronDown size={18} className="text-slate-300" />}
        </div>
      </div>

      {/* Detalle Expandible */}
      {isExpanded && (
        <div className="px-5 pb-5 space-y-3 bg-slate-50/50 pt-2">
          <div className="flex items-center gap-2 mb-1">
            <History size={12} className="text-slate-400" />
            <span className="text-[9px] font-black text-slate-400 uppercase">Historial de entregas</span>
          </div>
          
          {persona.items.map((entrega: any) => (
            <div key={entrega.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="text-[11px] font-black text-slate-700 uppercase">{entrega.tipo}</p>
                  <p className="text-[9px] font-bold text-slate-400 italic">Talla: {entrega.talla}</p>
                </div>
                <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  x{entrega.cantidad}
                </span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
                  <Calendar size={12} className="text-emerald-500" /> {entrega.fechaEntrega}
                </div>
                {entrega.vencimiento && (
                  <div className="text-[9px] font-black text-orange-500 uppercase tracking-tighter">
                    Vence: {entrega.vencimiento}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- COMPONENTE STOCK ---
function StockCard({ item }: { item: any }) {
  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-4">
      <div className="bg-slate-100 p-4 rounded-3xl text-slate-600">
        <Package size={24} />
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-start">
          <h4 className="font-black text-slate-800 text-sm uppercase">{item.tipo}</h4>
          <span className="bg-emerald-100 text-emerald-700 text-[9px] font-black px-2 py-1 rounded-lg uppercase">
            {item.cantidad_disponible || 0} DISP.
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 italic">
            <Tag size={10} /> Talla {item.talla}
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
            <div className={`w-1.5 h-1.5 rounded-full ${item.estado === 'Nuevo' ? 'bg-emerald-400' : 'bg-orange-400'}`} />
            {item.estado}
          </span>
        </div>
      </div>
    </div>
  );
}