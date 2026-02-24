import React, { useEffect, useState, useMemo } from 'react';
import { Header } from '../components/Layout';
import { 
  Search, UserPlus, MoreVertical, Phone, Loader2, 
  X, Save, Camera, User, MapPin, Shield, CreditCard, 
  HeartPulse, Calendar, Briefcase, GraduationCap, Users as UsersIcon
} from 'lucide-react';
import { db, storage } from '../lib/firebase';
import { collection, onSnapshot, query, orderBy, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function Personal() {
  const [loading, setLoading] = useState(true);
  const [personal, setPersonal] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEstado, setFilterEstado] = useState("Activo");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const initialForm = {
    nombreApellidos: "",
    numeroDocumento: "",
    tipoDocumento: "CC",
    genero: "MASCULINO",
    estadoCivil: "SOLTERO",
    fechaNacimiento: "",
    correo: "",
    telefonoContacto: "",
    direccionResidencia: "",
    barrioResidencia: "",
    ciudad: "Bogotá",
    rh: "A+",
    eps: "",
    pension: "",
    cesantias: "",
    arl: "ARL Sura",
    arlFecha: "",
    cargo: "OPERATIVO",
    empresa: "NO INFO",
    modeloContrato: "CONTRATO DE SERVICIOS",
    fechaIngresoLaboral: "",
    banco: "Banco Davivienda",
    tipoProducto: "DP",
    numeroCuenta: "",
    nombreTitular: "",
    numeroDocumentoTitular: "",
    tipoDocumentoTitular: "CC",
    numeroHijos: 0,
    edadHijos: "0",
    nombreFamiliar: "NO INFO",
    parentesco: "NO INFO",
    telefonoFamiliar: "",
    telefonoEmergencia: "",
    institucion: "NO INFO",
    tituloObtenido: "BACHILLER",
    anioCulminado: "",
    ultimaExperiencia: "NO INFO",
    estado: "Activo",
    foto: ""
  };

  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    const q = query(collection(db, "trabajadores"), orderBy("nombreApellidos", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      setPersonal(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    try {
      const storageRef = ref(storage, `fotos_personal/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setFormData(prev => ({ ...prev, foto: url }));
    } catch (error) {
      alert("Error al subir imagen");
    } finally { setUploading(false); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await addDoc(collection(db, "trabajadores"), {
        ...formData,
        timestamp: serverTimestamp(),
        fechaNacimiento: formData.fechaNacimiento ? new Date(formData.fechaNacimiento) : null,
        fechaIngresoLaboral: formData.fechaIngresoLaboral ? new Date(formData.fechaIngresoLaboral) : null,
        arlFecha: formData.arlFecha ? new Date(formData.arlFecha) : null,
      });
      setShowModal(false);
      setFormData(initialForm);
      setPreviewUrl(null);
    } catch (error) { alert("Error al guardar"); }
    finally { setSaving(false); }
  };

  const personalFiltrado = useMemo(() => {
    return personal.filter(p => {
      const match = p.nombreApellidos?.toLowerCase().includes(searchTerm.toLowerCase()) || p.numeroDocumento?.includes(searchTerm);
      const matchEdo = filterEstado === "all" || p.estado === filterEstado;
      return match && matchEdo;
    });
  }, [personal, searchTerm, filterEstado]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600 size-10" /></div>;

  return (
    <div className="pb-24 bg-slate-50 min-h-screen">
      <Header title="Personal AMA" />

      {/* Buscador y Listado (Igual que el anterior) */}
      <div className="p-4 space-y-4">
        <div className="bg-white p-4 rounded-[2rem] shadow-sm space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 size-4" />
            <input className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl text-xs font-bold outline-none" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <div className="flex gap-2">
            {["Activo", "Inactivo", "all"].map(e => (
              <button key={e} onClick={() => setFilterEstado(e)} className={`flex-1 py-2 rounded-lg text-[9px] font-black uppercase ${filterEstado === e ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400'}`}>{e}</button>
            ))}
          </div>
        </div>

        <div className="grid gap-3">
          {personalFiltrado.map(p => (
            <div 
              key={p.id} 
              onClick={() => setSelectedUser(p)} // <--- Acción para seleccionar
              className="bg-white p-4 rounded-[2rem] border border-slate-100 flex items-center gap-3 cursor-pointer active:scale-95 transition-all shadow-sm hover:border-blue-100"
            >
              <div className="size-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                {p.foto ? (
                  <img src={p.foto} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold uppercase">
                    {p.nombreApellidos?.[0]}
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-[10px] font-black uppercase text-slate-800 leading-tight">
                  {p.nombreApellidos}
                </h3>
                <p className="text-[9px] text-slate-400 font-bold">
                  {p.tipoDocumento} {p.numeroDocumento}
                </p>
              </div>
              <div className="p-2">
                <MoreVertical className="size-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DE DETALLES (VISTA) */}
      {selectedUser && (
        <div className="fixed inset-0 z-[60] flex items-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-slate-50 w-full h-[85vh] rounded-t-[3rem] flex flex-col overflow-hidden">
            <div className="p-6 bg-white border-b flex justify-between items-center">
              <h2 className="text-xs font-black uppercase text-slate-800">Detalle del Personal</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-slate-100 rounded-full"><X className="size-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-20">
              <div className="flex flex-col items-center mb-4">
                <div className="size-20 rounded-3xl bg-white shadow-sm overflow-hidden mb-2 border-4 border-white">
                  {selectedUser.foto ? <img src={selectedUser.foto} className="w-full h-full object-cover" /> : <User className="size-full p-4 text-slate-200" />}
                </div>
                <h3 className="text-sm font-black uppercase text-slate-800">{selectedUser.nombreApellidos}</h3>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase">{selectedUser.cargo}</span>
              </div>

              <div className="grid gap-3">
                <DetailCard icon={<Shield className="size-4 text-emerald-500"/>} label="Documento" value={`${selectedUser.tipoDocumento} ${selectedUser.numeroDocumento}`} />
                <DetailCard icon={<Phone className="size-4 text-orange-500"/>} label="Contacto" value={selectedUser.telefonoContacto} />
                <DetailCard icon={<MapPin className="size-4 text-blue-500"/>} label="Ubicación" value={`${selectedUser.direccionResidencia}, ${selectedUser.barrioResidencia}`} />
                <DetailCard icon={<CreditCard className="size-4 text-purple-500"/>} label="Banco" value={`${selectedUser.banco} - ${selectedUser.numeroCuenta}`} />
                <DetailCard icon={<HeartPulse className="size-4 text-rose-500"/>} label="Emergencia" value={`${selectedUser.nombreFamiliar} (${selectedUser.telefonoEmergencia})`} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BOTÓN FLOTANTE */}
      <button onClick={() => setShowModal(true)} className="fixed bottom-28 right-6 size-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center z-40"><UserPlus /></button>

      {/* MODAL FORMULARIO COMPLETO */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full h-[92vh] rounded-t-[3rem] flex flex-col overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xs font-black uppercase tracking-tighter text-slate-800">Ficha Técnica Trabajador</h2>
              <button onClick={() => setShowModal(false)} className="p-2 bg-slate-100 rounded-full"><X className="size-5" /></button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-6 space-y-8 pb-20 bg-slate-50/50">
              
              {/* 0. FOTO */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <div className="size-24 rounded-[2rem] bg-white shadow-md overflow-hidden flex items-center justify-center border-4 border-white">
                    {previewUrl ? <img src={previewUrl} className="w-full h-full object-cover" /> : <User className="text-slate-200 size-10" />}
                    {uploading && <div className="absolute inset-0 bg-black/20 flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}
                  </div>
                  <label className="absolute -bottom-1 -right-1 size-8 bg-blue-600 text-white rounded-xl flex items-center justify-center border-2 border-white shadow-lg">
                    <Camera className="size-4" />
                    <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
                  </label>
                </div>
              </div>

              {/* 1. INFORMACIÓN BÁSICA */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-blue-600"><User className="size-4"/><span className="text-[10px] font-black uppercase">Datos Personales</span></div>
                <div className="grid gap-3">
                  <input required className="input-ama" placeholder="NOMBRE COMPLETO" value={formData.nombreApellidos} onChange={e => setFormData({...formData, nombreApellidos: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input-ama" value={formData.tipoDocumento} onChange={e => setFormData({...formData, tipoDocumento: e.target.value})}><option value="CC">CC</option><option value="CE">CE</option><option value="PEP">PEP</option></select>
                    <input required className="input-ama" placeholder="N° DOCUMENTO" value={formData.numeroDocumento} onChange={e => setFormData({...formData, numeroDocumento: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 ml-2 uppercase">Nacimiento</label><input type="date" className="input-ama" value={formData.fechaNacimiento} onChange={e => setFormData({...formData, fechaNacimiento: e.target.value})} /></div>
                    <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 ml-2 uppercase">RH</label><input className="input-ama" placeholder="A+" value={formData.rh} onChange={e => setFormData({...formData, rh: e.target.value.toUpperCase()})} /></div>
                  </div>
                  <select className="input-ama" value={formData.genero} onChange={e => setFormData({...formData, genero: e.target.value})}><option value="MASCULINO">MASCULINO</option><option value="FEMENINO">FEMENINO</option><option value="OTRO">OTRO</option></select>
                  <select className="input-ama" value={formData.estadoCivil} onChange={e => setFormData({...formData, estadoCivil: e.target.value})}><option value="SOLTERO">SOLTERO</option><option value="CASADO">CASADO</option><option value="UNION LIBRE">UNIÓN LIBRE</option></select>
                </div>
              </div>

              {/* 2. CONTACTO Y VIVIENDA */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-600"><MapPin className="size-4"/><span className="text-[10px] font-black uppercase">Ubicación y Contacto</span></div>
                <div className="grid gap-3">
                  <input className="input-ama" placeholder="CORREO ELECTRÓNICO" value={formData.correo} onChange={e => setFormData({...formData, correo: e.target.value.toLowerCase()})} />
                  <input className="input-ama" placeholder="TELÉFONO CONTACTO" value={formData.telefonoContacto} onChange={e => setFormData({...formData, telefonoContacto: e.target.value})} />
                  <input className="input-ama" placeholder="DIRECCIÓN RESIDENCIA" value={formData.direccionResidencia} onChange={e => setFormData({...formData, direccionResidencia: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-ama" placeholder="BARRIO" value={formData.barrioResidencia} onChange={e => setFormData({...formData, barrioResidencia: e.target.value.toUpperCase()})} />
                    <input className="input-ama" placeholder="CIUDAD" value={formData.ciudad} onChange={e => setFormData({...formData, ciudad: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 3. SEGURIDAD SOCIAL */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-emerald-600"><Shield className="size-4"/><span className="text-[10px] font-black uppercase">Seguridad Social</span></div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-ama" placeholder="EPS" value={formData.eps} onChange={e => setFormData({...formData, eps: e.target.value})} />
                    <input className="input-ama" placeholder="PENSIÓN" value={formData.pension} onChange={e => setFormData({...formData, pension: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-ama" placeholder="CESANTÍAS" value={formData.cesantias} onChange={e => setFormData({...formData, cesantias: e.target.value})} />
                    <input className="input-ama" placeholder="ARL" value={formData.arl} onChange={e => setFormData({...formData, arl: e.target.value})} />
                  </div>
                  <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 ml-2 uppercase">Vencimiento ARL</label><input type="date" className="input-ama" value={formData.arlFecha} onChange={e => setFormData({...formData, arlFecha: e.target.value})} /></div>
                </div>
              </div>

              {/* 4. LABORAL */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-indigo-600"><Briefcase className="size-4"/><span className="text-[10px] font-black uppercase">Información Laboral</span></div>
                <div className="grid gap-3">
                  <input className="input-ama" placeholder="CARGO" value={formData.cargo} onChange={e => setFormData({...formData, cargo: e.target.value.toUpperCase()})} />
                  <input className="input-ama" placeholder="EMPRESA" value={formData.empresa} onChange={e => setFormData({...formData, empresa: e.target.value})} />
                  <select className="input-ama" value={formData.modeloContrato} onChange={e => setFormData({...formData, modeloContrato: e.target.value})}><option value="CONTRATO DE SERVICIOS">CONTRATO DE SERVICIOS</option><option value="TERMINO FIJO">TÉRMINO FIJO</option><option value="INDEFINIDO">INDEFINIDO</option></select>
                  <div className="space-y-1"><label className="text-[8px] font-black text-slate-400 ml-2 uppercase">Fecha Ingreso</label><input type="date" className="input-ama" value={formData.fechaIngresoLaboral} onChange={e => setFormData({...formData, fechaIngresoLaboral: e.target.value})} /></div>
                </div>
              </div>

              {/* 5. FINANCIERO */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-purple-600"><CreditCard className="size-4"/><span className="text-[10px] font-black uppercase">Pago y Nómina</span></div>
                <div className="grid gap-3">
                  <input className="input-ama" placeholder="BANCO" value={formData.banco} onChange={e => setFormData({...formData, banco: e.target.value})} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input-ama" value={formData.tipoProducto} onChange={e => setFormData({...formData, tipoProducto: e.target.value})}><option value="DP">AHORROS</option><option value="CC">CORRIENTE</option></select>
                    <input className="input-ama" placeholder="N° CUENTA" value={formData.numeroCuenta} onChange={e => setFormData({...formData, numeroCuenta: e.target.value})} />
                  </div>
                  <input className="input-ama" placeholder="NOMBRE TITULAR" value={formData.nombreTitular} onChange={e => setFormData({...formData, nombreTitular: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-2">
                    <select className="input-ama" value={formData.tipoDocumentoTitular} onChange={e => setFormData({...formData, tipoDocumentoTitular: e.target.value})}><option value="CC">CC</option><option value="CE">CE</option></select>
                    <input className="input-ama" placeholder="DOC. TITULAR" value={formData.numeroDocumentoTitular} onChange={e => setFormData({...formData, numeroDocumentoTitular: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 6. FAMILIAR Y EMERGENCIA */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-rose-600"><UsersIcon className="size-4"/><span className="text-[10px] font-black uppercase">Familia y Emergencia</span></div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-2">
                    <input type="number" className="input-ama" placeholder="N° HIJOS" value={formData.numeroHijos} onChange={e => setFormData({...formData, numeroHijos: parseInt(e.target.value)})} />
                    <input className="input-ama" placeholder="EDAD HIJOS" value={formData.edadHijos} onChange={e => setFormData({...formData, edadHijos: e.target.value})} />
                  </div>
                  <input className="input-ama" placeholder="FAMILIAR CONTACTO" value={formData.nombreFamiliar} onChange={e => setFormData({...formData, nombreFamiliar: e.target.value.toUpperCase()})} />
                  <input className="input-ama" placeholder="PARENTESCO" value={formData.parentesco} onChange={e => setFormData({...formData, parentesco: e.target.value.toUpperCase()})} />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="input-ama" placeholder="TEL. FAMILIAR" value={formData.telefonoFamiliar} onChange={e => setFormData({...formData, telefonoFamiliar: e.target.value})} />
                    <input className="input-ama" placeholder="TEL. EMERGENCIA" value={formData.telefonoEmergencia} onChange={e => setFormData({...formData, telefonoEmergencia: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 7. ACADÉMICO */}
              <div className="space-y-4 pb-10">
                <div className="flex items-center gap-2 text-yellow-600"><GraduationCap className="size-4"/><span className="text-[10px] font-black uppercase">Educación</span></div>
                <div className="grid gap-3">
                  <input className="input-ama" placeholder="INSTITUCIÓN" value={formData.institucion} onChange={e => setFormData({...formData, institucion: e.target.value.toUpperCase()})} />
                  <input className="input-ama" placeholder="TÍTULO OBTENIDO" value={formData.tituloObtenido} onChange={e => setFormData({...formData, tituloObtenido: e.target.value.toUpperCase()})} />
                  <input className="input-ama" placeholder="AÑO CULMINADO" value={formData.anioCulminado} onChange={e => setFormData({...formData, anioCulminado: e.target.value})} />
                </div>
              </div>

              <button disabled={saving || uploading} type="submit" className="w-full bg-slate-900 text-white p-5 rounded-3xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl active:scale-95 disabled:opacity-50 transition-all">
                {saving ? <Loader2 className="animate-spin size-5" /> : <><Save className="size-5" /> Registrar en Sistema</>}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ESTILOS CSS INYECTADOS PARA EL FORMULARIO */}
      <style>{`
        .input-ama {
          width: 100%;
          padding: 1rem;
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 1rem;
          font-size: 11px;
          font-weight: 700;
          outline: none;
          transition: all 0.2s;
        }
        .input-ama:focus {
          border-color: #3b82f6;
          background: #f8faff;
        }
      `}</style>
    </div>
  );
}
function DetailCard({ icon, label, value }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-50">
      <div className="bg-slate-50 p-2 rounded-xl">{icon}</div>
      <div>
        <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-[11px] font-bold text-slate-700 uppercase">{value || 'No asignado'}</p>
      </div>
    </div>
  );
}