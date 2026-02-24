import React from 'react';
import { Header } from '../components/Layout';
import { Search, Package, AlertTriangle, CheckCircle, BarChart3, Settings, QrCode } from 'lucide-react';
import { cn } from '../lib/utils';

const items = [
  { id: '1', name: 'Generador Industrial X1', sku: 'MACH-8829-G', stock: 85, max: 100, status: 'EN STOCK', color: 'bg-brand-green' },
  { id: '2', name: 'Taladro Percutor DeWalt', sku: 'TOOL-1022-D', stock: 3, max: 25, status: 'STOCK BAJO', color: 'bg-orange-500' },
  { id: '3', name: 'Cinta Adhesiva Reforzada', sku: 'CONS-4412-C', stock: 450, max: 500, status: 'EN STOCK', color: 'bg-brand-green' },
  { id: '4', name: 'Compresor de Aire 50L', sku: 'MACH-5521-A', stock: 12, max: 15, status: 'EN STOCK', color: 'bg-brand-green' },
];

export default function Inventario() {
  return (
    <div className="pb-24 bg-background-light min-h-screen">
      <Header title="Inventario Central" />
      
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Package className="size-5" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Artículos Totales</span>
            </div>
            <p className="text-2xl font-bold">1,240 <span className="text-brand-green text-xs">+2.4%</span></p>
          </div>

          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-2 text-brand-red">
              <AlertTriangle className="size-5" />
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock Bajo</span>
            </div>
            <p className="text-2xl font-bold">12 <span className="text-brand-red text-xs">Alerta</span></p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
            <input 
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary outline-none" 
              placeholder="Buscar activos, SKU o stock..." 
            />
          </div>
          <button className="bg-white border border-slate-200 p-3 rounded-xl text-slate-600">
            <QrCode className="size-6" />
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
          <button className="px-6 py-2 bg-primary text-white rounded-full text-sm font-bold">Todos</button>
          <button className="px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600">Maquinaria</button>
          <button className="px-6 py-2 bg-white border border-slate-200 rounded-full text-sm font-medium text-slate-600">Herramientas</button>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
              {item.status === 'STOCK BAJO' && (
                <div className="absolute top-0 right-0 bg-brand-red text-white text-[8px] font-black px-3 py-1 rounded-bl-lg uppercase">
                  Stock Bajo
                </div>
              )}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <Package className="size-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{item.name}</h3>
                    <p className="text-xs text-slate-400 font-medium">SKU: {item.sku}</p>
                  </div>
                </div>
                <div className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-bold",
                  item.status === 'EN STOCK' ? "bg-brand-green/10 text-brand-green" : "bg-brand-red/10 text-brand-red"
                )}>
                  {item.status}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Nivel de Stock</span>
                  <span className={item.status === 'STOCK BAJO' ? "text-brand-red" : "text-slate-800"}>
                    {item.stock} / {item.max} unidades
                  </span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-500", item.color)} 
                    style={{ width: `${(item.stock / item.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-24 right-6">
        <button className="size-14 bg-primary text-white rounded-full shadow-xl flex items-center justify-center active:scale-95 transition-transform">
          <QrCode className="size-6" />
        </button>
      </div>
    </div>
  );
}
