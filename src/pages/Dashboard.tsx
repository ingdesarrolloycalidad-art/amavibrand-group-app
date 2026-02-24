import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Layout';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { 
  Users, Clock, Package, MapPin, TrendingUp, Loader2, Calendar, 
  ShieldCheck, Filter, XCircle 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const formatCOP = (val: number) => 
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);

export default function DashboardAnalitico() {
  const [loading, setLoading] = useState(true);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [sedesData, setSedesData] = useState<any[]>([]);
  const [dotacion, setDotacion] = useState({ total: 0, usados: 0 });

  // ESTADOS DE FILTROS
  const [filtroMes, setFiltroMes] = useState(""); // Formato "YYYY-MM"
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroSede, setFiltroSede] = useState("");

  useEffect(() => {
    const qJornadas = query(collection(db, "registrosJornadas"), orderBy("fecha", "asc"));
    const unsubJornadas = onSnapshot(qJornadas, (snap) => {
      setJornadas(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    const unsubSedes = onSnapshot(collection(db, "sedes"), (snap) => {
      setSedesData(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubDotacion = onSnapshot(collection(db, "dotacion"), (snap) => {
      let total = 0; let usados = 0;
      snap.forEach(doc => {
        const d = doc.data();
        const cant = Number(d.cantidad_disponible || 0);
        total += cant;
        if (d.estado === "Usado") usados += cant;
      });
      setDotacion({ total, usados });
    });

    return () => { unsubJornadas(); unsubSedes(); unsubDotacion(); };
  }, []);

  // --- LÓGICA DE PROCESAMIENTO DINÁMICO ---
  const { metrics, listaClientes, listaSedesCC, filteredCount } = useMemo(() => {
    // 1. Filtrar datos base usando los campos correctos de tu Firebase
    let data = jornadas.filter(reg => {
      const regMes = reg.fecha?.substring(0, 7);
      const matchMes = !filtroMes || regMes === filtroMes;
      
      // Corregido: Usamos sedeId que es el campo que muestras en tu captura
      const matchCliente = !filtroCliente || reg.sedeId === filtroCliente;
      
      // Corregido: Usamos centroCostoNombre
      const matchSede = !filtroSede || reg.centroCostoNombre === filtroSede;
      
      return matchMes && matchCliente && matchSede;
    });

    const tempEvolucion: any = {};
    const porCliente: any = {};
    const distHoras = { diurnas: 0, nocturnas: 0, extDiurnas: 0, extNocturnas: 0 };
    let totalCosto = 0;

    const modoMensual = filtroMes !== "";

    data.forEach(reg => {
      const claveEvol = modoMensual ? reg.fecha?.substring(8, 10) : reg.fecha?.substring(0, 7);
      
      // Usamos el campo 'cliente' de tu captura
      const clienteNombre = reg.cliente || "Sin Nombre";
      const costo = Number(reg.valorPago || 0);
      
      totalCosto += costo;

      if (claveEvol) {
        if (!tempEvolucion[claveEvol]) tempEvolucion[claveEvol] = { name: claveEvol, turnos: 0 };
        tempEvolucion[claveEvol].turnos += 1;
      }

      if (!porCliente[clienteNombre]) porCliente[clienteNombre] = { name: clienteNombre, turnos: 0 };
      porCliente[clienteNombre].turnos += 1;

      distHoras.diurnas += Number(reg.horasDiurnas || 0);
      distHoras.nocturnas += Number(reg.horasNocturnas || 0);
      distHoras.extDiurnas += Number(reg.horasExtrasDiurnas || 0);
      distHoras.extNocturnas += Number(reg.horasExtrasNocturnas || 0);
    });

    // 2. Preparar Selectores con los campos de tu captura
    // Obtenemos los sedeId únicos que realmente tienen jornadas
    const idsClientesConJornadas = Array.from(new Set(jornadas.map(j => j.sedeId))).filter(Boolean);
    
    // Mapeamos contra sedesData para obtener el nombre "bonito" del cliente
    const clientesParaFiltro = sedesData.filter(s => idsClientesConJornadas.includes(s.id));

    // Obtener Centros de Costo de la sede seleccionada
    const sedeSeleccionada = sedesData.find(s => s.id === filtroCliente);
    const centrosDeCosto = sedeSeleccionada?.CentroCosto || [];

    return {
      filteredCount: data.length,
      listaClientes: clientesParaFiltro,
      listaSedesCC: centrosDeCosto,
      metrics: {
        chartEvolucion: Object.values(tempEvolucion).sort((a: any, b: any) => a.name.localeCompare(b.name)),
        chartCliente: Object.values(porCliente).sort((a: any, b: any) => b.turnos - a.turnos).slice(0, 5),
        pieData: [
          { name: 'Diurnas', value: distHoras.diurnas, color: '#f59e0b' },
          { name: 'Nocturnas', value: distHoras.nocturnas, color: '#8b5cf6' },
          { name: 'Extras D.', value: distHoras.extDiurnas, color: '#10b981' },
          { name: 'Extras N.', value: distHoras.extNocturnas, color: '#6366f1' },
        ].filter(d => d.value > 0),
        totalCosto,
        modoMensual
      }
    };
  }, [jornadas, sedesData, filtroMes, filtroCliente, filtroSede]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen font-sans">
      <Header title="AmaVibrand Analytics" />

      <main className="max-w-md mx-auto p-4 space-y-4">

        {/* ACCESOS RÁPIDOS */}
        <div className="grid grid-cols-4 gap-2">
          <QuickLink icon={Users} label="Personal" to="/personal" color="text-blue-600" />
          <QuickLink icon={Calendar} label="Jornadas" to="/jornadas" color="text-emerald-600" />
          <QuickLink icon={ShieldCheck} label="Dotación" to="/dotacion" color="text-orange-600" />
          <QuickLink icon={MapPin} label="Sedes" to="/sedes" color="text-red-600" />
        </div>
        
        {/* FILTROS (Igual a tu estructura) */}
        <section className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2 mb-2">
            <Filter size={16} className="text-blue-600" />
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filtros de Análisis</h3>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            <input 
              type="month" 
              className="w-full p-3 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-600"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
            />
            
            <select 
              className="w-full p-3 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-600 appearance-none"
              value={filtroCliente}
              onChange={(e) => { setFiltroCliente(e.target.value); setFiltroSede(""); }}
            >
              <option value="">Todos los Clientes</option>
              {listaClientes.map(s => <option key={s.id} value={s.id}>{s.Cliente?.toUpperCase()}</option>)}
            </select>

            <select 
              className="w-full p-3 rounded-2xl bg-slate-50 border-none text-xs font-bold text-slate-600"
              value={filtroSede}
              onChange={(e) => setFiltroSede(e.target.value)}
              disabled={!filtroCliente}
            >
              <option value="">Todos los Centros de Costo</option>
              {listaSedesCC.map((cc: any, i: number) => <option key={i} value={cc.nombre}>{cc.nombre}</option>)}
            </select>

            {(filtroMes || filtroCliente || filtroSede) && (
              <button onClick={() => { setFiltroMes(""); setFiltroCliente(""); setFiltroSede(""); }} className="text-[9px] font-black text-red-400 uppercase text-center py-2">
                Limpiar Filtros
              </button>
            )}
          </div>
        </section>

        {/* KPI COSTO */}
        <section className="bg-blue-600 p-6 rounded-[2.5rem] text-white shadow-xl">
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Inversión Acumulada</p>
          <h2 className="text-3xl font-black mb-1">{formatCOP(metrics.totalCosto)}</h2>
          <p className="text-[10px] font-medium bg-white/20 w-fit px-3 py-1 rounded-full">{filteredCount} Turnos realizados</p>
        </section>

        {/* GRÁFICO: EVOLUCIÓN (POR TURNOS) */}
        <ChartCard 
          title={metrics.modoMensual ? `Días de ${filtroMes}` : "Evolución Mensual"} 
          subtitle="Volumen de Turnos"
        >
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.chartEvolucion}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="turnos" stroke="#3b82f6" strokeWidth={4} dot={{ r: 4, fill: '#3b82f6' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* GRÁFICO: TOP CLIENTES (POR TURNOS) */}
        <ChartCard title="Clientes con más Actividad" subtitle="Ranking por Turnos">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.chartCliente} layout="vertical" margin={{ left: -20, right: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={9} width={90} axisLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="turnos" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={15}>
                  {metrics.chartCliente.map((_, index) => (
                    <Cell key={index} fill={['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'][index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* GRÁFICO: RECARGOS */}
        <ChartCard title="Distribución de Horas" subtitle="Cálculo de Recargos">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={metrics.pieData} 
                  innerRadius={50} 
                  outerRadius={70} 
                  paddingAngle={5} 
                  dataKey="value"
                >
                  {metrics.pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                
                {/* MODIFICACIÓN AQUÍ: Formateador de Tooltip */}
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(2)} hrs`, 'Cantidad']} 
                />
                
                <Legend 
                  iconType="circle" 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

      </main>
    </div>
  );
}

// --- SUBCOMPONENTES ---
function QuickLink({ icon: Icon, label, to, color }: any) {
  return (
    <Link to={to} className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center gap-1 shadow-sm active:scale-95 transition-all">
      <Icon className={`size-5 ${color}`} />
      <span className="text-[8px] font-black text-slate-500 uppercase">{label}</span>
    </Link>
  );
}

function ChartCard({ title, subtitle, children }: any) {
  return (
    <div className="bg-white p-5 rounded-[2.5rem] border border-slate-100 shadow-sm">
      <div className="mb-4">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{title}</h3>
        <p className="text-xs font-bold text-slate-800">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}