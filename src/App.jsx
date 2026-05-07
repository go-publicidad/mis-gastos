import { useState, useEffect } from "react";
import {
  Home, PieChart, Calendar, X, Bell, Target, Wallet, Menu, Loader2, Edit2, Trash2, AlertTriangle, Plus, ChevronRight, CheckCircle2, MoreVertical, ArrowLeft,
  Search, Lightbulb, ArrowLeftRight, FileText, Shield, Headphones, PiggyBank
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
import ModalDetalleCategoria from "./components/ModalDetalleCategoria";
import ModalHistorialPresupuestos from "./components/ModalHistorialPresupuestos";
import ModalResumenMensual from "./components/ModalResumenMensual";
import ModalPresupuestoAnual from "./components/ModalPresupuestoAnual";

import TabInicio from "./components/TabInicio";
import TabReportes from "./components/TabReportes";
import TabPresupuesto from "./components/TabPresupuesto";
import TabMetas from "./components/TabMetas";

import {
  INGRESOS_DEFAULT, GASTOS_DEFAULT, METAS_INICIALES,
  COLORES_CUSTOM, PASTEL_COLORS, CAT_ICONS
} from "./constants";
import {
  hoy, formatMoney, getIcono, getTexto, formatFecha, getUIFechaHora, diffDias, getFechaLocal
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

  const [catPresupSelec, setCatPresupSelec] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [resumenMes, setResumenMes] = useState(null);
  const [showPresupAnual, setShowPresupAnual] = useState(false);

  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: GASTOS_DEFAULT[0]?.id || "", tipo: "gasto" });
  const [userName, setUserName] = useState("Usuario");

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

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

  const [showAddModal, setShowAddModal] = useState(false);
  const [showAporteModal, setShowAporteModal] = useState(false);
  const [aporteMonto, setAporteMonto] = useState("");
  const [aporteMetaId, setAporteMetaId] = useState(null);

  const [showCrearMeta, setShowCrearMeta] = useState(false);
  const [isEditingMetaObj, setIsEditingMetaObj] = useState(false);
  const [metaForm, setMetaForm] = useState({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [showMetaMenu, setShowMetaMenu] = useState(false);

  // SWIPE TO ACTION
  const [swipedId, setSwipedId] = useState(null);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [currentSwipeX, setCurrentSwipeX] = useState(0);
  const [swipeBaseX, setSwipeBaseX] = useState(0); 
  const [isSwiping, setIsSwiping] = useState(false);

  const handleSwipeStart = (id, e) => {
    if (swipedId && swipedId !== id) { setCurrentSwipeX(0); setSwipedId(null); }
    setTouchStartX(e.touches[0].clientX); setTouchStartY(e.touches[0].clientY);
    setSwipeBaseX(swipedId === id ? currentSwipeX : 0); setIsSwiping(true);
  };
  const handleSwipeMove = (id, e) => {
    if (swipedId && swipedId !== id) return;
    const diffX = e.touches[0].clientX - touchStartX;
    const diffY = e.touches[0].clientY - touchStartY;
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 10) {
        setSwipedId(id);
        let newX = swipeBaseX + diffX;
        if (swipeBaseX < 0) newX = Math.min(0, newX);
        if (swipeBaseX > 0) newX = Math.max(0, newX);
        setCurrentSwipeX(Math.max(-85, Math.min(85, newX)));
    }
  };
  const handleSwipeEnd = () => {
    setIsSwiping(false);
    if (currentSwipeX > 40) setCurrentSwipeX(80);
    else if (currentSwipeX < -40) setCurrentSwipeX(-80);
    else setCurrentSwipeX(0);
  };

  // PULL TO REFRESH
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startYGlobal, setStartYGlobal] = useState(0);

  const handleTouchStartGlobal = (e) => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop <= 5) setStartYGlobal(e.touches[0].clientY);
    else setStartYGlobal(0);
  };
  const handleTouchMoveGlobal = (e) => {
    if (!startYGlobal) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startYGlobal;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (diff > 0 && scrollTop <= 5) setPullDistance(Math.min(diff * 0.4, 80));
  };
  const handleTouchEndGlobal = async () => {
    if (pullDistance > 40) {
      setIsRefreshing(true); setPullDistance(60);
      const delay = new Promise(resolve => setTimeout(resolve, 800));
      await Promise.all([loadData(true), delay]); setIsRefreshing(false);
    }
    setPullDistance(0); setStartYGlobal(0);
  };

  const [theme, setTheme] = useState(localStorage.getItem("themePref") || "dark");
  const [useBold, setUseBold] = useState(false);
  const [isClosing, setIsClosing] = useState("");

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];
  const isDark = theme === "dark";
  const isModalOpen = showAddModal || !!editando || showCrearMeta || !!metaSeleccionada || showAporteModal || catForm.visible || showNovedades || showCrearPresupuesto || !!catPresupSelec || showHistorial || !!resumenMes || showPresupAnual;

  const c = {
    bg: isDark ? "#0A0A0A" : "#F4F5F7", card: isDark ? "#111111" : "#FFFFFF", text: isDark ? "#E8E0D0" : "#1A1A1A",
    muted: isDark ? "#888888" : "#6B7280", border: isDark ? "#1E1E1E" : "#E5E7EB", nav: isDark ? "#0D0D0D" : "#FFFFFF",
    input: isDark ? "#1A1A1A" : "#F9FAFB", green: isDark ? "#5AE88A" : "#10B981", red: isDark ? "#E85A5A" : "#EF4444",
    shadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.04)", iconBgGreen: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
    iconBgRed: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2", iconBgOrange: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFEDD5",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF", iconTextPurple: isDark ? "#D8B4FE" : "#A855F7", brandBlue: "#4A3AFF"
  };

  const showToast = (msg, color = "#FF803C") => { setToast({ msg, color }); setTimeout(() => setToast(null), 2500); };

  const cerrarPantalla = (screenName, action) => {
    setIsClosing(screenName);
    setTimeout(() => {
      if (action) action();
      else if (screenName === 'detalleMeta') setMetaSeleccionada(null);
      else if (screenName === 'detalleCat') setCatPresupSelec(null);
      else if (screenName === 'resumenMes') setResumenMes(null);
      setIsClosing(""); setShowMetaMenu(false);
    }, 280);
  };

  const loadData = async (isManual = false) => {
    if (!usuario?.id) return;
    try {
      const { data: movimientos, error: err1 } = await supabase.from("gastos").select("*").eq("user_id", usuario.id).order("created_at", { ascending: false });
      if (err1) throw err1;
      setGastos((movimientos || []).map(m => ({ ...m, fecha: getFechaLocal(m.created_at) })));

      const { data: cfg, error: err2 } = await supabase.from("config").select("*").eq("user_id", usuario.id);
      if (err2) throw err2;

      if (cfg) {
        const getVal = (k) => cfg.find(item => item.key === k || item.key === `${usuario.id}_${k}`)?.value;
        if (getVal("themePref")) { setTheme(getVal("themePref")); localStorage.setItem("themePref", getVal("themePref")); }
        if (getVal("useBoldPref")) setUseBold(getVal("useBoldPref") === "true");
        if (getVal("userName")) setUserName(getVal("userName"));
        if (getVal("categoriasCustom")) { try { const p = JSON.parse(getVal("categoriasCustom")); if (Array.isArray(p)) setCategoriasExtra(p); } catch (_) { } }
        if (getVal("categoriasBase")) { try { const p = JSON.parse(getVal("categoriasBase")); if (Array.isArray(p)) setCategoriasBase(p); } catch (_) { } }
        if (getVal("listaMetas")) { try { const p = JSON.parse(getVal("listaMetas")); if (Array.isArray(p)) setListaMetas(p); } catch (_) { } }
        if (getVal("presupuestosMensuales")) { try { const p = JSON.parse(getVal("presupuestosMensuales")); if (p) setPresupuestosMensuales(p); } catch (_) { } }
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

  // FUNCIONES DE CATEGORÍA RECUPERADAS
  const abrirCrearCat = (tipo) => setCatForm({ visible: true, id: null, tipo, nombre: "", icono: "📌", color: COLORES_CUSTOM[0] });
  const abrirEditarCat = (cat, tipo) => setCatForm({ visible: true, id: cat.id, tipo, nombre: getTexto(cat.label), icono: getIcono(cat.label), color: cat.color || COLORES_CUSTOM[0] });

  const guardarCatForm = async () => {
    const nombre = catForm.nombre.trim();
    if (!nombre) return showToast("Escribe un nombre", c.red);
    const labelFinal = `${catForm.icono} ${nombre}`;
    const esIngreso = catForm.tipo === 'ingreso';
    const arrayActual = esIngreso ? safeBase : safeExtra;
    let nuevoArray = catForm.id ? arrayActual.map(c => c.id === catForm.id ? { ...c, label: labelFinal, color: catForm.color } : c) : [...arrayActual, { id: (esIngreso ? "base_" : "custom_") + Date.now(), label: labelFinal, color: catForm.color }];
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);
    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: esIngreso ? `categoriasBase` : `categoriasCustom`, value: JSON.stringify(nuevoArray) }], { onConflict: "user_id, key" });
    setSaving(false); showToast(catForm.id ? "Categoría actualizada ✓" : "Categoría creada ✓", c.green); setCatForm({ ...catForm, visible: false });
  };

  const eliminarCat = async (id, tipo) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const esIngreso = tipo === 'ingreso'; const arrayActual = esIngreso ? safeBase : safeExtra;
    const nuevoArray = arrayActual.filter(c => c.id !== id);
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);
    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: esIngreso ? `categoriasBase` : `categoriasCustom`, value: JSON.stringify(nuevoArray) }], { onConflict: "user_id, key" });
    setSaving(false); showToast("Categoría eliminada", c.muted);
  };

  const guardarPerfil = async () => {
    setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `userName`, value: userName }], { onConflict: "user_id, key" });
    setSaving(false); showToast("Datos actualizados ✓", c.green); cerrarPantalla('datos', () => setProfileScreen(null));
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

  const eliminar = async (g) => {
    if (!window.confirm("¿Seguro que deseas eliminar este movimiento?")) { setSwipedId(null); setCurrentSwipeX(0); return; }
    const { error: err } = await supabase.from("gastos").delete().eq("id", g.id);
    if (err) return showToast("Error", c.red);
    if (g.tipo === "aporte") {
        const metaNombre = g.descripcion.replace("Aporte a ", "").replace("Aporte inicial a ", "").trim();
        const metaEncontrada = listaMetas.find(m => m.nombre === metaNombre);
        if (metaEncontrada) {
            const nuevasMetas = listaMetas.map(m => m.id === metaEncontrada.id ? { ...m, aporteInicial: Math.max(0, m.aporteInicial - g.monto) } : m);
            setListaMetas(nuevasMetas);
            await supabase.from("config").upsert([{ user_id: usuario.id, key: `listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "user_id, key" });
        }
    }
    setGastos(prev => prev.filter(item => item.id !== g.id));
    showToast("Eliminado", c.muted); setSwipedId(null); setCurrentSwipeX(0);
  };

  const abrirEdicion = (g) => { 
    setEditando(g); 
    setEditForm({ monto: g.monto, descripcion: g.descripcion, categoria: g.categoria, tipo: g.tipo });
    setSwipedId(null); setCurrentSwipeX(0);
  };

  const guardarEdicion = async () => {
    const montoNuevo = parseFloat(editForm.monto);
    if (!montoNuevo || montoNuevo <= 0) return showToast("Monto inválido", c.red);
    setSaving(true);
    const updates = { monto: montoNuevo, descripcion: editForm.descripcion, categoria: editForm.categoria, tipo: editForm.tipo };
    const { error: err } = await supabase.from("gastos").update(updates).eq("id", editando.id);
    if (err) { showToast("Error", c.red); setSaving(false); return; }
    if (editando.tipo === "aporte") {
        const metaNombre = editando.descripcion.replace("Aporte a ", "").replace("Aporte inicial a ", "").trim();
        const metaEncontrada = listaMetas.find(m => m.nombre === metaNombre);
        if (metaEncontrada) {
            const diff = montoNuevo - editando.monto;
            const nuevasMetas = listaMetas.map(m => m.id === metaEncontrada.id ? { ...m, aporteInicial: Math.max(0, m.aporteInicial + diff) } : m);
            setListaMetas(nuevasMetas);
            await supabase.from("config").upsert([{ user_id: usuario.id, key: `listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "user_id, key" });
        }
    }
    setGastos(prev => prev.map(g => g.id === editando.id ? { ...g, ...updates } : g));
    setEditando(null); showToast("Actualizado ✓"); setSaving(false);
  };

  const guardarPresupuesto = async () => {
    const totalAsignado = Object.values(presupForm.categorias).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    if (totalAsignado <= 0) return showToast("Asigna un monto a al menos una categoría", c.red);
    setSaving(true);
    const nuevosPresupuestos = { ...presupuestosMensuales, [presupForm.periodo]: { total: totalAsignado, categorias: presupForm.categorias } };
    setPresupuestosMensuales(nuevosPresupuestos);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `presupuestosMensuales`, value: JSON.stringify(nuevosPresupuestos) }], { onConflict: "user_id, key" });
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
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "user_id, key" });
    setSaving(false); cerrarPantalla('crearMeta', () => { setShowCrearMeta(false); setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); });
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta meta? Todo el progreso se perderá.")) return;
    const nuevasMetas = listaMetas.filter(m => m.id !== id); setListaMetas(nuevasMetas); setSaving(true);
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "user_id, key" });
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
    await supabase.from("config").upsert([{ user_id: usuario.id, key: `listaMetas`, value: JSON.stringify(nuevasMetas) }], { onConflict: "user_id, key" });
    showToast(`¡S/ ${monto} aportados a tu meta! 🎉`, c.green); setSaving(false); setShowAporteModal(false); setAporteMonto(""); setAporteMetaId(null);
  };

  const fechaHoy = hoy(); const mesActualStr = fechaHoy.slice(0, 7);
  const presupuestoDelMes = presupuestosMensuales[mesActualStr]?.total || 0;
  const gastosDelMesHoy = gastos.filter(g => g.tipo === "gasto" && g.fecha.startsWith(mesActualStr)).reduce((a, g) => a + g.monto, 0);
  const diasEnMes = new Date(parseInt(mesActualStr.split('-')[0]), parseInt(mesActualStr.split('-')[1]), 0).getDate();
  const diaActual = parseInt(fechaHoy.split('-')[2]);
  const diasRestantesMes = Math.max(1, diasEnMes - diaActual + 1);
  const presupuestoDiario = presupuestoDelMes > 0 ? Math.max(0, (presupuestosMensuales[mesActualStr]?.total - gastosDelMesHoy) / diasRestantesMes) : 0;
  const movimientosHoy = gastos.filter(g => g.fecha === fechaHoy);
  const totalGastadoHoy = movimientosHoy.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosHoy = movimientosHoy.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const gastosVerTodos = gastos.filter(g => (!vtFechaDesde || g.fecha >= vtFechaDesde) && (!vtFechaHasta || g.fecha <= vtFechaHasta));

  const s = {
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: "480px", margin: "0 auto", position: "relative", boxShadow: isDark ? "0 0 40px rgba(0,0,0,0.6)" : "0 0 40px rgba(0,0,0,0.1)", background: c.bg, paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))", width: "100%" },
    section: { padding: "calc(60px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card: { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    sliderCard: { width: "100%", background: "#111", borderRadius: 20, padding: "20px", boxSizing: "border-box", color: "#FFF", boxShadow: "none", position: "relative" },
    label: { fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 },
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48 },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48 },
    btnPrimary: { background: "#FF803C", color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.2)" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: c.nav, display: "flex", zIndex: 100, paddingTop: 0, paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`, boxShadow: isDark ? "0 -2px 10px rgba(0,0,0,0.4)" : "0 -2px 10px rgba(0,0,0,0.06)" },
    navBtn: (a) => ({ flex: 1, paddingTop: 10, paddingBottom: 8, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: a ? "#FF803C" : c.muted, fontSize: 12, fontWeight: 400, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", position: "relative" }),
    fabCircle: { position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", width: 68, height: 68, borderRadius: "50%", background: "#FF803C", color: "#FFF", border: `6px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.4)", zIndex: 999, padding: 0 },
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
        * { box-sizing: border-box; } html, body { background: ${c.bg} !important; color: ${c.text}; margin: 0; padding: 0; width: 100vw; max-width: 100%; overflow-x: hidden; font-family: 'Montserrat', sans-serif; transition: background 0.3s ease, color 0.3s ease; overscroll-behavior-y: none; }
        body * { font-weight: ${useBold ? '700' : 'inherit'}; } #root { background: ${c.bg}; min-height: 100vh; width: 100%; max-width: 100%; overflow-x: hidden; }
        .hide-scroll::-webkit-scrollbar { display: none; } .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg) } } @keyframes slideInFromLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } } @keyframes slideOutToLeft { from { transform: translateX(0); } to { transform: translateX(-100%); } } @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } } @keyframes slideDown { from { transform: translate(-50%, -100%); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
      {toast && (<div style={{ position: "fixed", top: 40, left: "50%", transform: "translateX(-50%)", background: toast.color || "#333", color: "#FFF", padding: "12px 24px", borderRadius: 30, zIndex: 999999, fontWeight: 600, fontSize: 14, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", animation: "slideDown 0.3s ease-out", whiteSpace: "nowrap" }}>{toast.msg}</div>)}
      {viewAll ? (
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
                  <div style={{ flex: 1, position: "relative" }}>
                    {!vtFechaDesde && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: c.muted, fontSize: 15, fontWeight: 600, pointerEvents: "none", zIndex: 2 }}>Del</span>}
                    <input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaDesde ? c.text : "transparent", position: "relative", zIndex: 1 }} />
                  </div>
                  <div style={{ flex: 1, position: "relative" }}>
                    {!vtFechaHasta && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: c.muted, fontSize: 15, fontWeight: 600, pointerEvents: "none", zIndex: 2 }}>Al</span>}
                    <input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaHasta ? c.text : "transparent", position: "relative", zIndex: 1 }} />
                  </div>
                </div>
                {(vtFechaDesde || vtFechaHasta) && (<button style={{ width: "100%", fontSize: 14, fontWeight: 600, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4, fontFamily: "inherit" }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>)}
              </div>
            )}
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12 }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.map(g => {
              const isAporte = g.tipo === "aporte"; const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
              const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";
              let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"; let montoColor = c.text; let iconColor = c.muted;
              if (isAporte) { iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"; montoColor = c.green; iconColor = c.green; }
              else if (g.tipo === "gasto") { iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"; montoColor = c.red; iconColor = c.red; }
              else if (g.tipo === "ingreso") { iconBg = isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6"; iconColor = isDark ? "#D1D5DB" : "#4B5563"; montoColor = c.text; }
              const isCurrentSwiped = swipedId === g.id;
              return (
                <div key={g.id} style={{ position: "relative", marginBottom: 10, borderRadius: 16, overflow: "hidden", height: 72 }}>
                  <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div onClick={() => abrirEdicion(g)} style={{ flex: 1, height: "100%", background: "#10B981", color: "#FFF", display: "flex", alignItems: "center", paddingLeft: 24, cursor: "pointer" }}><Edit2 size={24} /></div>
                      <div onClick={() => eliminar(g)} style={{ flex: 1, height: "100%", background: c.red, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, cursor: "pointer" }}><Trash2 size={24} /></div>
                  </div>
                  <div onTouchStart={(e) => handleSwipeStart(g.id, e)} onTouchMove={(e) => handleSwipeMove(g.id, e)} onTouchEnd={handleSwipeEnd} style={{ position: "absolute", inset: 0, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transform: isCurrentSwiped ? `translateX(${currentSwipeX}px)` : "translateX(0)", transition: isSwiping && isCurrentSwiped ? "none" : "transform 0.3s ease", zIndex: 2, touchAction: "pan-y" }} >
                    <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isAporte ? <PiggyBank size={24} /> : getIcono(cat ? cat.label : (g.descripcion || "?"))}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text, textDecoration: (!cat && !isAporte) ? "line-through" : "none" }}>{isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}{cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>{descAdicional}</span>}</div>
                        <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 16, fontWeight: 600, color: montoColor }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", background: tab === "hoy" ? c.bg : c.card, borderBottom: tab === "hoy" ? "none" : `1px solid ${c.border}`, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: tab === "hoy" ? "space-between" : "center", alignItems: "center" }}>
              {tab === "hoy" ? (
                <><div style={{ display: "flex", alignItems: "center", gap: 16 }}><button onClick={() => setShowMenu(true)} style={{ background: "none", border: "none", color: c.text, cursor: "pointer", padding: 0 }}><Menu size={28} /></button><h1 style={{ fontSize: 20, fontWeight: 600, color: c.text, margin: 0, lineHeight: 1.1 }}><span style={{ fontWeight: 500 }}>¡Hola</span><span style={{ fontWeight: 600 }}>, {userName}! 👋</span></h1></div>
                  <div style={{ position: "relative" }}><button onClick={() => setShowNovedades(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 0, color: c.green }}><Bell size={24} /></button><div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: c.red, borderRadius: "50%", border: `2px solid ${c.bg}` }}></div></div></>
              ) : (<h1 style={{ fontSize: 18, fontWeight: 700, color: c.text, margin: 0, lineHeight: 1.1 }}>{tab === "metas" ? "Mis Metas" : tab === "resumen" ? "Reportes" : "Presupuesto"}</h1>)}
            </div>
          </div>
          {error && <div style={{ ...s.errorCard, marginTop: 80, position: "relative", zIndex: 20 }}><AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: 8 }} /> {error}</div>}
          {tab === "hoy" && (
            <>
              <div style={{ position: "fixed", top: "calc(52px + env(safe-area-inset-top, 0px))", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, height: 60, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", zIndex: 10, color: "#10B981", opacity: (isRefreshing || pullDistance > 0) ? 1 : 0, visibility: (isRefreshing || pullDistance > 0) ? "visible" : "hidden", pointerEvents: "none" }}>
                <Loader2 size={24} style={{ animation: isRefreshing ? "spin 1s linear infinite" : "none", transform: isRefreshing ? "none" : `rotate(${pullDistance * 5}deg)` }} />
                <span style={{ fontSize: 12, fontWeight: 600, marginTop: 4, opacity: Math.min(pullDistance / 50, 1), color: c.muted }}>Actualizando...</span>
              </div>
              <TabInicio c={c} s={s} isDark={isDark} listaMetas={listaMetas} setAporteMetaId={setAporteMetaId} setShowAporteModal={setShowAporteModal} setIsEditingMetaObj={setIsEditingMetaObj} setMetaForm={setMetaForm} setShowCrearMeta={setShowCrearMeta} setViewAll={setViewAll} movimientosHoy={movimientosHoy} totalIngresosHoy={totalIngresosHoy} totalGastadoHoy={totalGastadoHoy} presupuestoDiario={presupuestoDiario} categorias={categorias} setMetaSeleccionada={setMetaSeleccionada} isRefreshing={isRefreshing} pullDistance={pullDistance} handleTouchStart={handleTouchStartGlobal} handleTouchMove={handleTouchMoveGlobal} handleTouchEnd={handleTouchEndGlobal} />
            </>
          )}
          {tab === "resumen" && <TabReportes c={c} s={s} isDark={isDark} gastos={gastos} categoriasBase={categoriasBase} categoriasExtra={categoriasExtra} categorias={categorias} listaMetas={listaMetas} />}
          {tab === "presupuesto" && <TabPresupuesto c={c} s={s} isDark={isDark} presupuestosMensuales={presupuestosMensuales} setPresupForm={setPresupForm} setShowCrearPresupuesto={setShowCrearPresupuesto} gastos={gastos} categorias={categorias} setCatPresupSelec={setCatPresupSelec} setShowHistorial={setShowHistorial} setShowPresupAnual={setShowPresupAnual} />}
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
      {showAddModal && <ModalRegistrarMovimiento s={s} c={c} form={form} setForm={setForm} safeBase={safeBase} safeExtra={safeExtra} agregarMovimiento={agregarMovimiento} setShowAddModal={setShowAddModal} saving={saving} />}
      {editando && <ModalEditarMovimiento s={s} c={c} editForm={editForm} setEditForm={setEditForm} safeBase={safeBase} safeExtra={safeExtra} guardarEdicion={guardarEdicion} setEditando={setEditando} saving={saving} />}
      {showCrearMeta && <ModalCrearMeta c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearMeta={setShowCrearMeta} setIsEditingMetaObj={setIsEditingMetaObj} isEditingMetaObj={isEditingMetaObj} metaForm={metaForm} setMetaForm={setMetaForm} procesarNuevaMeta={procesarNuevaMeta} />}
      {showCrearPresupuesto && <ModalCrearPresupuesto c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearPresupuesto={setShowCrearPresupuesto} presupForm={presupForm} setPresupForm={setPresupForm} safeExtra={safeExtra} setProfileScreen={setProfileScreen} setShowMenu={setShowMenu} guardarPresupuesto={guardarPresupuesto} saving={saving} />}
      {catPresupSelec && <ModalDetalleCategoria c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} catId={catPresupSelec} categorias={categorias} gastos={gastos} presupuestoActual={presupuestosMensuales[hoy().slice(0, 7)]} />}
      {showHistorial && <ModalHistorialPresupuestos c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} presupuestosMensuales={presupuestosMensuales} setShowHistorial={setShowHistorial} setResumenMes={setResumenMes} />}
      {resumenMes && <ModalResumenMensual c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} mes={resumenMes} presupuestosMensuales={presupuestosMensuales} gastos={gastos} categorias={categorias} setResumenMes={setResumenMes} />}
      {showPresupAnual && <ModalPresupuestoAnual c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} presupuestosMensuales={presupuestosMensuales} gastos={gastos} setShowPresupAnual={setShowPresupAnual} />}
      {showNovedades && <Novedades c={c} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowNovedades={setShowNovedades} />}
      {(showMenu || showApariencia) && <MenuPrincipal c={c} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowMenu={setShowMenu} setProfileScreen={setProfileScreen} setShowApariencia={setShowApariencia} cerrarSesion={cerrarSesion} />}
      {showMenu && profileScreen === "exportar" && <ExportarReportes c={c} s={s} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} exportFechaDesde={exportFechaDesde} setExportFechaDesde={setExportFechaDesde} exportFechaHasta={exportFechaHasta} setExportFechaHasta={setExportFechaHasta} exportEmail={exportEmail} setExportEmail={setExportEmail} gastos={gastos} categorias={categorias} showToast={showToast} />}
      {showMenu && profileScreen === "categorias" && <ConfigCategorias c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} safeBase={safeBase} safeExtra={safeExtra} abrirEditarCat={abrirEditarCat} eliminarCat={eliminarCat} abrirCrearCat={abrirCrearCat} />}
      {showMenu && profileScreen === "logros" && <MisLogros c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} listaMetas={listaMetas} gastos={gastos} userName={userName} />}
      {showMenu && profileScreen === "ayuda" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'ayuda' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, marginTop: 16 }}><button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Centro de ayuda</h2></div>
          <div style={{ display: "flex", alignItems: "center", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 32, boxShadow: c.shadow }}><Search size={20} color={c.muted} style={{ marginRight: 12 }} /><input type="text" placeholder="Buscar ayuda..." style={{ border: "none", background: "transparent", outline: "none", color: c.text, fontSize: 15, width: "100%", fontFamily: "inherit" }} /></div>
          <div style={{ fontSize: 13, color: c.muted, fontWeight: 700, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>Categorías</div>
          <div style={{ background: c.card, borderRadius: 16, border: `1px solid ${c.border}`, overflow: "hidden", marginBottom: 32, boxShadow: c.shadow }}>{["primeros_pasos", "metas", "movimientos", "presupuesto", "reportes", "cuenta"].map((catId) => (<div key={catId} style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: `1px solid ${c.border}`, cursor: "pointer" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, marginRight: 16 }}>{catId === 'metas' ? <Target size={24} color="#FF803C" /> : <Book size={24} color="#FF803C" />}</div><div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{catId.replace('_', ' ')}</div><div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Descripción de ayuda</div></div><ChevronRight size={20} color={c.muted} /></div>))}</div>
          <button style={{ width: "100%", padding: "16px", background: "transparent", border: `1.5px solid ${c.border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: "#FF803C", fontSize: 16, fontWeight: 700, fontFamily: "inherit" }}><Headphones size={20} /> Contactar soporte</button>
        </div>
      )}
      {showAporteModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAporteModal(false); }}>
          <div style={{ ...s.modal, animation: "slideUp 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Aportar a la meta</h3><button onClick={() => setShowAporteModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button></div>
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12, color: c.muted }}>¿Cuánto deseas aportar?</div>
            <input autoFocus style={{ ...s.input, marginBottom: 24, fontSize: 36, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto", color: c.green }} type="number" placeholder="0.00" value={aporteMonto} onChange={e => setAporteMonto(e.target.value)} onKeyDown={e => e.key === "Enter" && procesarAporte()} />
            <button style={{ ...s.btnPrimary, padding: "16px", background: c.green, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }} onClick={procesarAporte} disabled={saving}>{saving ? "Procesando..." : "Confirmar Aporte"}</button>
          </div>
        </div>
      )}
      {showApariencia && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'apariencia' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('apariencia', () => { setShowApariencia(false); setShowMenu(true); })} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: "700" }}>Pantalla y brillo</h2></div>
          <div style={{ fontSize: 14, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: 700 }}>Aspecto</div>
          <div style={{ background: c.card, borderRadius: 16, padding: "20px 20px 0", marginBottom: 24, border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: 24 }}>
              <div onClick={async () => { setTheme("light"); localStorage.setItem("themePref", "light"); showToast("Tema Claro guardado ✓"); await supabase.from("config").upsert([{ user_id: usuario.id, key: `themePref`, value: "light" }], { onConflict: "user_id, key" }); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}><div style={{ width: 66, height: 130, borderRadius: 12, background: "#FFF", border: theme === "light" ? "3px solid #34C759" : "1px solid #CCC", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#E5E5E5", borderRadius: 4 }} /><div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#E5E5E5", borderRadius: 4 }} /></div><span style={{ fontSize: 16, fontWeight: 600 }}>Claro</span><div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "light" ? "none" : `1px solid ${c.muted}`, background: theme === "light" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{theme === "light" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}</div></div>
              <div onClick={async () => { setTheme("dark"); localStorage.setItem("themePref", "dark"); showToast("Tema Oscuro guardado ✓"); await supabase.from("config").upsert([{ user_id: usuario.id, key: `themePref`, value: "dark" }], { onConflict: "user_id, key" }); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}><div style={{ width: 66, height: 130, borderRadius: 12, background: "#111", border: theme === "dark" ? "3px solid #34C759" : "1px solid #444", position: "relative", overflow: "hidden" }}><div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#333", borderRadius: 4 }} /><div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#333", borderRadius: 4 }} /></div><span style={{ fontSize: 16, fontWeight: 600 }}>Oscuro</span><div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "dark" ? "none" : `1px solid ${c.muted}`, background: theme === "dark" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{theme === "dark" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}</div></div>
            </div>
          </div>
        </div>
      )}
      {showMenu && profileScreen === "datos" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'datos' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => cerrarPantalla('datos', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis datos</h2></div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}><div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FF803C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#FFF" }}>{userInitials}</div></div>
          <div style={{ marginBottom: 20 }}><div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Nombre completo</div><input style={s.input} value={userName} onChange={e => setUserName(e.target.value)} placeholder="Ej. Paul Flores" /></div>
          <button style={s.btnPrimary} onClick={guardarPerfil} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      )}
    </div>
  );
}