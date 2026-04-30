import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jboazxmcmvvcscqeerbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2F6eG1jbXZ2Y3NjcWVlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMxMjksImV4cCI6MjA5MjcyOTEyOX0.zFKEHscM7-PaXqoSgbk7ra8JFZ3Hh69JJKktm7N4IwY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CURRENCY = "S/";

const CATEGORIAS_DEFAULT = [
  { id: "comida",          label: "🍽️ Comida",           color: "#E8845A" },
  { id: "transporte",      label: "🚌 Transporte",         color: "#5A9BE8" },
  { id: "trabajo",         label: "💼 Trabajo/Negocio",    color: "#7BE85A" },
  { id: "salud",           label: "❤️ Salud",             color: "#E85A8A" },
  { id: "hogar",           label: "🏠 Hogar",              color: "#C05AE8" },
  { id: "entretenimiento", label: "🎮 Entretenimiento",    color: "#E8D85A" },
  { id: "otros",           label: "📦 Otros",              color: "#8A9BA8" },
];

const COLORES_CUSTOM = ["#FF6B6B","#FCB606","#6BCB77","#4D96FF","#C77DFF","#FF9F1C","#2EC4B6","#E71D36","#F72585","#B5E48C"];

const getLimaTime = () => new Date(Date.now() - 18000000);
const hoy = () => getLimaTime().toISOString().split("T")[0];
const calcularFechaFutura = (dias) => new Date(Date.now() - 18000000 + dias * 86400000).toISOString().split("T")[0];

const getFechaLocal = (isoStr) => {
  if (!isoStr) return hoy();
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  return new Date(dt.getTime() - 18000000).toISOString().split("T")[0];
};

const formatMoney = (n) => `${CURRENCY} ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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

const getUIFechaHora = (isoStr) => {
  if (!isoStr) return "";
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  const limaDate = new Date(dt.getTime() - 18000000);

  let h = limaDate.getUTCHours();
  let m = limaDate.getUTCMinutes();
  const ampm = h >= 12 ? 'pm' : 'am';
  h = h % 12;
  h = h ? h : 12; 
  m = m < 10 ? '0' + m : m;
  const strTime = `${h}:${m} ${ampm}`;

  const isoDate = limaDate.toISOString().split("T")[0];
  const todayIso = hoy();
  const ayerDate = new Date(Date.now() - 18000000 - 86400000);
  const ayerIso = ayerDate.toISOString().split("T")[0];

  if (isoDate === todayIso) {
    return `Hoy ${strTime}`;
  } else if (isoDate === ayerIso) {
    return `Ayer ${strTime}`;
  } else {
    const meses = ["Ene.", "Feb.", "Mar.", "Abr.", "May.", "Jun.", "Jul.", "Ago.", "Sep.", "Oct.", "Nov.", "Dic."];
    const day = limaDate.getUTCDate();
    const month = meses[limaDate.getUTCMonth()];
    const year = limaDate.getUTCFullYear();
    return `${day} ${month} ${year} - ${strTime}`;
  }
};

// NUEVA FUNCIÓN: Limpia la descripción para evitar emojis dobles
const getDisplayDesc = (g, categorias) => {
  const cat = categorias.find(c => c.id === g.categoria);
  if (!cat) return g.descripcion;
  if (g.descripcion === cat.label) {
    return cat.label.substring(cat.label.indexOf(" ") + 1).trim();
  }
  return g.descripcion;
};

const diffDias = (d1Str, d2Str) => {
  if (!d1Str || !d2Str) return 0;
  const [y1, m1, day1] = d1Str.split("-");
  const [y2, m2, day2] = d2Str.split("-");
  return Math.round((Date.UTC(y2, m2 - 1, day2) - Date.UTC(y1, m1 - 1, day1)) / 86400000);
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
    const cat  = categorias.find(c => c.id === g.categoria);
    const catLabel = cat?.label || g.categoria || "";
    const color = g.tipo === "gasto" ? "#c0392b" : "#27ae60";
    const signo = g.tipo === "gasto" ? "-" : "+";
    return `<tr>
      <td style="font-weight:500;">${fecha}<br/><small style="color:#888">${hora}</small></td>
      <td style="font-weight:600;color:${cat?.color || "#1a1a1a"}">${catLabel}</td>
      <td style="color:#1a1a1a;">${g.descripcion || ""}</td>
      <td style="color:${color};font-weight:bold;text-align:right">${signo} S/ ${Number(g.monto).toFixed(2)}</td>
    </tr>`;
  }).join("");

  const win = window.open("", "_blank");
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>Historial Ahorro Meta</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
      body{font-family:'Montserrat',sans-serif;padding:30px 20px;font-size:13px;background-color:#F4F5F7;color:#1a1a1a;margin:0;}
      h2{color:#FCB606;margin-top:0;font-size:24px;font-weight:700;}
      .header-meta {color:#6B7280;margin-bottom:24px;font-size:14px;font-weight:500;}
      .btn-print {display:inline-block;margin-bottom:20px;padding:12px 24px;background:#FCB606;color:#000;font-weight:700;border:none;border-radius:12px;cursor:pointer;font-family:inherit;font-size:14px;box-shadow:0 4px 12px rgba(252,182,6,0.2);}
      
      .card-history {
        width:100%;
        max-width:800px;
        margin:0 auto;
        background:#FFFFFF;
        border:1px solid #E5E7EB;
        border-radius:24px;
        padding:32px;
        box-shadow:0 8px 24px rgba(0,0,0,0.06);
        box-sizing:border-box;
      }
      
      table{width:100%;border-collapse:collapse;margin-top:12px;border-radius:12px;overflow:hidden;}
      th{background:#F9FAFB;color:#6B7280;padding:14px 16px;text-align:left;font-weight:600;border-bottom:1px solid #E5E7EB;text-transform:uppercase;font-size:11px;letter-spacing:1px;}
      td{padding:14px 16px;border-bottom:1px solid #E5E7EB;}
      tr:last-child td{border-bottom:none;}
      tr:nth-child(even){background:#F9FAFB;}
      
      @media print{
        button{display:none;}
        body{background:#FFFFFF;padding:0;}
        .card-history{border:none;box-shadow:none;padding:0;}
      }
    </style></head><body>
    <div style="max-width:800px;margin:0 auto;">
      <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar PDF</button>
      <div class="card-history">
        <h2>Ahorro Meta — Historial de movimientos</h2>
        <p class="header-meta">Exportado el ${formatFecha(hoy())} · Total registros: ${gastos.length}</p>
        <table><thead><tr><th>Fecha / Hora</th><th>Categoría</th><th>Descripción</th><th>Monto</th></tr></thead>
        <tbody>${filas}</tbody></table>
      </div>
    </div>
    </body></html>`);
  win.document.close();
};

