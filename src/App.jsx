import { useState, useEffect } from "react";
import { 
  Home, PieChart, FileText, Settings, Menu, RefreshCw, 
  ArrowDownToLine, ArrowUpFromLine, PiggyBank, Target, 
  Edit2, Trash2, X, Calendar, Mail, CheckCircle2, ChevronRight,
  UserCircle, Lock, Trophy, Palette, Download, Headphones, LogOut, AlertTriangle,
  BarChart2, Plane, Laptop, ShieldCheck, TrendingUp, Plus, PlusCircle, ArrowLeft, Clock,
  ChevronUp, Minus, ChevronDown, Circle, MoreVertical, TrendingDown, Bell, Loader2, Wallet
} from "lucide-react";

// ── Importaciones desde archivos separados ─────────────────────────────────
import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import {
  INGRESOS_DEFAULT, GASTOS_DEFAULT, METAS_INICIALES,
  COLORES_CUSTOM, PASTEL_COLORS, METAS_ICONS, CAT_ICONS
} from "./constants";
import {
  hoy, calcularFechaFutura, getFechaLocal,
  formatMoney, getIcono, getTexto, formatCatName,
  formatFecha, getUIFechaHora, diffDias
} from "./utils";

const MenuItem = ({ icon, text, color, bgColor, border, showArrow = true, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, backgroundColor: bgColor || "transparent", WebkitAppearance: "none", border: "none", padding: "16px 20px", cursor: "pointer", color: color, fontSize: 14, fontWeight: 600, borderBottom: `1px solid ${border}`, textAlign: "left", fontFamily: "inherit", transition: "background-color 0.2s" }}>
    <span style={{ display: "flex", alignItems: "center", color: color }}>{icon}</span>
    <span style={{ flex: 1 }}>{text}</span>
    {showArrow && <span style={{ color: "#FF803C", display: "flex", alignItems: "center" }}><ChevronRight size={18} /></span>}
  </button>
);

