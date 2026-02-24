import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Bell, History, ReceiptText, Settings } from 'lucide-react';
import { cn } from '../lib/utils';

export function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Inicio', path: '/' },
    { icon: History, label: 'Jornadas', path: '/jornadas' },
    { icon: ReceiptText, label: 'Nómina', path: '/nomina' },
    { icon: Settings, label: 'Ajustes', path: '/ajustes' },
  ];

  return (
    // Mantenemos tus comentarios y todas tus clases originales
    // CAMBIO: Quitamos 'fixed bottom-0', añadimos posicionamiento normal para el flex-col
    <nav className="bg-white border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] w-full">
      {/* Mantenemos tu pb-4 y pt-2 exactos */}
      <div className="flex gap-2 px-4 pb-4 pt-2"> 
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-1 flex-col items-center justify-center gap-1 transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )
            }
          >
            <item.icon className="size-6" />
            <p className={cn("text-[10px] leading-normal", "font-medium")}>
              {item.label}
            </p>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

export function Header({ title, showNotification = true }: { title: string; showNotification?: boolean }) {
  return (
    // CAMBIO: Quitamos 'sticky top-0' y añadimos pt-6 para que baje un poco por la cámara
    <header className="bg-white border-b border-slate-200 px-4 pb-3 pt-6 w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
            <img 
              src="https://i.postimg.cc/ZYVp15bZ/LOGO_AMA_HUMAN.png"
              alt="Logo" 
              className="object-contain"
            />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-primary">{title}</h1>
        </div>
        {showNotification && (
          <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
            <Bell className="size-6" />
          </button>
        )}
      </div>
    </header>
  );
}