const MenuItem = ({ icon, text, color, mutedColor, border, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", padding: "16px 0", cursor: "pointer", color: color, fontSize: 16, fontWeight: 500, borderBottom: `1px solid ${border}`, textAlign: "left", fontFamily: "inherit" }}>
    <span style={{ fontSize: 24 }}>{icon}</span>
    <span style={{ flex: 1 }}>{text}</span>
    <span style={{ color: mutedColor, fontSize: 20 }}>›</span>
  </button>
);

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [categoriasBase, setCategoriasBase] = useState(CATEGORIAS_DEFAULT);
  const [categoriasExtra, setCategoriasExtra] = useState([]);  
  
  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  
  const [metaAhorro, setMetaAhorro] = useState("100000");
  const [fechaInicioPlan, setFechaInicioPlan] = useState(hoy());
  const [fechaFinPlan, setFechaFinPlan] = useState(calcularFechaFutura(150));
  const [ingresoMensual, setIngresoMensual] = useState("");
  
  const [userName, setUserName] = useState("Emprendedor");

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isEditingIngreso, setIsEditingIngreso] = useState(false);
  
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [editando, setEditando] = useState(null);   
  const [editForm, setEditForm] = useState({});

  const [showNuevaCat, setShowNuevaCat] = useState(false);
  const [nuevaCatLabel, setNuevaCatLabel] = useState("");
  const [nuevaCatColor, setNuevaCatColor] = useState(COLORES_CUSTOM[0]);

  const [editandoCat, setEditandoCat] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  const [editandoCatBase, setEditandoCatBase] = useState(null);
  const [editCatBaseLabel, setEditCatBaseLabel] = useState("");
  const [editCatBaseColor, setEditCatBaseColor] = useState("");

  const [filtroHistCat, setFiltroHistCat] = useState("todas");
  const [filtroHistFechaDesde, setFiltroHistFechaDesde] = useState("");
  const [filtroHistFechaHasta, setFiltroHistFechaHasta] = useState("");

  const [filtroResumen, setFiltroResumen] = useState("todo");
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState(hoy());
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState(hoy());

  const [viewAll, setViewAll] = useState(false);
  const [showVtFiltro, setShowVtFiltro] = useState(false);
  const [vtFechaDesde, setVtFechaDesde] = useState("");
  const [vtFechaHasta, setVtFechaHasta] = useState("");
  
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailDestino, setEmailDestino] = useState("");
  
  const [showMenu, setShowMenu] = useState(false);
  const [showApariencia, setShowApariencia] = useState(false);
  const [profileScreen, setProfileScreen] = useState(null);
  
  const [showAddModal, setShowAddModal] = useState(false);

  const [theme, setTheme] = useState("dark");
  const [isAutoTheme, setIsAutoTheme] = useState(false);
  const [useBold, setUseBold] = useState(false);

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];
  const isDark = theme === "dark";

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
    iconBgGreen: isDark ? "rgba(90, 232, 138, 0.15)" : "#E6F4EA",
    iconBgRed: isDark ? "rgba(232, 90, 90, 0.15)" : "#FEE2E2",
    iconBgYellow: isDark ? "rgba(252, 182, 6, 0.15)" : "#FEF3C7",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF",
    iconTextPurple: isDark ? "#D8B4FE" : "#A855F7"
  };

  const showToast = (msg, color = "#FCB606") => {
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
        setGastos((movimientos || []).map(m => ({ ...m, fecha: getFechaLocal(m.created_at) })));

        const { data: cfg, error: err2 } = await supabase.from("config").select("*");
        if (err2) throw err2;
        if (cfg) {
          const getVal = (k) => cfg.find(item => item.key === k)?.value;
          
          if (getVal("metaAhorro")) setMetaAhorro(getVal("metaAhorro"));
          if (getVal("fechaInicio")) setFechaInicioPlan(getVal("fechaInicio"));
          if (getVal("fechaFin")) setFechaFinPlan(getVal("fechaFin"));
          if (getVal("ingresoMensual")) setIngresoMensual(getVal("ingresoMensual"));
          if (getVal("themePref")) setTheme(getVal("themePref"));
          if (getVal("useBoldPref")) setUseBold(getVal("useBoldPref") === "true");
          if (getVal("userName")) setUserName(getVal("userName"));

          if (getVal("categoriasCustom")) {
            try { 
              const p = JSON.parse(getVal("categoriasCustom")); 
              if(Array.isArray(p)) setCategoriasExtra(p);
            } catch(_) {}
          }
          if (getVal("categoriasBase")) {
            try { 
              const p = JSON.parse(getVal("categoriasBase")); 
              if(Array.isArray(p)) setCategoriasBase(p);
            } catch(_) {}
          }
        }
        setError(null);
      } catch (e) {
        setError("No se pudo conectar. Verifica tu configuración.");
      }
      setLoaded(true);
    })();
  }, []);

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) { showToast("Ingresa un monto válido", c.red); return; }
    setSaving(true);
    const catObj = categorias.find(cat => cat.id === form.categoria);
    const defaultDesc = catObj ? catObj.label.substring(catObj.label.indexOf(" ") + 1).trim() : "Movimiento";
    const nuevo = { fecha: hoy(), monto, descripcion: form.descripcion || defaultDesc, categoria: form.categoria, tipo: form.tipo };
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
    if (err) { showToast("Error", c.red); return; }
    setGastos(prev => prev.filter(g => g.id !== id));
    showToast("Eliminado", c.muted);
  };

  const abrirEdicion = (g) => { setEditando(g); setEditForm({ monto: g.monto, descripcion: g.descripcion, categoria: g.categoria, tipo: g.tipo }); };

  const guardarEdicion = async () => {
    const monto = parseFloat(editForm.monto);
    if (!monto || monto <= 0) { showToast("Monto inválido", c.red); return; }
    setSaving(true);
    const catObj = categorias.find(cat => cat.id === editForm.categoria);
    const defaultDesc = catObj ? catObj.label.substring(catObj.label.indexOf(" ") + 1).trim() : "Movimiento";
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
    const upserts = [
      { key: "metaAhorro", value: (metaAhorro || "0").toString() },
      { key: "fechaInicio", value: fechaInicioPlan },
      { key: "fechaFin", value: fechaFinPlan },
      { key: "ingresoMensual", value: (ingresoMensual || "0").toString() },
      { key: "themePref", value: theme },
      { key: "useBoldPref", value: useBold.toString() },
      { key: "categoriasCustom", value: JSON.stringify(safeExtra) },
      { key: "categoriasBase", value: JSON.stringify(safeBase) }
    ];
    await supabase.from("config").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    showToast("Configuración guardada ✓");
  };

  const guardarPerfil = async () => {
    setSaving(true);
    await supabase.from("config").upsert([{ key: "userName", value: userName }], { onConflict: "key" });
    setSaving(false);
    showToast("Datos actualizados ✓", c.green);
    setProfileScreen(null);
  };

  const agregarCategoria = async () => {
    const label = nuevaCatLabel.trim();
    if (!label) { showToast("Escribe un nombre", c.red); return; }
    const id = "custom_" + Date.now();
    const nueva = { id, label, color: nuevaCatColor };
    const updated = [...safeExtra, nueva];
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    setNuevaCatLabel("");
    setShowNuevaCat(false);
    showToast(`Categoría "${label}" creada ✓`);
  };

  const eliminarCategoria = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría?")) return;
    const updated = safeExtra.filter(cat => cat.id !== id);
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    showToast("Categoría eliminada", c.muted);
  };

  const abrirEdicionCat = (cat) => { setEditandoCat(cat.id); setEditCatLabel(cat.label); setEditCatColor(cat.color); };

  const guardarEdicionCat = async () => {
    const label = editCatLabel.trim();
    if (!label) { showToast("Escribe un nombre", c.red); return; }
    const updated = safeExtra.map(cat => cat.id === editandoCat ? { ...cat, label, color: editCatColor } : cat);
    setCategoriasExtra(updated);
    await supabase.from("config").upsert([{ key: "categoriasCustom", value: JSON.stringify(updated) }], { onConflict: "key" });
    setEditandoCat(null);
    showToast("Categoría actualizada ✓");
  };

  const abrirEdicionCatBase = (cat) => { setEditandoCatBase(cat.id); setEditCatBaseLabel(cat.label); setEditCatBaseColor(cat.color); };

  const guardarEdicionCatBase = async () => {
    const label = editCatBaseLabel.trim();
    if (!label) { showToast("Escribe un nombre", c.red); return; }
    const updated = safeBase.map(cat => cat.id === editandoCatBase ? { ...cat, label, color: editCatBaseColor } : cat);
    setCategoriasBase(updated);
    await supabase.from("config").upsert([{ key: "categoriasBase", value: JSON.stringify(updated) }], { onConflict: "key" });
    setEditandoCatBase(null);
    showToast("Categoría base actualizada ✓");
  };

  const eliminarCategoriaBase = async (id) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta categoría base?")) return;
    const updated = safeBase.filter(cat => cat.id !== id);
    setCategoriasBase(updated);
    await supabase.from("config").upsert([{ key: "categoriasBase", value: JSON.stringify(updated) }], { onConflict: "key" });
    showToast("Categoría eliminada", c.muted);
  };

  const metaTotalNum = parseFloat(metaAhorro) || 0;
  const ingMensual = parseFloat(ingresoMensual) || 0;
  const diasTotalPlan = Math.max(1, diffDias(fechaInicioPlan, fechaFinPlan) + 1);
  const diasTranscurridosPlan = Math.max(0, Math.min(diasTotalPlan, diffDias(fechaInicioPlan, hoy()) + 1));
  const diasRestantesPlan = Math.max(0, diasTotalPlan - diasTranscurridosPlan);
  const fechaHoy = hoy();
  
  const movimientosHoy = gastos.filter(g => g.fecha === fechaHoy);

  const totalGastadoHoy = movimientosHoy.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosHoy = movimientosHoy.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);

  const totalGastado = gastos.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ahorroAcumulado = totalIngresos - totalGastado;
  const progreso = metaTotalNum > 0 ? Math.max(0, Math.min(100, (ahorroAcumulado / metaTotalNum) * 100)) : 0;
  const ingDiario = ingMensual / 30;
  const ahorroMetaDiario = metaTotalNum / diasTotalPlan;
  const presupuestoDiario = ingDiario - ahorroMetaDiario;
  const gastoDiarioProm = diasTranscurridosPlan > 0 ? totalGastado / diasTranscurridosPlan : 0;
  const ahorroDiarioProm = diasTranscurridosPlan > 0 ? ahorroAcumulado / diasTranscurridosPlan : 0;
  
  let proyeccionTexto = "—";
  if (ahorroDiarioProm > 0 && metaTotalNum > 0) {
    const diasNecesarios = Math.ceil((metaTotalNum - ahorroAcumulado) / ahorroDiarioProm);
    const mesesProyeccion = Math.floor(diasNecesarios / 30);
    const diasExtra = diasNecesarios % 30;
    if (ahorroAcumulado >= metaTotalNum) proyeccionTexto = "¡Meta alcanzada! 🎉";
    else if (mesesProyeccion === 0) proyeccionTexto = `en ${diasExtra} día${diasExtra !== 1 ? "s" : ""}`;
    else if (diasExtra === 0) proyeccionTexto = `en ${mesesProyeccion} mes${mesesProyeccion !== 1 ? "es" : ""}`;
    else proyeccionTexto = `en ${mesesProyeccion} mes${mesesProyeccion !== 1 ? "es" : ""} y ${diasExtra} día${diasExtra !== 1 ? "s" : ""}`;
  } else if (ahorroDiarioProm <= 0 && diasTranscurridosPlan > 1) proyeccionTexto = "Sin ahorro neto aún";

  const getFiltradosResumen = () => {
    if (filtroResumen === "hoy") return gastos.filter(g => g.fecha === hoy());
    if (filtroResumen === "semana") return gastos.filter(g => g.fecha >= new Date(Date.now() - 18000000 - 6 * 86400000).toISOString().split("T")[0]);
    if (filtroResumen === "mes") return gastos.filter(g => g.fecha.startsWith(hoy().slice(0, 7)));
    if (filtroResumen === "rango") return gastos.filter(g => (!filtroFechaResumenDesde || g.fecha >= filtroFechaResumenDesde) && (!filtroFechaResumenHasta || g.fecha <= filtroFechaResumenHasta));
    return gastos;
  };
  const gastosFiltradosResumen = getFiltradosResumen();
  const totalGastadoR = gastosFiltradosResumen.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresosR = gastosFiltradosResumen.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ahorroR = totalIngresosR - totalGastadoR;

  const porCategoriaR = categorias.map(cat => ({
    ...cat, total: gastosFiltradosResumen.filter(g => g.tipo === "gasto" && g.categoria === cat.id).reduce((a, g) => a + g.monto, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCatR = porCategoriaR[0]?.total || 1;

  const gastosUltimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - 18000000 - (6 - i) * 86400000);
    const fecha = d.toISOString().split("T")[0];
    const label = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"][new Date(Date.UTC(...fecha.split("-").map((v, idx) => idx === 1 ? v - 1 : v), 12, 0, 0)).getUTCDay()];
    const total = gastos.filter(g => g.fecha === fecha && g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
    return { label, total, fecha };
  });
  const maxBar = Math.max(...gastosUltimos7.map(d => d.total), 1);

  const gastosFiltradosHist = gastos.filter(g => (filtroHistCat === "todas" || g.categoria === filtroHistCat) && (!filtroHistFechaDesde || g.fecha >= filtroHistFechaDesde) && (!filtroHistFechaHasta || g.fecha <= filtroHistFechaHasta));
  const gastosVerTodos = gastos.filter(g => (!vtFechaDesde || g.fecha >= vtFechaDesde) && (!vtFechaHasta || g.fecha <= vtFechaHasta));

  const s = {
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(160px + env(safe-area-inset-bottom, 0px))", width: "100%" },
    header:     { padding: "24px 20px 16px", borderBottom: `1px solid ${c.border}`, position: "sticky", top: 0, background: c.bg, zIndex: 90 },
    title:      { fontSize: 24, fontWeight: 700, color: "#FCB606", margin: 0, fontFamily: "'Montserrat', sans-serif" },
    refreshBtn: { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18 },
    subtitle:   { color: c.muted, fontSize: 13, margin: "4px 0 0", fontWeight: 400 },
    section:    { padding: "20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card:       { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    metaCard:   { width: "100%", background: "linear-gradient(135deg,#1A1A1A,#050505)", borderRadius: 16, padding: "24px", marginBottom: 24, boxSizing: "border-box", color: "#FFF", boxShadow: isDark ? "none" : "0 8px 24px rgba(0,0,0,0.15)" },
    
    metaLabel:  { fontSize: 16, color: "#FFF", marginBottom: 12 }, 
    label:      { fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 12 },
    
    bigNum:     { fontSize: 30, fontWeight: 700, color: "#FFF", lineHeight: 1 },
    smallNum:   { fontSize: 22, fontWeight: 700, color: c.text },
    redNum:     { fontSize: 22, fontWeight: 700, color: c.red },
    greenNum:   { fontSize: 22, fontWeight: 700, color: c.green },
    
    progressBg: { background: "#333", borderRadius: 4, height: 8, margin: "16px 0", overflow: "hidden" },
    progressFill: (p) => ({ height: "100%", width: `${p}%`, background: p >= 100 ? c.green : p >= 50 ? "#FCB606" : c.red, borderRadius: 4, transition: "width 0.6s ease" }),
    
    grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, width: "100%" },
    
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48 },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48 },
    
    btnPrimary: { background: "#FCB606", color: "#000", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(252, 182, 6, 0.2)" },
    btnSecondary:{ background: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 700 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    
    deleteBtn:  { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.red, cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn:    { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    
    errorCard:  { background: isDark ? "#1A0A0A" : "#FEF2F2", border: `1px solid ${c.red}`, borderRadius: 12, padding: "16px", margin: "20px", color: c.red, fontSize: 14, fontWeight: 400 },
    
    filterRow:  { display: "flex", gap: 6, marginBottom: 24, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" },
    filterBtn: (a) => ({ whiteSpace: "nowrap", flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: `1px solid ${a ? "#FCB606" : c.border}`, background: a ? "#FCB606" : c.card, color: a ? "#000" : c.muted, fontSize: 13, fontWeight: a ? 600 : 500, cursor: "pointer", fontFamily: "inherit" }),
    
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
      background: c.nav, borderTop: `1px solid ${c.border}`, display: "flex", zIndex: 100,
      paddingTop: "8px", paddingBottom: "calc(16px + env(safe-area-inset-bottom, 0px))", boxShadow: isDark ? "none" : "0 -4px 20px rgba(0,0,0,0.06)"
    },
    navBtn: (a) => ({
      flex: 1, paddingTop: 10, paddingBottom: 10, backgroundColor: "transparent", WebkitAppearance: "none", border: "none",
      color: a ? "#FCB606" : c.muted, fontSize: 11, fontWeight: a ? 700 : 500, cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 4, fontFamily: "inherit"
    }),
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 200, padding: "0", backdropFilter: "blur(5px)" },
    modal: { background: c.card, borderTop: `1px solid ${c.border}`, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)" },
    
    fab: { position: "fixed", bottom: "calc(90px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", width: "90%", maxWidth: 430, background: "#FCB606", color: "#000", border: "none", borderRadius: 20, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 8px 24px rgba(252, 182, 6, 0.3)", zIndex: 95, display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }
  };

  const IconBadge = ({ emoji, bg, color }) => (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
      {emoji}
    </div>
  );

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PF';

  if (!loaded) return (
    <div style={{ background: c.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${c.border}`, borderTop: "2px solid #FCB606", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <span style={{ color: c.muted, fontSize: 14, fontFamily: "'Montserrat', sans-serif" }}>Conectando...</span>
    </div>
  );

  return (
    <div style={s.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; } 
        html, body {
          background: ${c.bg} !important; 
          color: ${c.text}; 
          margin: 0; padding: 0; 
          width: 100vw; max-width: 100%; 
          overflow-x: hidden; overflow-y: auto; 
          font-family: 'Montserrat', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }
        body * { font-weight: ${useBold ? '700' : 'inherit'}; }
        #root { background: ${c.bg}; min-height: 100vh; width: 100%; max-width: 100%; overflow-x: hidden; overflow-y: auto; }
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>

      {viewAll ? (
        <>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.bg, position: "sticky", top: 0, zIndex: 10 }}>
            <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => { setViewAll(false); window.scrollTo(0, 0); }}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 600 }}>Movimientos</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowEmailModal(true)}>✉️</button>
              <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}>📅</button>
            </div>
          </div>
          {showVtFiltro && (
            <div style={{ padding: "16px 20px", background: c.card, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ ...s.label, textAlign: "center" }}>Filtrar por rango de fecha</div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: c.muted, marginBottom: 4, textAlign: "center", fontWeight: 500 }}>Del</div>
                  <input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center" }} />
                </div>
                <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                  <div style={{ fontSize: 12, color: c.muted, marginBottom: 4, textAlign: "center", fontWeight: 500 }}>Al</div>
                  <input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center" }} />
                </div>
              </div>
              {(vtFechaDesde || vtFechaHasta) && (
                <button style={{ width: "100%", fontSize: 14, fontWeight: 600, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4, fontFamily: "inherit" }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}>× Limpiar fechas</button>
              )}
            </div>
          )}
          <div style={s.section}>
            <div style={{ ...s.label, textAlign: "center" }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "32px", fontWeight: 500 }}>No se encontraron movimientos</div>
            ) : (
              gastosVerTodos.map(g => {
                const cat = categorias.find(c => c.id === g.categoria);
                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                        {cat && (
                          <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                            {cat.label.split(" ")[0]}
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text }}>
                            {getDisplayDesc(g, categorias)}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)} · {g.tipo === "gasto" ? "Gastos" : "Ingresos"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 700, color: g.tipo === "gasto" ? c.text : c.green, marginRight: 4 }}>
                          {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button style={{...s.editBtn, padding: 2}} onClick={() => abrirEdicion(g)}>✏️</button>
                          <button style={{...s.deleteBtn, padding: 2}} onClick={() => eliminar(g.id)}>×</button>
                        </div>
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
          <div style={s.header}>
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", position: "relative", marginBottom: 4 }}>
              <button onClick={() => setShowMenu(true)} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.green, fontSize: 26, cursor: "pointer", position: "absolute", left: 0, padding: 0 }}>☰</button>
              <h1 style={s.title}>Ahorro Meta</h1>
              <button onClick={() => window.location.reload()} style={{ ...s.refreshBtn, position: "absolute", right: 0 }}>🔄</button>
            </div>
            <p style={{ ...s.subtitle, textAlign: "center", width: "100%", display: "block" }}>Día {diasTranscurridosPlan} de {diasTotalPlan}</p>
          </div>

          {error && <div style={s.errorCard}>⚠️ {error}</div>}

          {tab === "hoy" && (
            <div style={s.section}>
              <div style={s.metaCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 500, color: "#FFF", marginBottom: 6 }}>Tu progreso</div>
                    <div style={{ ...s.bigNum, color: "#FFF" }}>{formatMoney(Math.max(0, ahorroAcumulado))}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#AAA", fontWeight: 500, marginBottom: 6 }}>Falta ahorrar</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#FCB606" }}>{formatMoney(Math.max(0, metaTotalNum - ahorroAcumulado))}</div>
                  </div>
                </div>

                <div style={{ ...s.progressBg, marginBottom: 16 }}>
                  <div style={s.progressFill(progreso)} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#AAA", fontWeight: 500, marginBottom: 8 }}>
                  <span>{progreso.toFixed(1)}%</span>
                  <span>de {formatMoney(metaTotalNum)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#AAA", fontWeight: 500 }}>
                  <span>A este ritmo llegarás</span>
                  <span style={{ color: c.green, fontWeight: 700 }}>{proyeccionTexto}</span>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Resumen de hoy</h3>
              </div>

              <div style={s.grid2}>
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <IconBadge emoji="⬇️" bg={c.iconBgGreen} color={c.green} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.muted }}>Ingresos hoy</span>
                  </div>
                  <div style={{ ...s.greenNum, textAlign: "center", marginTop: 8 }}>{formatMoney(totalIngresosHoy)}</div>
                </div>
                
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <IconBadge emoji="⬆️" bg={c.iconBgRed} color={c.red} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.muted }}>Gastos hoy</span>
                  </div>
                  <div style={{ ...s.redNum, textAlign: "center", marginTop: 8 }}>{formatMoney(totalGastadoHoy)}</div>
                </div>

                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <IconBadge emoji="🐷" bg={c.iconBgYellow} color="#FCB606" />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.muted }}>Ahorro hoy</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: "#FCB606", textAlign: "center", marginTop: 8 }}>{formatMoney(totalIngresosHoy - totalGastadoHoy)}</div>
                </div>

                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    <IconBadge emoji="🎯" bg={c.iconBgPurple} color={c.iconTextPurple} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: c.muted }}>Límite / día</span>
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: c.text, textAlign: "center", marginTop: 8 }}>{formatMoney(ahorroMetaDiario)}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Últimos movimientos</h3>
                <button onClick={() => { setViewAll(true); window.scrollTo(0, 0); }} style={{ background: "none", border: "none", color: c.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Ver todos
                </button>
              </div>

              {movimientosHoy.length > 0 ? (
                <div style={{ ...s.card, padding: "8px 16px" }}>
                  {movimientosHoy.map((g, i, arr) => {
                    const cat = categorias.find(c => c.id === g.categoria);
                    const isLast = i === arr.length - 1;
                    return (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${c.border}` }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                          {cat && (
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                              {cat.label.split(" ")[0]}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text }}>
                              {getDisplayDesc(g, categorias)}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)} · {g.tipo === "gasto" ? "Gastos" : "Ahorros"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <span style={{ fontSize: 16, fontWeight: 700, color: g.tipo === "gasto" ? c.text : c.green }}>
                            {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0", fontWeight: 500 }}>Aún no hay movimientos hoy</div>
              )}

              <button style={s.fab} onClick={() => setShowAddModal(true)}>
                <span style={{ fontSize: 20 }}>+</span> Nuevo movimiento
              </button>
            </div>
          )}

          {tab === "resumen" && (
            <div style={s.section}>
              <div className="hide-scroll" style={s.filterRow}>
                {[{ id: "hoy", label: "Hoy" }, { id: "semana", label: "7 días" }, { id: "mes", label: "Este mes" }, { id: "todo", label: "Todo" }, { id: "rango", label: "📅 Rango" }].map(f => (
                  <button key={f.id} style={s.filterBtn(filtroResumen === f.id)} onClick={() => setFiltroResumen(f.id)}>{f.label}</button>
                ))}
              </div>
              {filtroResumen === "rango" && (
                <div style={{ ...s.card, padding: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
                    <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: c.muted, marginBottom: 5, textAlign: "center", fontWeight: 500 }}>Del</div>
                      <input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={{ ...s.input, textAlign: "center" }} />
                    </div>
                    <div style={{ flex: 1, width: "100%", minWidth: 0 }}>
                      <div style={{ fontSize: 12, color: c.muted, marginBottom: 5, textAlign: "center", fontWeight: 500 }}>Al</div>
                      <input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center" }} />
                    </div>
                  </div>
                  {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                    <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}>× Limpiar fechas</button>
                  )}
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>General</h3>
              </div>

              <div style={s.grid2}>
                <div style={{ ...s.card, textAlign: "center", marginBottom: 0 }}><div style={s.label}>Total gastado</div><div style={s.redNum}>{formatMoney(totalGastadoR)}</div></div>
                <div style={{ ...s.card, textAlign: "center", marginBottom: 0 }}><div style={s.label}>Total ingresos</div><div style={s.greenNum}>{formatMoney(totalIngresosR)}</div></div>
                <div style={{ ...s.card, textAlign: "center", marginBottom: 0 }}><div style={s.label}>Ahorro período</div><div style={{ ...s.smallNum, color: ahorroR >= 0 ? "#FCB606" : c.red }}>{formatMoney(ahorroR)}</div></div>
                <div style={{ ...s.card, textAlign: "center", marginBottom: 0 }}><div style={s.label}>Gasto prom/día</div><div style={s.smallNum}>{formatMoney(gastoDiarioProm)}</div></div>
              </div>

              <div style={{ ...s.card, background: isDark ? "#0F1A0F" : "#F0FDF4", border: `1px solid ${isDark ? "#1A3A1A" : "#BBF7D0"}`, textAlign: "center", padding: "24px 16px", marginBottom: 24 }}>
                <div style={{ ...s.label, textAlign: "center", color: isDark ? c.muted : "#065F46", marginBottom: 0 }}>Proyección inteligente</div>
                <div style={{ fontSize: 16, color: isDark ? "#FCB606" : "#047857", fontWeight: 700, marginTop: 8 }}>📈 A este ritmo llegarás a tu meta {proyeccionTexto}</div>
                <div style={{ fontSize: 13, color: c.muted, marginTop: 6, fontWeight: 500 }}>Basado en un ahorro diario promedio de {formatMoney(ahorroDiarioProm > 0 ? ahorroDiarioProm : 0)}</div>
              </div>

              {ingMensual > 0 && (
                <div style={s.metaCard}>
                  <div style={{ ...s.metaLabel, textAlign: "center", marginBottom: 0 }}>Para lograr tu meta</div>
                  <div style={{ fontSize: 14, color: "#CCC", lineHeight: 1.9, marginTop: 12, textAlign: "center", fontWeight: 500 }}>
                    <div>📥 Ingreso mensual: <strong style={{ color: "#E8E0D0", fontWeight: 700 }}>{formatMoney(ingMensual)}</strong></div>
                    <div>🎯 Ahorro necesario/mes: <strong style={{ color: "#FCB606", fontWeight: 700 }}>{formatMoney(ahorroMetaDiario * 30)}</strong></div>
                    <div>💸 Gasto máximo/mes: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(ingMensual - (ahorroMetaDiario * 30))}</strong></div>
                    <div>📆 Gasto máximo/día: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(presupuestoDiario)}</strong></div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Gastos últimos 7 días</h3>
              </div>
              <div style={{...s.card, marginBottom: 24}}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 100, marginTop: 8 }}>
                  {gastosUltimos7.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                      <div style={{ width: "100%", height: `${d.total ? Math.max(8, (d.total / maxBar) * 80) : 4}px`, background: d.fecha === fechaHoy ? "#FCB606" : c.border, borderRadius: "4px 4px 0 0" }} />
                      <span style={{ fontSize: 11, fontWeight: 500, color: d.fecha === fechaHoy ? "#FCB606" : c.muted }}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {porCategoriaR.length > 0 && (
                <>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Por categoría</h3>
                  </div>
                  <div style={s.card}>
                    {porCategoriaR.map((cat, i, arr) => (
                      <div key={cat.id} style={{ marginBottom: i === arr.length - 1 ? 0 : 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 14, fontWeight: 600, color: c.text }}>{cat.label}</span>
                          <span style={{ fontSize: 15, fontWeight: 700, color: cat.color }}>{formatMoney(cat.total)}</span>
                        </div>
                        <div style={{ background: c.border, borderRadius: 4, height: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(cat.total / maxCatR) * 100}%`, background: cat.color, borderRadius: 4 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {tab === "historial" && (
            <div style={s.section}>
              <div style={{ display: "flex", gap: 12, marginBottom: 24, width: "100%" }}>
                <button style={s.btnSecondary} onClick={() => exportarCSV(gastosFiltradosHist, categorias)}>📊 Excel</button>
                <button style={s.btnSecondary} onClick={() => exportarPDF(gastosFiltradosHist, categorias)}>📄 PDF</button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Filtros</h3>
              </div>

              <div style={{...s.card, marginBottom: 24}}>
                <div style={{ ...s.label, textAlign: "center" }}>Filtrar por categoría</div>
                <div className="hide-scroll" style={{ ...s.filterRow, marginTop: 16 }}>
                  <button style={s.filterBtn(filtroHistCat === "todas")} onClick={() => setFiltroHistCat("todas")}>Todas</button>
                  {categorias.map(c => <button key={c.id} style={s.filterBtn(filtroHistCat === c.id)} onClick={() => setFiltroHistCat(c.id)}>{c.label}</button>)}
                </div>
                <div style={{ ...s.label, marginTop: 28, textAlign: "center" }}>Filtrar por rango de fecha</div>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 16 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: c.muted, marginBottom: 6, textAlign: "center", fontWeight: 500 }}>Del</div><input type="date" value={filtroHistFechaDesde} onChange={e => setFiltroHistFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center" }} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: c.muted, marginBottom: 6, textAlign: "center", fontWeight: 500 }}>Al</div><input type="date" value={filtroHistFechaHasta} onChange={e => setFiltroHistFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center" }} /></div>
                </div>
                {(filtroHistFechaDesde || filtroHistFechaHasta) && <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroHistFechaDesde(""); setFiltroHistFechaHasta(""); }}>× Limpiar fechas</button>}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{gastosFiltradosHist.length} Movimientos</h3>
              </div>

              {gastosFiltradosHist.length === 0 ? <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "40px 20px", fontWeight: 500 }}>Sin movimientos con estos filtros</div> : (
                <div style={{...s.card, padding: "8px 16px"}}>
                  {gastosFiltradosHist.map((g, i, arr) => {
                    const cat = categorias.find(c => c.id === g.categoria);
                    const isLast = i === arr.length - 1;
                    return (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${c.border}` }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                          {cat && (
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                              {cat.label.split(" ")[0]}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text }}>
                              {getDisplayDesc(g, categorias)}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)} | {g.tipo === "gasto" ? "Gastos" : "Ahorros"}</div>
                          </div>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: g.tipo === "gasto" ? c.text : c.green }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === "config" && (
            <div style={s.section}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Plan actual</h3>
              </div>

              <div style={{...s.card, marginBottom: 24}}>
                <div style={{ ...s.label, textAlign: "center" }}>DEFINIR META DE AHORRO (S/)</div>
                <input style={{ ...s.input, marginTop: 12, marginBottom: 24, fontSize: 24, textAlign: "center", color: "#FCB606", fontWeight: 700 }} type={isEditingMeta ? "number" : "text"} placeholder="Ej: 100000" value={isEditingMeta ? metaAhorro : (metaAhorro ? formatMoney(metaAhorro) : "")} onFocus={() => setIsEditingMeta(true)} onBlur={() => setIsEditingMeta(false)} onChange={e => setMetaAhorro(e.target.value)} />
                
                <div style={{ ...s.label, textAlign: "center" }}>PERÍODO DE AHORRO</div>
                <div style={{ display: "flex", gap: 12, marginTop: 12, marginBottom: 24 }}>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: c.muted, marginBottom: 6, textAlign: "center", fontWeight: 500 }}>DEL</div><input style={{ ...s.input, textAlign: "center" }} type="date" value={fechaInicioPlan} onChange={e => setFechaInicioPlan(e.target.value)} /></div>
                  <div style={{ flex: 1 }}><div style={{ fontSize: 12, color: c.muted, marginBottom: 6, textAlign: "center", fontWeight: 500 }}>AL</div><input style={{ ...s.input, textAlign: "center" }} type="date" value={fechaFinPlan} onChange={e => setFechaFinPlan(e.target.value)} /></div>
                </div>
                
                <div style={{ ...s.label, textAlign: "center" }}>INGRESO MENSUAL (S/)</div>
                <input style={{ ...s.input, marginTop: 12, marginBottom: 24, fontSize: 20, textAlign: "center", color: c.green, fontWeight: 700 }} type={isEditingIngreso ? "number" : "text"} placeholder="Ej: 5000" value={isEditingIngreso ? ingresoMensual : (ingresoMensual ? formatMoney(ingresoMensual) : "")} onFocus={() => setIsEditingIngreso(true)} onBlur={() => setIsEditingIngreso(false)} onChange={e => setIngresoMensual(e.target.value)} />
                <button style={s.btnPrimary} onClick={guardarConfig} disabled={saving}>{saving ? "Guardando..." : "Guardar configuración"}</button>
              </div>

              {ingMensual > 0 && metaTotalNum > 0 && (
                <div style={s.metaCard}>
                  <div style={{ ...s.metaLabel, textAlign: "center", marginBottom: 0 }}>Tu plan para {formatMoney(metaTotalNum)}</div>
                  <div style={{ fontSize: 14, color: "#CCC", lineHeight: 1.9, marginTop: 12, textAlign: "center", fontWeight: 500 }}>
                    <div>📥 Ingreso mensual: <strong style={{ color: "#E8E0D0", fontWeight: 700 }}>{formatMoney(ingMensual)}</strong></div>
                    <div>🎯 Ahorro necesario/mes: <strong style={{ color: "#FCB606", fontWeight: 700 }}>{formatMoney(ahorroMetaDiario * 30)}</strong></div>
                    <div>💸 Gasto máximo/mes: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(ingMensual - (ahorroMetaDiario * 30))}</strong></div>
                    <div>📆 Gasto máximo/día: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(presupuestoDiario)}</strong></div>
                  </div>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Categorías</h3>
              </div>

              <div style={{...s.card, marginBottom: 12}}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{...s.label, marginBottom:0}}>Categorías Base</div></div>
                {safeBase.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "12px 0" }}>No hay categorías base</div> : safeBase.map((cat, i, arr) => (
                  editandoCatBase === cat.id ? (
                    <div key={cat.id} style={{ background: c.input, borderRadius: 12, padding: 16, margin: "8px 0" }}>
                      <input style={{ ...s.input, marginBottom: 12 }} value={editCatBaseLabel} onChange={e => setEditCatBaseLabel(e.target.value)} />
                      <div style={{ ...s.label, marginBottom: 8 }}>Elige un color</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                        {COLORES_CUSTOM.map(col => <div key={col} onClick={() => setEditCatBaseColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: editCatBaseColor === col ? `3px solid ${c.text}` : "3px solid transparent" }} />)}
                      </div>
                      <div style={{ display: "flex", gap: 10 }}><button style={s.btnSecondary} onClick={() => setEditandoCatBase(null)}>Cancelar</button><button style={s.btnPrimary} onClick={guardarEdicionCatBase}>Guardar</button></div>
                    </div>
                  ) : (
                    <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                           {cat.label.split(" ")[0]}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{cat.label.substring(cat.label.indexOf(" ") + 1)}</span>
                      </div>
                      <div><button style={s.editBtn} onClick={() => abrirEdicionCatBase(cat)}>✏️</button><button style={s.deleteBtn} onClick={() => eliminarCategoriaBase(cat.id)}>×</button></div>
                    </div>
                  )
                ))}
              </div>

              <div style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{...s.label, marginBottom:0}}>Categorías personalizadas</div><button style={{ backgroundColor: "#FCB606", WebkitAppearance: "none", color: "#000", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 700, fontFamily: "inherit", fontSize: 13 }} onClick={() => setShowNuevaCat(v => !v)}>+ Nueva</button></div>
                {showNuevaCat && (
                  <div style={{ background: c.input, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                    <input style={{ ...s.input, marginBottom: 12 }} placeholder="Ej: 🛍️ Compras" value={nuevaCatLabel} onChange={e => setNuevaCatLabel(e.target.value)} />
                    <div style={{ ...s.label, marginBottom: 8 }}>Elige un color</div>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>{COLORES_CUSTOM.map(col => <div key={col} onClick={() => setNuevaCatColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: nuevaCatColor === col ? `3px solid ${c.text}` : "3px solid transparent" }} />)}</div>
                    <div style={{ display: "flex", gap: 10 }}><button style={s.btnSecondary} onClick={() => setShowNuevaCat(false)}>Cancelar</button><button style={s.btnPrimary} onClick={agregarCategoria}>Agregar</button></div>
                  </div>
                )}
                {safeExtra.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "12px 0" }}>Aún no hay categorías</div> : safeExtra.map((cat, i, arr) => (
                  editandoCat === cat.id ? (
                    <div key={cat.id} style={{ background: c.input, borderRadius: 12, padding: 16, margin: "8px 0" }}>
                      <input style={{ ...s.input, marginBottom: 12 }} value={editCatLabel} onChange={e => setEditCatLabel(e.target.value)} />
                      <div style={{ ...s.label, marginBottom: 8 }}>Elige un color</div>
                      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>{COLORES_CUSTOM.map(col => <div key={col} onClick={() => setEditCatColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: editCatColor === col ? `3px solid ${c.text}` : "3px solid transparent" }} />)}</div>
                      <div style={{ display: "flex", gap: 10 }}><button style={s.btnSecondary} onClick={() => setEditandoCat(null)}>Cancelar</button><button style={s.btnPrimary} onClick={guardarEdicionCat}>Guardar</button></div>
                    </div>
                  ) : (
                    <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                           {cat.label.split(" ")[0]}
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 600 }}>{cat.label.substring(cat.label.indexOf(" ") + 1)}</span>
                      </div>
                      <div><button style={s.editBtn} onClick={() => abrirEdicionCat(cat)}>✏️</button><button style={s.deleteBtn} onClick={() => eliminarCategoria(cat.id)}>×</button></div>
                    </div>
                  )
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 24 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.red }}>Opciones avanzadas</h3>
              </div>

              <div style={{ ...s.card, borderColor: isDark ? "#3A1A1A" : "#FECACA", padding: 20 }}>
                <div style={{ ...s.label, marginBottom: 16, color: c.red, textAlign: "center" }}>Zona de peligro</div>
                <button style={{ ...s.btnSecondary, padding: 14, color: c.red, borderColor: isDark ? "#5A1A1A" : "#F87171", fontWeight: 700 }} onClick={async () => {
                  if (window.prompt("Escribe BORRAR TODO para confirmar:") === "BORRAR TODO") {
                    await supabase.from("gastos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                    setGastos([]); showToast("Todos los movimientos eliminados", c.muted);
                  }
                }}>Eliminar todos los movimientos</button>
              </div>
            </div>
          )}

          <div style={s.navBar}>
            {[{ id: "hoy", icon: "🏠", label: "Inicio" }, { id: "resumen", icon: "📊", label: "Resumen" }, { id: "historial", icon: "📋", label: "Historial" }, { id: "config", icon: "⚙️", label: "Config" }].map(n => (
              <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
                <span style={{ fontSize: 24, marginBottom: 2 }}>{n.icon}</span>
                <span style={{ fontFamily: "'Montserrat', sans-serif" }}>{n.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {showApariencia && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => { setShowApariencia(false); setShowMenu(true); }} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: "700" }}>Pantalla y brillo</h2>
          </div>

          <div style={{ fontSize: 14, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: 700 }}>Aspecto</div>
          <div style={{ background: c.card, borderRadius: 16, padding: "20px 20px 0", marginBottom: 24, border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
            
            <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: 24 }}>
              <div onClick={() => { setTheme("light"); showToast("Tema Claro activado"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 66, height: 130, borderRadius: 12, background: "#FFF", border: theme === "light" ? "3px solid #34C759" : "1px solid #CCC", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#E5E5E5", borderRadius: 4 }} />
                  <div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#E5E5E5", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Claro</span>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "light" ? "none" : `1px solid ${c.muted}`, background: theme === "light" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {theme === "light" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}
                </div>
              </div>

              <div onClick={() => { setTheme("dark"); showToast("Tema Oscuro activado"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <div style={{ width: 66, height: 130, borderRadius: 12, background: "#111", border: theme === "dark" ? "3px solid #34C759" : "1px solid #444", position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#333", borderRadius: 4 }} />
                  <div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#333", borderRadius: 4 }} />
                </div>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Oscuro</span>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "dark" ? "none" : `1px solid ${c.muted}`, background: theme === "dark" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {theme === "dark" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}
                </div>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${c.border}`, padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Automático</span>
              <div onClick={() => setIsAutoTheme(!isAutoTheme)} style={{ width: 50, height: 30, background: isAutoTheme ? "#34C759" : c.border, borderRadius: 15, position: "relative", cursor: "pointer", transition: "0.3s" }}>
                <div style={{ width: 26, height: 26, background: "#FFF", borderRadius: "50%", position: "absolute", top: 2, left: isAutoTheme ? 22 : 2, transition: "0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}/>
              </div>
            </div>

            {isAutoTheme && (
              <div style={{ borderTop: `1px solid ${c.border}`, padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
                <span style={{ fontSize: 16, fontWeight: 600 }}>Opciones</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 400 }}>Claro hasta el atardecer</span>
                  <span style={{ color: c.muted, fontSize: 18 }}>›</span>
                </div>
              </div>
            )}
          </div>

          <div style={{ background: c.card, borderRadius: 16, padding: "0 20px", border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
            <div style={{ padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, cursor: "pointer" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Tamaño del texto</span>
              <span style={{ color: c.muted, fontSize: 18 }}>›</span>
            </div>
            <div style={{ padding: "16px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 16, fontWeight: 600 }}>Negritas</span>
              <div onClick={() => setUseBold(!useBold)} style={{ width: 50, height: 30, background: useBold ? "#34C759" : c.border, borderRadius: 15, position: "relative", cursor: "pointer", transition: "0.3s" }}>
                <div style={{ width: 26, height: 26, background: "#FFF", borderRadius: "50%", position: "absolute", top: 2, left: useBold ? 22 : 2, transition: "0.3s", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}/>
              </div>
            </div>
          </div>
          
          <button style={{ ...s.btnPrimary, marginTop: 30 }} onClick={() => { guardarConfig(); setShowApariencia(false); setShowMenu(true); }}>Guardar Preferencias</button>
        </div>
      )}

      {showMenu && !showApariencia && !profileScreen && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 9999, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => setShowMenu(false)} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 22, color: c.text, fontWeight: 700 }}>Mi Perfil</h2>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, color: "#FCB606", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 700 }}>Mi cuenta</div>
            <MenuItem icon="🪪" text="Mis datos" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("datos")} />
            <MenuItem icon="🔒" text="Cambiar mi clave" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("clave")} />
            <MenuItem icon="🏆" text="Mis logros / Insignias" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("logros")} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, color: "#FCB606", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 700 }}>Ajustes</div>
            <MenuItem icon="🎯" text="Mi Meta de Ahorro" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => { setShowMenu(false); setTab("config"); }} />
            <MenuItem icon="🎨" text="Apariencia (Tema Claro/Oscuro)" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => { setShowApariencia(true); setProfileScreen(null); }} />
            <MenuItem icon="📊" text="Exportar Reportes" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => { setShowMenu(false); setShowEmailModal(true); }} />
            <MenuItem icon="🎧" text="Centro de ayuda" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("ayuda")} />
          </div>

          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <MenuItem icon="🚪" text="Cerrar sesión" color={c.red} mutedColor={c.muted} border={c.border} />
            <MenuItem icon="🗑️" text="Eliminar mi cuenta" color={c.red} mutedColor={c.muted} border={c.border} />
          </div>
        </div>
      )}

      {showMenu && profileScreen === "datos" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => setProfileScreen(null)} style={{ background: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis datos</h2>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FCB606", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#000" }}>
              {userInitials}
            </div>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Nombre completo</div>
            <input style={s.input} value={userName} onChange={e => setUserName(e.target.value)} placeholder="Ej. Paul Flores" />
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Correo electrónico</div>
            <input style={{ ...s.input, opacity: 0.6 }} value="paul@ejemplo.com" disabled />
            <div style={{ fontSize: 12, color: c.muted, marginTop: 8, fontWeight: 400 }}>El correo no se puede cambiar por ahora.</div>
          </div>
          
          <button style={s.btnPrimary} onClick={guardarPerfil} disabled={saving}>{saving ? "Guardando..." : "Guardar cambios"}</button>
        </div>
      )}

      {showMenu && profileScreen === "clave" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => setProfileScreen(null)} style={{ background: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Cambiar mi clave</h2>
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Contraseña actual</div>
            <input type="password" style={s.input} placeholder="••••••••" />
          </div>
          
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Nueva contraseña</div>
            <input type="password" style={s.input} placeholder="••••••••" />
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: c.muted, marginBottom: 8 }}>Repetir nueva contraseña</div>
            <input type="password" style={s.input} placeholder="••••••••" />
          </div>
          
          <button style={s.btnPrimary} onClick={() => { showToast("Clave actualizada ✓", c.green); setProfileScreen(null); }}>Actualizar clave</button>
        </div>
      )}

      {showMenu && profileScreen === "logros" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => setProfileScreen(null)} style={{ background: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis logros</h2>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", border: `2px solid #FCB606` }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🌟</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Primer Paso</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4, fontWeight: 500 }}>Registraste tu primer movimiento.</div>
            </div>
            
            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", border: `2px solid #FCB606` }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🔥</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Constante</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4, fontWeight: 500 }}>Usaste la app por 3 días seguidos.</div>
            </div>

            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", opacity: 0.4, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 44, marginBottom: 16, filter: "grayscale(100%)" }}>🎯</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Meta Alcanzada</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4, fontWeight: 500 }}>Llegaste al 100% de tu ahorro.</div>
            </div>

            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", opacity: 0.4, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 44, marginBottom: 16, filter: "grayscale(100%)" }}>🐷</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Súper Ahorrador</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4, fontWeight: 500 }}>Ahorraste más del 50% en un mes.</div>
            </div>
          </div>
        </div>
      )}

      {showMenu && profileScreen === "ayuda" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => setProfileScreen(null)} style={{ background: "none", border: "none", color: "#FCB606", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Centro de ayuda</h2>
          </div>
          
          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo edito una categoría?</div>
            <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Ve a Configuración &gt; Categorías Personalizadas y presiona el ícono del lápiz junto a la categoría que deseas modificar.</div>
          </div>

          <div style={{ ...s.card, padding: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>¿Cómo funciona la proyección?</div>
            <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Calculamos tu promedio de ahorro diario desde que iniciaste tu plan, y con eso estimamos en qué fecha exacta llegarás a tu meta si mantienes ese ritmo.</div>
          </div>

          <div style={{ ...s.card, padding: 16, marginBottom: 24 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 8 }}>Mi meta se reinició, ¿qué hago?</div>
            <div style={{ fontSize: 13, color: c.muted, lineHeight: 1.5, fontWeight: 500 }}>Verifica que el periodo de ahorro (Fechas Del / Al) en tu configuración abarque el día de hoy.</div>
          </div>

          <a href="mailto:soporte@ahorrometa.com" style={{ ...s.btnSecondary, display: "block", textAlign: "center", textDecoration: "none", padding: "16px 0", fontSize: 15 }}>
            ✉️ Contactar a soporte
          </a>
        </div>
      )}

      {showAddModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Registrar Movimiento</h3>
              <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button>
            </div>
            
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button style={s.tipoBtn(form.tipo === "gasto", c.red)} onClick={() => setForm(f => ({ ...f, tipo: "gasto" }))}>− Gasto</button>
              <button style={s.tipoBtn(form.tipo === "ingreso", c.green)} onClick={() => setForm(f => ({ ...f, tipo: "ingreso" }))}>+ Ingreso</button>
            </div>
            
            <input autoFocus style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
            
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
            </div>
            
            <button style={{...s.btnPrimary, padding: "16px"}} onClick={agregarMovimiento} disabled={saving}>{saving ? "Guardando..." : "Guardar Registro"}</button>
          </div>
        </div>
      )}

      {editando && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditando(null); }}>
          <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Editar Movimiento</h3>
              <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button style={s.tipoBtn(editForm.tipo === "gasto", c.red)} onClick={() => setEditForm(f => ({ ...f, tipo: "gasto" }))}>− Gasto</button>
              <button style={s.tipoBtn(editForm.tipo === "ingreso", c.green)} onClick={() => setForm(f => ({ ...f, tipo: "ingreso" }))}>+ Ingreso</button>
            </div>
            <input style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </select>
              <input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} />
            </div>
            <button style={{...s.btnPrimary, padding: "16px"}} onClick={guardarEdicion} disabled={saving}>{saving ? "Guardando..." : "Guardar Cambios"}</button>
          </div>
        </div>
      )}

      {showEmailModal && (
        <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowEmailModal(false); }}>
          <div style={{ ...s.modal, textAlign: "center", animation: "slideUp 0.3s ease-out" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: 20, color: c.text, fontWeight: 700 }}>Enviar reporte</h3>
            <p style={{ margin: "0 0 20px", fontSize: 14, color: c.muted, fontWeight: 500 }}>Ingresa el e-mail del destinatario.</p>
            <input style={{ ...s.input, marginBottom: 20, textAlign: "center", fontWeight: 500 }} type="email" placeholder="correo@ejemplo.com" value={emailDestino} onChange={e => setEmailDestino(e.target.value)} />
            <div style={{ display: "flex", gap: 12, borderTop: `1px solid ${c.border}`, paddingTop: 16 }}>
              <button style={{ flex: 1, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.text, fontSize: 16, cursor: "pointer", padding: "10px 0", fontFamily: "inherit", fontWeight: 600 }} onClick={() => setShowEmailModal(false)}>Cancelar</button>
              <button style={{ flex: 1, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#4D96FF", fontSize: 16, cursor: "pointer", padding: "10px 0", fontWeight: 700, fontFamily: "inherit" }} onClick={() => { showToast("Enviado con éxito", c.green); setShowEmailModal(false); setEmailDestino(""); }}>Enviar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}