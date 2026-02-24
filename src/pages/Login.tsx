import React, { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const userDoc = await getDoc(doc(db, "usuarios", userCredential.user.uid));
      
      if (!userDoc.exists()) {
        await auth.signOut();
        setError('Usuario no autorizado en la base de datos.');
        return;
      }
    } catch (err: any) {
      setError('Credenciales inválidas. Por favor intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    /* CAMBIO: h-full y flex-1 para que respete el contenedor de App.tsx */
    <div className="flex flex-col h-full bg-background-light">
      
      {/* HEADER: Le añadimos un padding top extra para asegurar que no toque la cámara */}
      <div className="flex items-center bg-white p-3 pt-6 justify-between shadow-sm border-b border-slate-100">
        <div className="text-primary flex size-10 shrink-0 items-center justify-center">
          <ShieldCheck className="size-7" />
        </div>
        <h2 className="text-slate-900 text-base font-bold leading-tight tracking-widest uppercase flex-1 text-center pr-10">
          Sistema AMA
        </h2>
      </div>

      {/* CONTENIDO SCROLLABLE: Encerramos todo lo demás en un div con scroll */}
      <div className="flex-1 overflow-y-auto w-full">
        
        <div className="flex flex-col items-center justify-center pt-8 pb-4 px-4">
          <div className="w-full max-w-[200px] flex justify-center mb-4">
            <img 
              alt="Logotipo AmaVibrand Group" 
              className="w-full h-auto object-contain rounded-xl overflow-hidden shadow-sm" 
              src="https://i.postimg.cc/ZnYnwJk0/Diseño_sin_título.png"
            />
          </div>
          <h1 className="text-slate-900 text-2xl font-bold leading-tight text-center">Bienvenido</h1>
          <p className="text-slate-600 text-sm font-normal leading-normal mt-1 text-center max-w-[280px]">
            Ingresa tus credenciales para acceder al panel de control
          </p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col w-full max-w-[400px] mx-auto px-6 py-2 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-2 rounded-lg text-xs font-medium border border-red-200 text-center">
              {error}
            </div>
          )}
          
          <div className="flex flex-col w-full gap-1.5">
            <label className="text-slate-700 text-xs font-semibold ml-1">Correo Electrónico o Usuario</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input 
                className="w-full pl-10 pr-4 h-12 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" 
                placeholder="ejemplo@amavibrand.com" 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex flex-col w-full gap-1.5">
            <label className="text-slate-700 text-xs font-semibold ml-1">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 size-4" />
              <input 
                className="w-full pl-10 pr-10 h-12 rounded-xl border border-slate-200 bg-white text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm" 
                placeholder="••••••••" 
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary transition-colors"
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="button" className="text-primary font-medium text-xs hover:underline underline-offset-4">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <div className="pt-2">
            <button 
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-12 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-70"
            >
              <span className="text-sm">{loading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
              <LogIn className="size-4" />
            </button>
          </div>
        </form>

        {/* FOOTER: Le añadimos padding bottom extra para que los botones de Android no lo tapen */}
        <div className="mt-8 flex flex-col items-center pb-12 px-6 opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-6 h-[1px] bg-slate-400"></span>
            <span className="text-[10px] uppercase tracking-tighter font-semibold text-slate-500">Garantía de Seguridad</span>
            <span className="w-6 h-[1px] bg-slate-400"></span>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            AmaVibrand Group © 2026. Todos los derechos reservados. <br/>
            Versión 2.4.0
          </p>
        </div>
      </div>
    </div>
  );
}