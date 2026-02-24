import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './lib/firebase';
import { BottomNav } from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Jornadas from './pages/Jornadas';
import Inventario from './pages/Inventario';
import Rutas from './pages/Rutas';
import Ajustes from './pages/Ajustes';
import Personal from './pages/Personal';
import Dotacion from './pages/Dotacion';
import Sedes from './pages/Sedes';

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "usuarios", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              uid: currentUser.uid,
              email: currentUser.email,
              ...userData
            });
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error("Error al obtener datos de Firestore:", error);
          setUser(currentUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background-light">
        <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const hasAccess = (modulePermission: boolean | undefined) => {
    if (user?.rol !== "Auxiliar") return true;
    return modulePermission === true;
  };

  return (
    <Router>
      {/* ESTRUCTURA DE CONTENEDOR MAESTRO:
          'h-screen' fija el alto al tamaño de la pantalla disponible.
          'flex flex-col' apila los elementos (Contenido arriba, Nav abajo).
          'overflow-hidden' evita que el cuerpo principal rebote.
      */}
      <div className="h-screen w-full flex flex-col bg-background-light overflow-hidden">
        
        {/* ZONA DE CONTENIDO DINÁMICO:
            'flex-1' hace que las rutas ocupen todo el espacio central.
            'overflow-y-auto' permite el scroll solo en esta parte.
        */}
        <div className="flex-1 overflow-y-auto">
          <Routes>
            {!user ? (
              <>
                <Route path="/login" element={<Login />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/" element={<Dashboard user={user} />} />
                
                <Route 
                  path="/personal" 
                  element={
                    hasAccess(user.modulos?.accesoPersonal) 
                      ? <Personal /> 
                      : <Navigate to="/" replace />
                  } 
                />

                <Route 
                  path="/dotacion" 
                  element={
                    hasAccess(user.modulos?.accesoDotacion) 
                      ? <Dotacion /> 
                      : <Navigate to="/" replace />
                  } 
                />

                <Route 
                  path="/sedes" 
                  element={
                    hasAccess(user.modulos?.accesoClientes) 
                      ? <Sedes /> 
                      : <Navigate to="/" replace />
                  } 
                />

                <Route path="/jornadas" element={<Jornadas />} />
                <Route path="/inventario" element={<Inventario />} />
                <Route path="/rutas" element={<Rutas />} />
                <Route path="/ajustes" element={<Ajustes />} />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </>
            )}
          </Routes>
        </div>

        {/* MENÚ INFERIOR:
            Al estar fuera del div con scroll, se mantiene siempre visible 
            y apoyado sobre la barra de navegación del celular.
        */}
        {user && <BottomNav user={user} />}
      </div>
    </Router>
  );
}