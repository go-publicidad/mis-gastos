import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jboazxmcmvvcscqeerbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2F6eG1jbXZ2Y3NjcWVlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMxMjksImV4cCI6MjA5MjcyOTEyOX0.zFKEHscM7-PaXqoSgbk7ra8JFZ3Hh69JJKktm7N4IwY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CURRENCY = "S/";
const META_TOTAL = 100000;
const MESES = 5;
const DIAS_TOTAL = MESES * 30;

const CATEGORIAS_DEFAULT = [
  { id: "comida",          label: "🍽️ Comida",           color: "#E8845A" },
  { id: "transporte",      label: "🚌 Transporte",         color: "#5A9BE8" },
  { id: "trabajo",         label: "💼 Trabajo/Negocio",    color: "#7BE85A" },
  { id: "salud",           label: "❤️ Salud",             color: "#E85A8A" },
  { id: "hogar",           label: "🏠 Hogar",              color: "#C05AE8" },
  { id: "entretenimiento", label: "🎮 Entretenimiento",    color: "#E8D85A" },
  { id: "otros",           label: "📦 Otros",              color: "#8A9BA8" },
];

const COLORES_CUSTOM = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#C77DFF","#FF9F1C","#2EC4B6","#E71D36","#F72585","#B5E48C"];

const getLimaTime = () => new Date(Date.now() - 18000000);

const hoy = () => getLimaTime().toISOString().split("T")[0];

const getFechaLocal = (isoStr) => {
  if (!isoStr) return hoy();
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  return new Date(dt.getTime() - 18000000).toISOString().split("T")[0];
};

