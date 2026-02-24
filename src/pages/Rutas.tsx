import React from 'react';
import { Header } from '../components/Layout';
import { Search, Fuel, Timer, MapPin, MoreVertical, CheckCircle, Clock, Plus, UserPlus } from 'lucide-react';
import { cn } from '../lib/utils';

const activeRoutes = [
  { id: '1', name: 'Ruta A-12: Zona Norte', vehicle: 'FR-442', driver: 'Carlos Méndez', progress: 65, status: 'EN PROGRESO', color: 'bg-primary' },
  { id: '2', name: 'Ruta C-08: Centro Histórico', vehicle: 'TR-901', driver: 'Ana Silva', progress: 100, status: 'COMPLETADO', color: 'bg-brand-green' },
];

export default function Rutas() {
  return (
    <div className="pb-24 bg-background-light min-h-screen">
      <Header title="Rutas y Logística" />
      
      <div className="p-4">
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
          <input 
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" 
            placeholder="Buscar ruta, conductor o placa..." 
          />
        </div>

        <div className="flex gap-4 overflow-x-auto no-scrollbar mb-6">
          <StatCard icon={Fuel} label="Combustible" value="94%" trend="+ 2.4% vs ayer" trendColor="text-brand-green" />
          <StatCard icon={Timer} label="Puntualidad" value="88%" trend="- 1.2% demoras" trendColor="text-brand-red" />
        </div>

        {/* Map Placeholder */}
        <div className="bg-slate-200 rounded-3xl h-60 w-full mb-6 relative overflow-hidden flex items-center justify-center text-slate-400 font-bold text-sm">
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full flex items-center gap-2 shadow-sm">
            <div className="size-2 bg-brand-green rounded-full animate-pulse"></div>
            <span className="text-[10px] text-slate-800 uppercase tracking-wider">En Vivo</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <MapPin className="size-8" />
            <span>Mapa de Seguimiento</span>
          </div>
          <button className="absolute bottom-4 right-4 bg-white p-2 rounded-xl shadow-md">
            <Search className="size-5 text-slate-600" />
          </button>
        </div>

        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-slate-800">Rutas Activas</h2>
          <button className="text-primary text-xs font-bold flex items-center gap-1">
            Filtrar
          </button>
        </div>

        <div className="space-y-4">
          {activeRoutes.map((route) => (
            <div key={route.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">{route.name}</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ID: #45902 • Vehículo: {route.vehicle}</p>
                </div>
                <div className={cn(
                  "px-3 py-1 rounded-full text-[9px] font-black tracking-wider uppercase",
                  route.status === 'EN PROGRESO' ? "bg-primary/10 text-primary" : "bg-brand-green/10 text-brand-green"
                )}>
                  {route.status}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Progreso de entrega</span>
                  <span className="text-slate-800">{route.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-700", route.color)} 
                    style={{ width: `${route.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-slate-100 overflow-hidden">
                    <img src={`https://i.pravatar.cc/150?u=${route.driver}`} alt={route.driver} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">{route.driver}</p>
                    <p className="text-[10px] text-slate-400">Hace 5 min en Av. Reforma</p>
                  </div>
                </div>
                <button className="text-slate-400">
                  <MoreVertical className="size-5" />
                </button>
              </div>
            </div>
          ))}

          {/* Pending Route Card */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border-2 border-dashed border-slate-200 flex flex-col items-center text-center gap-4">
            <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="size-6" />
            </div>
            <div>
              <h3 className="font-bold text-primary uppercase tracking-wider text-sm">Ruta D-15: PENDIENTE</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Requiere asignación de conductor para el turno de tarde</p>
            </div>
            <button className="bg-primary text-white px-8 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 active:scale-95 transition-transform">
              Asignar Conductor
            </button>
          </div>
        </div>
      </div>

      <button className="fixed bottom-24 right-6 size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform">
        <Plus className="size-8" />
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, trend, trendColor }: any) {
  return (
    <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100 min-w-[160px] flex-1">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-2 rounded-xl bg-slate-50 text-primary">
          <Icon className="size-4" />
        </div>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
      <p className={cn("text-[10px] font-bold mt-1", trendColor)}>{trend}</p>
    </div>
  );
}