export default function App() {
  // --- ESTADOS DE SESIÓN (LOGIN) ---
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setVerificandoSesion(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUsuario(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    await supabase.auth.signOut();
  };
  // ---------------------------------

  const [gastos, setGastos] = useState([]);
  const [categoriasBase, setCategoriasBase] = useState(INGRESOS_DEFAULT);
  const [categoriasExtra, setCategoriasExtra] = useState(GASTOS_DEFAULT);  
  const [listaMetas, setListaMetas] = useState(METAS_INICIALES);
  
  const [presupuestosMensuales, setPresupuestosMensuales] = useState({});
  const [showCrearPresupuesto, setShowCrearPresupuesto] = useState(false);
  const [presupForm, setPresupForm] = useState({ periodo: hoy().slice(0, 7), categorias: {} });

  const [activeSlide, setActiveSlide] = useState(0); 
  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  // CAMBIO 1: Nombre hardcodeado cambiado a "Usuario"
  const [userName, setUserName] = useState("Usuario");
  
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);

  const [editando, setEditando] = useState(null);   
  const [editForm, setEditForm] = useState({});
  const [catForm, setCatForm] = useState({ visible: false, id: null, tipo: 'ingreso', nombre: '', icono: '📌', color: COLORES_CUSTOM[0] });

  // Filtros Pestaña Reportes
  const [filtroReporteTipo, setFiltroReporteTipo] = useState("general");
  const [reporteMetaId, setReporteMetaId] = useState("");
  const [filtroReporteCat, setFiltroReporteCat] = useState(null);
  const [showFiltrosMenu, setShowFiltrosMenu] = useState(false);
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState("");
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState("");
  const [tipoGraficoIngresos, setTipoGraficoIngresos] = useState("bar"); 
  const [tipoGraficoGastos, setTipoGraficoGastos] = useState("bar"); 

  const [viewAll, setViewAll] = useState(false);
  const [showVtFiltro, setShowVtFiltro] = useState(false);
  const [vtFechaDesde, setVtFechaDesde] = useState("");
  const [vtFechaHasta, setVtFechaHasta] = useState("");
  
  const [showMenu, setShowMenu] = useState(false);
  const [showNovedades, setShowNovedades] = useState(false);
  const [showApariencia, setShowApariencia] = useState(false);
  const [profileScreen, setProfileScreen] = useState(null);
  const [exportFechaDesde, setExportFechaDesde] = useState("");
  const [exportFechaHasta, setExportFechaHasta] = useState("");
  const [exportEmail, setExportEmail] = useState("");
  const [filtroLogros, setFiltroLogros] = useState("desbloqueados");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteMonto, setAporteMonto] = useState("");
  const [aporteMetaId, setAporteMetaId] = useState(null);

  const [showCrearMeta, setShowCrearMeta] = useState(false);
  const [isEditingMetaObj, setIsEditingMetaObj] = useState(false);
  const [metaForm, setMetaForm] = useState({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [showMetaMenu, setShowMetaMenu] = useState(false);

  // SOLUCIÓN TEMA 4: Lee del disco duro (localStorage) primero para evitar el flash.
  const [theme, setTheme] = useState(localStorage.getItem("themePref") || "dark");
  const [useBold, setUseBold] = useState(false);
  const [isClosing, setIsClosing] = useState("");

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];
  const isDark = theme === "dark";
  const isModalOpen = showAddModal || !!editando || showCrearMeta || !!metaSeleccionada || showAporteModal || catForm.visible || showNovedades || showCrearPresupuesto;

  const c = {
    bg: isDark ? "#0A0A0A" : "#F4F5F7",
    card: isDark ? "#111111" : "#FFFFFF",
    text: isDark ? "#E8E0D0" : "#1A1A1A",
    muted: isDark ? "#888888" : "#6B7280",
    border: isDark ? "#1E1E1E" : "#E5E7EB",
    nav: isDark ? "#0D0D0D" : "#FFFFFF",
    input: isDark ? "#1A1A1A" : "#F9FAFB",
    green: isDark ? "#5AE88A" : "#10B981",
    red: isDark ? "#E85A5A" : "#EF4444",
    shadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.04)",
    iconBgGreen: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
    iconBgRed: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2",
    iconBgOrange: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFEDD5",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF",
    iconTextPurple: isDark ? "#D8B4FE" : "#A855F7",
    brandBlue: "#4A3AFF"
  };

  const menuGroupHeader = { fontSize: 13, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, padding: "16px 20px 8px", margin: 0 };

  const showToast = (msg, color = "#FF803C") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const cerrarPantalla = (screenName, action) => {
    setIsClosing(screenName);
    setTimeout(() => { action(); setIsClosing(""); setShowMetaMenu(false); }, 280);
  };

  const loadData = async (isManual = false) => {
    if (!usuario?.id) return;
    try {
      const { data: movimientos, error: err1 } = await supabase
        .from("gastos")
        .select("*")
        .eq("user_id", usuario.id)
        .order("created_at", { ascending: false });
      
      if (err1) throw err1;
      setGastos((movimientos || []).map(m => ({ ...m, fecha: getFechaLocal(m.created_at) })));

      // CAMBIO 2: Uso de eq("user_id", usuario.id) para RLS
      const { data: cfg, error: err2 } = await supabase
        .from("config")
        .select("*")
        .eq("user_id", usuario.id);
      
      if (err2) throw err2;
      
      if (cfg) {
        const getVal = (k) => cfg.find(item => item.key === `${usuario.id}_${k}`)?.value;
        
        if (getVal("themePref")) {
            setTheme(getVal("themePref"));
            localStorage.setItem("themePref", getVal("themePref")); // Lo guardamos en disco duro local
        }
        if (getVal("useBoldPref")) setUseBold(getVal("useBoldPref") === "true");
        if (getVal("userName")) setUserName(getVal("userName"));
        if (getVal("categoriasCustom")) { try { const p = JSON.parse(getVal("categoriasCustom")); if(Array.isArray(p)) setCategoriasExtra(p); } catch(_) {} }
        if (getVal("categoriasBase")) { try { const p = JSON.parse(getVal("categoriasBase")); if(Array.isArray(p)) setCategoriasBase(p); } catch(_) {} }
        if (getVal("listaMetas")) { try { const p = JSON.parse(getVal("listaMetas")); if(Array.isArray(p)) setListaMetas(p); } catch(_) {} }
        if (getVal("presupuestosMensuales")) { try { const p = JSON.parse(getVal("presupuestosMensuales")); if(p) setPresupuestosMensuales(p); } catch(_) {} }
      }
      setError(null);
      if (isManual) showToast("Datos actualizados ✓", c.green);
    } catch (e) { setError("No se pudo conectar al servidor."); }
    setLoaded(true);
  };

  useEffect(() => {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  }, []);

  useEffect(() => {
    if (usuario) {
      loadData();
    }
  }, [usuario]);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const handleTouchStart = (e) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    setStartY(scrollTop <= 5 ? e.touches[0].clientY : 0);
  };

  const handleTouchMove = (e) => {
    if (!startY) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (diff > 0 && scrollTop <= 5) setPullDistance(Math.min(diff * 0.4, 80));
  };

  const handleTouchEnd = async () => {
    if (pullDistance > 40) { 
      setIsRefreshing(true);
      setPullDistance(60); 
      const delay = new Promise(resolve => setTimeout(resolve, 800)); 
      await Promise.all([loadData(true), delay]);
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setStartY(0);
  };

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    const current = Math.round(scrollLeft / width);
    setActiveSlide(current);
  };

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) return showToast("Ingresa un monto válido", c.red);
    setSaving(true);
    const catObj = categorias.find(cat => cat.id === form.categoria);
    const defaultDesc = catObj ? getTexto(catObj.label) : "Movimiento";
    
    const nuevo = { user_id: usuario.id, fecha: hoy(), monto, descripcion: form.descripcion || defaultDesc, categoria: form.categoria, tipo: form.tipo };
    
    const { data, error: err } = await supabase.from("gastos").insert([nuevo]).select();
    if (err) { showToast("Error al guardar", c.red); setSaving(false); return; }
    setGastos(prev => [{ ...data[0], fecha: getFechaLocal(data[0].created_at) }, ...prev]);
    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast(`Registrado ✓`);
    setSaving(false);
    setShowAddModal(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este movimiento?")) return;
    const { error: err } = await supabase.from("gastos").delete().eq("id", id);
    if (err) return showToast("Error", c.red);
    setGastos(prev => prev.filter(g => g.id !== id));
    showToast("Eliminado", c.muted);
  };

  const abrirEdicion = (g) => { setEditando(g); setEditForm({ monto: g.monto, descripcion: g.descripcion, categoria: g.categoria, tipo: g.tipo }); };

  const guardarEdicion = async () => {
    const monto = parseFloat(editForm.monto);
    if (!monto || monto <= 0) return showToast("Monto inválido", c.red);
    setSaving(true);
    const catObj = categorias.find(cat => cat.id === editForm.categoria);
    const defaultDesc = catObj ? getTexto(catObj.label) : "Movimiento";
    const updates = { monto, descripcion: editForm.descripcion || defaultDesc, categoria: editForm.categoria, tipo: editForm.tipo };
    const { error: err } = await supabase.from("gastos").update(updates).eq("id", editando.id);
    if (err) { showToast("Error", c.red); setSaving(false); return; }
    setGastos(prev => prev.map(g => g.id === editando.id ? { ...g, ...updates } : g));
    setEditando(null);
    showToast("Actualizado ✓");
    setSaving(false);
  };

  const guardarConfig = async () => {
    setSaving(true);
    // CAMBIO 3: Inyectar user_id
    const upserts = [
      { user_id: usuario.id, key: `${usuario.id}_themePref`, value: theme },
      { user_id: usuario.id, key: `${usuario.id}_useBoldPref`, value: useBold.toString() },
      { user_id: usuario.id, key: `${usuario.id}_categoriasCustom`, value: JSON.stringify(safeExtra) },
      { user_id: usuario.id, key: `${usuario.id}_categoriasBase`, value: JSON.stringify(safeBase) }
    ];
    await supabase.from("config").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    showToast("Configuración guardada ✓");
  };

  const guardarPerfil = async () => {
    setSaving(true);
    // CAMBIO 4: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_userName`, value: userName }], { onConflict: "key" });
    setSaving(false);
    showToast("Datos actualizados ✓", c.green);
    cerrarPantalla('datos', () => setProfileScreen(null));
  };

  const abrirCrearCat = (tipo) => setCatForm({ visible: true, id: null, tipo, nombre: "", icono: "📌", color: COLORES_CUSTOM[0] });
  const abrirEditarCat = (cat, tipo) => setCatForm({ visible: true, id: cat.id, tipo, nombre: getTexto(cat.label), icono: getIcono(cat.label), color: cat.color || COLORES_CUSTOM[0] });

  const guardarCatForm = async () => {
    const nombre = catForm.nombre.trim();
    if (!nombre) return showToast("Escribe un nombre", c.red);
    const labelFinal = `${catForm.icono} ${nombre}`;
    const esIngreso = catForm.tipo === 'ingreso';
    const arrayActual = esIngreso ? safeBase : safeExtra;
    const key = esIngreso ? `${usuario.id}_categoriasBase` : `${usuario.id}_categoriasCustom`;

    let nuevoArray = catForm.id 
      ? arrayActual.map(c => c.id === catForm.id ? { ...c, label: labelFinal, color: catForm.color } : c)
      : [...arrayActual, { id: (esIngreso ? "base_" : "custom_") + Date.now(), label: labelFinal, color: catForm.color }];

    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    setSaving(true);
    // CAMBIO 5: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key, value: JSON.stringify(nuevoArray) }], { onConflict: "key" });
    setSaving(false);
    showToast(catForm.id ? "Categoría actualizada ✓" : "Categoría creada ✓", c.green);
    setCatForm({ ...catForm, visible: false });
  };

  const eliminarCat = async (id, tipo) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const esIngreso = tipo === 'ingreso';
    const arrayActual = esIngreso ? safeBase : safeExtra;
    const key = esIngreso ? `${usuario.id}_categoriasBase` : `${usuario.id}_categoriasCustom`;
    const nuevoArray = arrayActual.filter(c => c.id !== id);
    
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    setSaving(true);
    // CAMBIO 6: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key, value: JSON.stringify(nuevoArray) }], { onConflict: "key" });
    setSaving(false);
    showToast("Categoría eliminada", c.muted);
  };

  const guardarPresupuesto = async () => {
    const totalAsignado = Object.values(presupForm.categorias).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (totalAsignado <= 0) return showToast("Asigna un monto a al menos una categoría", c.red);
    
    setSaving(true);
    const nuevosPresupuestos = { 
        ...presupuestosMensuales, 
        [presupForm.periodo]: { total: totalAsignado, categorias: presupForm.categorias } 
    };
    
    setPresupuestosMensuales(nuevosPresupuestos);
    // CAMBIO 7: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_presupuestosMensuales`, value: JSON.stringify(nuevosPresupuestos) }], { onConflict: "key" });
    
    setSaving(false);
    showToast("Presupuesto guardado ✓", c.green);
    cerrarPantalla('crearPresupuesto', () => setShowCrearPresupuesto(false));
  };

  const procesarNuevaMeta = async () => {
    if (!metaForm.nombre.trim()) return showToast("⚠️ Ingresa el nombre de la meta", c.red);
    if (!metaForm.montoObjetivo || parseFloat(metaForm.montoObjetivo) <= 0) return showToast("⚠️ Ingresa un monto objetivo válido", c.red);
    if (!metaForm.fechaLimite) return showToast("⚠️ Selecciona una fecha límite", c.red);

    let nuevasMetas;
    if (isEditingMetaObj) {
      nuevasMetas = listaMetas.map(m => m.id === metaForm.id ? { ...metaForm, montoObjetivo: parseFloat(metaForm.montoObjetivo), aporteInicial: metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0 } : m);
      setMetaSeleccionada(prev => ({ ...prev, ...metaForm, montoObjetivo: parseFloat(metaForm.montoObjetivo), aporteInicial: metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0 }));
      showToast("Meta actualizada con éxito ✓", c.green);
    } else {
      const aporteInicialVal = metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0;
      const nuevaMeta = { id: "meta_" + Date.now(), nombre: metaForm.nombre.trim(), montoObjetivo: parseFloat(metaForm.montoObjetivo), aporteInicial: aporteInicialVal, fechaLimite: metaForm.fechaLimite, prioridad: metaForm.prioridad, tipo: metaForm.tipo, icono: metaForm.icono };
      nuevasMetas = [nuevaMeta, ...listaMetas];

      if (aporteInicialVal > 0) {
        const nuevoAporte = { user_id: usuario.id, fecha: hoy(), monto: aporteInicialVal, descripcion: `Aporte inicial a ${nuevaMeta.nombre}`, categoria: "meta_aporte", tipo: "aporte" };
        const { data: dataAporte } = await supabase.from("gastos").insert([nuevoAporte]).select();
        if (dataAporte) setGastos(prev => [{ ...dataAporte[0], fecha: getFechaLocal(dataAporte[0].created_at) }, ...prev]);
      }
      showToast("Meta guardada con éxito ✓", c.green);
    }

    setListaMetas(nuevasMetas);
    setSaving(true);
    // CAMBIO 8: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false);

    cerrarPantalla('crearMeta', () => {
      setShowCrearMeta(false); setIsEditingMetaObj(false);
      setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
    });
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta meta? Todo el progreso se perderá.")) return;
    const nuevasMetas = listaMetas.filter(m => m.id !== id);
    setListaMetas(nuevasMetas);
    setSaving(true);
    // CAMBIO 9: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false);
    showToast("Meta eliminada con éxito", c.muted);
    setShowMetaMenu(false);
    cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null));
  };

  const abrirEdicionMeta = () => {
    setMetaForm({ ...metaSeleccionada });
    setIsEditingMetaObj(true);
    setShowCrearMeta(true);
  };

  const procesarAporte = async () => {
    const monto = parseFloat(aporteMonto);
    if (!monto || monto <= 0) return showToast("Ingresa un monto válido", c.red);
    setSaving(true);

    const metaDestino = listaMetas.find(m => m.id === aporteMetaId);
    const nuevo = { user_id: usuario.id, fecha: hoy(), monto, descripcion: `Aporte a ${metaDestino.nombre}`, categoria: "meta_aporte", tipo: "aporte" };
    const { data, error: err } = await supabase.from("gastos").insert([nuevo]).select();
    if (err) { showToast("Error al guardar", c.red); setSaving(false); return; }
    
    setGastos(prev => [{ ...data[0], fecha: getFechaLocal(data[0].created_at) }, ...prev]);

    const nuevasMetas = listaMetas.map(m => m.id === aporteMetaId ? { ...m, aporteInicial: m.aporteInicial + monto } : m);
    setListaMetas(nuevasMetas);
    // CAMBIO 10: Inyectar user_id
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });

    showToast(`¡S/ ${monto} aportados a tu meta! 🎉`, c.green);
    setSaving(false);
    setShowAporteModal(false);
    setAporteMonto("");
    setAporteMetaId(null);
  };

  const fechaHoy = hoy();
  const mesActualStr = fechaHoy.slice(0, 7);
  const presupuestoDelMes = presupuestosMensuales[mesActualStr]?.total || 0;
  const gastosDelMesHoy = gastos.filter(g => g.tipo === "gasto" && g.fecha.startsWith(mesActualStr)).reduce((a, g) => a + g.monto, 0);
  const diasEnMes = new Date(parseInt(mesActualStr.split('-')[0]), parseInt(mesActualStr.split('-')[1]), 0).getDate();
  const diaActual = parseInt(fechaHoy.split('-')[2]);
  const diasRestantesMes = Math.max(1, diasEnMes - diaActual + 1);
  const presupuestoDiario = presupuestoDelMes > 0 ? Math.max(0, (presupuestoDelMes - gastosDelMesHoy) / diasRestantesMes) : 0;

  const movimientosHoy = gastos.filter(g => g.fecha === fechaHoy);
  const totalGastadoHoy = movimientosHoy.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosHoy = movimientosHoy.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  
  const getFiltradosResumen = () => {
    let filtrados = gastos.filter(g => g.tipo !== "aporte");
    if (filtroFechaResumenDesde) filtrados = filtrados.filter(g => g.fecha >= filtroFechaResumenDesde);
    if (filtroFechaResumenHasta) filtrados = filtrados.filter(g => g.fecha <= filtroFechaResumenHasta);
    if (filtroReporteCat) filtrados = filtrados.filter(g => g.categoria === filtroReporteCat);
    return filtrados;
  };
  
  const gastosFiltradosResumen = getFiltradosResumen();
  const ingresosResumen = gastosFiltradosResumen.filter(g => g.tipo === "ingreso");
  const gastosResumen = gastosFiltradosResumen.filter(g => g.tipo === "gasto");

  const totalGastadoR = gastosResumen.reduce((a, g) => a + g.monto, 0);
  const totalIngresosR = ingresosResumen.reduce((a, g) => a + g.monto, 0);
  const ahorroR = totalIngresosR - totalGastadoR;

  const calcCats = (arr) => {
    const agrupado = {};
    arr.forEach(g => {
      const catExiste = categorias.find(c => c.id === g.categoria);
      const groupKey = catExiste ? g.categoria : `eliminado_${g.descripcion}`;
      if (!agrupado[groupKey]) {
        agrupado[groupKey] = { id: groupKey, label: catExiste ? catExiste.label : g.descripcion, color: catExiste ? catExiste.color : (isDark ? "rgba(255,255,255,0.15)" : "rgba(160,174,192,0.4)"), isDeleted: !catExiste, total: 0 };
      }
      agrupado[groupKey].total += g.monto;
    });
    return Object.values(agrupado).sort((a, b) => b.total - a.total);
  };

  const catsIngresos = calcCats(ingresosResumen);
  const catsGastos = calcCats(gastosResumen);

  const buildConic = (cats) => {
    const tot = cats.reduce((sum, c) => sum + c.total, 0) || 1;
    let deg = 0;
    return cats.length > 0 ? cats.map(c => {
        const pct = (c.total / tot) * 360;
        const str = `${c.color} ${deg}deg ${deg + pct}deg`;
        deg += pct;
        return str;
    }).join(", ") : `${c.border} 0deg 360deg`;
  };

  const conicIngresos = buildConic(catsIngresos);
  const conicGastos = buildConic(catsGastos);
  const totIngresosDonut = catsIngresos.reduce((s,c)=>s+c.total,0)||1;
  const totGastosDonut = catsGastos.reduce((s,c)=>s+c.total,0)||1;
  
  const maxIngreso = catsIngresos[0]?.total || 1;
  const maxGasto = catsGastos[0]?.total || 1;
  const cMaxI = maxIngreso * 1.2;
  const cMaxG = maxGasto * 1.2;

  const gastosVerTodos = gastos.filter(g => (!vtFechaDesde || g.fecha >= vtFechaDesde) && (!vtFechaHasta || g.fecha <= vtFechaHasta));

  const s = {
    // CAMBIO 11: Estilos para laptop aplicados
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: "480px", margin: "0 auto", position: "relative", boxShadow: isDark ? "0 0 40px rgba(0,0,0,0.6)" : "0 0 40px rgba(0,0,0,0.1)", background: c.bg, paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))", width: "100%", userSelect: "none", WebkitUserSelect: "none" },
    section:    { padding: "calc(60px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card:       { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    sliderContainer: { display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", gap: 16, paddingBottom: 8, marginTop: 4, WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" },
    slideItem: { minWidth: "100%", scrollSnapAlign: "center", flexShrink: 0 },
    sliderCard: { width: "100%", background: "#111", borderRadius: 20, padding: "20px", boxSizing: "border-box", color: "#FFF", boxShadow: "none", position: "relative" },
    label:      { fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 },
    greenNum:   { fontSize: 20, fontWeight: 600, color: c.green },
    redNum:     { fontSize: 20, fontWeight: 600, color: c.red },
    grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, width: "100%" },
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48, userSelect: "auto", WebkitUserSelect: "auto" },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48, userSelect: "auto", WebkitUserSelect: "auto" },
    btnPrimary: { background: "#FF803C", color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.2)" },
    btnSecondary:{ background: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    deleteBtn:  { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.red, cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn:    { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    errorCard:  { background: isDark ? "#1A0A0A" : "#FEF2F2", border: `1px solid ${c.red}`, borderRadius: 12, padding: "16px", margin: "20px", color: c.red, fontSize: 14, fontWeight: 400 },
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: c.nav, display: "flex", zIndex: 100, paddingTop: 0, paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`, boxShadow: isDark ? "0 -2px 10px rgba(0,0,0,0.4)" : "0 -2px 10px rgba(0,0,0,0.06)" 
    },
    navBtn: (a) => ({ flex: 1, paddingTop: 10, paddingBottom: 8, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: a ? "#FF803C" : c.muted, fontSize: 12, fontWeight: 400, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", position: "relative" }),
    fabCircle: { position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", width: 68, height: 68, borderRadius: "50%", background: "#FF803C", color: "#FFF", border: `6px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.4)", zIndex: 105, padding: 0 },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 99999, padding: "0", backdropFilter: "blur(10px)" },
    modal: { background: c.card, borderTop: `1px solid ${c.border}`, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)" }
  };

  const IconBadge = ({ emoji, bg, color }) => (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{emoji}</div>
  );

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PF';

  // --- COMPROBACIONES DE AUTH Y CARGA ---
  if (verificandoSesion) return (
    <div style={{ background: "#0A0A0A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "2px solid #1E1E1E", borderTop: "2px solid #FF803C", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  if (!usuario) return <Auth />;

  if (!loaded) return (
    <div style={{ background: c.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${c.border}`, borderTop: "2px solid #FF803C", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ color: c.muted, fontSize: 14, fontFamily: "'Montserrat', sans-serif" }}>Cargando datos...</span>
    </div>
  );
  // --------------------------------------

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; } 
        /* CAMBIO 12: Estilos del body modificados para contraste en laptop */
        html, body { background: ${isDark ? "#000000" : "#E5E7EB"} !important; color: ${c.text}; margin: 0; padding: 0; width: 100vw; max-width: 100%; overflow-x: hidden; overflow-y: ${isModalOpen ? 'hidden' : 'auto'} !important; font-family: 'Montserrat', sans-serif; transition: background 0.3s ease, color 0.3s ease; user-select: none; -webkit-user-select: none; overscroll-behavior-y: none; }
        body * { font-weight: ${useBold ? '700' : 'inherit'}; }
        #root { background: ${c.bg}; min-height: 100vh; width: 100%; max-width: 100%; overflow-x: hidden; overflow-y: ${isModalOpen ? 'hidden' : 'auto'}; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideInFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes slideOutToLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {toast && (
        <div style={{ position: "fixed", top: 40, left: "50%", transform: "translateX(-50%)", background: toast.color || "#333", color: "#FFF", padding: "12px 24px", borderRadius: 30, zIndex: 999999, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "slideDown 0.3s ease-out", whiteSpace: "nowrap" }}>
          {toast.msg}
        </div>
      )}

      {viewAll ? (
        <>
          <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.bg, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
            <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => { setViewAll(false); window.scrollTo(0, 0); }}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 600 }}>Movimientos</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}>
                <Calendar size={20} />
              </button>
            </div>
          </div>
          <div style={s.section}>
            {showVtFiltro && (
              <div style={{ padding: "16px 20px", background: c.card, borderBottom: `1px solid ${c.border}`, borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    {!vtFechaDesde && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Del</span>}
                    <input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaDesde ? c.text : "transparent" }} />
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    {!vtFechaHasta && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Al</span>}
                    <input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaHasta ? c.text : "transparent" }} />
                  </div>
                </div>
                {(vtFechaDesde || vtFechaHasta) && (
                  <button style={{ width: "100%", fontSize: 14, fontWeight: 600, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4, fontFamily: "inherit" }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}>
                    <X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas
                  </button>
                )}
              </div>
            )}
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12 }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "32px", fontWeight: 500 }}>No se encontraron movimientos</div>
            ) : (
              gastosVerTodos.map(g => {
                const isAporte = g.tipo === "aporte";
                const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
                const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";
                
                let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"; 
                let montoColor = c.text;
                if (isAporte) { iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"; montoColor = c.green; }
                else if (g.tipo === "gasto") { iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"; montoColor = c.red; }
                else if (g.tipo === "ingreso") { iconBg = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"; montoColor = c.text; }

                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>
                          {isAporte ? "🎯" : (cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase())}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text, textDecoration: (!cat && !isAporte) ? "line-through" : "none" }}>
                            {isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}
                            {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>{descAdicional}</span>}
                            {!cat && !isAporte && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>(Eliminado)</span>}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)} · {isAporte ? "Aportes" : (g.tipo === "gasto" ? "Gastos" : "Ingresos")}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: montoColor, marginRight: 4 }}>
                          {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                        </span>
                        {!isAporte && (
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                            <button style={{...s.editBtn, padding: 2}} onClick={() => abrirEdicion(g)}><Edit2 size={16} /></button>
                            <button style={{...s.deleteBtn, padding: 2}} onClick={() => eliminar(g.id)}><Trash2 size={16} /></button>
                            </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* HEADER FIJO */}
          <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", background: tab === "hoy" ? c.bg : c.card, borderBottom: tab === "hoy" ? "none" : `1px solid ${c.border}`, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: tab === "hoy" ? "space-between" : "center", alignItems: "center" }}>
              {tab === "hoy" ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setShowMenu(true)} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.text, cursor: "pointer", padding: 0, display: "flex" }}><Menu size={28} /></button>
                    <h1 style={{ fontSize: 20, fontWeight: 600, color: c.text, margin: 0, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.1 }}><span style={{ fontWeight: 500 }}>¡Hola</span><span style={{ fontWeight: 600 }}>, {userName}! 👋</span></h1>
                  </div>
                  <div style={{ position: "relative" }}>
                      <button onClick={() => setShowNovedades(true)} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: 0, color: c.green, display: "flex" }}><Bell size={24} /></button>
                      <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: c.red, borderRadius: "50%", border: `2px solid ${c.bg}` }}></div>
                  </div>
                </>
              ) : (
                <h1 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.1 }}>
                  {tab === "metas" ? "Mis Metas" : tab === "resumen" ? "Reportes" : "Presupuesto"}
                </h1>
              )}
            </div>
          </div>

          {error && <div style={{...s.errorCard, marginTop: 80, position: "relative", zIndex: 20}}><AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: 8 }} /> {error}</div>}

          {/* INDICADOR PULL TO REFRESH */}
          {tab === "hoy" && (
            <div style={{ position: "fixed", top: "calc(52px + env(safe-area-inset-top, 0px))", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, color: "#10B981", opacity: (isRefreshing || pullDistance > 0) ? 1 : 0, visibility: (isRefreshing || pullDistance > 0) ? "visible" : "hidden", pointerEvents: "none" }}>
              <Loader2 size={24} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none", transform: isRefreshing ? "none" : `rotate(${pullDistance * 5}deg)` }} />
              <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4, opacity: Math.min(pullDistance / 50, 1), color: c.muted }}>Actualizando...</span>
            </div>
          )}

          {/* CONTENIDO SCROLLEABLE INICIO */}
          {tab === "hoy" && (
            <div style={{ ...s.section, background: "transparent", minHeight: "100vh", position: "relative", zIndex: 20, transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`, transition: pullDistance === 0 || isRefreshing ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none" }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
              {listaMetas.length === 0 ? (
                 <div style={{ ...s.sliderCard, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", marginBottom: 24, textAlign: "center" }}>
                    <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
                    <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no tienes metas</div>
                    <div style={{ fontSize: 14, color: "#AAA", marginBottom: 24, lineHeight: 1.4 }}>Crea tu primera meta y empieza a ahorrar para lo que siempre quisiste.</div>
                    <button onClick={() => { setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); setShowCrearMeta(true); }} style={{ background: c.green, color: "#FFF", padding: "14px 24px", borderRadius: 30, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ Crea tu primera meta</button>
                 </div>
              ) : (
                 <>
                   <div className="hide-scroll" style={s.sliderContainer} onScroll={handleScroll}>
                      {listaMetas.map((meta, i) => {
                         const obj = parseFloat(meta.montoObjetivo) || 1;
                         const ahorrado = parseFloat(meta.aporteInicial) || 0;
                         const faltan = Math.max(0, obj - ahorrado);
                         const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
                         let fechaStr = "Sin límite"; let diasRestantes = 0;
                         if (meta.fechaLimite) { fechaStr = formatFecha(meta.fechaLimite); diasRestantes = diffDias(hoy(), meta.fechaLimite); }

                         return (
                             <div key={meta.id} style={s.slideItem}>
                                 <div style={s.sliderCard}>
                                    <div style={{ position: "absolute", top: 16, left: 20, background: i === 0 ? "rgba(168,85,247,0.2)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"), color: i === 0 ? "#D8B4FE" : (isDark ? "#AAA" : "#666"), padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{i === 0 ? "★ Meta principal" : "Meta secundaria"}</div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, marginBottom: 16 }}>
                                        <div>
                                            <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>{meta.nombre} <span style={{ fontSize: 24 }}>{meta.icono}</span></div>
                                            <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                                <span style={{ fontSize: 20, fontWeight: 700, color: "#FFF" }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span>
                                                <span style={{ fontSize: 14, color: "#999", fontWeight: 500 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</span>
                                            </div>
                                        </div>
                                        <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(#10B981 ${pct}%, #333 0)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                           <div style={{ position: "absolute", inset: 5, background: "#111", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16, fontWeight: 700, color: "#FFF" }}>{pct}%</span></div>
                                        </div>
                                    </div>
                                    <div style={{ background: "#333", borderRadius: 4, height: 6, marginBottom: 20, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "#10B981", borderRadius: 4 }}></div></div>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={14} color="#10B981" /> Te faltan</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>S/ {formatMoney(faltan).replace("S/ ", "")}</span></div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} color="#10B981" /> Fecha límite</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>{fechaStr}</span></div>
                                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} color="#F59E0B" /> Llegarás en</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>{diasRestantes > 0 ? `${diasRestantes} días` : "—"}</span></div>
                                    </div>
                                    <button onClick={() => { setAporteMetaId(meta.id); setShowAporteModal(true); }} style={{ width: "100%", background: "#10B981", color: "#FFF", padding: "14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}><PlusCircle size={18} /> Aportar a esta meta</button>
                                 </div>
                             </div>
                         )
                      })}
                   </div>
                   {listaMetas.length > 1 && (
                     <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 4, marginBottom: 20 }}>
                       {listaMetas.map((_, idx) => ( <div key={idx} style={{ width: activeSlide === idx ? 18 : 8, height: 8, borderRadius: 4, background: activeSlide === idx ? "#10B981" : (isDark ? "#333" : "#E5E7EB"), transition: "all 0.3s ease" }} /> ))}
                     </div>
                   )}
                 </>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: listaMetas.length <= 1 ? 8 : 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.text }}>Resumen de hoy</h3>
              </div>
              <div style={s.grid2}>
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<ArrowDownToLine size={18} />} bg={c.iconBgGreen} color={c.green} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ingresos hoy</span></div>
                  <div style={{ ...s.greenNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy)}</div>
                </div>
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<ArrowUpFromLine size={18} />} bg={c.iconBgRed} color={c.red} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Gastos hoy</span></div>
                  <div style={{ ...s.redNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalGastadoHoy)}</div>
                </div>
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<PiggyBank size={18} />} bg={c.iconBgOrange} color="#FF803C" /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ahorro hoy</span></div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#FF803C", textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy - totalGastadoHoy)}</div>
                </div>
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<Target size={18} />} bg={c.iconBgPurple} color={c.iconTextPurple} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Límite / día</span></div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: c.text, textAlign: "center", marginTop: 0 }}>{formatMoney(presupuestoDiario)}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.text }}>Últimos movimientos</h3>
                <button onClick={() => { setViewAll(true); window.scrollTo(0, 0); }} style={{ background: "none", border: "none", color: c.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Ver todos</button>
              </div>

              {movimientosHoy.length > 0 ? (
                <div style={{ ...s.card, padding: "0 16px" }}>
                  {movimientosHoy.map((g, i, arr) => {
                    const isAporte = g.tipo === "aporte";
                    const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
                    const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";
                    const isLast = i === arr.length - 1;
                    
                    let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"; 
                    let montoColor = c.text;
                    if (isAporte) { iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"; montoColor = c.green; }
                    else if (g.tipo === "gasto") { iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"; montoColor = c.red; }
                    else if (g.tipo === "ingreso") { iconBg = isDark ? "rgba(255,255,255,0.1)" : "#E5E7EB"; montoColor = c.text; }

                    return (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${c.border}` }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>
                            {isAporte ? "🎯" : (cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase())}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text, textDecoration: (!cat && !isAporte) ? "line-through" : "none" }}>
                              {isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}
                              {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>{descAdicional}</span>}
                              {!cat && !isAporte && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>(Eliminado)</span>}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)} · {isAporte ? "Aportes" : (g.tipo === "gasto" ? "Gastos" : "Ingresos")}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}><span style={{ fontSize: 16, fontWeight: 700, color: montoColor }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span></div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0", fontWeight: 500 }}>Aún no hay movimientos hoy</div>
              )}
            </div>
          )}

          {/* REPORTES */}
          {tab === "resumen" && (
            <div style={s.section}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ position: "relative" }}>
                    <select style={{ ...s.select, paddingRight: 40, fontSize: 16, fontWeight: 700, color: filtroReporteTipo === "general" ? c.text : "#10B981", borderColor: filtroReporteTipo === "general" ? (isDark ? "#555" : "#000") : "#10B981", borderWidth: 2, appearance: "none", WebkitAppearance: "none", backgroundColor: "transparent" }} value={filtroReporteTipo} onChange={(e) => setFiltroReporteTipo(e.target.value)}>
                        <option value="general">📊 Ingresos y Gastos</option>
                        <option value="metas">🎯 Metas de ahorro</option>
                    </select>
                    <ChevronDown size={20} color={filtroReporteTipo === "general" ? c.text : "#10B981"} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
              </div>

              {filtroReporteTipo === "general" && (
                <>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: showFiltrosMenu ? 16 : 24 }}>
                    <div className="hide-scroll" style={{ flex: 1, display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, alignItems: "center" }}>
                      {!filtroReporteCat ? (
                        <>
                          {categoriasBase.map(c => (
                            <button key={c.id} onClick={() => setFiltroReporteCat(c.id)} style={{ whiteSpace: "nowrap", flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: `1px solid ${isDark ? "#888" : "#000"}`, background: c.card, color: c.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{c.label}</button>
                          ))}
                          {categoriasExtra.map(catExtra => (
                            <button key={catExtra.id} onClick={() => setFiltroReporteCat(catExtra.id)} style={{ whiteSpace: "nowrap", flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: `1px solid ${c.red}`, background: c.card, color: c.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>{catExtra.label}</button>
                          ))}
                        </>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <button onClick={() => setFiltroReporteCat(null)} style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? '#333' : '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}><X size={16} color={c.text} /></button>
                          <div style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid #E9D5FF`, background: "#F3E8FF", color: "#7E22CE", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center" }}>{categorias.find(cat => cat.id === filtroReporteCat)?.label}</div>
                        </div>
                      )}
                    </div>
                    <button onClick={() => setShowFiltrosMenu(!showFiltrosMenu)} style={{ width: 48, height: 48, borderRadius: "50%", border: `1.5px solid ${c.text}`, background: c.input, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}><Calendar size={22} color={c.text} /></button>
                  </div>

                  {showFiltrosMenu && (
                      <div style={{...s.card, marginBottom: 24, animation: "slideDown 0.3s ease-out"}}>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                              <div style={{ flex: 1, position: "relative" }}><input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenDesde ? c.text : "transparent" }} /></div>
                              <div style={{ flex: 1, position: "relative" }}><input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenHasta ? c.text : "transparent" }} /></div>
                          </div>
                          {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                              <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>
                          )}
                      </div>
                  )}

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 24 }}>
                    <div style={{ background: isDark ? "rgba(16, 185, 129, 0.1)" : "#F0FDF4", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "none" }}>
                      <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Total ingresos</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: c.text }}>{formatMoney(totalIngresosR)}</div>
                    </div>
                    <div style={{ background: isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(239, 68, 68, 0.2)" : "none" }}>
                      <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Total gastos</div>
                      <div style={{ fontSize: 20, fontWeight: 600, color: c.red }}>{formatMoney(totalGastadoR)}</div>
                    </div>
                  </div>

                  <div style={{ ...s.card, padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Reporte de Ingresos</h3>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => setTipoGraficoIngresos("bar")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoIngresos === "bar" ? 1 : 0.3, padding: 0 }}><BarChart2 size={20} color={c.text} /></button>
                        <button onClick={() => setTipoGraficoIngresos("donut")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoIngresos === "donut" ? 1 : 0.3, padding: 0 }}><PieChart size={20} color={c.text} /></button>
                      </div>
                    </div>
                    {catsIngresos.length === 0 ? (
                      <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontSize: 14 }}>Aún no hay registros en esta vista</div>
                    ) : tipoGraficoIngresos === "donut" ? (
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                          <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${conicIngresos})`, position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%" }}></div></div>
                        </div>
                        <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 10, paddingLeft: 10, boxSizing: "border-box" }}>
                          {catsIngresos.slice(0, 5).map(cat => (
                            <div key={cat.id} style={{ display: "flex", alignItems: "center" }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, marginRight: 8, flexShrink: 0 }}></div><span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: cat.isDeleted ? c.muted : c.text, textDecoration: cat.isDeleted ? "line-through" : "none", width: 85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatCatName(cat.label)}</span><span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.muted, width: 35, textAlign: "right" }}>{Math.round((cat.total / totIngresosDonut) * 100)}%</span></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", height: 160, marginTop: 24, gap: 8 }}>
                          <div style={{ width: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>{[cMaxI, cMaxI * 0.75, cMaxI * 0.5, cMaxI * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}</div>
                          <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>{catsIngresos.slice(0, 6).map((cat) => (<div key={cat.id} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {cat.total % 1 === 0 ? cat.total : cat.total.toFixed(1)}</span><div style={{ width: "100%", maxWidth: 36, height: `${(cat.total / cMaxI) * 100}%`, background: cat.color, borderRadius: "4px 4px 0 0", minHeight: 2 }} /></div>))}</div>
                        </div>
                        <div style={{ display: "flex", paddingLeft: 38, gap: 8, marginTop: 8 }}>{catsIngresos.slice(0, 6).map((cat) => (<div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 500, color: cat.isDeleted ? c.muted : c.text, textDecoration: cat.isDeleted ? "line-through" : "none" }}>{formatCatName(cat.label)}</div>))}</div>
                      </>
                    )}
                  </div>

                  <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#DCFCE7", color: c.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><CheckCircle2 size={20} /></div>
                    <div><div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Ahorraste {formatMoney(ahorroR)} en este periodo</div><div style={{ fontSize: 12, color: c.muted, marginTop: 4, fontWeight: 500 }}>¡Buen trabajo gestionando tu dinero!</div></div>
                  </div>

                  <div style={{ ...s.card, padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Reporte de Gastos</h3>
                      <div style={{ display: "flex", gap: 12 }}>
                        <button onClick={() => setTipoGraficoGastos("bar")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoGastos === "bar" ? 1 : 0.3, padding: 0 }}><BarChart2 size={20} color={c.text} /></button>
                        <button onClick={() => setTipoGraficoGastos("donut")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoGastos === "donut" ? 1 : 0.3, padding: 0 }}><PieChart size={20} color={c.text} /></button>
                      </div>
                    </div>
                    {catsGastos.length === 0 ? (
                      <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontSize: 14 }}>Aún no hay registros en esta vista</div>
                    ) : tipoGraficoGastos === "donut" ? (
                      <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                        <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                          <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${conicGastos})`, position: "relative", flexShrink: 0 }}><div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%" }}></div></div>
                        </div>
                        <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 10, paddingLeft: 10, boxSizing: "border-box" }}>
                          {catsGastos.slice(0, 5).map(cat => (
                            <div key={cat.id} style={{ display: "flex", alignItems: "center" }}><div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, marginRight: 8, flexShrink: 0 }}></div><span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: cat.isDeleted ? c.muted : c.text, textDecoration: cat.isDeleted ? "line-through" : "none", width: 85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatCatName(cat.label)}</span><span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.muted, width: 35, textAlign: "right" }}>{Math.round((cat.total / totGastosDonut) * 100)}%</span></div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", height: 160, marginTop: 24, gap: 8 }}>
                          <div style={{ width: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>{[cMaxG, cMaxG * 0.75, cMaxG * 0.5, cMaxG * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}</div>
                          <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>{catsGastos.slice(0, 6).map((cat) => (<div key={cat.id} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {cat.total % 1 === 0 ? cat.total : cat.total.toFixed(1)}</span><div style={{ width: "100%", maxWidth: 36, height: `${(cat.total / cMaxG) * 100}%`, background: cat.color, borderRadius: "4px 4px 0 0", minHeight: 2 }} /></div>))}</div>
                        </div>
                        <div style={{ display: "flex", paddingLeft: 38, gap: 8, marginTop: 8 }}>{catsGastos.slice(0, 6).map((cat) => (<div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 500, color: cat.isDeleted ? c.muted : c.text, textDecoration: cat.isDeleted ? "line-through" : "none" }}>{formatCatName(cat.label)}</div>))}</div>
                      </>
                    )}
                  </div>
                </>
              )}

              {filtroReporteTipo === "metas" && (() => {
                 if (listaMetas.length === 0) return (<div style={{ ...s.card, textAlign: "center", padding: "40px 20px", color: c.muted, fontWeight: 500 }}>No tienes metas creadas para analizar. ¡Crea una en la pestaña Metas!</div>);
                 const metaSelecId = reporteMetaId || listaMetas[0].id;
                 const metaSelec = listaMetas.find(m => m.id === metaSelecId) || listaMetas[0];
                 const objHistorico = parseFloat(metaSelec.montoObjetivo) || 1;
                 const ahorradoHistorico = parseFloat(metaSelec.aporteInicial) || 0;
                 const faltanHistorico = Math.max(0, objHistorico - ahorradoHistorico);
                 const pctHistorico = Math.min(100, Math.round((ahorradoHistorico / objHistorico) * 100));

                 const aportesDeMeta = gastos.filter(g => {
                     if (g.tipo !== "aporte" || !g.descripcion.includes(metaSelec.nombre)) return false;
                     if (showFiltrosMenu) {
                         if (filtroFechaResumenDesde && g.fecha < filtroFechaResumenDesde) return false;
                         if (filtroFechaResumenHasta && g.fecha > filtroFechaResumenHasta) return false;
                     }
                     return true;
                 });
                 const totalAportadoRango = aportesDeMeta.reduce((acc, g) => acc + g.monto, 0);
                 const mayorAporte = aportesDeMeta.length > 0 ? Math.max(...aportesDeMeta.map(a => a.monto)) : 0;
                 const aportesPorFecha = aportesDeMeta.reduce((acc, g) => { acc[g.fecha] = (acc[g.fecha] || 0) + g.monto; return acc; }, {});
                 const aportesChartData = Object.keys(aportesPorFecha).sort().slice(-6).map(fecha => ({ fecha, total: aportesPorFecha[fecha] }));
                 const maxAporteC = aportesChartData.length > 0 ? Math.max(...aportesChartData.map(d => d.total)) : 1;
                 const cMaxA = maxAporteC * 1.2;

                 return (
                    <div>
                        <div style={{ marginBottom: showFiltrosMenu ? 16 : 24 }}>
                            <div style={{ ...s.label, marginBottom: 8 }}>Selecciona una meta a analizar:</div>
                            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                    <select style={{ ...s.select, paddingRight: 40, fontSize: 16, fontWeight: 700, color: "#10B981", borderColor: "#10B981", marginBottom: 0 }} value={metaSelecId} onChange={(e) => setReporteMetaId(e.target.value)}>
                                        {listaMetas.map(m => <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>)}
                                    </select>
                                    <ChevronDown size={20} color="#10B981" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                                </div>
                                <button onClick={() => setShowFiltrosMenu(!showFiltrosMenu)} style={{ width: 48, height: 48, borderRadius: "50%", border: `1.5px solid ${c.text}`, background: c.input, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}><Calendar size={22} color={c.text} /></button>
                            </div>
                        </div>

                        {showFiltrosMenu && (
                            <div style={{...s.card, marginBottom: 24, animation: "slideDown 0.3s ease-out"}}>
                                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                                    <div style={{ flex: 1, position: "relative" }}><input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenDesde ? c.text : "transparent" }} /></div>
                                    <div style={{ flex: 1, position: "relative" }}><input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenHasta ? c.text : "transparent" }} /></div>
                                </div>
                                {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                                    <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>
                                )}
                            </div>
                        )}

                        <div style={{ ...s.card, padding: "20px" }}>
                            <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 600, color: c.text }}>Progreso de la Meta</h3>
                            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                                <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                                    <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${c.green} ${pctHistorico * 3.6}deg, ${isDark ? "#333" : "#E5E7EB"} ${pctHistorico * 3.6}deg 360deg)`, position: "relative", flexShrink: 0 }}>
                                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{pctHistorico}%</span></div>
                                    </div>
                                </div>
                                <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 12, paddingLeft: 10 }}>
                                    <div style={{ display: "flex", alignItems: "center" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: c.green, marginRight: 8, flexShrink: 0 }}></div><div><div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Ahorrado</div><div style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>{formatMoney(ahorradoHistorico)}</div></div></div>
                                    <div style={{ display: "flex", alignItems: "center" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: isDark ? "#333" : "#E5E7EB", marginRight: 8, flexShrink: 0 }}></div><div><div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Te falta</div><div style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>{formatMoney(faltanHistorico)}</div></div></div>
                                </div>
                            </div>
                            <div style={{ marginTop: 24 }}>
                               <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 600 }}><span style={{ color: c.green }}>{pctHistorico}% Ahorrado</span><span style={{ color: c.muted }}>{formatMoney(objHistorico)} Total</span></div>
                               <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 8, height: 12, width: "100%", overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pctHistorico}%`, borderRadius: 8 }}></div></div>
                            </div>
                        </div>

                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                            <div style={{ background: isDark ? "rgba(16, 185, 129, 0.1)" : "#F0FDF4", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "none" }}>
                                <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>{showFiltrosMenu && (filtroFechaResumenDesde || filtroFechaResumenHasta) ? "Aportado en rango" : "Total Aportado"}</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: c.green }}>{formatMoney(totalAportadoRango)}</div>
                            </div>
                            <div style={{ background: isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(245, 158, 11, 0.2)" : "none" }}>
                                <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Te falta</div>
                                <div style={{ fontSize: 20, fontWeight: 700, color: "#F59E0B" }}>{formatMoney(faltanHistorico)}</div>
                            </div>
                        </div>
                        
                        <div style={{ background: isDark ? "rgba(168, 85, 247, 0.1)" : "#F3E8FF", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(168, 85, 247, 0.2)" : "none", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                                <div style={{ fontSize: 13, color: c.muted, marginBottom: 4, fontWeight: 500 }}>Mayor aporte realizado</div>
                                <div style={{ fontSize: 22, fontWeight: 700, color: "#A855F7" }}>{formatMoney(mayorAporte)}</div>
                            </div>
                            <div style={{ fontSize: 32 }}>💪</div>
                        </div>

                        <div style={{ ...s.card, padding: "20px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Evolución de Aportes</h3>
                            </div>
                            {aportesChartData.length === 0 ? (
                                <div style={{ textAlign: "center", color: c.muted, padding: "30px 0", fontSize: 14 }}>Aún no has hecho aportes a esta meta.</div>
                            ) : (
                                <>
                                    <div style={{ display: "flex", height: 160, marginTop: 12, gap: 8 }}>
                                        <div style={{ width: 35, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>{[cMaxA, cMaxA * 0.75, cMaxA * 0.5, cMaxA * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}</div>
                                        <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>{aportesChartData.map((d, index) => (<div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {d.total % 1 === 0 ? d.total : d.total.toFixed(1)}</span><div style={{ width: "100%", maxWidth: 36, height: `${(d.total / cMaxA) * 100}%`, background: "#10B981", borderRadius: "4px 4px 0 0", minHeight: 2 }} /></div>))}</div>
                                    </div>
                                    <div style={{ display: "flex", paddingLeft: 43, gap: 8, marginTop: 8 }}>{aportesChartData.map((d, index) => { const parts = d.fecha.split("-"); return (<div key={index} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: c.muted }}>{`${parts[2]}/${parts[1]}`}</div>) })}</div>
                                </>
                            )}
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Historial de la Meta</h3>
                        </div>
                        {aportesDeMeta.length > 0 ? (
                            <div style={{ ...s.card, padding: "0 16px" }}>
                                {aportesDeMeta.slice(0, 10).map((g, i, arr) => (
                                    <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                                            <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{metaSelec.icono}</div>
                                            <div style={{ minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text }}>Aporte realizado</div><div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)}</div></div>
                                        </div>
                                        <div style={{ textAlign: "right" }}><span style={{ fontSize: 16, fontWeight: 600, color: c.green }}>+{formatMoney(g.monto)}</span></div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0", fontWeight: 500 }}>Aún no hay aportes registrados</div>
                        )}
                    </div>
                 );
              })()}
            </div>
          )}

          {/* PRESUPUESTO (FASE 1: EMPTY STATE + CREACIÓN) */}
          {tab === "presupuesto" && (() => {
              const mesActualClave = hoy().slice(0, 7); 
              const presupuestoActual = presupuestosMensuales[mesActualClave];

              // PANTALLA: SIN PRESUPUESTO (EMPTY STATE)
              if (!presupuestoActual) {
                 return (
                    <div style={{...s.section, alignItems: "center", justifyContent: "center", minHeight: "80vh", paddingBottom: 120 }}>
                       <div style={{ fontSize: 80, marginBottom: 24 }}>💰</div>
                       <h2 style={{ fontSize: 22, color: c.text, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Aún no tienes un presupuesto</h2>
                       <p style={{ color: c.muted, textAlign: "center", fontSize: 15, marginBottom: 40, lineHeight: 1.6, maxWidth: 300, fontWeight: 500 }}>
                          Crea tu primer presupuesto y controla tus gastos por categoría mes a mes.
                       </p>
                       <button onClick={() => {
                          setPresupForm({ periodo: mesActualClave, categorias: {} });
                          setShowCrearPresupuesto(true);
                       }} style={{...s.btnPrimary, background: c.brandBlue, boxShadow: "0 8px 24px rgba(74, 58, 255, 0.3)", padding: "16px 32px", fontSize: 16, width: "auto", borderRadius: 30 }}>
                          Crear presupuesto
                       </button>
                    </div>
                 );
              }

              // PANTALLA: ESTADO TEMPORAL (Muestra que se guardó, preparativo para Fase 2)
              return (
                  <div style={s.section}>
                      <div style={{ background: c.brandBlue, borderRadius: 24, padding: 24, color: "#FFF", marginBottom: 24, boxShadow: "0 10px 30px rgba(74, 58, 255, 0.3)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                              <span style={{ fontSize: 18, fontWeight: 800 }}>Resumen del mes</span>
                              <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>{presupuestoActual.total ? `S/ ${formatMoney(presupuestoActual.total).replace("S/ ","")}` : ""}</div>
                          </div>
                          <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 24, lineHeight: 1.5 }}>
                              ¡Excelente! Has guardado tu presupuesto para este mes.<br/><br/>
                              En el siguiente paso (Fase 2) transformaremos esta tarjeta en el dashboard completo con tus barras de progreso por categoría.
                          </div>
                          <button onClick={() => {
                              setPresupForm({ periodo: mesActualClave, categorias: presupuestoActual.categorias || {} });
                              setShowCrearPresupuesto(true);
                          }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFF", padding: "12px 16px", borderRadius: 12, fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 15 }}>
                              Editar mi presupuesto
                          </button>
                      </div>
                  </div>
              );
          })()}

          {/* METAS */}
          {tab === "metas" && (
            <div style={{ padding: "calc(76px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", paddingBottom: 140 }}>
              <div style={{ fontSize: 14, color: c.muted, marginBottom: 20, fontWeight: 500 }}>Tus objetivos financieros</div>
              {listaMetas.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: "40px 20px", color: c.muted, fontWeight: 500 }}>Aún no tienes metas creadas. ¡Anímate a crear una!</div>
              ) : (
                listaMetas.map((meta, index) => {
                  const obj = parseFloat(meta.montoObjetivo) || 1;
                  const ahorrado = parseFloat(meta.aporteInicial) || 0;
                  const faltan = Math.max(0, obj - ahorrado);
                  const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
                  let fechaStr = "Sin fecha límite"; let diasStr = "Sin prisa"; let diasRestantes = 0;
                  if (meta.fechaLimite) {
                    fechaStr = formatFecha(meta.fechaLimite);
                    diasRestantes = diffDias(hoy(), meta.fechaLimite);
                    if (diasRestantes < 0) diasStr = "Vencida"; else if (diasRestantes === 0) diasStr = "¡Hoy!"; else diasStr = `En ${diasRestantes} días`;
                  }
                  const bgIconColor = PASTEL_COLORS[index % PASTEL_COLORS.length];
                  return (
                    <div key={meta.id} onClick={() => setMetaSeleccionada({ ...meta, indexColor: index })} style={{ ...s.card, padding: "20px", marginBottom: 16, cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <div style={{ width: 70, height: 70, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 32 }}>{meta.icono}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 6 }}>{meta.nombre}</div>
                          <div style={{ marginBottom: 12 }}><span style={{ fontSize: 18, fontWeight: 700, color: c.green }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span><span style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}> de S/ {formatMoney(obj).replace("S/ ", "")}</span></div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 8, flex: 1, overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 4 }}></div></div><span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{pct}%</span></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${c.border}`, paddingTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted, fontSize: 13, fontWeight: 500 }}><Calendar size={16} /> {fechaStr}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: (!meta.fechaLimite || diasRestantes > 0) ? c.muted : c.red, fontSize: 13, fontWeight: 500 }}><Clock size={16} /> {diasStr}</div>
                      </div>
                    </div>
                  );
                })
              )}
              <button onClick={() => { setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); setShowCrearMeta(true); }} style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", marginTop: 8 }}><Plus size={20} /> Crear nueva meta</button>
            </div>
          )}

          {/* NAVBAR */}
          <div style={s.navBar}>
            {[{ id: "hoy", icon: <Home size={24} strokeWidth={2.5} />, label: "Inicio" }, 
              { id: "resumen", icon: <PieChart size={24} strokeWidth={2.5} />, label: "Reportes" }].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
                {tab === n.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 3, background: "#FF803C", borderRadius: "0 0 4px 4px" }} />}
                <div style={{ marginBottom: -2 }}>{n.icon}</div>
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{n.label}</span>
              </button>
            ))}

            <div style={{ width: 72, position: "relative", display: "flex", justifyContent: "center" }}>
              <button style={s.fabCircle} onClick={() => setShowAddModal(true)}><Plus size={36} strokeWidth={2.5} color="#FFF" /></button>
            </div>

            {[{ id: "presupuesto", icon: <Wallet size={24} strokeWidth={2.5} />, label: "Presupuesto" }, 
              { id: "metas", icon: <Target size={24} strokeWidth={2.5} />, label: "Metas" }].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
                {tab === n.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 3, background: "#FF803C", borderRadius: "0 0 4px 4px" }} />}
                <div style={{ marginBottom: -2 }}>{n.icon}</div>
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{n.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* OVERLAYS Y PANTALLAS FLOTANTES (MODALS) */}

      {/* MODAL CREAR PRESUPUESTO (FASE 1) */}
      {showCrearPresupuesto && (() => {
        const totalCalculado = Object.values(presupForm.categorias).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
        return (
          <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'crearPresupuesto' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
              <button onClick={() => cerrarPantalla('crearPresupuesto', () => setShowCrearPresupuesto(false))} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
              <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Crear presupuesto</h2>
            </div>
            
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13, color: c.muted }}>¿Para qué período?</div>
            <input type="month" style={{...s.input, marginBottom: 24, fontSize: 16, fontWeight: 700}} value={presupForm.periodo} onChange={e => setPresupForm({...presupForm, periodo: e.target.value})} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${c.border}`, marginBottom: 24 }}>
               <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Presupuesto total</span>
               <span style={{ fontSize: 20, fontWeight: 800, color: c.green }}>S/ {formatMoney(totalCalculado).replace("S/ ","")}</span>
            </div>

            <div style={{ ...s.label, marginBottom: 16, fontSize: 15 }}>Asignar por categorías</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
               {/* Aquí nos aseguramos de mapear SOLO safeExtra (Gastos) */}
               {safeExtra.map(cat => (
                   <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <div style={{ width: 44, height: 44, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: c.text }}>{getIcono(cat.label)}</div>
                         <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{getTexto(cat.label)}</span>
                      </div>
                      <div style={{ position: "relative", width: 130 }}>
                         <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.muted, fontWeight: 600, fontSize: 15 }}>S/</span>
                         <input type="number" style={{ ...s.input, paddingLeft: 36, textAlign: "right", fontSize: 16, fontWeight: 700 }} placeholder="0.00" 
                            value={presupForm.categorias[cat.id] || ""}
                            onChange={e => setPresupForm({ ...presupForm, categorias: { ...presupForm.categorias, [cat.id]: e.target.value } })}
                         />
                      </div>
                   </div>
               ))}
            </div>

            {/* NUEVO TEXTO DE AYUDA (UX) */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
               <p style={{ fontSize: 13, color: c.muted, margin: 0, fontWeight: 500 }}>
                  ¿Falta alguna? Administra tus categorías desde la <button onClick={() => { setShowCrearPresupuesto(false); setProfileScreen("categorias"); setShowMenu(true); }} style={{ background: "none", border: "none", color: c.brandBlue, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>Configuración</button>.
               </p>
            </div>

            <button onClick={guardarPresupuesto} disabled={saving} style={{ ...s.btnPrimary, background: c.brandBlue, boxShadow: "0 8px 24px rgba(74, 58, 255, 0.3)", padding: 16, fontSize: 16, borderRadius: 16 }}>
               {saving ? "Guardando..." : "Guardar presupuesto"}
            </button>
          </div>
        );
      })()}
      
      {showAporteModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAporteModal(false); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Aportar a la meta</h3>
                <button onClick={() => setShowAporteModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button>
             </div>
             <div style={{ ...s.label, textAlign: "center", marginBottom: 12, color: c.muted }}>¿Cuánto deseas aportar?</div>
             <input autoFocus style={{ ...s.input, marginBottom: 24, fontSize: 36, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto", color: c.green }} type="number" placeholder="0.00" value={aporteMonto} onChange={e => setAporteMonto(e.target.value)} onKeyDown={e => e.key === "Enter" && procesarAporte()} />
             <button style={{...s.btnPrimary, padding: "16px", background: c.green, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"}} onClick={procesarAporte} disabled={saving}>{saving ? "Procesando..." : "Confirmar Aporte"}</button>
          </div>
        </div>
      )}

      {metaSeleccionada && (() => {
        const obj = parseFloat(metaSeleccionada.montoObjetivo) || 1;
        const ahorrado = parseFloat(metaSeleccionada.aporteInicial) || 0;
        const faltan = Math.max(0, obj - ahorrado);
        const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
        let fechaStr = "Sin fecha límite"; let diasRestantes = 0;
        if (metaSeleccionada.fechaLimite) {
          fechaStr = formatFecha(metaSeleccionada.fechaLimite);
          diasRestantes = diffDias(hoy(), metaSeleccionada.fechaLimite);
        }
        const ahorroDiarioVal = diasRestantes > 0 ? (faltan / diasRestantes) : 0;
        const bgIconColor = PASTEL_COLORS[metaSeleccionada.indexColor % PASTEL_COLORS.length];

        return (
          <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, display: "flex", flexDirection: "column", animation: isClosing === 'detalleMeta' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "env(safe-area-inset-top, 20px) 20px 16px", background: c.bg, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={() => cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null))} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}><ArrowLeft size={28} /></button>
                <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{metaSeleccionada.nombre}</h2>
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowMetaMenu(!showMetaMenu)} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}><MoreVertical size={24} /></button>
                {showMetaMenu && (
                  <div style={{ position: "absolute", top: 30, right: 0, background: c.card, border: `1px solid ${c.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 105, overflow: "hidden", minWidth: 140 }}>
                    <button onClick={() => eliminarMeta(metaSeleccionada.id)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: c.red, textAlign: "left", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}><Trash2 size={18} /> Eliminar</button>
                  </div>
                )}
              </div>
            </div>
            <div style={{ padding: "32px 20px 20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>{metaSeleccionada.icono}</div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#FFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}><CheckCircle2 size={20} color={c.green} /></div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: c.green, marginBottom: 4 }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</div>
                <div style={{ fontSize: 14, color: c.muted, fontWeight: 500, marginBottom: 24 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</div>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 6, height: 10, flex: 1, overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 6 }}></div></div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{pct}%</span>
                </div>
              </div>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 12 }}>Resumen de tu progreso</div>
              <div style={{ ...s.card, padding: "20px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Fecha limite</span><span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{fechaStr}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Faltan</span><span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{metaSeleccionada.fechaLimite ? `${Math.max(0, diasRestantes)} días` : "—"}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Ahorrado</span><span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Falta por ahorrar</span><span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>S/ {formatMoney(faltan).replace("S/ ", "")}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Ahorro diario necesario</span><span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{ahorroDiarioVal > 0 ? `S/ ${ahorroDiarioVal.toFixed(2)}` : "S/ 0.00"}</span></div>
              </div>
              <button onClick={abrirEdicionMeta} style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}>Editar meta</button>
            </div>
          </div>
        );
      })()}

      {showCrearMeta && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'crearMeta' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('crearMeta', () => { setShowCrearMeta(false); setIsEditingMetaObj(false); })} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{isEditingMetaObj ? "Editar meta" : "Crear nueva meta"}</h2>
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Nombre de la meta</div>
            <input style={{ ...s.input }} placeholder="Ej: Nueva Laptop, Viaje a Europa" value={metaForm.nombre} onChange={e => setMetaForm({ ...metaForm, nombre: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Monto objetivo</div>
            <input style={{ ...s.input }} type="number" placeholder="S/ 0.00" value={metaForm.montoObjetivo} onChange={e => setMetaForm({ ...metaForm, montoObjetivo: e.target.value })} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Aporte inicial <span style={{ color: c.muted, fontWeight: "normal" }}>{isEditingMetaObj ? "(No se puede editar)" : "(Opcional)"}</span></div>
            <input style={{ ...s.input, opacity: isEditingMetaObj ? 0.6 : 1 }} type="number" placeholder="S/ 0.00" value={metaForm.aporteInicial} onChange={e => setMetaForm({ ...metaForm, aporteInicial: e.target.value })} disabled={isEditingMetaObj} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Fecha límite</div>
            <div style={{ position: "relative" }}>
              {!metaForm.fechaLimite && <span style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: c.muted, pointerEvents: "none", fontSize: 15 }}>Selecciona una fecha</span>}
              <input type="date" value={metaForm.fechaLimite} onChange={e => setMetaForm({ ...metaForm, fechaLimite: e.target.value })} style={{ ...s.input, color: metaForm.fechaLimite ? c.text : "transparent" }} />
            </div>
          </div>
          <div style={{ marginBottom: 40 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Imagen / ícono</div>
            <div className="hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
              {METAS_ICONS.map(ico => (
                <div key={ico} onClick={() => setMetaForm({ ...metaForm, icono: ico })} style={{ width: 56, height: 56, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: metaForm.icono === ico ? `2px solid #10B981` : "2px solid transparent", cursor: "pointer", transition: "0.2s" }}>{ico}</div>
              ))}
            </div>
          </div>
          <button onClick={procesarNuevaMeta} style={{ ...s.btnPrimary, background: "#059669", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", padding: 16, fontSize: 16 }}>{isEditingMetaObj ? "Guardar cambios" : "Guardar meta"}</button>
        </div>
      )}

      {showNovedades && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'novedades' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('novedades', () => setShowNovedades(false))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Novedades</h2>
          </div>
          <div style={{ background: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFF5EB", borderRadius: 16, padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, border: `1px solid ${isDark ? "rgba(255, 128, 60, 0.3)" : "transparent"}` }}>
             <div><div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 8, lineHeight: 1.2 }}>¡Descubre<br/><span style={{color: "#FF803C"}}>novedades!</span></div><div style={{ fontSize: 14, color: "#FF803C", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>Para ti <ChevronRight size={16}/></div></div><div style={{ fontSize: 64 }}>🚀</div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 16 }}>Lo nuevo del App</div>
          <div className="hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, marginBottom: 24, scrollSnapType: "x mandatory" }}>
              <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#065F46" }}>Gestión de metas individuales</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>🎯</div></div>
              <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(77, 150, 255, 0.15)" : "#EFF6FF", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(77, 150, 255, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#1E3A8A" }}>Nuevo historial separado</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>📋</div></div>
              <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(168, 85, 247, 0.15)" : "#F5F3FF", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#4C1D95" }}>Pull-to-refresh en Inicio</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>👇</div></div>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 16 }}>Consejos para tu app</div>
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, scrollSnapType: "x mandatory" }} className="hide-scroll">
              <div style={{ minWidth: 200, scrollSnapAlign: "start", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 28 }}>📊</div><div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>¡Exporta tus datos en Excel o PDF!</div></div>
              <div style={{ minWidth: 200, scrollSnapAlign: "start", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 28 }}>🎨</div><div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>¡Personaliza tus propias categorías!</div></div>
          </div>
        </div>
      )}

      {showMenu && !profileScreen && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 9999, padding: "env(safe-area-inset-top, 20px) 0 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'menu' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 0, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16, paddingLeft: 20, paddingRight: 20 }}>
            <button onClick={() => cerrarPantalla('menu', () => setShowMenu(false))} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Menú Principal</h2>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={menuGroupHeader}>MI CUENTA</div>
            <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
              <MenuItem bgColor={c.card} icon={<UserCircle size={20} color="#FF803C" />} text="Mis datos" color={c.text} border={c.border} onClick={() => setProfileScreen("datos")} />
              <MenuItem bgColor={c.card} icon={<Lock size={20} color="#FF803C" />} text="Cambiar mi clave" color={c.text} border={c.border} onClick={() => setProfileScreen("clave")} />
              <MenuItem bgColor={c.card} icon={<Trophy size={20} color="#FF803C" />} text="Mis logros / Insignias" color={c.text} border={"transparent"} onClick={() => setProfileScreen("logros")} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={menuGroupHeader}>AJUSTES</div>
            <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
              <MenuItem bgColor={c.card} icon={<Settings size={20} color="#FF803C" />} text="Configuración de categorías" color={c.text} border={c.border} onClick={() => setProfileScreen("categorias")} />
              <MenuItem bgColor={c.card} icon={<Palette size={20} color="#FF803C" />} text="Apariencia (Tema Claro/Oscuro)" color={c.text} border={c.border} onClick={() => { setShowApariencia(true); setShowMenu(false); }} />
              <MenuItem bgColor={c.card} icon={<Download size={20} color="#FF803C" />} text="Exportar Reportes" color={c.text} border={c.border} onClick={() => setProfileScreen("exportar")} />
              <MenuItem bgColor={c.card} icon={<Headphones size={20} color="#FF803C" />} text="Centro de ayuda" color={c.text} border={"transparent"} onClick={() => setProfileScreen("ayuda")} />
            </div>
          </div>
          <div style={{ marginTop: "auto", paddingTop: 32, paddingBottom: 20 }}>
            <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
              <MenuItem bgColor={c.card} icon={<LogOut size={20}/>} text="Cerrar sesión" color={c.red} border={c.border} showArrow={false} onClick={cerrarSesion} />
              <MenuItem bgColor={c.card} icon={<Trash2 size={20}/>} text="Eliminar mi cuenta" color={c.red} border={"transparent"} showArrow={false} />
            </div>
          </div>
        </div>
      )}

      {showMenu && profileScreen === "exportar" && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'exportar' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('exportar', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Exportar Reportes</h2>
          </div>
          <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 16 }}>1. Selecciona el rango de fechas</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
              <div style={{ flex: 1, position: "relative" }}><input type="date" value={exportFechaDesde} onChange={e => setExportFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: exportFechaDesde ? c.text : "transparent" }} /></div>
              <div style={{ flex: 1, position: "relative" }}><input type="date" value={exportFechaHasta} onChange={e => setExportFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: exportFechaHasta ? c.text : "transparent" }} /></div>
            </div>
            {(exportFechaDesde || exportFechaHasta) && <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 8, fontFamily: "inherit" }} onClick={() => { setExportFechaDesde(""); setExportFechaHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>}
          </div>
          <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 16 }}>2. Descargar archivo</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={{...s.btnSecondary, background: c.bg, border: `1px solid ${c.border}`, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16}} onClick={() => { const filtrados = gastos.filter(g => (!exportFechaDesde || g.fecha >= exportFechaDesde) && (!exportFechaHasta || g.fecha <= exportFechaHasta)); exportarCSV(filtrados, categorias); }}><span style={{fontSize: 24}}>📊</span> Excel</button>
              <button style={{...s.btnSecondary, background: c.bg, border: `1px solid ${c.border}`, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16}} onClick={() => { const filtrados = gastos.filter(g => (!exportFechaDesde || g.fecha >= exportFechaDesde) && (!exportFechaHasta || g.fecha <= exportFechaHasta)); exportarPDF(filtrados, categorias); }}><span style={{fontSize: 24}}>📄</span> PDF</button>
            </div>
          </div>
          <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 8 }}>3. O enviar por correo</div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: c.muted, fontWeight: 500 }}>Recibirás un resumen en tu bandeja de entrada.</p>
            <input style={{ ...s.input, marginBottom: 16 }} type="email" placeholder="correo@ejemplo.com" value={exportEmail} onChange={e => setExportEmail(e.target.value)} />
            <button style={{ ...s.btnPrimary, background: "#4D96FF", boxShadow: "0 4px 12px rgba(77, 150, 255, 0.3)" }} onClick={() => { if(!exportEmail) return showToast("Ingresa un correo", c.red); showToast("Reporte enviado con éxito", c.green); setExportEmail(""); }}>Enviar Reporte</button>
          </div>
        </div>
      )}

      {showMenu && profileScreen === "categorias" && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'categorias' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('categorias', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Configuración de categorías</h2>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ ...s.label, fontSize: 16, color: c.green, marginBottom: 12 }}>Categorías para Ingresos</div>
            <div style={{ ...s.card, padding: 8, marginBottom: 12 }}>
                {safeBase.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "16px 0" }}>No hay categorías creadas</div> : 
                  safeBase.map((cat, i, arr) => (
                    <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                      {/* AQUÍ ESTÁ LA SOLUCIÓN 3: El color de fondo del ícono usa cat.color */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: cat.color || (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#FFF" }}>{getIcono(cat.label)}</div><span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span></div>
                      <div style={{ display: "flex", gap: 4 }}><button style={s.editBtn} onClick={() => abrirEditarCat(cat, 'ingreso')}><Edit2 size={18}/></button><button style={s.deleteBtn} onClick={() => eliminarCat(cat.id, 'ingreso')}><Trash2 size={18}/></button></div>
                    </div>
                  ))
                }
            </div>
            <button onClick={() => abrirCrearCat('ingreso')} style={{ width: "100%", padding: 14, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}><Plus size={18} /> Crear categoría</button>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ ...s.label, fontSize: 16, color: c.red, marginBottom: 12 }}>Categorías para Gastos</div>
            <div style={{ ...s.card, padding: 8, marginBottom: 12 }}>
                {safeExtra.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "16px 0" }}>No hay categorías creadas</div> : 
                  safeExtra.map((cat, i, arr) => (
                    <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                      {/* AQUÍ ESTÁ LA SOLUCIÓN 3: El color de fondo del ícono usa cat.color */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: cat.color || (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#FFF" }}>{getIcono(cat.label)}</div><span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span></div>
                      <div style={{ display: "flex", gap: 4 }}><button style={s.editBtn} onClick={() => abrirEditarCat(cat, 'gasto')}><Edit2 size={18}/></button><button style={s.deleteBtn} onClick={() => eliminarCat(cat.id, 'gasto')}><Trash2 size={18}/></button></div>
                    </div>
                  ))
                }
            </div>
            <button onClick={() => abrirCrearCat('gasto')} style={{ width: "100%", padding: 14, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}><Plus size={18} /> Crear categoría</button>
          </div>
        </div>
      )}

      {showMenu && profileScreen === "datos" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'datos' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('datos', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis datos</h2>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FF803C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#FFF" }}>{userInitials}</div></div>
          <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Nombre completo</div><input style={s.input} value={userName} onChange={e => setUserName(e.target.value)} placeholder="Ej. Paul Flores" /></div>
          <div style={{ marginBottom: 32 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Correo electrónico</div><input style={{ ...s.input, opacity: 0.6 }} value={usuario?.email || "Cargando..."} disabled /><div style={{ fontSize: 12, color: c.muted, marginTop: 8, fontWeight: 400 }}>El correo está enlazado a tu cuenta de acceso.</div></div>
          <button style={s.btnPrimary} onClick={guardarPerfil} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      )}

      {showMenu && profileScreen === "clave" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'clave' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('clave', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Cambiar mi clave</h2></div>
          <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Contraseña actual</div><input type="password" style={s.input} placeholder="••••••••" /></div>
          <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Nueva contraseña</div><input type="password" style={s.input} placeholder="••••••••" /></div>
          <div style={{ marginBottom: 32 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Repetir nueva contraseña</div><input type="password" style={s.input} placeholder="••••••••" /></div>
          <button style={s.btnPrimary} onClick={() => { showToast("Clave actualizada ✓", c.green); cerrarPantalla('clave', () => setProfileScreen(null)); }}>Actualizar clave</button>
        </div>
      )}

      {showMenu && profileScreen === "logros" && (() => {
        const hasMetas = listaMetas.length > 0;
        let fechaPrimerPaso = "Pendiente";
        if (hasMetas) {
          const oldestMeta = listaMetas[listaMetas.length - 1]; 
          if (oldestMeta.id.startsWith("meta_")) {
              const d = new Date(parseInt(oldestMeta.id.replace("meta_", "")));
              fechaPrimerPaso = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
          } else { fechaPrimerPaso = "12/04/2025"; }
        }

        const achievements = [
          { id: 1, title: "Primer paso", desc: "Registra tu primera meta", unlocked: hasMetas, date: hasMetas ? `Obtenido el ${fechaPrimerPaso}` : "", icon: "🔰", bg: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5" },
          { id: 2, title: "Ahorrador constante", desc: "Ahorra 7 días seguidos", unlocked: true, date: "Obtenido el 20/04/2025", icon: "🪙", bg: isDark ? "rgba(59,130,246,0.15)" : "#DBEAFE" },
          { id: 3, title: "Meta en marcha", desc: "Completa el 50% de una meta", unlocked: true, date: "Obtenido el 25/04/2025", icon: "🚀", bg: isDark ? "rgba(168,85,247,0.15)" : "#F3E8FF" },
          { id: 4, title: "Gran ahorrador", desc: "Completa el 100% de una meta", unlocked: false, progress: 62, icon: <Lock size={20} color={c.muted} />, bg: isDark ? "#333" : "#F3F4F6" },
          { id: 5, title: "Experto financiero", desc: "Usa la app por 30 días seguidos", unlocked: false, progress: 20, icon: <Lock size={20} color={c.muted} />, bg: isDark ? "#333" : "#F3F4F6" }
        ];

        const filteredAchievements = achievements.filter(a => filtroLogros === "desbloqueados" ? a.unlocked : filtroLogros === "bloqueados" ? !a.unlocked : true);

        return (
          <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'logros' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
              <button onClick={() => cerrarPantalla('logros', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
              <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis logros / Insignias</h2>
            </div>
            <div style={{ background: isDark ? "#1E120A" : "#FFF5EB", borderRadius: 16, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>¡Vas increíble!</div><div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Sigue así para desbloquear<br/>más logros 🤞</div></div>
              <div style={{ fontSize: 48 }}>🏆</div>
            </div>
            <div className="hide-scroll" style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto" }}>
              {['Todos', 'Desbloqueados', 'Bloqueados'].map(t => {
                  const val = t.toLowerCase(); const act = filtroLogros === val;
                  return (<button key={val} onClick={() => setFiltroLogros(val)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: act ? 700 : 600, background: "transparent", border: act ? `1px solid #FF803C` : `1px solid transparent`, color: act ? "#FF803C" : c.muted, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>{t}</button>)
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {filteredAchievements.map(ach => (
                <div key={ach.id} style={{ ...s.card, padding: 16, display: "flex", alignItems: "center", gap: 16, marginBottom: 0, opacity: ach.unlocked ? 1 : 0.6 }}>
                    <div style={{ width: 48, height: 48, borderRadius: "50%", background: ach.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{ach.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{ach.title}</div>
                      <div style={{ fontSize: 13, color: c.muted, fontWeight: 500, marginBottom: 2 }}>{ach.desc}</div>
                      {ach.unlocked && <div style={{ fontSize: 12, color: c.muted, fontWeight: 400 }}>{ach.date}</div>}
                      {!ach.unlocked && (<div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 6, flex: 1, overflow: "hidden" }}><div style={{ background: "#9CA3AF", height: "100%", width: `${ach.progress}%`, borderRadius: 4 }}></div></div></div>)}
                    </div>
                    <div>{ach.unlocked ? <CheckCircle2 size={24} color="#10B981" /> : <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>{ach.progress}%</span>}</div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {showMenu && profileScreen === "ayuda" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'ayuda' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Centro de ayuda</h2></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo edito una categoría?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Ve a Configuración &gt; Configuración de categorías y presiona el ícono del lápiz junto a la categoría que deseas modificar.</div></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo funciona la proyección de metas?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Calculamos cuánto te falta ahorrar y lo dividimos entre los días restantes hasta tu fecha límite para decirte tu cuota diaria.</div></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 24 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>Mi presupuesto no aparece, ¿qué hago?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Asegúrate de haber creado el presupuesto para el mes actual en la pestaña 'Presupuesto'.</div></div>
          <a href="mailto:soporte@ahorrometa.com" style={{ ...s.btnSecondary, display: "block", textAlign: "center", textDecoration: "none", padding: "16px 0", fontSize: 15 }}>✉️ Contactar a soporte</a>
        </div>
      )}

      {/* MODAL CREAR/EDITAR CATEGORÍA */}
      {catForm.visible && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10001, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => setCatForm({...catForm, visible: false})} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{catForm.id ? "Editar categoría" : "Crear categoría"}</h2></div>
          <div style={{ marginBottom: 24 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Nombre de la categoría ►</div><input style={s.input} placeholder={catForm.tipo === 'ingreso' ? "Ej: Sueldo, Venta..." : "Ej: Comida, Transporte..."} value={catForm.nombre} onChange={e => setCatForm({...catForm, nombre: e.target.value})} /></div>
          <div style={{ marginBottom: 24 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Seleccionar icono ►</div><div className="hide-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>{CAT_ICONS.map(ico => (<div key={ico} onClick={() => setCatForm({...catForm, icono: ico})} style={{ width: 56, height: 56, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: catForm.icono === ico ? `2px solid #10B981` : "2px solid transparent", cursor: "pointer", transition: "0.2s" }}>{ico}</div>))}</div></div>
          <div style={{ marginBottom: 40 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Color de la categoría</div><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{COLORES_CUSTOM.map(col => (<div key={col} onClick={() => setCatForm({...catForm, color: col})} style={{ width: 38, height: 38, borderRadius: "50%", background: col, cursor: "pointer", border: catForm.color === col ? `3px solid ${c.text}` : "3px solid transparent", transition: "0.2s" }} />))}</div></div>
          <button onClick={guardarCatForm} disabled={saving} style={{ ...s.btnPrimary, background: "#059669", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", padding: 16, fontSize: 16 }}>{saving ? "Guardando..." : (catForm.id ? "Guardar cambios" : "Crear categoría")}</button>
        </div>
      )}

      {showApariencia && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'apariencia' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('apariencia', () => { setShowApariencia(false); })} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: "700" }}>Pantalla y brillo</h2></div>
          <div style={{ fontSize: 14, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: 700 }}>Aspecto</div>
          <div style={{ background: c.card, borderRadius: 16, padding: "20px 20px 0", marginBottom: 24, border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: 24 }}>
              <div onClick={() => { setTheme("light"); localStorage.setItem("themePref", "light"); showToast("Tema Claro activado"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}><div style={{ width: 66, height: 130, borderRadius: 12, background: "#FFF", border: theme === "light" ? "3px solid #34C759" : "1px solid #CCC", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#E5E5E5", borderRadius: 4 }} /><div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#E5E5E5", borderRadius: 4 }} /></div><span style={{ fontSize: 16, fontWeight: 600 }}>Claro</span><div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "light" ? "none" : `1px solid ${c.muted}`, background: theme === "light" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{theme === "light" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}</div></div>
              <div onClick={() => { setTheme("dark"); localStorage.setItem("themePref", "dark"); showToast("Tema Oscuro activado"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}><div style={{ width: 66, height: 130, borderRadius: 12, background: "#111", border: theme === "dark" ? "3px solid #34C759" : "1px solid #444", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#333", borderRadius: 4 }} /><div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#333", borderRadius: 4 }} /></div><span style={{ fontSize: 16, fontWeight: 600 }}>Oscuro</span><div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "dark" ? "none" : `1px solid ${c.muted}`, background: theme === "dark" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{theme === "dark" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}</div></div>
            </div>
          </div>
          <button style={{ ...s.btnPrimary, marginTop: 30 }} onClick={() => { guardarConfig(); cerrarPantalla('apariencia', () => setShowApariencia(false)); }}>Guardar Preferencias</button>
        </div>
      )}

      {showAddModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Registrar Movimiento</h3><button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button></div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}><button style={s.tipoBtn(form.tipo === "ingreso", c.green)} onClick={() => setForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button><button style={s.tipoBtn(form.tipo === "gasto", c.red)} onClick={() => setForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button></div>
            <input autoFocus style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}><select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>{(form.tipo === "ingreso" ? safeBase : safeExtra).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select><input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} /></div>
            <button style={{...s.btnPrimary, padding: "16px"}} onClick={agregarMovimiento} disabled={saving}>{saving ? "Guardando..." : "Guardar Registro"}</button>
          </div>
        </div>
      )}

      {editando && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditando(null); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Editar Movimiento</h3><button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button></div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}><button style={s.tipoBtn(editForm.tipo === "ingreso", c.green)} onClick={() => setEditForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button><button style={s.tipoBtn(editForm.tipo === "gasto", c.red)} onClick={() => setEditForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button></div>
            <input style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}><select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>{(editForm.tipo === "ingreso" ? safeBase : safeExtra).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select><input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} /></div>
            <button style={{...s.btnPrimary, padding: "16px"}} onClick={guardarEdicion} disabled={saving}>{saving ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </div>
      )}

    </div>
  );
}