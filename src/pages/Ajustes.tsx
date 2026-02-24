import React, { useEffect, useState, useRef } from 'react'; // Añadido useRef
import { User, Lock, ChevronRight, FileText, Table, History, Database, LogOut, Loader2, X, Save, Camera, Upload } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { signOut, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { cn } from '../lib/utils';

export default function Ajustes() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null); // Referencia para el input de cámara

  // Estados para Modales e Interfaz
  const [activeModal, setActiveModal] = useState<'perfil' | 'seguridad' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // Estados de Formulario
  const [editForm, setEditForm] = useState({ nombre: '', foto: '' });
  const [passForm, setPassForm] = useState({ p1: '', p2: '' });

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (auth.currentUser) {
      try {
        const userDoc = await getDoc(doc(db, "usuarios", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          setEditForm({ nombre: data.nombre || '', foto: data.foto || '' });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para manejar la foto desde el carrete/cámara
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm({ ...editForm, foto: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const userRef = doc(db, "usuarios", auth.currentUser!.uid);
      await updateDoc(userRef, { 
        nombre: editForm.nombre, 
        foto: editForm.foto 
      });
      setUserData({ ...userData, nombre: editForm.nombre, foto: editForm.foto });
      setStatusMsg({ type: 'success', text: 'Perfil actualizado correctamente' });
      setTimeout(() => { setActiveModal(null); setStatusMsg({ type: '', text: '' }); }, 1500);
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.p1 !== passForm.p2) {
      setStatusMsg({ type: 'error', text: 'Las contraseñas no coinciden' });
      return;
    }
    if (passForm.p1.length < 6) {
      setStatusMsg({ type: 'error', text: 'Debe tener al menos 6 caracteres' });
      return;
    }

    setActionLoading(true);
    try {
      await updatePassword(auth.currentUser!, passForm.p1);
      setStatusMsg({ type: 'success', text: 'Contraseña actualizada con éxito' });
      setTimeout(() => { 
        setActiveModal(null); 
        setStatusMsg({ type: '', text: '' }); 
        setPassForm({ p1: '', p2: '' }); 
      }, 1500);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: 'Error. Por seguridad, re-inicia sesión e intenta de nuevo.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="pb-24 bg-background-light min-h-screen">
      {/* HEADER ORIGINAL */}
      <div className="flex items-center bg-white p-4 sticky top-0 z-10 border-b border-slate-200 justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold leading-tight tracking-tight">Ajustes</h1>
        </div>
        <button onClick={handleLogout} className="text-primary font-medium text-sm flex items-center gap-1">
          <LogOut className="size-4" />
          Cerrar Sesión
        </button>
      </div>

      {/* PERFIL DINÁMICO */}
      <div className="flex p-6 flex-col items-center">
        <div className="relative mb-4">
          <img 
            alt="User Avatar" 
            className="rounded-full h-32 w-32 object-cover border-4 border-white shadow-md bg-slate-100" 
            src={userData?.foto || "https://i.postimg.cc/J45mQ474/avatar.png"}
          />
          <div className="absolute bottom-1 right-1 bg-brand-green border-2 border-white w-6 h-6 rounded-full shadow-sm"></div>
        </div>
        
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin size-4 text-slate-400" />
            <span className="text-slate-400 text-sm">Cargando perfil...</span>
          </div>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold leading-tight text-slate-900">
              {userData?.nombre || "Usuario AMA"}
            </h2>
            <p className="text-slate-500 text-sm font-normal">
              {auth.currentUser?.email}
            </p>
          </div>
        )}
      </div>

      <div className="px-4 space-y-6">
        {/* SECCIÓN CONFIGURACIÓN */}
        <section>
          <h2 className="text-slate-900 text-lg font-bold leading-tight px-1 pb-3">Configuración de Cuenta</h2>
          <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <SettingsItem 
              icon={User} 
              title="Editar Perfil" 
              subtitle="Nombre, correo y foto" 
              onClick={() => setActiveModal('perfil')}
            />
            <SettingsItem 
              icon={Lock} 
              title="Seguridad" 
              subtitle="Cambiar contraseña" 
              isLast 
              onClick={() => setActiveModal('seguridad')}
            />
          </div>
        </section>

        {/* SECCIÓN EXPORTAR */}
        {userData?.rol !== "Auxiliar" && (
          <section>
            <h2 className="text-slate-900 text-lg font-bold leading-tight px-1 pb-3">Exportar Datos</h2>
            <div className="space-y-3">
              <ExportItem icon={FileText} title="Reporte de Nóminas" subtitle="Resumen mensual de pagos" format="PDF" color="bg-red-100 text-brand-red" />
              <ExportItem icon={Table} title="Inventario Completo" subtitle="Stock y valor de almacén" format="EXCEL" color="bg-green-100 text-brand-green" />
              <ExportItem icon={History} title="Registro de Jornadas" subtitle="Control de asistencia diario" format="CSV" color="bg-blue-100 text-primary" />
            </div>
          </section>
        )}

        {/* ESTADO DEL SISTEMA ORIGINAL */}
        <section>
          <h2 className="text-slate-900 text-lg font-bold leading-tight px-1 pb-3">Estado del Sistema</h2>
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-full bg-orange-100 p-2 text-orange-600">
                <Database className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Google Firebase</p>
                <p className="text-xs text-slate-500 font-medium">Región: us-east1</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
              <div className="w-2 h-2 bg-brand-green rounded-full animate-pulse"></div>
              <span className="text-brand-green text-[10px] font-black uppercase tracking-wider">Online</span>
            </div>
          </div>
        </section>
      </div>

      {/* MODAL EDITAR PERFIL ACTUALIZADO CON CÁMARA */}
      {activeModal === 'perfil' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Editar Perfil</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="size-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              
              {/* ÁREA DE FOTO CON CÁMARA */}
              <div className="flex flex-col items-center gap-2 mb-4">
                <div 
                  className="relative group cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <img 
                    src={editForm.foto || "https://i.postimg.cc/J45mQ474/avatar.png"} 
                    className="size-24 rounded-full object-cover border-4 border-slate-50 shadow-md"
                    alt="Preview"
                  />
                  <div className="absolute inset-0 bg-black/20 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white size-6" />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-primary p-1.5 rounded-full text-white border-2 border-white shadow-sm">
                    <Upload className="size-3" />
                  </div>
                </div>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                />
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toca para cambiar foto</p>
              </div>

              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nombre Completo</label>
                <input 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-medium transition-all"
                  value={editForm.nombre}
                  onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                  required
                />
              </div>

              {statusMsg.text && (
                <p className={cn("text-center text-xs font-bold p-2 rounded-lg", statusMsg.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-brand-green')}>
                  {statusMsg.text}
                </p>
              )}
              <button disabled={actionLoading} className="w-full bg-primary text-white p-3.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-lg shadow-primary/20 active:scale-[0.98] transition-all">
                {actionLoading ? <Loader2 className="animate-spin size-5" /> : <><Save className="size-5" /> Guardar Cambios</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SEGURIDAD (Se mantiene igual que el tuyo) */}
      {activeModal === 'seguridad' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl scale-in-center">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-xl">Actualizar Clave</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-full transition-colors"><X className="size-6 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nueva Contraseña</label>
                <input 
                  type="password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={passForm.p1}
                  onChange={(e) => setPassForm({...passForm, p1: e.target.value})}
                  placeholder="Mínimo 6 caracteres"
                  required
                />
              </div>
              <div className="space-y-1 text-left">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Confirmar Contraseña</label>
                <input 
                  type="password"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  value={passForm.p2}
                  onChange={(e) => setPassForm({...passForm, p2: e.target.value})}
                  placeholder="Escribe de nuevo la clave"
                  required
                />
              </div>
              {statusMsg.text && (
                <p className={cn("text-center text-xs font-bold p-2 rounded-lg", statusMsg.type === 'error' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-brand-green')}>
                  {statusMsg.text}
                </p>
              )}
              <button disabled={actionLoading} className="w-full bg-slate-900 text-white p-3.5 rounded-xl font-bold flex justify-center items-center shadow-lg active:scale-[0.98] transition-all">
                {actionLoading ? <Loader2 className="animate-spin size-5" /> : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// SUB-COMPONENTES (Sin cambios, manteniendo tu estructura original)
function SettingsItem({ icon: Icon, title, subtitle, isLast, onClick }: { icon: any; title: string; subtitle: string; isLast?: boolean; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-4 px-4 py-4 hover:bg-slate-50 transition-colors",
        !isLast && "border-b border-slate-100"
      )}
    >
      <div className="flex items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 size-10">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-500 font-medium">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-slate-300" />
    </button>
  );
}

function ExportItem({ icon: Icon, title, subtitle, format, color }: { icon: any; title: string; subtitle: string; format: string; color: string }) {
  return (
    <div className="flex items-center gap-4 bg-white px-4 py-4 rounded-xl border border-slate-200 justify-between shadow-sm">
      <div className="flex items-center gap-4">
        <div className={cn("flex items-center justify-center rounded-lg shrink-0 size-12 shadow-inner", color)}>
          <Icon className="size-6" />
        </div>
        <div className="flex flex-col justify-center text-left">
          <p className="text-base font-medium leading-tight text-slate-900">{title}</p>
          <p className="text-slate-500 text-sm">{subtitle}</p>
        </div>
      </div>
      <button className="flex min-w-[80px] items-center justify-center rounded-lg h-9 px-3 bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-sm hover:opacity-90 active:scale-95 transition-all">
        {format}
      </button>
    </div>
  );
}