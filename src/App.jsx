import { useState, useEffect } from "react";
import { 
  Home, PieChart, Calendar, X, Bell, Target, Wallet, Menu, Loader2, Edit2, Trash2, AlertTriangle, Plus, ChevronRight, CheckCircle2, MoreVertical, ArrowLeft,
} from "lucide-react";

import { supabase } from "./supabaseClient";
import Auth from "./Auth";
import MenuPrincipal from "./components/MenuPrincipal";
import Novedades from "./components/Novedades";
import ExportarReportes from "./components/ExportarReportes";
import ConfigCategorias from "./components/ConfigCategorias";
import MisLogros from "./components/MisLogros";

import ModalRegistrarMovimiento from "./components/ModalRegistrarMovimiento";
import ModalEditarMovimiento from "./components/ModalEditarMovimiento";
import ModalCrearMeta from "./components/ModalCrearMeta";
import ModalCrearPresupuesto from "./components/ModalCrearPresupuesto";

import TabInicio from "./components/TabInicio";
import TabReportes from "./components/TabReportes";
import TabPresupuesto from "./components/TabPresupuesto";
import TabMetas from "./components/TabMetas";

import {
  INGRESOS_DEFAULT, GASTOS_DEFAULT, METAS_INICIALES,
  COLORES_CUSTOM, PASTEL_COLORS, METAS_ICONS, CAT_ICONS
} from "./constants";
import {
  hoy, calcularFechaFutura, getFechaLocal,
  formatMoney, getIcono, getTexto, formatCatName,
  formatFecha, getUIFechaHora, diffDias
} from "./utils";

