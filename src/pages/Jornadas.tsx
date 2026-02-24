import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Layout';
import { 
  Search, Calendar, Filter, Loader2, UserCheck, CreditCard, X, Clock 
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function Jornadas() {
  const [loading, setLoading] = useState(true);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCliente, setFilterCliente] = useState("all");
  const [filterCC, setFilterCC] = useState("all");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");

  // 1. Lógica de Quincena por defecto
  const limitesQuincena = useMemo(() => {
    const hoy = new Date(); 
    const anio = hoy.getFullYear();
    const mes = hoy.getMonth();
    const dia = hoy.getDate();
    const inicio = dia <= 15 ? 1 : 16;
    const fin = dia <= 15 ? 15 : new Date(anio, mes + 1, 0).getDate();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return {
      desde: `${anio}-${pad(mes + 1)}-${pad(inicio)}`,
      hasta: `${anio}-${pad(mes + 1)}-${pad(fin)}`
    };
  }, []);

  useEffect(() => {
    const q = query(collection(db, "registrosJornadas"), orderBy("fecha", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const docs = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setJornadas(docs);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 2. Filtrado y Ordenamiento Maestro (Cliente > CC > Nombre > Fecha)
  const jornadasMostradas = useMemo(() => {
    const filtradas = jornadas.filter(j => {
      const cumpleNombre = j.nombre?.toLowerCase().includes(searchTerm.toLowerCase());
      const cumpleCliente = filterCliente === "all" || j.cliente === filterCliente;
      const cumpleCC = filterCC === "all" || j.centroCostoNombre === filterCC;
      
      let cumpleRango = true;
      if (fechaInicio && fechaFin) {
        cumpleRango = j.fecha >= fechaInicio && j.fecha <= fechaFin;
      } else if (fechaInicio) {
        cumpleRango = j.fecha >= fechaInicio;
      } else if (fechaFin) {
        cumpleRango = j.fecha <= fechaFin;
      }

      const filtroManualActivo = searchTerm || filterCliente !== "all" || filterCC !== "all" || fechaInicio || fechaFin;
      
      if (!filtroManualActivo) {
        return j.fecha >= limitesQuincena.desde && j.fecha <= limitesQuincena.hasta;
      }
      return cumpleNombre && cumpleCliente && cumpleCC && cumpleRango;
    });

    return [...filtradas].sort((a, b) => {
      if (a.cliente !== b.cliente) return a.cliente.localeCompare(b.cliente);
      if (a.centroCostoNombre !== b.centroCostoNombre) 
        return (a.centroCostoNombre || "").localeCompare(b.centroCostoNombre || "");
      if (a.nombre !== b.nombre) return a.nombre.localeCompare(b.nombre);
      return b.fecha.localeCompare(a.fecha);
    });
  }, [jornadas, searchTerm, filterCliente, filterCC, fechaInicio, fechaFin, limitesQuincena]);

  // 3. Estadísticas (Redondeo de Nómina y 2 decimales en Horas)
  const stats = useMemo(() => ({
    total: jornadasMostradas.length,
    nomina: Math.round(jornadasMostradas.reduce((acc, curr) => acc + (Number(curr.valorPago) || 0), 0)),
    horas: jornadasMostradas.reduce((acc, curr) => acc + (Number(curr.horasTrabajadas) || 0), 0)
  }), [jornadasMostradas]);

  const opcionesFiltro = useMemo(() => ({
    clientes: Array.from(new Set(jornadas.map(j => j.cliente).filter(Boolean))),
    ccs: Array.from(new Set(jornadas.map(j => j.centroCostoNombre).filter(Boolean)))
  }), [jornadas]);

  const limpiarFiltros = () => {
    setSearchTerm("");
    setFilterCliente("all");
    setFilterCC("all");
    setFechaInicio("");
    setFechaFin("");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin text-blue-600 size-10" /></div>;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      <Header title="Reporte de Nómina" />
      
      <div className="p-4 space-y-4">
        {/* CARDS DE RESUMEN */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900 p-5 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-1">Registros</p>
            <p className="text-4xl font-black">{stats.total}</p>
            <p className="text-[8px] font-bold text-slate-500 mt-2 uppercase">
              {stats.horas.toLocaleString('es-CO', { maximumFractionDigits: 2 })}h Totales
            </p>
          </div>
          
          <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">Inversión Nómina</p>
            <p className="text-2xl font-black text-slate-800">
              ${stats.nomina.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
            </p>
            <div className="mt-2 flex items-center gap-1">
              <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-tighter">Sin decimales</span>
            </div>
          </div>
        </div>

        {/* PANEL DE FILTROS */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Controles de vista</h3>
            {(searchTerm || fechaInicio || fechaFin || filterCliente !== 'all' || filterCC !== 'all') && (
              <button onClick={limpiarFiltros} className="text-[9px] font-black text-red-500 uppercase">Limpiar</button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-bold outline-none border-none text-slate-600 shadow-inner" />
            <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="w-full bg-slate-50 p-3 rounded-xl text-[10px] font-bold outline-none border-none text-slate-600 shadow-inner" />
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
            <input className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none" placeholder="Buscar trabajador..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select value={filterCliente} onChange={(e) => setFilterCliente(e.target.value)} className="bg-slate-50 px-3 py-3 rounded-xl text-[10px] font-black uppercase text-slate-500 outline-none">
              <option value="all">Todos los Clientes</option>
              {opcionesFiltro.clientes.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterCC} onChange={(e) => setFilterCC(e.target.value)} className="bg-slate-50 px-3 py-3 rounded-xl text-[10px] font-black uppercase text-slate-500 outline-none">
              <option value="all">Todas las Sedes</option>
              {opcionesFiltro.ccs.map(cc => <option key={cc} value={cc}>{cc}</option>)}
            </select>
          </div>
        </div>

        {/* LISTADO DE RESULTADOS */}
        <div className="space-y-3">
          {jornadasMostradas.map((log) => (
            <div key={log.id} className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm transition-all active:scale-[0.98]">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-[10px]">
                    {log.nombre?.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-slate-800 leading-none">{log.nombre}</h3>
                    <p className="text-[9px] font-bold text-blue-600 uppercase mt-1 tracking-tighter">
                      {log.cliente}
                    </p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase mt-0.5">
                      CC: {log.centroCostoNombre || 'Sin Centro'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[11px] font-black text-slate-800">
                    ${Math.round(Number(log.valorPago)).toLocaleString('es-CO')}
                  </p>
                  <p className="text-[8px] font-extrabold text-slate-300 uppercase tracking-widest">{log.fecha}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex gap-4 text-[10px] font-bold text-slate-600">
                  <div className="flex flex-col">
                    <span className="text-[6px] text-slate-400 uppercase font-black">Entrada</span>
                    <span>{log.horaInicio}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[6px] text-slate-400 uppercase font-black">Salida</span>
                    <span>{log.horaFin || '--:--'}</span>
                  </div>
                </div>
                {/* Horas con máximo 2 decimales */}
                <div className="bg-slate-900 px-3 py-1 rounded-full text-white text-[10px] font-black italic shadow-sm">
                  {Number(log.horasTrabajadas).toLocaleString('es-CO', { maximumFractionDigits: 2 })}h
                </div>
              </div>
            </div>
          ))}
          
          {jornadasMostradas.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] italic">
                No se hallaron registros
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}