const formatMoney = (n) =>
  `${CURRENCY} ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const [y, m, d] = fechaStr.split("-");
  return `${d}/${m}/${y}`;
};

const formatDateTime = (isoStr) => {
  if (!isoStr) return { fecha: "", hora: "" };
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  const limaDate = new Date(dt.getTime() - 18000000);
  const iso = limaDate.toISOString(); 
  const fecha = iso.substring(0, 10).split('-').reverse().join('/');
  const hora = iso.substring(11, 19);
  return { fecha, hora };
};

const diasTranscurridos = (inicio) => {
  if (!inicio) return 1;
  const [y1, m1, d1] = inicio.split("-");
  const [y2, m2, d2] = hoy().split("-");
  const dif = Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86400000);
  return Math.max(1, dif + 1);
};

const exportarCSV = (gastos, categorias) => {
  const header = "Fecha,Hora,Tipo,Categoría,Descripción,Monto\n";
  const rows = gastos.map(g => {
    const { fecha, hora } = formatDateTime(g.created_at);
    const cat = categorias.find(c => c.id === g.categoria)?.label || g.categoria || "";
    const desc = (g.descripcion || "").replace(/,/g, ";");
    return `${fecha},${hora},${g.tipo},${cat},${desc},${g.monto}`;
  }).join("\n");
  const blob = new Blob(["\uFEFF" + header + rows], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = `ahorro-meta-${hoy()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const exportarPDF = (gastos, categorias) => {
  const filas = gastos.map(g => {
    const { fecha, hora } = formatDateTime(g.created_at);
    const cat  = categorias.find(c => c.id === g.categoria)?.label || g.categoria || "";
    const color = g.tipo === "gasto" ? "#c0392b" : "#27ae60";
    const signo = g.tipo === "gasto" ? "-" : "+";
    return `<tr>
      <td>${fecha}<br/><small style="color:#888">${hora}</small></td>
      <td>${cat}</td>
      <td>${g.descripcion || ""}</td>
      <td style="color:${color};font-weight:bold;text-align:right">${signo} S/ ${Number(g.monto).toFixed(2)}</td>
    </tr>`;
  }).join("");

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Historial Ahorro Meta</title>
    <style>
      body{font-family:Arial,sans-serif;padding:20px;font-size:13px}
      h2{color:#B8860B}
      table{width:100%;border-collapse:collapse;margin-top:12px}
      th{background:#1a1a1a;color:#fff;padding:8px 10px;text-align:left}
      td{padding:7px 10px;border-bottom:1px solid #eee}
      tr:nth-child(even){background:#f9f9f9}
      @media print{button{display:none}}
    </style></head><body>
    <h2>Ahorro Meta — Historial de movimientos</h2>
    <p>Exportado el ${formatFecha(hoy())} · Total registros: ${gastos.length}</p>
    <button onclick="window.print()" style="margin-bottom:12px;padding:8px 16px;background:#B8860B;color:#fff;border:none;border-radius:6px;cursor:pointer">🖨️ Imprimir / Guardar PDF</button>
    <table><thead><tr><th>Fecha / Hora</th><th>Categoría</th><th>Descripción</th><th>Monto</th></tr></thead>
    <tbody>${filas}</tbody></table>
    </body></html>`);
  win.document.close();
};

export default function App() {
  const [gastos,         setGastos]         = useState([]);
  const [categoriasExtra, setCategoriasExtra] = useState([]);  
  const [tab,            setTab]            = useState("hoy");
  const [form,           setForm]           = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  const [ingresoMensual, setIngresoMensual] = useState("");
  const [isEditingIngreso, setIsEditingIngreso] = useState(false);
  const [fechaInicio,    setFechaInicio]    = useState(hoy());
  const [loaded,         setLoaded]         = useState(false);
  const [saving,         setSaving]         = useState(false);
  const [toast,          setToast]          = useState(null);
  const [error,          setError]          = useState(null);

  const [editando,  setEditando]  = useState(null);   
  const [editForm,  setEditForm]  = useState({});

  const [showNuevaCat,  setShowNuevaCat]  = useState(false);
  const [nuevaCatLabel, setNuevaCatLabel] = useState("");
  const [nuevaCatColor, setNuevaCatColor] = useState(COLORES_CUSTOM[0]);

  const [editandoCat,  setEditandoCat]  = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  const [filtroHistCat,        setFiltroHistCat]        = useState("todas");
  const [filtroHistFechaDesde, setFiltroHistFechaDesde] = useState("");
  const [filtroHistFechaHasta, setFiltroHistFechaHasta] = useState("");

  const [filtroResumen,           setFiltroResumen]           = useState("todo");
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState(hoy());
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState(hoy());

  // NUEVOS ESTADOS: PANTALLA "VER TODOS" Y MODAL CORREO
  const [viewAll, setViewAll] = useState(false);
  const [showVtFiltro, setShowVtFiltro] = useState(false);
  const [vtFechaDesde, setVtFechaDesde] = useState("");
  const [vtFechaHasta, setVtFechaHasta] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");

  const categorias = [...CATEGORIAS_DEFAULT, ...categoriasExtra];

  const showToast = (msg, color = "#D4AF37") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    let viewportMeta = document.querySelector("meta[name=viewport]");
    if (!viewportMeta) {
      viewportMeta = document.createElement("meta");
      viewportMeta.name = "viewport";
      document.head.appendChild(viewportMeta);
    }
    viewportMeta.setAttribute("content", "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0");

    (async () => {
      try {
        const { data: movimientos, error: err1 } = await supabase.from("gastos").select("*").order("created_at", { ascending: false });
        if (err1) throw err1;
        
        const movimientosCorregidos = (movimientos || []).map(m => ({
          ...m,
          fecha: getFechaLocal(m.created_at)
        }));
        
        setGastos(movimientosCorregidos);

        const { data: cfg, error: err2 } = await supabase.from("config").select("*");
        if (err2) throw err2;
        if (cfg) {
          const ing  = cfg.find(c => c.key === "ingresoMensual");
          const fi   = cfg.find(c => c.key === "fechaInicio");
          const cats = cfg.find(c => c.key === "categoriasCustom");
          if (ing)  setIngresoMensual(ing.value);
          if (fi)   setFechaInicio(fi.value);
          if (cats) { try { setCategoriasExtra(JSON.parse(cats.value)); } catch(_) {} }
        }
        setError(null);
      } catch (e) {
        setError("No se pudo conectar. Verifica tu configuración de Supabase.");
      }
      setLoaded(true);
    })();
  }, []);

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) { showToast("Ingresa un monto válido", "#E85A5A"); return; }
    setSaving(true);
    const nuevo = {
      fecha:       hoy(),
      monto,
      descripcion: form.descripcion || categorias.find(c => c.id === form.categoria)?.label || "Movimiento",
      categoria:   form.categoria,
      tipo:        form.tipo,
    };
    const { data, error: err } = await supabase.from("gastos").insert([nuevo]).select();
    if (err) { showToast("Error al guardar", "#E85A5A"); setSaving(false); return; }
    
    const movGuardado = { ...data[0], fecha: getFechaLocal(data[0].created_at) };
    
    setGastos(prev => [movGuardado, ...prev]);
    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast(form.tipo === "gasto" ? "Gasto registrado ✓" : "Ingreso registrado ✓");
    setSaving(false);
  };

  const eliminar = async (id) => {
    const confirmacion = window.confirm("¿Seguro que deseas eliminar este movimiento?");
    if (!confirmacion) return;

    const { error: err } = await supabase.from("gastos").delete().eq("id", id);
    if (err) { showToast("Error al eliminar", "#E85A5A"); return; }
    setGastos(prev => prev.filter(g => g.id !== id));
    showToast("Eliminado", "#888");
  };

  const abrirEdicion = (g) => {
    setEditando(g);
    setEditForm({ monto: g.monto, descripcion: g.descripcion, categoria: g.categoria, tipo: g.tipo });
  };

  const guardarEdicion = async () => {
    const monto = parseFloat(editForm.monto);
    if (!monto || monto <= 0) { showToast("Monto inválido", "#E85A5A"); return; }
    setSaving(true);
    const updates = {
      monto,
      descripcion: editForm.descripcion || categorias.find(c => c.id === editForm.categoria)?.label || "Movimiento",
      categoria:   editForm.categoria,
      tipo:        editForm.tipo,
    };
    const { error: err } = await supabase.from("gastos").update(updates).eq("id", editando.id);
    if (err) { showToast("Error al editar", "#E85A5A"); setSaving(false); return; }
    setGastos(prev => prev.map(g => g.id === editando.id ? { ...g, ...updates } : g));
    setEditando(null);
    showToast("Movimiento actualizado ✓");
    setSaving(false);
  };

  const guardarConfig = async () => {
    setSaving(true);
    const upserts = [
      { key: "ingresoMensual",  value: ingresoMensual },
      { key: "fechaInicio",     value: fechaInicio },
      { key: "categoriasCustom", value: JSON.stringify(categoriasExtra) },
    ];
    const { error: err } = await supabase.from("config").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    if (err) { showToast("Error al guardar config", "#E85A5A"); return; }
    showToast("Configuración guardada ✓");
  };

  const agregarCategoria = async () => {
    const label = nuevaCatLabel.trim();
    if (!label) { showToast("Escribe un nombre", "#E85A5A"); return; }
    const id = "custom_" + Date.now();
    const nueva = { id, label, color: nuevaCatColor };
    const updated = [...categoriasExtra, nueva];
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    setNuevaCatLabel("");
    setShowNuevaCat(false);
    showToast(`Categoría "${label}" creada ✓`);
  };

  const eliminarCategoria = async (id) => {
    const updated = categoriasExtra.filter(c => c.id !== id);
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    showToast("Categoría eliminada", "#888");
  };

  const abrirEdicionCat = (cat) => {
    setEditandoCat(cat.id);
    setEditCatLabel(cat.label);
    setEditCatColor(cat.color);
  };

  const guardarEdicionCat = async () => {
    const label = editCatLabel.trim();
    if (!label) { showToast("Escribe un nombre", "#E85A5A"); return; }
    const updated = categoriasExtra.map(c => 
      c.id === editandoCat ? { ...c, label, color: editCatColor } : c
    );
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    setEditandoCat(null);
    showToast("Categoría actualizada ✓");
  };

  const fechaHoy     = hoy();
  const gastosHoy    = gastos.filter(g => g.fecha === fechaHoy && g.tipo === "gasto");
  const ingresosHoy  = gastos.filter(g => g.fecha === fechaHoy && g.tipo === "ingreso");
  const totalGastadoHoy = gastosHoy.reduce((a, g) => a + g.monto, 0);
  const totalIngresosHoy = ingresosHoy.reduce((a, g) => a + g.monto, 0);

  const totalGastado  = gastos.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ingMensual    = parseFloat(ingresoMensual) || 0;
  const diasTrans     = diasTranscurridos(fechaInicio);
  const diasRestantes = Math.max(0, DIAS_TOTAL - diasTrans);
  const ahorroAcumulado = totalIngresos - totalGastado;
  const progreso      = Math.max(0, Math.min(100, (ahorroAcumulado / META_TOTAL) * 100));
  const ingDiario     = ingMensual / 30;
  const ahorroMetaDiario   = META_TOTAL / DIAS_TOTAL;
  const presupuestoDiario  = ingDiario - ahorroMetaDiario;
  const gastoDiarioProm    = diasTrans > 0 ? totalGastado / diasTrans : 0;

  const ahorroDiarioProm = diasTrans > 0 ? ahorroAcumulado / diasTrans : 0;
  let proyeccionTexto = "—";
  if (ahorroDiarioProm > 0) {
    const diasNecesarios  = Math.ceil((META_TOTAL - ahorroAcumulado) / ahorroDiarioProm);
    const mesesProyeccion = Math.floor(diasNecesarios / 30);
    const diasExtra       = diasNecesarios % 30;
    if (ahorroAcumulado >= META_TOTAL) {
      proyeccionTexto = "¡Meta alcanzada! 🎉";
    } else if (mesesProyeccion === 0) {
      proyeccionTexto = `en ${diasExtra} día${diasExtra !== 1 ? "s" : ""}`;
    } else if (diasExtra === 0) {
      proyeccionTexto = `en ${mesesProyeccion} mes${mesesProyeccion !== 1 ? "es" : ""}`;
    } else {
      proyeccionTexto = `en ${mesesProyeccion} mes${mesesProyeccion !== 1 ? "es" : ""} y ${diasExtra} día${diasExtra !== 1 ? "s" : ""}`;
    }
  } else if (ahorroDiarioProm <= 0 && diasTrans > 1) {
    proyeccionTexto = "Sin ahorro neto aún";
  }

  const getFiltradosResumen = () => {
    const hoyStr = hoy();
    if (filtroResumen === "hoy") return gastos.filter(g => g.fecha === hoyStr);
    if (filtroResumen === "semana") {
      const hace7 = new Date(Date.now() - 18000000 - 6 * 86400000);
      const limite = hace7.toISOString().split("T")[0];
      return gastos.filter(g => g.fecha >= limite);
    }
    if (filtroResumen === "mes") {
      const mesActual = hoyStr.slice(0, 7);
      return gastos.filter(g => g.fecha.startsWith(mesActual));
    }
    if (filtroResumen === "rango") {
      const desde = filtroFechaResumenDesde;
      const hasta = filtroFechaResumenHasta;
      return gastos.filter(g => (!desde || g.fecha >= desde) && (!hasta || g.fecha <= hasta));
    }
    return gastos;
  };
  const gastosFiltradosResumen = getFiltradosResumen();
  const totalGastadoR  = gastosFiltradosResumen.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosR = gastosFiltradosResumen.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ahorroR        = totalIngresosR - totalGastadoR;

  const porCategoriaR = categorias.map(cat => ({
    ...cat,
    total: gastosFiltradosResumen.filter(g => g.tipo === "gasto" && g.categoria === cat.id).reduce((a, g) => a + g.monto, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCatR = porCategoriaR[0]?.total || 1;

  const gastosUltimos7 = Array.from({ length: 7 }, (_, i) => {
    const msLima = Date.now() - 18000000;
    const d = new Date(msLima - (6 - i) * 86400000);
    const fecha = d.toISOString().split("T")[0];
    const [y, m, day] = fecha.split("-");
    const tempDate = new Date(Date.UTC(y, m - 1, day, 12, 0, 0));
    const diasSemana = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
    const label = diasSemana[tempDate.getUTCDay()];
    const total = gastos.filter(g => g.fecha === fecha && g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
    return { label, total, fecha };
  });
  
  const maxBar = Math.max(...gastosUltimos7.map(d => d.total), 1);

  const gastosFiltradosHist = gastos.filter(g => {
    const matchCat   = filtroHistCat === "todas" || g.categoria === filtroHistCat;
    const matchDesde = !filtroHistFechaDesde || g.fecha >= filtroHistFechaDesde;
    const matchHasta = !filtroHistFechaHasta || g.fecha <= filtroHistFechaHasta;
    return matchCat && matchDesde && matchHasta;
  });

  // FILTRO PARA LA PANTALLA "VER TODOS"
  const gastosVerTodos = gastos.filter(g => {
    const matchDesde = !vtFechaDesde || g.fecha >= vtFechaDesde;
    const matchHasta = !vtFechaHasta || g.fecha <= vtFechaHasta;
    return matchDesde && matchHasta;
  });

  const s = {
    app: {
      background: "#0A0A0A", minHeight: "100vh", color: "#E8E0D0",
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
      maxWidth: 480, margin: "0 auto",
      paddingBottom: "calc(80px + env(safe-area-inset-bottom, 0px))",
      overscrollBehaviorY: "none",
      overflowX: "hidden",
      width: "100%"
    },
    header:     { padding: "24px 20px 0", borderBottom: "1px solid #1E1E1E" },
    title:      { fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 700, color: "#D4AF37", margin: 0 },
    refreshBtn: { background: "#1A1A1A", border: "1px solid #333", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 },
    subtitle:   { color: "#666", fontSize: 13, margin: "4px 0 0" },
    tabs:       { display: "flex", padding: "16px 20px 0", borderBottom: "1px solid #1A1A1A" },
    tab:    (a) => ({ padding: "8px 14px", background: "none", border: "none", borderBottom: a ? "2px solid #D4AF37" : "2px solid transparent", color: a ? "#D4AF37" : "#555", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, transition: "all 0.2s" }),
    section:    { padding: "20px", width: "100%", maxWidth: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card:       { width: "100%", background: "#111", border: "1px solid #1E1E1E", borderRadius: 12, padding: "16px", marginBottom: 12, overflow: "hidden", boxSizing: "border-box" },
    metaCard:   { width: "100%", background: "linear-gradient(135deg,#1A1500,#0F1000)", border: "1px solid #3A2E00", borderRadius: 16, padding: "20px", marginBottom: 16, boxSizing: "border-box" },
    label:      { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 },
    bigNum:     { fontFamily: "monospace", fontSize: 30, fontWeight: 700, color: "#D4AF37", lineHeight: 1 },
    smallNum:   { fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: "#E8E0D0" },
    redNum:     { fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#E85A5A" },
    greenNum:   { fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#5AE88A" },
    progressBg: { background: "#1A1A1A", borderRadius: 4, height: 8, margin: "12px 0 4px", overflow: "hidden" },
    progressFill: (p) => ({ height: "100%", width: `${p}%`, background: p >= 100 ? "#5AE88A" : p >= 50 ? "#D4AF37" : "#E85A5A", borderRadius: 4, transition: "width 0.6s ease" }),
    grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12, width: "100%" },
    input: { width: "100%", maxWidth: "100%", background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, color: "#E8E0D0", padding: "10px 12px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", WebkitAppearance: "none", minHeight: 44 },
    select: { width: "100%", background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, color: "#E8E0D0", padding: "10px 12px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer", WebkitAppearance: "none", minHeight: 44 },
    btnPrimary: { background: "#D4AF37", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "0.5px" },
    btnSecondary:{ background: "#1A1A1A", color: "#D4AF37", border: "1px solid #3A3A00", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", width: "100%" },
    tipoBtn: (a, c) => ({ flex: 1, padding: "8px", background: a ? c : "#111", border: `1px solid ${a ? c : "#2A2A2A"}`, color: a ? "#000" : "#666", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 400, transition: "all 0.2s" }),
    itemRow:    { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #161616" },
    catDot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", marginRight: 8, flexShrink: 0 }),
    deleteBtn:  { background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn:    { background: "none", border: "none", color: "#D4AF37", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    errorCard:  { background: "#1A0A0A", border: "1px solid #5A0A0A", borderRadius: 12, padding: "16px", margin: "20px", color: "#E85A5A", fontSize: 13 },
    filterRow:  { display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" },
    filterBtn: (a) => ({ padding: "5px 12px", borderRadius: 20, border: `1px solid ${a ? "#D4AF37" : "#2A2A2A"}`, background: a ? "#D4AF37" : "#111", color: a ? "#000" : "#666", fontSize: 12, cursor: "pointer", fontWeight: a ? 700 : 400 }),
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      background: "#0D0D0D", borderTop: "1px solid #1A1A1A",
      display: "flex", zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    },
    navBtn: (a) => ({
      flex: 1, paddingTop: 12, paddingBottom: 10,
      background: "none", border: "none",
      color: a ? "#D4AF37" : "#444",
      fontSize: 10, cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
    }),
    overlay: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "20px",
    },
    modal: {
      background: "#111", border: "1px solid #2A2A2A", borderRadius: 16,
      padding: "20px", width: "100%", maxWidth: 400, boxSizing: "border-box"
    },
  };

  if (!loaded) return (
    <div style={{ background: "#0A0A0A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "2px solid #1A1A1A", borderTop: "2px solid #D4AF37", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } } *{box-sizing:border-box} html,body{background:#0A0A0A!important;margin:0;padding:0;overscroll-behavior-y:none;width:100vw;max-width:100%;overflow-x:hidden} #root{background:#0A0A0A;min-height:100vh;width:100%;max-width:100%;overflow-x:hidden}`}</style>
      <span style={{ color: "#555", fontSize: 13 }}>Conectando...</span>
    </div>
  );

  return (
    <div style={s.app}>
      <style>{`*{box-sizing:border-box} html,body{background:#0A0A0A!important;margin:0;padding:0;overscroll-behavior-y:none;width:100vw;max-width:100%;overflow-x:hidden}#root{background:#0A0A0A;min-height:100vh;width:100%;max-width:100%;overflow-x:hidden}`}</style>

      {/* RENDERIZADO CONDICIONAL: PANTALLA PRINCIPAL vs PANTALLA "VER TODOS" */}
      {viewAll ? (
        <>
          {/* HEADER DE LA NUEVA PANTALLA */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1A1A1A", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0A0A0A", position: "sticky", top: 0, zIndex: 10 }}>
            <button style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => setViewAll(false)}>
              ←
            </button>
            <h2 style={{ margin: 0, fontSize: 18, color: "#E8E0D0", fontWeight: 600 }}>Movimientos</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowEmailModal(true)}>
                ✉️
              </button>
              <button style={{ background: "none", border: "none", color: "#D4AF37", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}>
                🎚️
              </button>
            </div>
          </div>

          {/* PANEL DE FILTRO DESPLEGABLE EN VER TODOS */}
          {showVtFiltro && (
            <div style={{ padding: "16px 20px", background: "#111", borderBottom: "1px solid #1E1E1E" }}>
              <div style={{ ...s.label, marginBottom: 6, textAlign: "center" }}>Filtrar por rango de fecha</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Del</div>
                  <input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, padding: "10px 5px", fontSize: 16 }} />
                </div>
                <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Al</div>
                  <input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, padding: "10px 5px", fontSize: 16 }} />
                </div>
              </div>
              {(vtFechaDesde || vtFechaHasta) && (
                <button style={{ width: "100%", fontSize: 12, color: "#E85A5A", background: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4 }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}>
                  × Limpiar fechas
                </button>
              )}
            </div>
          )}

          {/* LISTA DE MOVIMIENTOS VER TODOS */}
          <div style={s.section}>
            <div style={{ ...s.label, marginBottom: 12, textAlign: "center" }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", color: "#333", padding: "32px" }}>No se encontraron movimientos</div>
            ) : (
              gastosVerTodos.map(g => {
                const cat = categorias.find(c => c.id === g.categoria);
                const { fecha, hora } = formatDateTime(g.created_at);
                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 14px", marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                          {cat && <span style={s.catDot(cat.color)} />}
                          <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.descripcion}</span>
                        </div>
                        <div style={{ fontSize: 11, color: "#666" }}>
                          {fecha} <span style={{ opacity: 0.5, margin: "0 4px" }}>|</span> {hora}
                        </div>
                      </div>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", marginRight: 4, flexShrink: 0 }}>
                        {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                      </span>
                      <button style={s.editBtn} onClick={() => abrirEdicion(g)}>✏️</button>
                      <button style={s.deleteBtn} onClick={() => eliminar(g.id)}>×</button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      ) : (
        <>
          {/* HEADER NORMAL DE LA APP */}
          <div style={s.header}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h1 style={s.title}>Ahorro Meta</h1>
              <button onClick={() => window.location.reload()} style={s.refreshBtn} title="Actualizar">🔄</button>
            </div>
            <p style={s.subtitle}>
              Meta: {formatMoney(META_TOTAL)} en {MESES} meses · Día {diasTranscurridos(fechaInicio)} de {DIAS_TOTAL}
              {saving && <span style={{ color: "#555", marginLeft: 8, fontSize: 11 }}>· Guardando...</span>}
            </p>
            <div style={s.tabs}>
              {[{ id: "hoy", label: "Hoy" }, { id: "resumen", label: "Resumen" }, { id: "historial", label: "Historial" }, { id: "config", label: "Config" }].map(t => (
                <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
              ))}
            </div>
          </div>

          {error && <div style={s.errorCard}>⚠️ {error}</div>}

          {/* ═══════════ TAB: HOY ═══════════ */}
          {tab === "hoy" && (
            <div style={s.section}>

              <div style={s.metaCard}>
                <div style={s.label}>Progreso hacia tu meta</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <span style={s.bigNum}>{formatMoney(Math.max(0, ahorroAcumulado))}</span>
                  <span style={{ color: "#555", fontSize: 13 }}>de {formatMoney(META_TOTAL)}</span>
                </div>
                <div style={s.progressBg}><div style={s.progressFill(progreso)} /></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888", marginBottom: 8 }}>
                  <span>{progreso.toFixed(1)}% completado</span>
                  <span>{diasRestantes} días restantes</span>
                </div>
                <div style={{ borderTop: "1px solid #2A2000", paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#666" }}>Falta ahorrar</span>
                  <span style={{ color: "#E8845A", fontFamily: "monospace", fontWeight: 700 }}>
                    {formatMoney(Math.max(0, META_TOTAL - ahorroAcumulado))}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 4 }}>
                  <span style={{ color: "#666" }}>A este ritmo llegarás</span>
                  <span style={{ color: "#D4AF37", fontWeight: 700 }}>{proyeccionTexto}</span>
                </div>
              </div>

              <div style={s.grid2}>
                <div style={s.card}><div style={s.label}>Gastado hoy</div><div style={{ ...s.redNum, fontSize: 20 }}>{formatMoney(totalGastadoHoy)}</div></div>
                <div style={s.card}><div style={s.label}>Límite/día</div><div style={{ ...s.greenNum, fontSize: 20 }}>{ingMensual > 0 ? formatMoney(presupuestoDiario) : "—"}</div></div>
              </div>

              {ingMensual > 0 && (
                <div style={s.grid2}>
                  <div style={s.card}>
                    <div style={s.label}>Ingresos hoy</div>
                    <div style={{ ...s.greenNum, fontSize: 20 }}>
                      {formatMoney(totalIngresosHoy)}
                    </div>
                  </div>
                  
                  <div style={{ ...s.card, background: totalGastadoHoy > presupuestoDiario ? "#1A0A0A" : "#0A1A0A", border: `1px solid ${totalGastadoHoy > presupuestoDiario ? "#3A1000" : "#103A10"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ ...s.label, fontSize: 10 }}>Saldo disponible hoy</div>
                        <div style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: (presupuestoDiario - totalGastadoHoy) >= 0 ? "#5AE88A" : "#E85A5A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {formatMoney(presupuestoDiario - totalGastadoHoy)}
                        </div>
                      </div>
                      <span style={{ fontSize: 20, marginLeft: 4 }}>{(presupuestoDiario - totalGastadoHoy) >= 0 ? "✅" : "⚠️"}</span>
                    </div>
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={s.label}>Registrar movimiento</div>
                <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                  <button style={s.tipoBtn(form.tipo === "gasto", "#E85A5A")} onClick={() => setForm(f => ({ ...f, tipo: "gasto" }))}>− Gasto</button>
                  <button style={s.tipoBtn(form.tipo === "ingreso", "#5AE88A")} onClick={() => setForm(f => ({ ...f, tipo: "ingreso" }))}>+ Ingreso</button>
                </div>
                <input style={{ ...s.input, marginBottom: 8, fontSize: 22, fontWeight: 700 }} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
                {form.tipo === "gasto" && (
                  <select style={{ ...s.select, marginBottom: 8 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                )}
                <input style={{ ...s.input, marginBottom: 10 }} type="text" placeholder="Descripción (opcional)" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
                <button style={s.btnPrimary} onClick={agregarMovimiento} disabled={saving}>
                  {saving ? "Guardando..." : `Registrar ${form.tipo === "gasto" ? "Gasto" : "Ingreso"}`}
                </button>
              </div>

              {(gastosHoy.length > 0 || ingresosHoy.length > 0) ? (
                <div style={s.card}>
                  <div style={s.label}>Movimientos de hoy</div>
                  {[...gastosHoy, ...ingresosHoy].map(g => {
                    const cat = categorias.find(c => c.id === g.categoria);
                    const { fecha, hora } = formatDateTime(g.created_at);
                    return (
                      <div key={g.id} style={s.itemRow}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                            {cat && <span style={s.catDot(cat.color)} />}
                            <span style={{ fontSize: 14, color: "#C0B8A8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.descripcion}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#666" }}>
                            {fecha} <span style={{ opacity: 0.5, margin: "0 4px" }}>|</span> {hora}
                          </div>
                        </div>
                        <span style={{ fontFamily: "monospace", fontWeight: 600, color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", marginRight: 4, flexShrink: 0 }}>
                          {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                        </span>
                        <button style={s.editBtn} onClick={() => abrirEdicion(g)}>✏️</button>
                        <button style={s.deleteBtn} onClick={() => eliminar(g.id)}>×</button>
                      </div>
                    );
                  })}
                  {/* BOTÓN VER TODOS */}
                  <button style={{ ...s.btnPrimary, marginTop: 12, padding: "10px", fontSize: 13 }} onClick={() => setViewAll(true)}>
                    Ver todos
                  </button>
                </div>
              ) : (
                <div style={{ ...s.card, textAlign: "center", color: "#333", padding: "24px" }}>Sin movimientos hoy</div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: RESUMEN ═══════════ */}
          {tab === "resumen" && (
            <div style={s.section}>

              <div style={s.filterRow}>
                {[
                  { id: "hoy",    label: "Hoy" },
                  { id: "semana", label: "7 días" },
                  { id: "mes",    label: "Este mes" },
                  { id: "todo",   label: "Todo" },
                  { id: "rango",  label: "📅 Rango" },
                ].map(f => (
                  <button key={f.id} style={s.filterBtn(filtroResumen === f.id)} onClick={() => setFiltroResumen(f.id)}>{f.label}</button>
                ))}
              </div>
              {filtroResumen === "rango" && (
                <div style={{ ...s.card, padding: 12 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                      <div style={{ ...s.label, marginBottom: 5 }}>Del</div>
                      <input
                        type="date" value={filtroFechaResumenDesde}
                        onChange={e => setFiltroFechaResumenDesde(e.target.value)}
                        style={{ ...s.input, padding: "10px 5px", fontSize: 16 }}
                      />
                    </div>
                    <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                      <div style={{ ...s.label, marginBottom: 5 }}>Al</div>
                      <input
                        type="date" value={filtroFechaResumenHasta}
                        onChange={e => setFiltroFechaResumenHasta(e.target.value)}
                        style={{ ...s.input, padding: "10px 5px", fontSize: 16 }}
                      />
                    </div>
                  </div>
                  {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                    <button
                      style={{ fontSize: 12, color: "#E85A5A", background: "none", border: "none", cursor: "pointer", marginTop: 8, padding: 0 }}
                      onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}
                    >× Limpiar fechas</button>
                  )}
                </div>
              )}

              <div style={s.grid2}>
                <div style={s.card}><div style={s.label}>Total gastado</div><div style={s.redNum}>{formatMoney(totalGastadoR)}</div></div>
                <div style={s.card}><div style={s.label}>Total ingresos</div><div style={s.greenNum}>{formatMoney(totalIngresosR)}</div></div>
                <div style={s.card}><div style={s.label}>Ahorro período</div><div style={{ ...s.smallNum, color: ahorroR >= 0 ? "#D4AF37" : "#E85A5A" }}>{formatMoney(ahorroR)}</div></div>
                <div style={s.card}><div style={s.label}>Gasto prom/día</div><div style={s.smallNum}>{formatMoney(gastoDiarioProm)}</div></div>
              </div>

              <div style={{ ...s.card, background: "#0F1A0F", border: "1px solid #1A3A1A", marginBottom: 12 }}>
                <div style={s.label}>Proyección inteligente</div>
                <div style={{ fontSize: 15, color: "#D4AF37", fontWeight: 700, marginTop: 6 }}>
                  📈 A este ritmo llegarás a tu meta {proyeccionTexto}
                </div>
                <div style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                  Basado en un ahorro diario promedio de {formatMoney(ahorroDiarioProm > 0 ? ahorroDiarioProm : 0)}
                </div>
              </div>

              {ingMensual > 0 && (
                <div style={s.metaCard}>
                  <div style={s.label}>Para lograr tu meta</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 1.9, marginTop: 8 }}>
                    <div>💰 Ahorra <strong style={{ color: "#D4AF37" }}>{formatMoney(ahorroMetaDiario)}/día</strong></div>
                    <div>📅 o <strong style={{ color: "#D4AF37" }}>{formatMoney(ahorroMetaDiario * 30)}/mes</strong></div>
                    <div>💸 Límite de gasto: <strong style={{ color: "#5AE88A" }}>{formatMoney(presupuestoDiario)}/día</strong></div>
                    <div>🎯 Faltan: <strong style={{ color: "#D4AF37" }}>{formatMoney(Math.max(0, META_TOTAL - ahorroAcumulado))}</strong></div>
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={{ ...s.label, marginBottom: 14 }}>Gastos últimos 7 días</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
                  {gastosUltimos7.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", height: `${d.total ? Math.max(8, (d.total / maxBar) * 70) : 3}px`, background: d.fecha === fechaHoy ? "#D4AF37" : "#2A2A2A", borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} />
                      <span style={{ fontSize: 9, color: d.fecha === fechaHoy ? "#D4AF37" : "#444", textTransform: "capitalize" }}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {porCategoriaR.length > 0 && (
                <div style={s.card}>
                  <div style={{ ...s.label, marginBottom: 14 }}>Por categoría</div>
                  {porCategoriaR.map(cat => (
                    <div key={cat.id} style={{ marginBottom: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13 }}>{cat.label}</span>
                        <span style={{ fontFamily: "monospace", fontSize: 13, color: cat.color }}>{formatMoney(cat.total)}</span>
                      </div>
                      <div style={{ background: "#1A1A1A", borderRadius: 3, height: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${(cat.total / maxCatR) * 100}%`, background: cat.color, borderRadius: 3 }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TAB: HISTORIAL ═══════════ */}
          {tab === "historial" && (
            <div style={s.section}>

              <div style={{ display: "flex", gap: 8, marginBottom: 12, width: "100%" }}>
                <button
                  style={{ ...s.btnSecondary, flex: 1, fontSize: 12 }}
                  onClick={() => exportarCSV(gastosFiltradosHist, categorias)}
                >📊 Exportar Excel</button>
                <button
                  style={{ ...s.btnSecondary, flex: 1, fontSize: 12 }}
                  onClick={() => exportarPDF(gastosFiltradosHist, categorias)}
                >📄 Exportar PDF</button>
              </div>

              <div style={s.card}>
                <div style={{ ...s.label, marginBottom: 6 }}>Filtrar por categoría</div>
                <div style={{ ...s.filterRow, marginBottom: 12 }}>
                  <button style={s.filterBtn(filtroHistCat === "todas")} onClick={() => setFiltroHistCat("todas")}>Todas</button>
                  {categorias.map(c => (
                    <button key={c.id} style={s.filterBtn(filtroHistCat === c.id)} onClick={() => setFiltroHistCat(c.id)}>{c.label}</button>
                  ))}
                </div>
                <div style={{ ...s.label, marginBottom: 6, marginTop: 8 }}>Filtrar por rango de fecha</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
                  <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Del</div>
                    <input
                      type="date" value={filtroHistFechaDesde}
                      onChange={e => setFiltroHistFechaDesde(e.target.value)}
                      style={{ ...s.input, padding: "10px 5px", fontSize: 16 }}
                    />
                  </div>
                  <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                    <div style={{ fontSize: 11, color: "#555", marginBottom: 3 }}>Al</div>
                    <input
                      type="date" value={filtroHistFechaHasta}
                      onChange={e => setFiltroHistFechaHasta(e.target.value)}
                      style={{ ...s.input, padding: "10px 5px", fontSize: 16 }}
                    />
                  </div>
                </div>
                {(filtroHistFechaDesde || filtroHistFechaHasta) && (
                  <button
                    style={{ fontSize: 12, color: "#E85A5A", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}
                    onClick={() => { setFiltroHistFechaDesde(""); setFiltroHistFechaHasta(""); }}
                  >× Limpiar fechas</button>
                )}
              </div>

              {gastosFiltradosHist.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", color: "#333", padding: "32px" }}>Sin movimientos con este filtro</div>
              ) : (
                <>
                  <div style={{ ...s.label, marginBottom: 12 }}>{gastosFiltradosHist.length} movimientos</div>
                  {gastosFiltradosHist.map(g => {
                    const cat = categorias.find(c => c.id === g.categoria);
                    const { fecha, hora } = formatDateTime(g.created_at);
                    return (
                      <div key={g.id} style={{ ...s.card, padding: "12px 14px", marginBottom: 6 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                              {cat && <span style={s.catDot(cat.color)} />}
                              <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{g.descripcion}</span>
                            </div>
                            <div style={{ fontSize: 11, color: "#666" }}>
                              {fecha} <span style={{ opacity: 0.5, margin: "0 4px" }}>|</span> {hora}
                            </div>
                          </div>
                          <span style={{ fontFamily: "monospace", fontWeight: 700, color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", marginRight: 4, flexShrink: 0 }}>
                            {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                          </span>
                          <button style={s.editBtn} onClick={() => abrirEdicion(g)}>✏️</button>
                          <button style={s.deleteBtn} onClick={() => eliminar(g.id)}>×</button>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}

          {/* ═══════════ TAB: CONFIG ═══════════ */}
          {tab === "config" && (
            <div style={s.section}>
              <div style={s.card}>
                <div style={{ ...s.label, marginBottom: 8, textAlign: "center" }}>INGRESO MENSUAL (S/)</div>
                <input 
                  style={{ ...s.input, marginBottom: 16, fontSize: 24, fontWeight: 700, textAlign: "center", color: "#D4AF37" }} 
                  type={isEditingIngreso ? "number" : "text"} 
                  placeholder="Ej: 5000" 
                  value={isEditingIngreso ? ingresoMensual : (ingresoMensual ? formatMoney(ingresoMensual) : "")} 
                  onFocus={() => setIsEditingIngreso(true)}
                  onBlur={() => setIsEditingIngreso(false)}
                  onChange={e => setIngresoMensual(e.target.value)} 
                />
                
                <div style={{ ...s.label, marginBottom: 8, textAlign: "center" }}>FECHA DE INICIO DEL PLAN</div>
                <input style={{ ...s.input, marginBottom: 16, textAlign: "center", fontSize: 16 }} type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
                
                <button style={s.btnPrimary} onClick={guardarConfig} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar configuración"}
                </button>
              </div>

              {ingMensual > 0 && (
                <div style={s.metaCard}>
                  <div style={s.label}>Tu plan para S/ 100,000</div>
                  <div style={{ fontSize: 13, color: "#888", lineHeight: 2, marginTop: 8 }}>
                    <div>📥 Ingreso mensual: <strong style={{ color: "#E8E0D0" }}>{formatMoney(ingMensual)}</strong></div>
                    <div>🎯 Ahorro necesario/mes: <strong style={{ color: "#D4AF37" }}>{formatMoney(META_TOTAL / MESES)}</strong></div>
                    <div>💸 Gasto máximo/mes: <strong style={{ color: "#5AE88A" }}>{formatMoney(ingMensual - META_TOTAL / MESES)}</strong></div>
                    <div>📆 Gasto máximo/día: <strong style={{ color: "#5AE88A" }}>{formatMoney(presupuestoDiario)}</strong></div>
                    {ingMensual < META_TOTAL / MESES && (
                      <div style={{ marginTop: 8, color: "#E85A5A", fontSize: 12 }}>⚠️ Tu ingreso es menor al ahorro necesario. Considera aumentar ingresos.</div>
                    )}
                  </div>
                </div>
              )}

              <div style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={s.label}>Categorías personalizadas</div>
                  <button
                    style={{ background: "#D4AF37", color: "#000", border: "none", borderRadius: 6, padding: "4px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                    onClick={() => setShowNuevaCat(v => !v)}
                  >+ Nueva</button>
                </div>
                
                {showNuevaCat && (
                  <div style={{ background: "#0A0A0A", borderRadius: 8, padding: 12, marginBottom: 12 }}>
                    <input
                      style={{ ...s.input, marginBottom: 8 }}
                      placeholder="Ej: 🛍️ Compras"
                      value={nuevaCatLabel}
                      onChange={e => setNuevaCatLabel(e.target.value)}
                    />
                    <div style={{ ...s.label, marginBottom: 6 }}>Elige un color</div>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                      {COLORES_CUSTOM.map(c => (
                        <div key={c} onClick={() => setNuevaCatColor(c)}
                          style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: nuevaCatColor === c ? "3px solid #fff" : "3px solid transparent" }} />
                      ))}
                    </div>
                    
                    <div style={{ display: "flex", gap: 8 }}>
                      <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => setShowNuevaCat(false)}>Cancelar</button>
                      <button style={{ ...s.btnPrimary, flex: 1 }} onClick={agregarCategoria}>Agregar categoría</button>
                    </div>
                  </div>
                )}

                {/* LISTA Y EDICIÓN DE CATEGORÍAS */}
                {categoriasExtra.length === 0 ? (
                  <div style={{ color: "#333", fontSize: 13, textAlign: "center", padding: "8px 0" }}>Aún no hay categorías personalizadas</div>
                ) : (
                  categoriasExtra.map(cat => (
                    editandoCat === cat.id ? (
                      <div key={cat.id} style={{ background: "#161616", borderRadius: 8, padding: 12, margin: "8px 0" }}>
                        <input
                          style={{ ...s.input, marginBottom: 8 }}
                          value={editCatLabel}
                          onChange={e => setEditCatLabel(e.target.value)}
                        />
                        <div style={{ ...s.label, marginBottom: 6 }}>Elige un color</div>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                          {COLORES_CUSTOM.map(c => (
                            <div key={c} onClick={() => setEditCatColor(c)}
                              style={{ width: 24, height: 24, borderRadius: "50%", background: c, cursor: "pointer", border: editCatColor === c ? "3px solid #fff" : "3px solid transparent" }} />
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => setEditandoCat(null)}>Cancelar</button>
                          <button style={{ ...s.btnPrimary, flex: 1, padding: "10px" }} onClick={guardarEdicionCat}>Guardar</button>
                        </div>
                      </div>
                    ) : (
                      <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1A1A1A" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, display: "inline-block" }} />
                          <span style={{ fontSize: 14 }}>{cat.label}</span>
                        </div>
                        <div>
                          <button style={{ ...s.editBtn, marginRight: 8 }} onClick={() => abrirEdicionCat(cat)}>✏️</button>
                          <button style={{ ...s.deleteBtn, color: "#E85A5A" }} onClick={() => eliminarCategoria(cat.id)}>×</button>
                        </div>
                      </div>
                    )
                  ))
                )}
              </div>

              <div style={{ ...s.card, borderColor: "#2A0A0A" }}>
                <div style={{ ...s.label, marginBottom: 8, color: "#E85A5A" }}>Zona de peligro</div>
                <button style={{ ...s.btnSecondary, color: "#E85A5A", borderColor: "#3A1A1A" }}
                  onClick={async () => {
                    const confirm = window.prompt("Escribe BORRAR TODO para confirmar:");
                    if (confirm === "BORRAR TODO") {
                      await supabase.from("gastos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                      setGastos([]);
                      showToast("Todos los movimientos eliminados", "#888");
                    }
                  }}>
                  Eliminar todos los movimientos
                </button>
              </div>
            </div>
          )}

          {/* ── Nav bar con Safe Area ── */}
          <div style={s.navBar}>
            {[
              { id: "hoy",      icon: "📝", label: "Hoy" },
              { id: "resumen",  icon: "📊", label: "Resumen" },
              { id: "historial",icon: "📋", label: "Historial" },
              { id: "config",   icon: "⚙️", label: "Config" },
            ].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
                <span style={{ fontSize: 22 }}>{n.icon}</span>
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Toast GLOBAL ── */}
      {toast && (
        <div style={{ position: "fixed", bottom: "calc(90px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", border: `1px solid ${toast.color}`, color: toast.color, padding: "10px 20px", borderRadius: 8, fontSize: 13, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          {toast.msg}
        </div>
      )}

      {/* ── Modal Edición GLOBAL ── */}
      {editando && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditando(null); }}>
          <div style={s.modal}>
            <div style={{ ...s.label, marginBottom: 12, fontSize: 14 }}>✏️ Editar movimiento</div>
            <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
              <button style={s.tipoBtn(editForm.tipo === "gasto", "#E85A5A")} onClick={() => setEditForm(f => ({ ...f, tipo: "gasto" }))}>− Gasto</button>
              <button style={s.tipoBtn(editForm.tipo === "ingreso", "#5AE88A")} onClick={() => setEditForm(f => ({ ...f, tipo: "ingreso" }))}>+ Ingreso</button>
            </div>
            <input style={{ ...s.input, marginBottom: 8, fontSize: 20, fontWeight: 700 }} type="number" placeholder="0.00" value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
            {editForm.tipo === "gasto" && (
              <select style={{ ...s.select, marginBottom: 8 }} value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
            )}
            <input style={{ ...s.input, marginBottom: 14 }} type="text" placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} />
            <div style={{ display: "flex", gap: 8 }}>
              <button style={{ ...s.btnSecondary, flex: 1 }} onClick={() => setEditando(null)}>Cancelar</button>
              <button style={{ ...s.btnPrimary, flex: 1 }} onClick={guardarEdicion} disabled={saving}>
                {saving ? "Guardando..." : "Guardar cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal de Correo (Sólo para "Ver Todos") ── */}
      {showEmailModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowEmailModal(false); }}>
          <div style={{ ...s.modal, textAlign: "center" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 18, color: "#E8E0D0" }}>Enviar movimientos</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#888" }}>Ingresa el e-mail del destinatario.</p>
            <input 
              style={{ ...s.input, marginBottom: 16, textAlign: "center" }} 
              type="email" 
              placeholder="correo@ejemplo.com" 
              value={emailDestino} 
              onChange={e => setEmailDestino(e.target.value)} 
            />
            <div style={{ display: "flex", gap: 8, borderTop: "1px solid #1E1E1E", paddingTop: 12 }}>
              <button style={{ flex: 1, background: "none", border: "none", color: "#D4AF37", fontSize: 15, cursor: "pointer", padding: "8px 0" }} onClick={() => setShowEmailModal(false)}>Cancelar</button>
              <button style={{ flex: 1, background: "none", border: "none", color: "#4D96FF", fontSize: 15, cursor: "pointer", padding: "8px 0", fontWeight: 600 }} onClick={() => { showToast("Enviado con éxito", "#5AE88A"); setShowEmailModal(false); setEmailDestino(""); }}>Enviar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}