export default function App() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setVerificandoSesion(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUsuario(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => await supabase.auth.signOut();

  const [gastos, setGastos] = useState([]);
  const [categoriasBase, setCategoriasBase] = useState(INGRESOS_DEFAULT);
  const [categoriasExtra, setCategoriasExtra] = useState(GASTOS_DEFAULT);  
  const [listaMetas, setListaMetas] = useState(METAS_INICIALES);
  
  const [presupuestosMensuales, setPresupuestosMensuales] = useState({});
  const [showCrearPresupuesto, setShowCrearPresupuesto] = useState(false);
  const [presupForm, setPresupForm] = useState({ periodo: hoy().slice(0, 7), categorias: {} });

  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: GASTOS_DEFAULT[0]?.id || "", tipo: "gasto" });
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

  const [theme, setTheme] = useState(localStorage.getItem("themePref") || "dark");
  const [useBold, setUseBold] = useState(false);
  const [isClosing, setIsClosing] = useState("");

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];
  const isDark = theme === "dark";
  const isModalOpen = showAddModal || !!editando || showCrearMeta || !!metaSeleccionada || showAporteModal || catForm.visible || showNovedades || showCrearPresupuesto;

  const c = {
    bg: isDark ? "#0A0A0A" : "#F4F5F7", card: isDark ? "#111111" : "#FFFFFF", text: isDark ? "#E8E0D0" : "#1A1A1A",
    muted: isDark ? "#888888" : "#6B7280", border: isDark ? "#1E1E1E" : "#E5E7EB", nav: isDark ? "#0D0D0D" : "#FFFFFF",
    input: isDark ? "#1A1A1A" : "#F9FAFB", green: isDark ? "#5AE88A" : "#10B981", red: isDark ? "#E85A5A" : "#EF4444",
    shadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.04)", iconBgGreen: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
    iconBgRed: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2", iconBgOrange: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFEDD5",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF", iconTextPurple: isDark ? "#D8B4FE" : "#A855F7", brandBlue: "#4A3AFF"
  };

  const showToast = (msg, color = "#FF803C") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const cerrarPantalla = (screenName, action) => { setIsClosing(screenName); setTimeout(() => { action(); setIsClosing(""); setShowMetaMenu(false); }, 280); };

  const loadData = async (isManual = false) => {
    if (!usuario?.id) return;
    try {
      const { data: movimientos, error: err1 } = await supabase.from("gastos").select("*").eq("user_id", usuario.id).order("created_at", { ascending: false });
      if (err1) throw err1;
      setGastos((movimientos || []).map(m => ({ ...m, fecha: getFechaLocal(m.created_at) })));

      const { data: cfg, error: err2 } = await supabase.from("config").select("*").eq("user_id", usuario.id);
      if (err2) throw err2;
      
      if (cfg) {
        const getVal = (k) => cfg.find(item => item.key === `${usuario.id}_${k}`)?.value;
        if (getVal("themePref")) { setTheme(getVal("themePref")); localStorage.setItem("themePref", getVal("themePref")); }
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
    if (!viewportMeta) { viewportMeta = document.createElement("meta"); viewportMeta.name = "viewport"; document.head.appendChild(viewportMeta); }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  }, []);

  useEffect(() => { if (usuario) loadData(); }, [usuario]);
  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const handleTouchStart = (e) => { const scrollTop = window.scrollY || document.documentElement.scrollTop; setStartY(scrollTop <= 5 ? e.touches[0].clientY : 0); };
  const handleTouchMove = (e) => {
    if (!startY) return;
    const currentY = e.touches[0].clientY; const diff = currentY - startY;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (diff > 0 && scrollTop <= 5) setPullDistance(Math.min(diff * 0.4, 80));
  };
  const handleTouchEnd = async () => {
    if (pullDistance > 40) { 
      setIsRefreshing(true); setPullDistance(60); 
      const delay = new Promise(resolve => setTimeout(resolve, 800)); 
      await Promise.all([loadData(true), delay]); setIsRefreshing(false);
    }
    setPullDistance(0); setStartY(0);
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
    setForm(f => ({ ...f, monto: "", descripcion: "" })); showToast(`Registrado ✓`); setSaving(false); setShowAddModal(false);
  };

  const eliminar = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar este movimiento?")) return;
    const { error: err } = await supabase.from("gastos").delete().eq("id", id);
    if (err) return showToast("Error", c.red);
    setGastos(prev => prev.filter(g => g.id !== id)); showToast("Eliminado", c.muted);
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
    setEditando(null); showToast("Actualizado ✓"); setSaving(false);
  };

  const guardarConfig = async () => {
    setSaving(true);
    const upserts = [
      { user_id: usuario.id, key: `${usuario.id}_themePref`, value: theme },
      { user_id: usuario.id, key: `${usuario.id}_useBoldPref`, value: useBold.toString() },
      { user_id: usuario.id, key: `${usuario.id}_categoriasCustom`, value: JSON.stringify(safeExtra) },
      { user_id: usuario.id, key: `${usuario.id}_categoriasBase`, value: JSON.stringify(safeBase) }
    ];
    await supabase.from("config").upsert(upserts, { onConflict: "key" });
    setSaving(false); showToast("Configuración guardada ✓");
  };

  const guardarPerfil = async () => {
    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_userName`, value: userName }], { onConflict: "key" });
    setSaving(false); showToast("Datos actualizados ✓", c.green); cerrarPantalla('datos', () => setProfileScreen(null));
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

    let nuevoArray = catForm.id ? arrayActual.map(c => c.id === catForm.id ? { ...c, label: labelFinal, color: catForm.color } : c) : [...arrayActual, { id: (esIngreso ? "base_" : "custom_") + Date.now(), label: labelFinal, color: catForm.color }];
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key, value: JSON.stringify(nuevoArray) }], { onConflict: "key" });
    setSaving(false); showToast(catForm.id ? "Categoría actualizada ✓" : "Categoría creada ✓", c.green); setCatForm({ ...catForm, visible: false });
  };

  const eliminarCat = async (id, tipo) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const esIngreso = tipo === 'ingreso'; const arrayActual = esIngreso ? safeBase : safeExtra;
    const key = esIngreso ? `${usuario.id}_categoriasBase` : `${usuario.id}_categoriasCustom`;
    const nuevoArray = arrayActual.filter(c => c.id !== id);
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key, value: JSON.stringify(nuevoArray) }], { onConflict: "key" });
    setSaving(false); showToast("Categoría eliminada", c.muted);
  };

  const guardarPresupuesto = async () => {
    const totalAsignado = Object.values(presupForm.categorias).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (totalAsignado <= 0) return showToast("Asigna un monto a al menos una categoría", c.red);
    setSaving(true);
    const nuevosPresupuestos = { ...presupuestosMensuales, [presupForm.periodo]: { total: totalAsignado, categorias: presupForm.categorias } };
    setPresupuestosMensuales(nuevosPresupuestos);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_presupuestosMensuales`, value: JSON.stringify(nuevosPresupuestos) }], { onConflict: "key" });
    setSaving(false); showToast("Presupuesto guardado ✓", c.green); cerrarPantalla('crearPresupuesto', () => setShowCrearPresupuesto(false));
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
    setListaMetas(nuevasMetas); setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false); cerrarPantalla('crearMeta', () => { setShowCrearMeta(false); setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); });
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta meta? Todo el progreso se perderá.")) return;
    const nuevasMetas = listaMetas.filter(m => m.id !== id); setListaMetas(nuevasMetas); setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false); showToast("Meta eliminada con éxito", c.muted); setShowMetaMenu(false); cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null));
  };

  const procesarAporte = async () => {
    const monto = parseFloat(aporteMonto); if (!monto || monto <= 0) return showToast("Ingresa un monto válido", c.red); setSaving(true);
    const metaDestino = listaMetas.find(m => m.id === aporteMetaId);
    const nuevo = { user_id: usuario.id, fecha: hoy(), monto, descripcion: `Aporte a ${metaDestino.nombre}`, categoria: "meta_aporte", tipo: "aporte" };
    const { data, error: err } = await supabase.from("gastos").insert([nuevo]).select();
    if (err) { showToast("Error al guardar", c.red); setSaving(false); return; }
    setGastos(prev => [{ ...data[0], fecha: getFechaLocal(data[0].created_at) }, ...prev]);
    const nuevasMetas = listaMetas.map(m => m.id === aporteMetaId ? { ...m, aporteInicial: m.aporteInicial + monto } : m);
    setListaMetas(nuevasMetas);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `${usuario.id}_listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    showToast(`¡S/ ${monto} aportados a tu meta! 🎉`, c.green); setSaving(false); setShowAporteModal(false); setAporteMonto(""); setAporteMetaId(null);
  };

  const fechaHoy = hoy(); const mesActualStr = fechaHoy.slice(0, 7);
  const presupuestoDelMes = presupuestosMensuales[mesActualStr]?.total || 0;
  const gastosDelMesHoy = gastos.filter(g => g.tipo === "gasto" && g.fecha.startsWith(mesActualStr)).reduce((a, g) => a + g.monto, 0);
  const diasEnMes = new Date(parseInt(mesActualStr.split('-')[0]), parseInt(mesActualStr.split('-')[1]), 0).getDate();
  const diaActual = parseInt(fechaHoy.split('-')[2]);
  const diasRestantesMes = Math.max(1, diasEnMes - diaActual + 1);
  const presupuestoDiario = presupuestoDelMes > 0 ? Math.max(0, (presupuestoDelMes - gastosDelMesHoy) / diasRestantesMes) : 0;

  const movimientosHoy = gastos.filter(g => g.fecha === fechaHoy);
  const totalGastadoHoy = movimientosHoy.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosHoy = movimientosHoy.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  
  const gastosVerTodos = gastos.filter(g => (!vtFechaDesde || g.fecha >= vtFechaDesde) && (!vtFechaHasta || g.fecha <= vtFechaHasta));

  const s = {
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: "480px", margin: "0 auto", position: "relative", boxShadow: isDark ? "0 0 40px rgba(0,0,0,0.6)" : "0 0 40px rgba(0,0,0,0.1)", background: c.bg, paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))", width: "100%", userSelect: "none", WebkitUserSelect: "none" },
    section: { padding: "calc(60px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card: { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    sliderContainer: { display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", gap: 16, paddingBottom: 8, marginTop: 4, WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" },
    slideItem: { minWidth: "100%", scrollSnapAlign: "center", flexShrink: 0 },
    sliderCard: { width: "100%", background: "#111", borderRadius: 20, padding: "20px", boxSizing: "border-box", color: "#FFF", boxShadow: "none", position: "relative" },
    label: { fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 },
    greenNum: { fontSize: 20, fontWeight: 600, color: c.green },
    redNum: { fontSize: 20, fontWeight: 600, color: c.red },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, width: "100%" },
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48, userSelect: "auto", WebkitUserSelect: "auto" },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48, userSelect: "auto", WebkitUserSelect: "auto" },
    btnPrimary: { background: "#FF803C", color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.2)" },
    btnSecondary: { background: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    deleteBtn: { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.red, cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn: { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    errorCard: { background: isDark ? "#1A0A0A" : "#FEF2F2", border: `1px solid ${c.red}`, borderRadius: 12, padding: "16px", margin: "20px", color: c.red, fontSize: 14, fontWeight: 400 },
    navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: c.nav, display: "flex", zIndex: 100, paddingTop: 0, paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`, boxShadow: isDark ? "0 -2px 10px rgba(0,0,0,0.4)" : "0 -2px 10px rgba(0,0,0,0.06)" },
    navBtn: (a) => ({ flex: 1, paddingTop: 10, paddingBottom: 8, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: a ? "#FF803C" : c.muted, fontSize: 12, fontWeight: 400, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", position: "relative" }),
    fabCircle: { position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", width: 68, height: 68, borderRadius: "50%", background: "#FF803C", color: "#FFF", border: `6px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.4)", zIndex: 105, padding: 0 },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 99999, padding: "0", backdropFilter: "blur(10px)" },
    modal: { background: c.card, borderTop: `1px solid ${c.border}`, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)" }
  };

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PF';

  if (verificandoSesion) return (<div style={{ background: "#0A0A0A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}><div style={{ width: 32, height: 32, border: "2px solid #1E1E1E", borderTop: "2px solid #FF803C", borderRadius: "50%", animation: "spin 1s linear infinite" }} /><style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style></div>);
  if (!usuario) return <Auth />;
  if (!loaded) return (<div style={{ background: c.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}><div style={{ width: 32, height: 32, border: `2px solid ${c.border}`, borderTop: "2px solid #FF803C", borderRadius: "50%", animation: "spin 1s linear infinite" }} /><span style={{ color: c.muted, fontSize: 14, fontFamily: "'Montserrat', sans-serif" }}>Cargando datos...</span></div>);

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; } html, body { background: ${isDark ? "#000000" : "#E5E7EB"} !important; color: ${c.text}; margin: 0; padding: 0; width: 100vw; max-width: 100%; overflow-x: hidden; overflow-y: ${isModalOpen ? 'hidden' : 'auto'} !important; font-family: 'Montserrat', sans-serif; transition: background 0.3s ease, color 0.3s ease; user-select: none; -webkit-user-select: none; overscroll-behavior-y: none; }
        body * { font-weight: ${useBold ? '700' : 'inherit'}; } #root { background: ${c.bg}; min-height: 100vh; width: 100%; max-width: 100%; overflow-x: hidden; overflow-y: ${isModalOpen ? 'hidden' : 'auto'}; }
        .hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg) } } @keyframes slideInFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } } @keyframes slideOutToLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>

      {toast && (<div style={{ position: "fixed", top: 40, left: "50%", transform: "translateX(-50%)", background: toast.color || "#333", color: "#FFF", padding: "12px 24px", borderRadius: 30, zIndex: 999999, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "slideDown 0.3s ease-out", whiteSpace: "nowrap" }}>{toast.msg}</div>)}

      {/* VISTA VER TODOS LOS MOVIMIENTOS */}
      {viewAll && (
        <>
          <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.bg, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
            <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => { setViewAll(false); window.scrollTo(0, 0); }}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 600 }}>Movimientos</h2>
            <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}><Calendar size={20} /></button>
          </div>
          <div style={s.section}>
            {showVtFiltro && (
              <div style={{ padding: "16px 20px", background: c.card, borderBottom: `1px solid ${c.border}`, borderRadius: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <div style={{ flex: 1, position: "relative" }}><input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaDesde ? c.text : "transparent" }} /></div>
                  <div style={{ flex: 1, position: "relative" }}><input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaHasta ? c.text : "transparent" }} /></div>
                </div>
                {(vtFechaDesde || vtFechaHasta) && (<button style={{ width: "100%", fontSize: 14, fontWeight: 600, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4, fontFamily: "inherit" }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>)}
              </div>
            )}
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12 }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.map(g => {
                const isAporte = g.tipo === "aporte"; const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
                const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";
                let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"; let montoColor = c.text;
                if (isAporte) { iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"; montoColor = c.green; }
                else if (g.tipo === "gasto") { iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"; montoColor = c.red; }
                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>{isAporte ? "🎯" : (cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase())}</div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text, textDecoration: (!cat && !isAporte) ? "line-through" : "none" }}>{isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}{cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>{descAdicional}</span>}{!cat && !isAporte && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>(Eliminado)</span>}</div>
                          <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)} · {isAporte ? "Aportes" : (g.tipo === "gasto" ? "Gastos" : "Ingresos")}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: montoColor, marginRight: 4 }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span>
                        {!isAporte && (<div style={{ display: "flex", flexDirection: "column", gap: 4 }}><button style={{...s.editBtn, padding: 2}} onClick={() => abrirEdicion(g)}><Edit2 size={16} /></button><button style={{...s.deleteBtn, padding: 2}} onClick={() => eliminar(g.id)}><Trash2 size={16} /></button></div>)}
                      </div>
                    </div>
                  </div>
                );
            })}
          </div>
        </>
      )}

      {/* VISTAS PRINCIPALES DEL TAB */}
      {!viewAll && (
        <>
          <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", background: tab === "hoy" ? c.bg : c.card, borderBottom: tab === "hoy" ? "none" : `1px solid ${c.border}`, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: tab === "hoy" ? "space-between" : "center", alignItems: "center" }}>
              {tab === "hoy" ? (
                <><div style={{ display: "flex", alignItems: "center", gap: 16 }}><button onClick={() => setShowMenu(true)} style={{ background: "none", border: "none", color: c.text, cursor: "pointer", padding: 0 }}><Menu size={28} /></button><h1 style={{ fontSize: 20, fontWeight: 600, color: c.text, margin: 0, lineHeight: 1.1 }}><span style={{ fontWeight: 500 }}>¡Hola</span><span style={{ fontWeight: 600 }}>, {userName}! 👋</span></h1></div>
                  <div style={{ position: "relative" }}><button onClick={() => setShowNovedades(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: c.green }}><Bell size={24} /></button><div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: c.red, borderRadius: "50%", border: `2px solid ${c.bg}` }}></div></div></>
              ) : (<h1 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0, lineHeight: 1.1 }}>{tab === "metas" ? "Mis Metas" : tab === "resumen" ? "Reportes" : "Presupuesto"}</h1>)}
            </div>
          </div>

          {error && <div style={{...s.errorCard, marginTop: 80, position: "relative", zIndex: 20}}><AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: 8 }} /> {error}</div>}
          
          {tab === "hoy" && (
            <>
              <div style={{ position: "fixed", top: "calc(52px + env(safe-area-inset-top, 0px))", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, color: "#10B981", opacity: (isRefreshing || pullDistance > 0) ? 1 : 0, visibility: (isRefreshing || pullDistance > 0) ? "visible" : "hidden", pointerEvents: "none" }}>
                <Loader2 size={24} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none", transform: isRefreshing ? "none" : `rotate(${pullDistance * 5}deg)` }} />
                <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4, opacity: Math.min(pullDistance / 50, 1), color: c.muted }}>Actualizando...</span>
              </div>
              <TabInicio 
                c={c} s={s} isDark={isDark} listaMetas={listaMetas} setAporteMetaId={setAporteMetaId} setShowAporteModal={setShowAporteModal}
                setIsEditingMetaObj={setIsEditingMetaObj} setMetaForm={setMetaForm} setShowCrearMeta={setShowCrearMeta} setViewAll={setViewAll}
                movimientosHoy={movimientosHoy} totalIngresosHoy={totalIngresosHoy} totalGastadoHoy={totalGastadoHoy} presupuestoDiario={presupuestoDiario}
                categorias={categorias} abrirEdicion={abrirEdicion} eliminar={eliminar} isRefreshing={isRefreshing} pullDistance={pullDistance}
                handleTouchStart={handleTouchStart} handleTouchMove={handleTouchMove} handleTouchEnd={handleTouchEnd}
              />
            </>
          )}
          {tab === "resumen" && <TabReportes c={c} s={s} isDark={isDark} gastos={gastos} categoriasBase={categoriasBase} categoriasExtra={categoriasExtra} categorias={categorias} listaMetas={listaMetas} />}
          {tab === "presupuesto" && <TabPresupuesto c={c} s={s} isDark={isDark} presupuestosMensuales={presupuestosMensuales} setPresupForm={setPresupForm} setShowCrearPresupuesto={setShowCrearPresupuesto} />}
          {tab === "metas" && <TabMetas c={c} s={s} isDark={isDark} listaMetas={listaMetas} setMetaSeleccionada={setMetaSeleccionada} setIsEditingMetaObj={setIsEditingMetaObj} setMetaForm={setMetaForm} setShowCrearMeta={setShowCrearMeta} />}

          <div style={s.navBar}>
            {[{ id: "hoy", icon: <Home size={24} strokeWidth={2.5} />, label: "Inicio" }, { id: "resumen", icon: <PieChart size={24} strokeWidth={2.5} />, label: "Reportes" }].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>{tab === n.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 3, background: "#FF803C", borderRadius: "0 0 4px 4px" }} />}<div style={{ marginBottom: -2 }}>{n.icon}</div><span style={{ fontFamily: "'Montserrat', sans-serif" }}>{n.label}</span></button>
            ))}
            <div style={{ width: 72, position: "relative", display: "flex", justifyContent: "center" }}><button style={s.fabCircle} onClick={() => setShowAddModal(true)}><Plus size={36} strokeWidth={2.5} color="#FFF" /></button></div>
            {[{ id: "presupuesto", icon: <Wallet size={24} strokeWidth={2.5} />, label: "Presupuesto" }, { id: "metas", icon: <Target size={24} strokeWidth={2.5} />, label: "Metas" }].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>{tab === n.id && <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 44, height: 3, background: "#FF803C", borderRadius: "0 0 4px 4px" }} />}<div style={{ marginBottom: -2 }}>{n.icon}</div><span style={{ fontFamily: "'Montserrat', sans-serif" }}>{n.label}</span></button>
            ))}
          </div>
        </>
      )}

      {/* COMPONENTES MODALES Y PANTALLAS FLOTANTES */}
      {showAddModal && <ModalRegistrarMovimiento s={s} c={c} form={form} setForm={setForm} safeBase={safeBase} safeExtra={safeExtra} agregarMovimiento={agregarMovimiento} setShowAddModal={setShowAddModal} saving={saving} />}
      {editando && <ModalEditarMovimiento s={s} c={c} editForm={editForm} setEditForm={setEditForm} safeBase={safeBase} safeExtra={safeExtra} guardarEdicion={guardarEdicion} setEditando={setEditando} saving={saving} />}
      {showCrearMeta && <ModalCrearMeta c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearMeta={setShowCrearMeta} setIsEditingMetaObj={setIsEditingMetaObj} isEditingMetaObj={isEditingMetaObj} metaForm={metaForm} setMetaForm={setMetaForm} procesarNuevaMeta={procesarNuevaMeta} />}
      {showCrearPresupuesto && <ModalCrearPresupuesto c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearPresupuesto={setShowCrearPresupuesto} presupForm={presupForm} setPresupForm={setPresupForm} safeExtra={safeExtra} setProfileScreen={setProfileScreen} setShowMenu={setShowMenu} guardarPresupuesto={guardarPresupuesto} saving={saving} />}
      
      {showNovedades && <Novedades c={c} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowNovedades={setShowNovedades} />}
      {showMenu && !profileScreen && <MenuPrincipal c={c} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowMenu={setShowMenu} setProfileScreen={setProfileScreen} setShowApariencia={setShowApariencia} cerrarSesion={cerrarSesion} />}
      {showMenu && profileScreen === "exportar" && <ExportarReportes c={c} s={s} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} exportFechaDesde={exportFechaDesde} setExportFechaDesde={setExportFechaDesde} exportFechaHasta={exportFechaHasta} setExportFechaHasta={setExportFechaHasta} exportEmail={exportEmail} setExportEmail={setExportEmail} gastos={gastos} categorias={categorias} showToast={showToast} />}
      {showMenu && profileScreen === "categorias" && <ConfigCategorias c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} safeBase={safeBase} safeExtra={safeExtra} abrirEditarCat={abrirEditarCat} eliminarCat={eliminarCat} abrirCrearCat={abrirCrearCat} />}
      {showMenu && profileScreen === "logros" && <MisLogros c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} listaMetas={listaMetas} filtroLogros={filtroLogros} setFiltroLogros={setFiltroLogros} />}

      {/* MODALES PEQUEÑOS (Aportes, Perfil, Apariencia, etc.) */}
      {showAporteModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAporteModal(false); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Aportar a la meta</h3><button onClick={() => setShowAporteModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button></div>
             <div style={{ ...s.label, textAlign: "center", marginBottom: 12, color: c.muted }}>¿Cuánto deseas aportar?</div>
             <input autoFocus style={{ ...s.input, marginBottom: 24, fontSize: 36, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto", color: c.green }} type="number" placeholder="0.00" value={aporteMonto} onChange={e => setAporteMonto(e.target.value)} onKeyDown={e => e.key === "Enter" && procesarAporte()} />
             <button style={{...s.btnPrimary, padding: "16px", background: c.green, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"}} onClick={procesarAporte} disabled={saving}>{saving ? "Procesando..." : "Confirmar Aporte"}</button>
          </div>
        </div>
      )}

      {metaSeleccionada && (() => {
        const obj = parseFloat(metaSeleccionada.montoObjetivo) || 1; const ahorrado = parseFloat(metaSeleccionada.aporteInicial) || 0;
        const faltan = Math.max(0, obj - ahorrado); const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
        let fechaStr = "Sin fecha límite"; let diasRestantes = 0;
        if (metaSeleccionada.fechaLimite) { fechaStr = formatFecha(metaSeleccionada.fechaLimite); diasRestantes = diffDias(hoy(), metaSeleccionada.fechaLimite); }
        const ahorroDiarioVal = diasRestantes > 0 ? (faltan / diasRestantes) : 0; const bgIconColor = PASTEL_COLORS[metaSeleccionada.indexColor % PASTEL_COLORS.length];

        return (
          <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, display: "flex", flexDirection: "column", animation: isClosing === 'detalleMeta' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "env(safe-area-inset-top, 20px) 20px 16px", background: c.bg, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}><button onClick={() => cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null))} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}><ArrowLeft size={28} /></button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{metaSeleccionada.nombre}</h2></div>
              <div style={{ position: "relative" }}><button onClick={() => setShowMetaMenu(!showMetaMenu)} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}><MoreVertical size={24} /></button>
                {showMetaMenu && (<div style={{ position: "absolute", top: 30, right: 0, background: c.card, border: `1px solid ${c.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 105, overflow: "hidden", minWidth: 140 }}><button onClick={() => eliminarMeta(metaSeleccionada.id)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: c.red, textAlign: "left", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}><Trash2 size={18} /> Eliminar</button></div>)}
              </div>
            </div>
            <div style={{ padding: "32px 20px 20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
                <div style={{ position: "relative", marginBottom: 24 }}><div style={{ width: 110, height: 110, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>{metaSeleccionada.icono}</div><div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#FFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}><CheckCircle2 size={20} color={c.green} /></div></div>
                <div style={{ fontSize: 32, fontWeight: 700, color: c.green, marginBottom: 4 }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</div><div style={{ fontSize: 14, color: c.muted, fontWeight: 500, marginBottom: 24 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</div>
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}><div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 6, height: 10, flex: 1, overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 6 }}></div></div><span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{pct}%</span></div>
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

      {showMenu && profileScreen === "datos" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'datos' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('datos', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis datos</h2></div>
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

      {showMenu && profileScreen === "ayuda" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'ayuda' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Centro de ayuda</h2></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo edito una categoría?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Ve a Configuración &gt; Configuración de categorías y presiona el ícono del lápiz junto a la categoría que deseas modificar.</div></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo funciona la proyección de metas?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Calculamos cuánto te falta ahorrar y lo dividimos entre los días restantes hasta tu fecha límite para decirte tu cuota diaria.</div></div>
          <div style={{ ...s.card, padding: 16, marginBottom: 24 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>Mi presupuesto no aparece, ¿qué hago?</div><div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Asegúrate de haber creado el presupuesto para el mes actual en la pestaña 'Presupuesto'.</div></div>
          <a href="mailto:soporte@ahorrometa.com" style={{ ...s.btnSecondary, display: "block", textAlign: "center", textDecoration: "none", padding: "16px 0", fontSize: 15 }}>✉️ Contactar a soporte</a>
        </div>
      )}
    </div>
  );
}