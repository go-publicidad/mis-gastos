import { useState, useEffect } from "react";
import {
  Home, PieChart, Calendar, X, Bell, Target, Wallet, Menu, Loader2, Edit2, Trash2, AlertTriangle, Plus, ChevronRight, CheckCircle2, MoreVertical, ArrowLeft,
  Search, Lightbulb, ArrowLeftRight, FileText, Shield, Headphones, PiggyBank, Book
} from "lucide-react";

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

// AÑADE ESTA LÍNEA AQUÍ 👇
import PantallaMovimientos from "./components/PantallaMovimientos";
import PantallaApariencia from "./components/PantallaApariencia";
import PantallaDatos from "./components/PantallaDatos";
import PantallaClave from "./components/PantallaClave";
import PantallaAyuda from "./components/PantallaAyuda";
import PantallaDetalleMeta from "./components/PantallaDetalleMeta";
import { getThemeStyles } from "./theme";
import useMisGastos from "./hooks/useMisGastos";

import { COLORES_CUSTOM, PASTEL_COLORS, CAT_ICONS } from "./constants";
import { hoy, formatMoney, getIcono, getTexto, formatFecha, getUIFechaHora, diffDias } from "./utils";

const SAFE_COLORES = (COLORES_CUSTOM && COLORES_CUSTOM.length > 0) ? COLORES_CUSTOM : ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const SAFE_CAT_ICONS = (CAT_ICONS && CAT_ICONS.length > 0) ? CAT_ICONS : ['📌', '🛒', '🚗', '🏠', '🎮', '🏥', '🎓', '✈️'];
const SAFE_PASTEL = (PASTEL_COLORS && PASTEL_COLORS.length > 0) ? PASTEL_COLORS : ['#F3E8FF', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3'];

export default function App() {

  const {
    usuario, verificandoSesion, loaded, saving, error,
    gastos, categoriasBase, categoriasExtra, listaMetas, presupuestosMensuales, userName, theme, useBold,
    setCategoriasBase, setCategoriasExtra, setListaMetas, setPresupuestosMensuales, setUserName, setTheme,
    loadData, cerrarSesion, guardarConfig, agregarGastoBD, actualizarGastoBD, eliminarGastoBD
  } = useMisGastos();

  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: categoriasExtra[0]?.id || "", tipo: "gasto" });
  const [toast, setToast] = useState(null);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [catForm, setCatForm] = useState({ visible: false, id: null, tipo: 'ingreso', nombre: '', icono: '📌', color: SAFE_COLORES[0] });

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

  const [showCrearPresupuesto, setShowCrearPresupuesto] = useState(false);
  const [presupForm, setPresupForm] = useState({ periodo: hoy().slice(0, 7), categorias: {} });
  const [catPresupSelec, setCatPresupSelec] = useState(null);
  const [showHistorial, setShowHistorial] = useState(false);
  const [resumenMes, setResumenMes] = useState(null);
  const [showPresupAnual, setShowPresupAnual] = useState(false);

  const [isClosing, setIsClosing] = useState("");

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

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];

  const isDark = theme === "dark";
  const { c, s } = getThemeStyles(isDark); // Esto reemplaza las 35 líneas que borraste

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

  useEffect(() => {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) { viewportMeta = document.createElement("meta"); viewportMeta.name = "viewport"; document.head.appendChild(viewportMeta); }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");
  }, []);

  useEffect(() => { window.scrollTo(0, 0); }, [tab]);

  const abrirCrearCat = (tipo) => setCatForm({ visible: true, id: null, tipo, nombre: "", icono: "📌", color: SAFE_COLORES[0] });

  const abrirEditarCat = (cat, tipo) => {
    let iconoExtraido = getIcono(cat.label);
    if (typeof iconoExtraido !== 'string') iconoExtraido = '📌';
    setCatForm({ visible: true, id: cat.id, tipo, nombre: getTexto(cat.label), icono: iconoExtraido, color: cat.color || SAFE_COLORES[0] });
  };

  const guardarCatForm = async () => {
    const nombre = catForm.nombre.trim();
    if (!nombre) return showToast("Escribe un nombre", c.red);
    const labelFinal = `${catForm.icono} ${nombre}`;
    const esIngreso = catForm.tipo === 'ingreso';
    const arrayActual = esIngreso ? safeBase : safeExtra;
    let nuevoArray = catForm.id ? arrayActual.map(c => c.id === catForm.id ? { ...c, label: labelFinal, color: catForm.color } : c) : [...arrayActual, { id: (esIngreso ? "base_" : "custom_") + Date.now(), label: labelFinal, color: catForm.color }];

    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    const { error } = await guardarConfig(esIngreso ? `categoriasBase` : `categoriasCustom`, nuevoArray);
    if (error) return showToast("Error al guardar", c.red);

    showToast(catForm.id ? "Categoría actualizada ✓" : "Categoría creada ✓", c.green);
    setCatForm({ ...catForm, visible: false });
  };

  const eliminarCat = async (id, tipo) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const esIngreso = tipo === 'ingreso'; const arrayActual = esIngreso ? safeBase : safeExtra;
    const nuevoArray = arrayActual.filter(c => c.id !== id);
    if (esIngreso) setCategoriasBase(nuevoArray); else setCategoriasExtra(nuevoArray);

    const { error } = await guardarConfig(esIngreso ? `categoriasBase` : `categoriasCustom`, nuevoArray);
    if (error) return showToast("Error al eliminar", c.red);

    showToast("Categoría eliminada", c.muted);
  };

  const guardarPerfil = async () => {
    const { error } = await guardarConfig("userName", userName);
    if (error) return showToast("Error al guardar", c.red);

    showToast("Datos actualizados ✓", c.green);
    cerrarPantalla('datos', () => setProfileScreen(null));
  };

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) return showToast("Ingresa un monto válido", c.red);
    const catObj = categorias.find(cat => cat.id === form.categoria);
    const defaultDesc = catObj ? getTexto(catObj.label) : "Movimiento";

    const nuevo = { monto, descripcion: form.descripcion || defaultDesc, categoria: form.categoria, tipo: form.tipo };

    const { error: err } = await agregarGastoBD(nuevo);
    if (err) return showToast("Error al guardar", c.red);

    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast(`Registrado ✓`);
    setShowAddModal(false);
  };

  const eliminar = async (g) => {
    if (!window.confirm("¿Seguro que deseas eliminar este movimiento?")) { setSwipedId(null); setCurrentSwipeX(0); return; }
    const { error: err } = await eliminarGastoBD(g.id);
    if (err) return showToast("Error", c.red);

    if (g.tipo === "aporte") {
      const metaEncontrada = g.meta_id
        ? listaMetas.find(m => m.id === g.meta_id)
        : listaMetas.find(m => m.nombre === g.descripcion.replace("Aporte a ", "").replace("Aporte inicial a ", "").trim());

      if (metaEncontrada) {
        const nuevasMetas = listaMetas.map(m => m.id === metaEncontrada.id ? { ...m, aporteInicial: Math.max(0, m.aporteInicial - g.monto) } : m);
        setListaMetas(nuevasMetas);
        guardarConfig("listaMetas", nuevasMetas);
      }
    }

    showToast("Eliminado", c.muted);
    setSwipedId(null);
    setCurrentSwipeX(0);
  };

  const abrirEdicion = (g) => {
    setEditando(g);
    setEditForm({ monto: g.monto, descripcion: g.descripcion, categoria: g.categoria, tipo: g.tipo });
    setSwipedId(null); setCurrentSwipeX(0);
  };

  const guardarEdicion = async () => {
    const montoNuevo = parseFloat(editForm.monto);
    if (!montoNuevo || montoNuevo <= 0) return showToast("Monto inválido", c.red);

    const updates = { monto: montoNuevo, descripcion: editForm.descripcion, categoria: editForm.categoria, tipo: editForm.tipo };
    const { error: err } = await actualizarGastoBD(editando.id, updates);
    if (err) return showToast("Error", c.red);

    if (editando.tipo === "aporte") {
      const metaEncontrada = editando.meta_id
        ? listaMetas.find(m => m.id === editando.meta_id)
        : listaMetas.find(m => m.nombre === editando.descripcion.replace("Aporte a ", "").replace("Aporte inicial a ", "").trim());

      if (metaEncontrada) {
        const diff = montoNuevo - editando.monto;
        const nuevasMetas = listaMetas.map(m => m.id === metaEncontrada.id ? { ...m, aporteInicial: Math.max(0, m.aporteInicial + diff) } : m);
        setListaMetas(nuevasMetas);
        guardarConfig("listaMetas", nuevasMetas);
      }
    }
    setEditando(null); showToast("Actualizado ✓");
  };

  const guardarPresupuesto = async () => {
    // 1. Filtramos para guardar SOLO las categorías que aún existen en la app
    const categoriasLimpias = {};
    let totalAsignado = 0;

    Object.entries(presupForm.categorias).forEach(([catId, monto]) => {
      const categoriaExiste = categorias.find(c => c.id === catId);
      const valor = parseFloat(monto) || 0;

      // Si la categoría existe actualmente y tiene dinero asignado, la guardamos
      if (categoriaExiste && valor > 0) {
        categoriasLimpias[catId] = valor;
        totalAsignado += valor;
      }
    });

    if (totalAsignado <= 0) return showToast("Asigna un monto a al menos una categoría", c.red);

    // 2. Guardamos el objeto limpio sin las categorías "fantasmas"
    const nuevosPresupuestos = {
      ...presupuestosMensuales,
      [presupForm.periodo]: { total: totalAsignado, categorias: categoriasLimpias }
    };

    setPresupuestosMensuales(nuevosPresupuestos);

    const { error } = await guardarConfig("presupuestosMensuales", nuevosPresupuestos);
    if (error) return showToast("Error al guardar", c.red);

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
        const nuevoAporte = {
          monto: aporteInicialVal,
          descripcion: `Aporte inicial a ${nuevaMeta.nombre}`,
          categoria: "meta_aporte",
          tipo: "aporte",
          meta_id: nuevaMeta.id
        };
        await agregarGastoBD(nuevoAporte);
      }
      showToast("Meta guardada con éxito ✓", c.green);
    }
    setListaMetas(nuevasMetas);

    const { error } = await guardarConfig("listaMetas", nuevasMetas);
    if (error) return showToast("Error al guardar", c.red);

    cerrarPantalla('crearMeta', () => { setShowCrearMeta(false); setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); });
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta meta? Todo el progreso se perderá.")) return;
    const nuevasMetas = listaMetas.filter(m => m.id !== id); setListaMetas(nuevasMetas);

    const { error } = await guardarConfig("listaMetas", nuevasMetas);
    if (error) return showToast("Error al eliminar", c.red);

    showToast("Meta eliminada con éxito", c.muted); setShowMetaMenu(false); cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null));
  };

  const procesarAporte = async () => {
    const monto = parseFloat(aporteMonto); if (!monto || monto <= 0) return showToast("Ingresa un monto válido", c.red);
    const metaDestino = listaMetas.find(m => m.id === aporteMetaId);
    const nuevo = {
      monto,
      descripcion: `Aporte a ${metaDestino.nombre}`,
      categoria: "meta_aporte",
      tipo: "aporte",
      meta_id: aporteMetaId
    };
    const { error: err } = await agregarGastoBD(nuevo);
    if (err) return showToast("Error al guardar", c.red);

    const nuevasMetas = listaMetas.map(m => m.id === aporteMetaId ? { ...m, aporteInicial: m.aporteInicial + monto } : m);
    setListaMetas(nuevasMetas);

    const { error } = await guardarConfig("listaMetas", nuevasMetas);
    if (error) return showToast("Error al guardar", c.red);

    showToast(`¡S/ ${monto} aportados a tu meta! 🎉`, c.green);
    setShowAporteModal(false); setAporteMonto(""); setAporteMetaId(null);
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
        <PantallaMovimientos
          c={c} s={s} isDark={isDark} gastos={gastos} categorias={categorias}
          vtFechaDesde={vtFechaDesde} setVtFechaDesde={setVtFechaDesde}
          vtFechaHasta={vtFechaHasta} setVtFechaHasta={setVtFechaHasta}
          showVtFiltro={showVtFiltro} setShowVtFiltro={setShowVtFiltro}
          setViewAll={setViewAll} swipedId={swipedId} currentSwipeX={currentSwipeX}
          isSwiping={isSwiping} handleSwipeStart={handleSwipeStart}
          handleSwipeMove={handleSwipeMove} handleSwipeEnd={handleSwipeEnd}
          abrirEdicion={abrirEdicion} eliminar={eliminar}
        />
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

      {/* MODALES FLOTANTES */}
      {showAddModal && <ModalRegistrarMovimiento s={s} c={c} form={form} setForm={setForm} safeBase={safeBase} safeExtra={safeExtra} agregarMovimiento={agregarMovimiento} setShowAddModal={setShowAddModal} saving={saving} />}
      {editando && <ModalEditarMovimiento s={s} c={c} editForm={editForm} setEditForm={setEditForm} safeBase={safeBase} safeExtra={safeExtra} guardarEdicion={guardarEdicion} setEditando={setEditando} saving={saving} />}
      {showCrearMeta && <ModalCrearMeta c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearMeta={setShowCrearMeta} setIsEditingMetaObj={setIsEditingMetaObj} isEditingMetaObj={isEditingMetaObj} metaForm={metaForm} setMetaForm={setMetaForm} procesarNuevaMeta={procesarNuevaMeta} />}
      {showCrearPresupuesto && <ModalCrearPresupuesto c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowCrearPresupuesto={setShowCrearPresupuesto} presupForm={presupForm} setPresupForm={setPresupForm} safeExtra={safeExtra} setProfileScreen={setProfileScreen} setShowMenu={setShowMenu} guardarPresupuesto={guardarPresupuesto} saving={saving} />}

      {catPresupSelec && <ModalDetalleCategoria c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} catId={catPresupSelec} categorias={categorias} gastos={gastos} presupuestoActual={presupuestosMensuales[hoy().slice(0, 7)]} />}
      {showHistorial && <ModalHistorialPresupuestos c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} presupuestosMensuales={presupuestosMensuales} setShowHistorial={setShowHistorial} setResumenMes={setResumenMes} />}
      {resumenMes && <ModalResumenMensual c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} mes={resumenMes} presupuestosMensuales={presupuestosMensuales} gastos={gastos} categorias={categorias} setResumenMes={setResumenMes} />}
      {showPresupAnual && <ModalPresupuestoAnual c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} presupuestosMensuales={presupuestosMensuales} gastos={gastos} setShowPresupAnual={setShowPresupAnual} />}
      {showNovedades && <Novedades c={c} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowNovedades={setShowNovedades} />}

      {/* MENÚ PRINCIPAL */}
      {showMenu && <MenuPrincipal c={c} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setShowMenu={setShowMenu} setProfileScreen={setProfileScreen} setShowApariencia={setShowApariencia} cerrarSesion={cerrarSesion} />}

      {/* PANTALLAS SECUNDARIAS */}
      {profileScreen === "exportar" && <ExportarReportes c={c} s={s} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} exportFechaDesde={exportFechaDesde} setExportFechaDesde={setExportFechaDesde} exportFechaHasta={exportFechaHasta} setExportFechaHasta={setExportFechaHasta} exportEmail={exportEmail} setExportEmail={setExportEmail} gastos={gastos} categorias={categorias} showToast={showToast} />}
      {profileScreen === "categorias" && <ConfigCategorias c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} safeBase={safeBase} safeExtra={safeExtra} abrirEditarCat={abrirEditarCat} eliminarCat={eliminarCat} abrirCrearCat={abrirCrearCat} />}
      {profileScreen === "logros" && <MisLogros c={c} s={s} isDark={isDark} isClosing={isClosing} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} listaMetas={listaMetas} gastos={gastos} userName={userName} />}



      {/* FORMULARIO DE CATEGORÍAS */}
      {catForm.visible && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10001, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}><button onClick={() => setCatForm({ ...catForm, visible: false })} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button><h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{catForm.id ? "Editar categoría" : "Crear categoría"}</h2></div>
          <div style={{ marginBottom: 24 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Nombre de la categoría ►</div><input style={s.input} placeholder={catForm.tipo === 'ingreso' ? "Ej: Sueldo, Venta..." : "Ej: Comida, Transporte..."} value={catForm.nombre} onChange={e => setCatForm({ ...catForm, nombre: e.target.value })} /></div>
          <div style={{ marginBottom: 24 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Seleccionar icono ►</div><div className="hide-scroll" style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>{SAFE_CAT_ICONS.map(ico => (<div key={ico} onClick={() => setCatForm({ ...catForm, icono: ico })} style={{ width: 56, height: 56, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: catForm.icono === ico ? `2px solid #10B981` : "2px solid transparent", cursor: "pointer", transition: "0.2s" }}>{ico}</div>))}</div></div>
          <div style={{ marginBottom: 40 }}><div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Color de la categoría</div><div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>{SAFE_COLORES.map(col => (<div key={col} onClick={() => setCatForm({ ...catForm, color: col })} style={{ width: 38, height: 38, borderRadius: "50%", background: col, cursor: "pointer", border: catForm.color === col ? `3px solid ${c.text}` : "3px solid transparent", transition: "0.2s" }} />))}</div></div>
          <button onClick={guardarCatForm} disabled={saving} style={{ ...s.btnPrimary, background: "#059669", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", padding: 16, fontSize: 16 }}>{saving ? "Guardando..." : (catForm.id ? "Guardar cambios" : "Crear categoría")}</button>
        </div>
      )}

      {/* PANTALLAS DE AJUSTES REFACTORIZADAS */}
      {(showApariencia || profileScreen === "apariencia") && (
        <PantallaApariencia c={c} s={s} theme={theme} setTheme={setTheme} guardarConfig={guardarConfig} showToast={showToast} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} setShowApariencia={setShowApariencia} setShowMenu={setShowMenu} isClosing={isClosing} />
      )}

      {profileScreen === "datos" && (
        <PantallaDatos c={c} s={s} userName={userName} setUserName={setUserName} usuario={usuario} guardarPerfil={guardarPerfil} saving={saving} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} userInitials={userInitials} isClosing={isClosing} />
      )}

      {profileScreen === "clave" && (
        <PantallaClave c={c} s={s} showToast={showToast} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} isClosing={isClosing} />
      )}

      {profileScreen === "ayuda" && (
        <PantallaAyuda c={c} s={s} cerrarPantalla={cerrarPantalla} setProfileScreen={setProfileScreen} isClosing={isClosing} />
      )}

      {showAporteModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAporteModal(false); }}>
          <div style={{ ...s.modal, animation: "slideUp 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}><h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Aportar a la meta</h3><button onClick={() => setShowAporteModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button></div>
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12, color: c.muted }}>¿Cuánto deseas aportar?</div>
            <input autoFocus style={{ ...s.input, marginBottom: 24, fontSize: 36, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto", color: c.green }} type="number" placeholder="0.00" value={aporteMonto} onChange={e => setAporteMonto(e.target.value)} onKeyDown={e => e.key === "Enter" && procesarAporte()} />
            <button style={{ ...s.btnPrimary, padding: "16px", background: c.green, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }} onClick={procesarAporte} disabled={saving}>{saving ? "Aportando..." : "Confirmar Aporte"}</button>
          </div>
        </div>
      )}

      {/* DETALLE DE META */}
      <PantallaDetalleMeta
        c={c} s={s} isDark={isDark} isClosing={isClosing} metaSeleccionada={metaSeleccionada}
        cerrarPantalla={cerrarPantalla} setMetaSeleccionada={setMetaSeleccionada}
        showMetaMenu={showMetaMenu} setShowMetaMenu={setShowMetaMenu} eliminarMeta={eliminarMeta}
        setIsEditingMetaObj={setIsEditingMetaObj} setMetaForm={setMetaForm}
        setShowCrearMeta={setShowCrearMeta} SAFE_PASTEL={SAFE_PASTEL}
      />
    </div>
  );
}