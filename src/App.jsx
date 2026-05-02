import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { 
  Home, PieChart, FileText, Settings, Menu, RefreshCw, 
  ArrowDownToLine, ArrowUpFromLine, PiggyBank, Target, 
  Edit2, Trash2, X, Calendar, Mail, CheckCircle2, ChevronRight,
  UserCircle, Lock, Trophy, Palette, Download, Headphones, LogOut, AlertTriangle,
  BarChart2, Plane, Laptop, ShieldCheck, TrendingUp, Plus, PlusCircle, ArrowLeft, Clock,
  ChevronUp, Minus, ChevronDown, Circle, MoreVertical
} from "lucide-react";

const SUPABASE_URL = "https://jboazxmcmvvcscqeerbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2F6eG1jbXZ2Y3NjcWVlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMxMjksImV4cCI6MjA5MjcyOTEyOX0.zFKEHscM7-PaXqoSgbk7ra8JFZ3Hh69JJKktm7N4IwY";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CURRENCY = "S/";

const INGRESOS_DEFAULT = [
  { id: "sueldo",          label: "💰 Sueldo/Salario",    color: "#6BCB77" },
  { id: "negocio",         label: "💼 Negocio/Ventas",    color: "#4D96FF" },
  { id: "inversiones",     label: "📈 Inversiones",       color: "#C77DFF" },
];

const GASTOS_DEFAULT = [
  { id: "comida",          label: "🍽️ Comida",           color: "#E8845A" },
  { id: "transporte",      label: "🚌 Transporte",         color: "#5A9BE8" },
  { id: "trabajo",         label: "💼 Trabajo/Negocio",    color: "#7BE85A" },
  { id: "salud",           label: "❤️ Salud",             color: "#E85A8A" },
  { id: "hogar",           label: "🏠 Hogar",              color: "#C05AE8" },
  { id: "entretenimiento", label: "🎮 Entretenimiento",    color: "#E8D85A" },
  { id: "otros",           label: "📦 Otros",              color: "#8A9BA8" },
];

const METAS_INICIALES = [
  { id: "m1", nombre: "Nueva Laptop", montoObjetivo: 4000, aporteInicial: 2850, fechaLimite: "2025-12-25", prioridad: "alta", tipo: "libre", icono: "💻" },
  { id: "m2", nombre: "Viaje a Cusco", montoObjetivo: 2500, aporteInicial: 1200, fechaLimite: "2025-04-15", prioridad: "media", tipo: "libre", icono: "✈️" },
  { id: "m3", nombre: "Fondo de Emergencia", montoObjetivo: 10000, aporteInicial: 3200, fechaLimite: "", prioridad: "baja", tipo: "libre", icono: "🏠" }
];

const COLORES_CUSTOM = ["#FF6B6B","#FF803C","#6BCB77","#4D96FF","#C77DFF","#FF9F1C","#2EC4B6","#E71D36","#F72585","#B5E48C"];
const PASTEL_COLORS = ["#A7F3D0", "#BFDBFE", "#FED7AA", "#E9D5FF", "#FECACA", "#FDE047"];
const METAS_ICONS = ["💻", "✈️", "🏠", "🚗", "🛍️", "🎓", "📱"];

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

const getIcono = (label) => {
  if (!label || !label.trim()) return "📌";
  const text = label.trim();
  const arr = text.split(" ");
  if (arr.length > 1 && !/[a-zA-Z0-9]/.test(arr[0])) {
    return arr[0];
  }
  const firstChar = Array.from(text)[0];
  return firstChar ? firstChar.toUpperCase() : "📌";
};

const getTexto = (label) => {
  if (!label || !label.trim()) return "Sin nombre";
  const text = label.trim();
  const arr = text.split(" ");
  if (arr.length > 1 && !/[a-zA-Z0-9]/.test(arr[0])) {
    return arr.slice(1).join(" ");
  }
  const firstChar = Array.from(text)[0];
  if (firstChar && !/[a-zA-Z0-9]/.test(firstChar)) {
      return Array.from(text).slice(1).join("").trim() || text;
  }
  return text;
};

const formatCatName = (label) => {
  const clean = getTexto(label);
  return clean.length > 8 ? clean.substring(0, 8) + "..." : clean;
};

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

const getUITime = (isoStr) => {
  if (!isoStr) return "";
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  const limaDate = new Date(dt.getTime() - 18000000);
  let h = limaDate.getUTCHours();
  let m = limaDate.getUTCMinutes();
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
  h = h % 12;
  h = h ? h : 12; 
  m = m < 10 ? '0' + m : m;
  return `${h}:${m} ${ampm}`;
};

const formatGroupDate = (dateStr) => {
  const todayIso = hoy();
  const ayerDate = new Date(Date.now() - 18000000 - 86400000);
  const ayerIso = ayerDate.toISOString().split("T")[0];

  const d = new Date(dateStr + "T12:00:00Z");
  const day = d.getDate();
  const meses = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];
  
  if (dateStr === todayIso) return `Hoy, ${day} de ${meses[d.getMonth()]}`;
  if (dateStr === ayerIso) return `Ayer, ${day} de ${meses[d.getMonth()]}`;
  return `${day} de ${meses[d.getMonth()]}, ${d.getFullYear()}`;
};

const getUIFechaHora = (isoStr) => {
  if (!isoStr) return "";
  const validIsoStr = isoStr.includes('Z') || isoStr.includes('+') ? isoStr : `${isoStr}Z`;
  const dt = new Date(validIsoStr);
  const limaDate = new Date(dt.getTime() - 18000000);

  let h = limaDate.getUTCHours();
  let m = limaDate.getUTCMinutes();
  const ampm = h >= 12 ? 'p.m.' : 'a.m.';
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
    const catLabel = categorias.find(c => c.id === g.categoria)?.label || "(Eliminado)";
    const desc = (g.descripcion || "").replace(/,/g, ";");
    return `${fecha},${hora},${g.tipo},${catLabel},${desc},${g.monto}`;
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
    const catLabel = cat?.label || "(Eliminado)";
    const color = g.tipo === "gasto" ? "#c0392b" : "#27ae60";
    const signo = g.tipo === "gasto" ? "-" : "+";
    return `<tr>
      <td style="font-weight:500;">${fecha}<br/><small style="color:#888">${hora}</small></td>
      <td style="font-weight:600;color:${cat?.color || "#888"}">${catLabel}</td>
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
      h2{color:#FF803C;margin-top:0;font-size:24px;font-weight:700;}
      .header-meta {color:#6B7280;margin-bottom:24px;font-size:14px;font-weight:500;}
      .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
      .btn-print { margin:0; padding:12px 24px; background:#FF803C; color:#000; font-weight:700; border:none; border-radius:12px; cursor:pointer; font-family:inherit; font-size:14px; box-shadow:0 4px 12px rgba(255, 128, 60, 0.2); }
      .btn-close { background: #1a1a1a; color: #FFF; border: none; border-radius: 12px; width: 44px; height: 44px; font-size: 20px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-weight: bold; }
      .btn-close:hover { background: #000; }
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
        .top-bar {display:none;}
        body{background:#FFFFFF;padding:0;}
        .card-history{border:none;box-shadow:none;padding:0;}
      }
    </style></head><body>
    <div style="max-width:800px;margin:0 auto;">
      <div class="top-bar">
        <button onclick="window.print()" class="btn-print">🖨️ Imprimir / Guardar PDF</button>
        <button onclick="window.close()" class="btn-close">✕</button>
      </div>
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
    <span style={{ display: "flex", alignItems: "center", color: color }}>{icon}</span>
    <span style={{ flex: 1 }}>{text}</span>
    <span style={{ color: mutedColor }}><ChevronRight size={20} /></span>
  </button>
);

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [categoriasBase, setCategoriasBase] = useState(INGRESOS_DEFAULT);
  const [categoriasExtra, setCategoriasExtra] = useState(GASTOS_DEFAULT);  
  
  const [listaMetas, setListaMetas] = useState(METAS_INICIALES);
  
  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  
  const [metaAhorro, setMetaAhorro] = useState("100000");
  const [fechaInicioPlan, setFechaInicioPlan] = useState(hoy());
  const [fechaFinPlan, setFechaFinPlan] = useState(calcularFechaFutura(150));
  const [ingresoMensual, setIngresoMensual] = useState("");
  
  const [userName, setUserName] = useState("Paul Flores");

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [isEditingIngreso, setIsEditingIngreso] = useState(false);
  
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const [editando, setEditando] = useState(null);   
  const [editForm, setEditForm] = useState({});

  const [showNuevaCatBase, setShowNuevaCatBase] = useState(false);
  const [nuevaCatBaseLabel, setNuevaCatBaseLabel] = useState("");
  const [nuevaCatBaseColor, setNuevaCatBaseColor] = useState(COLORES_CUSTOM[0]);

  const [showNuevaCat, setShowNuevaCat] = useState(false);
  const [nuevaCatLabel, setNuevaCatLabel] = useState("");
  const [nuevaCatColor, setNuevaCatColor] = useState(COLORES_CUSTOM[0]);

  const [editandoCat, setEditandoCat] = useState(null);
  const [editCatLabel, setEditCatLabel] = useState("");
  const [editCatColor, setEditCatColor] = useState("");

  const [editandoCatBase, setEditandoCatBase] = useState(null);
  const [editCatBaseLabel, setEditCatBaseLabel] = useState("");
  const [editCatBaseColor, setEditCatBaseColor] = useState("");

  const [filtroHistTipo, setFiltroHistTipo] = useState("todos");
  const [filtroHistCat, setFiltroHistCat] = useState("todas");
  const [filtroHistFechaDesde, setFiltroHistFechaDesde] = useState("");
  const [filtroHistFechaHasta, setFiltroHistFechaHasta] = useState("");
  const [showFiltrosMenu, setShowFiltrosMenu] = useState(false);

  const [filtroResumen, setFiltroResumen] = useState("mes");
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState(hoy());
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState(hoy());

  const [tipoGraficoIngresos, setTipoGraficoIngresos] = useState("bar"); 
  const [tipoGraficoGastos, setTipoGraficoGastos] = useState("bar"); 

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

  const [showCrearMeta, setShowCrearMeta] = useState(false);
  // NUEVO: ESTADO PARA SABER SI ESTAMOS EDITANDO UNA META
  const [isEditingMetaObj, setIsEditingMetaObj] = useState(false);
  const [metaForm, setMetaForm] = useState({
    id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻"
  });

  const [metaSeleccionada, setMetaSeleccionada] = useState(null);
  const [showMetaMenu, setShowMetaMenu] = useState(false);

  const [theme, setTheme] = useState("dark");
  const [isAutoTheme, setIsAutoTheme] = useState(false);
  const [useBold, setUseBold] = useState(false);

  const [isClosing, setIsClosing] = useState("");

  const safeBase = categoriasBase || [];
  const safeExtra = categoriasExtra || [];
  const categorias = [...safeBase, ...safeExtra];
  const isDark = theme === "dark";

  const isModalOpen = showAddModal || !!editando || showEmailModal || showCrearMeta || !!metaSeleccionada;

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
    iconBgOrange: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFEDD5",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF",
    iconTextPurple: isDark ? "#D8B4FE" : "#A855F7"
  };

  const showToast = (msg, color = "#FF803C") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const cerrarPantalla = (screenName, action) => {
    setIsClosing(screenName);
    setTimeout(() => {
      action();
      setIsClosing("");
      setShowMetaMenu(false);
    }, 280);
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
          if (getVal("listaMetas")) {
            try { 
              const p = JSON.parse(getVal("listaMetas")); 
              if(Array.isArray(p) && p.length > 0) setListaMetas(p);
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) { showToast("Ingresa un monto válido", c.red); return; }
    setSaving(true);
    const catObj = categorias.find(cat => cat.id === form.categoria);
    const defaultDesc = catObj ? getTexto(catObj.label) : "Movimiento";
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
    cerrarPantalla('datos', () => setProfileScreen(null));
  };

  const agregarCategoriaBase = async () => {
    const label = nuevaCatBaseLabel.trim();
    if (!label) { showToast("Escribe un nombre", c.red); return; }
    const id = "base_" + Date.now();
    const nueva = { id, label, color: nuevaCatBaseColor };
    const updated = [...safeBase, nueva];
    setCategoriasBase(updated);
    await supabase.from("config").upsert([{ key: "categoriasBase", value: JSON.stringify(updated) }], { onConflict: "key" });
    setNuevaCatBaseLabel("");
    setShowNuevaCatBase(false);
    showToast(`Categoría "${label}" creada ✓`);
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

  const procesarNuevaMeta = async () => {
    if (!metaForm.nombre.trim()) return showToast("⚠️ Ingresa el nombre de la meta", c.red);
    if (!metaForm.montoObjetivo || parseFloat(metaForm.montoObjetivo) <= 0) return showToast("⚠️ Ingresa un monto objetivo válido", c.red);
    if (!metaForm.fechaLimite) return showToast("⚠️ Selecciona una fecha límite", c.red);

    let nuevasMetas;

    if (isEditingMetaObj) {
      // SI ESTAMOS EDITANDO, ACTUALIZAMOS LA META EXISTENTE
      nuevasMetas = listaMetas.map(m => m.id === metaForm.id ? { 
        ...metaForm, 
        montoObjetivo: parseFloat(metaForm.montoObjetivo), 
        aporteInicial: metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0 
      } : m);
      
      // Actualizar también la vista de detalle si está abierta
      setMetaSeleccionada(prev => ({ ...prev, ...metaForm, montoObjetivo: parseFloat(metaForm.montoObjetivo), aporteInicial: metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0 }));
      showToast("Meta actualizada con éxito ✓", c.green);
    } else {
      // SI ES NUEVA, LA CREAMOS
      const nuevaMeta = {
        id: "meta_" + Date.now(),
        nombre: metaForm.nombre.trim(),
        montoObjetivo: parseFloat(metaForm.montoObjetivo),
        aporteInicial: metaForm.aporteInicial ? parseFloat(metaForm.aporteInicial) : 0,
        fechaLimite: metaForm.fechaLimite,
        prioridad: metaForm.prioridad,
        tipo: metaForm.tipo,
        icono: metaForm.icono
      };
      nuevasMetas = [nuevaMeta, ...listaMetas];
      showToast("Meta guardada con éxito ✓", c.green);
    }

    setListaMetas(nuevasMetas);
    setSaving(true);
    await supabase.from("config").upsert([{ key: "listaMetas", value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false);

    cerrarPantalla('crearMeta', () => {
      setShowCrearMeta(false);
      setIsEditingMetaObj(false);
      setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
    });
  };

  const eliminarMeta = async (id) => {
    if (!window.confirm("¿Estás seguro que deseas eliminar esta meta? Todo el progreso se perderá.")) return;

    const nuevasMetas = listaMetas.filter(m => m.id !== id);
    setListaMetas(nuevasMetas);

    setSaving(true);
    await supabase.from("config").upsert([{ key: "listaMetas", value: JSON.stringify(nuevasMetas) }], { onConflict: "key" });
    setSaving(false);

    showToast("Meta eliminada con éxito", c.muted);
    setShowMetaMenu(false);
    cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null));
  };

  // NUEVO: FUNCION PARA ABRIR EL FORMULARIO DE EDICION
  const abrirEdicionMeta = () => {
    setMetaForm({
      id: metaSeleccionada.id,
      nombre: metaSeleccionada.nombre,
      montoObjetivo: metaSeleccionada.montoObjetivo,
      aporteInicial: metaSeleccionada.aporteInicial,
      fechaLimite: metaSeleccionada.fechaLimite,
      prioridad: metaSeleccionada.prioridad,
      tipo: metaSeleccionada.tipo,
      icono: metaSeleccionada.icono
    });
    setIsEditingMetaObj(true);
    setShowCrearMeta(true);
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
  
  let proyeccionTexto = "—";
  const ahorroDiarioProm = diasTranscurridosPlan > 0 ? ahorroAcumulado / diasTranscurridosPlan : 0;
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
    if (filtroResumen === "mes") return gastos.filter(g => g.fecha.startsWith(hoy().slice(0, 7)));
    if (filtroResumen === "rango") return gastos.filter(g => (!filtroFechaResumenDesde || g.fecha >= filtroFechaResumenDesde) && (!filtroFechaResumenHasta || g.fecha <= filtroFechaResumenHasta));
    return gastos;
  };
  
  const gastosFiltradosResumen = getFiltradosResumen();
  const ingresosResumen = gastosFiltradosResumen.filter(g => g.tipo === "ingreso");
  const gastosResumen = gastosFiltradosResumen.filter(g => g.tipo === "gasto");

  const totalGastadoR = gastosResumen.reduce((a, g) => a + g.monto, 0);
  const totalIngresosR = ingresosResumen.reduce((a, g) => a + g.monto, 0);
  const ahorroR = totalIngresosR - totalGastadoR;

  const calcCats = (arr) => categorias.map(cat => ({
    ...cat, total: arr.filter(g => g.categoria === cat.id).reduce((a, g) => a + g.monto, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

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

  const gastosFiltradosHist = gastos.filter(g => 
    (filtroHistTipo === "todos" || g.tipo === filtroHistTipo) &&
    (filtroHistCat === "todas" || g.categoria === filtroHistCat) && 
    (!filtroHistFechaDesde || g.fecha >= filtroHistFechaDesde) && 
    (!filtroHistFechaHasta || g.fecha <= filtroHistFechaHasta)
  );

  const groupedHistorial = gastosFiltradosHist.reduce((acc, g) => {
    if (!acc[g.fecha]) acc[g.fecha] = [];
    acc[g.fecha].push(g);
    return acc;
  }, {});
  const sortedGroupKeys = Object.keys(groupedHistorial).sort((a,b) => b.localeCompare(a));

  const gastosVerTodos = gastos.filter(g => (!vtFechaDesde || g.fecha >= vtFechaDesde) && (!vtFechaHasta || g.fecha <= vtFechaHasta));

  const s = {
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(100px + env(safe-area-inset-bottom, 0px))", width: "100%" },
    section:    { padding: "20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card:       { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    metaCard:   { width: "100%", background: "linear-gradient(135deg,#1A1A1A,#050505)", borderRadius: 16, padding: "20px", marginBottom: 24, boxSizing: "border-box", color: "#FFF", boxShadow: isDark ? "none" : "0 8px 24px rgba(0,0,0,0.15)" },
    
    metaLabel:  { fontSize: 16, color: "#FFF", marginBottom: 12 }, 
    label:      { fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 },
    
    bigNum:     { fontSize: 28, fontWeight: 600, color: "#FFF", lineHeight: 1 },
    smallNum:   { fontSize: 20, fontWeight: 500, color: c.text },
    redNum:     { fontSize: 20, fontWeight: 600, color: c.red },
    greenNum:   { fontSize: 20, fontWeight: 600, color: c.green },
    
    progressBg: { background: "#333", borderRadius: 4, height: 8, margin: "8px 0 16px", overflow: "hidden" },
    progressFill: (p) => ({ height: "100%", width: `${p}%`, background: p >= 100 ? c.green : p >= 50 ? "#FF803C" : c.red, borderRadius: 4, transition: "width 0.6s ease" }),
    
    grid2:      { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, width: "100%" },
    
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48 },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48 },
    
    btnPrimary: { background: "#FF803C", color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.2)" },
    btnSecondary:{ background: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    
    deleteBtn:  { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.red, cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn:    { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    
    errorCard:  { background: isDark ? "#1A0A0A" : "#FEF2F2", border: `1px solid ${c.red}`, borderRadius: 12, padding: "16px", margin: "20px", color: c.red, fontSize: 14, fontWeight: 400 },
    
    filterRow:  { display: "flex", gap: 6, flexWrap: "nowrap", overflowX: "auto", paddingBottom: 4, WebkitOverflowScrolling: "touch" },
    filterBtn: (a) => ({ whiteSpace: "nowrap", flexShrink: 0, padding: "8px 16px", borderRadius: 20, border: `1px solid ${a ? "#FF803C" : c.border}`, background: a ? "#FF803C" : c.card, color: a ? "#FFF" : c.muted, fontSize: 13, fontWeight: a ? 600 : 500, cursor: "pointer", fontFamily: "inherit" }),
    
    navBar: {
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480,
      background: c.nav, display: "flex", zIndex: 100,
      paddingTop: 0, paddingBottom: 0, 
      boxShadow: isDark ? "0 -2px 10px rgba(0,0,0,0.4)" : "0 -2px 10px rgba(0,0,0,0.06)" 
    },
    navBtn: (a) => ({
      flex: 1, paddingTop: 10, paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`, backgroundColor: "transparent", WebkitAppearance: "none", border: "none",
      color: a ? "#FF803C" : c.muted, fontSize: 12, fontWeight: 400, cursor: "pointer",
      display: "flex", flexDirection: "column", alignItems: "center", gap: 0, fontFamily: "inherit",
      position: "relative"
    }),
    fabCircle: {
      position: "absolute", top: -24, width: 60, height: 60, borderRadius: "50%",
      background: "#FF803C", color: "#FFF", border: `6px solid ${c.bg}`, 
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: 34, fontWeight: 400, cursor: "pointer", fontFamily: "inherit",
      boxShadow: "0 4px 12px rgba(255, 128, 60, 0.4)", zIndex: 105, padding: 0
    },

    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 99999, padding: "0", backdropFilter: "blur(10px)" },
    modal: { background: c.card, borderTop: `1px solid ${c.border}`, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)" }
  };

  const IconBadge = ({ emoji, bg, color }) => (
    <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
      {emoji}
    </div>
  );

  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'PF';

  if (!loaded) return (
    <div style={{ background: c.bg, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: `2px solid ${c.border}`, borderTop: "2px solid #FF803C", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
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
          overflow-x: hidden; 
          overflow-y: ${isModalOpen ? 'hidden' : 'auto'} !important; 
          font-family: 'Montserrat', sans-serif;
          transition: background 0.3s ease, color 0.3s ease;
        }
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
          <div style={{ padding: "12px 20px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.bg, position: "sticky", top: 0, zIndex: 10 }}>
            <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => { setViewAll(false); window.scrollTo(0, 0); }}>←</button>
            <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 600 }}>Movimientos</h2>
            <div style={{ display: "flex", gap: 16 }}>
              <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowEmailModal(true)}>
                <Mail size={20} />
              </button>
              <button style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}>
                <Calendar size={20} />
              </button>
            </div>
          </div>
          {showVtFiltro && (
            <div style={{ padding: "16px 20px", background: c.card, borderBottom: `1px solid ${c.border}` }}>
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
          <div style={s.section}>
            <div style={{ ...s.label, textAlign: "center", marginBottom: 12 }}>{gastosVerTodos.length} movimientos</div>
            {gastosVerTodos.length === 0 ? (
              <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "32px", fontWeight: 500 }}>No se encontraron movimientos</div>
            ) : (
              gastosVerTodos.map(g => {
                const cat = categorias.find(c => c.id === g.categoria);
                const descAdicional = g.descripcion && cat && g.descripcion !== getTexto(cat.label) ? g.descripcion : "";
                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 16px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>
                          {cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text }}>
                            {cat ? getTexto(cat.label) : g.descripcion}
                            {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>{descAdicional}</span>}
                            {!cat && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>(Eliminado)</span>}
                          </div>
                          <div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)} · {g.tipo === "gasto" ? "Gastos" : "Ingresos"}</div>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16, fontWeight: 500, color: g.tipo === "gasto" ? c.text : c.green, marginRight: 4 }}>
                          {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                        </span>
                        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                          <button style={{...s.editBtn, padding: 2}} onClick={() => abrirEdicion(g)}><Edit2 size={16} /></button>
                          <button style={{...s.deleteBtn, padding: 2}} onClick={() => eliminar(g.id)}><Trash2 size={16} /></button>
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
          {(() => {
            if (tab === "metas") {
              return (
                <div style={{ padding: "12px 20px 16px", background: c.bg, position: "sticky", top: 0, zIndex: 90 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <button onClick={() => setTab("hoy")} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", cursor: "pointer", padding: 0, display: "flex" }}>
                      <ArrowLeft size={28} />
                    </button>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: c.text, margin: 0, fontFamily: "'Montserrat', sans-serif" }}>Mis Metas de Ahorro</h1>
                    <button onClick={() => {
                      setIsEditingMetaObj(false);
                      setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
                      setShowCrearMeta(true);
                    }} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: 0, color: "#FF803C", display: "flex" }}>
                      <Plus size={28} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              );
            }

            let headTitle;
            if (tab === "hoy") { 
              headTitle = (
                <>
                  <span style={{ fontWeight: 500 }}>¡Hola</span>
                  <span style={{ fontWeight: 600 }}>, {userName}! 👋</span>
                </>
              ); 
            }
            else if (tab === "resumen") headTitle = "Reportes";
            else if (tab === "historial") headTitle = "Historial";

            return (
              <div style={{ padding: "8px 20px 12px", background: c.bg, position: "sticky", top: 0, zIndex: 90 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button onClick={() => setShowMenu(true)} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.text, cursor: "pointer", padding: 0, display: "flex" }}>
                      <Menu size={28} />
                    </button>
                    <h1 style={{ fontSize: 20, fontWeight: 600, color: c.text, margin: 0, fontFamily: "'Montserrat', sans-serif", lineHeight: 1.1 }}>{headTitle}</h1>
                  </div>
                  <button onClick={() => window.location.reload()} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", padding: 0, color: c.text }}>
                    <RefreshCw size={22} />
                  </button>
                </div>
              </div>
            );
          })()}

          {error && <div style={s.errorCard}><AlertTriangle size={16} style={{ verticalAlign: "middle", marginRight: 8 }} /> {error}</div>}

          {tab === "hoy" && (
            <div style={s.section}>
              <div style={s.metaCard}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 400, color: "#FFF", marginBottom: 6 }}>Tu progreso</div>
                    <div style={{ ...s.bigNum, color: "#FFF" }}>{formatMoney(Math.max(0, ahorroAcumulado))}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, color: "#AAA", fontWeight: 500, marginBottom: 6 }}>Falta ahorrar</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#FF803C" }}>{formatMoney(Math.max(0, metaTotalNum - ahorroAcumulado))}</div>
                  </div>
                </div>

                <div style={{ ...s.progressBg }}>
                  <div style={s.progressFill(progreso)} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#AAA", fontWeight: 500, marginBottom: 8 }}>
                  <span>{progreso.toFixed(1)}% <span style={{opacity: 0.5, margin: "0 6px"}}>|</span> Día {diasTranscurridosPlan} de {diasTotalPlan}</span>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                    <IconBadge emoji={<ArrowDownToLine size={18} />} bg={c.iconBgGreen} color={c.green} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ingresos hoy</span>
                  </div>
                  <div style={{ ...s.greenNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy)}</div>
                </div>
                
                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                    <IconBadge emoji={<ArrowUpFromLine size={18} />} bg={c.iconBgRed} color={c.red} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Gastos hoy</span>
                  </div>
                  <div style={{ ...s.redNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalGastadoHoy)}</div>
                </div>

                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                    <IconBadge emoji={<PiggyBank size={18} />} bg={c.iconBgOrange} color="#FF803C" />
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ahorro hoy</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "#FF803C", textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy - totalGastadoHoy)}</div>
                </div>

                <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}>
                    <IconBadge emoji={<Target size={18} />} bg={c.iconBgPurple} color={c.iconTextPurple} />
                    <span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Límite / día</span>
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: c.text, textAlign: "center", marginTop: 0 }}>{formatMoney(ahorroMetaDiario)}</div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
                <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Últimos movimientos</h3>
                <button onClick={() => { setViewAll(true); window.scrollTo(0, 0); }} style={{ background: "none", border: "none", color: c.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>
                  Ver todos
                </button>
              </div>

              {movimientosHoy.length > 0 ? (
                <div style={{ ...s.card, padding: "0 16px" }}>
                  {movimientosHoy.map((g, i, arr) => {
                    const cat = categorias.find(c => c.id === g.categoria);
                    const descAdicional = g.descripcion && cat && g.descripcion !== getTexto(cat.label) ? g.descripcion : "";
                    const isLast = i === arr.length - 1;
                    return (
                      <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${c.border}` }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>
                            {cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text }}>
                              {cat ? getTexto(cat.label) : g.descripcion}
                              {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>{descAdicional}</span>}
                              {!cat && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>(Eliminado)</span>}
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)} · {g.tipo === "gasto" ? "Gastos" : "Ahorros"}</div>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                           <span style={{ fontSize: 16, fontWeight: 500, color: g.tipo === "gasto" ? c.text : c.green }}>
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
            </div>
          )}

          {tab === "resumen" && (
            <div style={s.section}>
              
              <div className="hide-scroll" style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
                {[{ id: "hoy", label: "Hoy" }, { id: "mes", label: "Mes" }, { id: "rango", label: "Personalizado 📅" }].map(f => (
                  <button key={f.id} style={{
                    padding: "10px 20px", borderRadius: 24, 
                    border: `1px solid ${filtroResumen === f.id ? (isDark ? "#FFF" : "#000") : c.border}`,
                    background: filtroResumen === f.id ? (isDark ? "#FFF" : "#000") : c.card, 
                    color: filtroResumen === f.id ? (isDark ? "#000" : "#FFF") : c.muted,
                    fontSize: 14, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "inherit"
                  }} onClick={() => setFiltroResumen(f.id)}>
                    {f.label}
                  </button>
                ))}
              </div>

              {filtroResumen === "rango" && (
                <div style={{ ...s.card, padding: 16 }}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      {!filtroFechaResumenDesde && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Del</span>}
                      <input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenDesde ? c.text : "transparent" }} />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      {!filtroFechaResumenHasta && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Al</span>}
                      <input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenHasta ? c.text : "transparent" }} />
                    </div>
                  </div>
                  {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                    <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}>
                      <X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas
                    </button>
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

              {/* GRÁFICO 1: INGRESOS */}
              <div style={{ ...s.card, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Reporte de Ingresos</h3>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setTipoGraficoIngresos("bar")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoIngresos === "bar" ? 1 : 0.3, padding: 0 }}>
                      <BarChart2 size={20} color={c.text} />
                    </button>
                    <button onClick={() => setTipoGraficoIngresos("donut")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoIngresos === "donut" ? 1 : 0.3, padding: 0 }}>
                      <PieChart size={20} color={c.text} />
                    </button>
                  </div>
                </div>
                
                {catsIngresos.length === 0 ? (
                  <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontSize: 14 }}>Aún no hay registros en esta vista</div>
                ) : tipoGraficoIngresos === "donut" ? (
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                      <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${conicIngresos})`, position: "relative", flexShrink: 0 }}>
                         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%" }}></div>
                      </div>
                    </div>
                    <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 10, paddingLeft: 10, boxSizing: "border-box" }}>
                       {catsIngresos.slice(0, 5).map(cat => (
                         <div key={cat.id} style={{ display: "flex", alignItems: "center" }}>
                           <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, marginRight: 8, flexShrink: 0 }}></div>
                           <span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.text, width: 85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatCatName(cat.label)}</span>
                           <span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.muted, width: 35, textAlign: "right" }}>{Math.round((cat.total / totIngresosDonut) * 100)}%</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", height: 160, marginTop: 24, gap: 8 }}>
                      <div style={{ width: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>
                        {[cMaxI, cMaxI * 0.75, cMaxI * 0.5, cMaxI * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}
                      </div>
                      <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>
                        {catsIngresos.slice(0, 6).map((cat) => (
                          <div key={cat.id} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {cat.total % 1 === 0 ? cat.total : cat.total.toFixed(1)}</span>
                            <div style={{ width: "100%", maxWidth: 36, height: `${(cat.total / cMaxI) * 100}%`, background: cat.color, borderRadius: "4px 4px 0 0", minHeight: 2 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", paddingLeft: 38, gap: 8, marginTop: 8 }}>
                      {catsIngresos.slice(0, 6).map((cat) => (
                        <div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 500, color: c.muted }}>
                          {formatCatName(cat.label)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div style={{ ...s.card, display: "flex", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#DCFCE7", color: c.green, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>Ahorraste {formatMoney(ahorroR)} en este periodo</div>
                  <div style={{ fontSize: 12, color: c.muted, marginTop: 4, fontWeight: 500 }}>¡Buen trabajo gestionando tu dinero!</div>
                </div>
              </div>

              {/* GRÁFICO 2: GASTOS */}
              <div style={{ ...s.card, padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Reporte de Gastos</h3>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setTipoGraficoGastos("bar")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoGastos === "bar" ? 1 : 0.3, padding: 0 }}>
                      <BarChart2 size={20} color={c.text} />
                    </button>
                    <button onClick={() => setTipoGraficoGastos("donut")} style={{ background: "none", border: "none", cursor: "pointer", opacity: tipoGraficoGastos === "donut" ? 1 : 0.3, padding: 0 }}>
                      <PieChart size={20} color={c.text} />
                    </button>
                  </div>
                </div>
                
                {catsGastos.length === 0 ? (
                  <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontSize: 14 }}>Aún no hay registros en esta vista</div>
                ) : tipoGraficoGastos === "donut" ? (
                  <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                    <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                      <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${conicGastos})`, position: "relative", flexShrink: 0 }}>
                         <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%" }}></div>
                      </div>
                    </div>
                    <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 10, paddingLeft: 10, boxSizing: "border-box" }}>
                       {catsGastos.slice(0, 5).map(cat => (
                         <div key={cat.id} style={{ display: "flex", alignItems: "center" }}>
                           <div style={{ width: 10, height: 10, borderRadius: "50%", background: cat.color, marginRight: 8, flexShrink: 0 }}></div>
                           <span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.text, width: 85, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatCatName(cat.label)}</span>
                           <span style={{ display: "inline-block", fontSize: 13, fontWeight: 500, color: c.muted, width: 35, textAlign: "right" }}>{Math.round((cat.total / totGastosDonut) * 100)}%</span>
                         </div>
                       ))}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", height: 160, marginTop: 24, gap: 8 }}>
                      <div style={{ width: 30, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>
                        {[cMaxG, cMaxG * 0.75, cMaxG * 0.5, cMaxG * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}
                      </div>
                      <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>
                        {catsGastos.slice(0, 6).map((cat) => (
                          <div key={cat.id} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}>
                            <span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {cat.total % 1 === 0 ? cat.total : cat.total.toFixed(1)}</span>
                            <div style={{ width: "100%", maxWidth: 36, height: `${(cat.total / cMaxG) * 100}%`, background: cat.color, borderRadius: "4px 4px 0 0", minHeight: 2 }} />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", paddingLeft: 38, gap: 8, marginTop: 8 }}>
                      {catsGastos.slice(0, 6).map((cat) => (
                        <div key={cat.id} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 500, color: c.muted }}>
                          {formatCatName(cat.label)}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {tab === "historial" && (
            <div style={s.section}>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{ id: "todos", label: "Total" }, { id: "ingreso", label: "Ingresos" }, { id: "gasto", label: "Gastos" }].map(opt => (
                    <button key={opt.id} onClick={() => setFiltroHistTipo(opt.id)} style={{
                      padding: "10px 24px", borderRadius: 24,
                      border: `1px solid ${filtroHistTipo === opt.id ? (isDark ? "#FFF" : "#000") : c.border}`,
                      background: filtroHistTipo === opt.id ? (isDark ? "#FFF" : "#000") : c.card,
                      color: filtroHistTipo === opt.id ? (isDark ? "#000" : "#FFF") : c.muted,
                      fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s"
                    }}>
                      {opt.label}
                    </button>
                  ))}
                </div>
                
                <button onClick={() => setShowFiltrosMenu(!showFiltrosMenu)} style={{
                  padding: "8px 16px", borderRadius: 24, border: `1px solid ${showFiltrosMenu ? (isDark ? "#FFF" : "#000") : c.border}`,
                  background: showFiltrosMenu ? (isDark ? "#FFF" : "#000") : c.card, display: "flex", alignItems: "center", gap: 6,
                  cursor: "pointer", flexShrink: 0, transition: "all 0.2s"
                }}>
                  <Calendar size={16} color={showFiltrosMenu ? (isDark ? "#000" : "#FFF") : c.text} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: showFiltrosMenu ? (isDark ? "#000" : "#FFF") : c.text }}>Fechas</span>
                </button>
              </div>

              <div className="hide-scroll" style={{ ...s.filterRow, marginBottom: 24, minHeight: 36, alignItems: "center" }}>
                {filtroHistCat === "todas" ? (
                  <>
                    <button style={s.filterBtn(true)} onClick={() => setFiltroHistCat("todas")}>Todas</button>
                    {categorias.map(c => <button key={c.id} style={s.filterBtn(false)} onClick={() => setFiltroHistCat(c.id)}>{c.label}</button>)}
                  </>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button 
                      onClick={() => setFiltroHistCat("todas")} 
                      style={{ width: 32, height: 32, borderRadius: '50%', background: isDark ? '#333' : '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <X size={16} color={c.text} />
                    </button>
                    <div style={{ padding: "8px 16px", borderRadius: 20, border: `1px solid #E9D5FF`, background: "#F3E8FF", color: "#7E22CE", fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center" }}>
                      {categorias.find(c => c.id === filtroHistCat)?.label}
                    </div>
                  </div>
                )}
              </div>

              {showFiltrosMenu && (
                <div style={{...s.card, marginBottom: 24, animation: "slideUp 0.3s ease-out"}}>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      {!filtroHistFechaDesde && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Del</span>}
                      <input type="date" value={filtroHistFechaDesde} onChange={e => setFiltroHistFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroHistFechaDesde ? c.text : "transparent" }} />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                      {!filtroHistFechaHasta && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Al</span>}
                      <input type="date" value={filtroHistFechaHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroHistFechaHasta ? c.text : "transparent" }} />
                    </div>
                  </div>
                  {(filtroHistFechaDesde || filtroHistFechaHasta) && <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroHistFechaDesde(""); setFiltroHistFechaHasta(""); }}>
                    <X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas
                  </button>}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, marginBottom: 24, width: "100%" }}>
                <button style={{...s.btnSecondary, background: c.card, border: `1px solid ${c.border}`}} onClick={() => exportarCSV(gastosFiltradosHist, categorias)}>📊 Descargar Excel</button>
                <button style={{...s.btnSecondary, background: c.card, border: `1px solid ${c.border}`}} onClick={() => exportarPDF(gastosFiltradosHist, categorias)}>📄 Descargar PDF</button>
              </div>

              {gastosFiltradosHist.length === 0 ? (
                 <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "40px 20px", fontWeight: 500 }}>Sin movimientos con estos filtros</div> 
              ) : (
                 sortedGroupKeys.map(dateKey => (
                   <div key={dateKey} style={{ marginBottom: 24 }}>
                     <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 12, paddingLeft: 4 }}>
                       {formatGroupDate(dateKey)}
                     </div>
                     <div style={{ ...s.card, padding: "0 16px", marginBottom: 0 }}>
                       {groupedHistorial[dateKey].map((g, i, arr) => {
                         const cat = categorias.find(c => c.id === g.categoria);
                         const descAdicional = g.descripcion && cat && g.descripcion !== getTexto(cat.label) ? g.descripcion : "";
                         const isLast = i === arr.length - 1;
                         return (
                           <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: isLast ? "none" : `1px solid ${c.border}` }}>
                             <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                               <div style={{ width: 40, height: 40, borderRadius: 12, background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, color: cat ? "inherit" : c.muted, fontWeight: cat ? "normal" : 600 }}>
                                 {cat ? getIcono(cat.label) : (g.descripcion || "?").charAt(0).toUpperCase()}
                               </div>
                               <div style={{ minWidth: 0 }}>
                                 <div style={{ fontSize: 15, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2 }}>
                                    {cat ? getTexto(cat.label) : g.descripcion}
                                    {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>{descAdicional}</span>}
                                    {!cat && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 400 }}>(Eliminado)</span>}
                                 </div>
                                 <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUITime(g.created_at)}</div>
                               </div>
                             </div>
                             <div style={{ textAlign: "right", display: "flex", alignItems: "center", gap: 12 }}>
                               <span style={{ fontSize: 16, fontWeight: 500, color: g.tipo === "gasto" ? c.text : c.green }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span>
                             </div>
                           </div>
                         );
                       })}
                     </div>
                   </div>
                 ))
              )}
            </div>
          )}

          {/* PESTAÑA METAS DINÁMICA */}
          {tab === "metas" && (
            <div style={{ padding: "0 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", paddingBottom: 100 }}>
              <div style={{ fontSize: 14, color: c.muted, marginBottom: 20, fontWeight: 500 }}>Tus objetivos financieros</div>

              {listaMetas.length === 0 ? (
                <div style={{ ...s.card, textAlign: "center", padding: "40px 20px", color: c.muted, fontWeight: 500 }}>
                  Aún no tienes metas creadas. ¡Anímate a crear una!
                </div>
              ) : (
                listaMetas.map((meta, index) => {
                  const obj = parseFloat(meta.montoObjetivo) || 1;
                  const ahorrado = parseFloat(meta.aporteInicial) || 0;
                  const faltan = Math.max(0, obj - ahorrado);
                  const pct = Math.min(100, Math.round((ahorrado / obj) * 100));

                  let fechaStr = "Sin fecha límite";
                  let diasStr = "Sin prisa";
                  let diasRestantes = 0;
                  
                  if (meta.fechaLimite) {
                    const mesesAbv = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
                    const [y, m, d] = meta.fechaLimite.split("-");
                    fechaStr = `${parseInt(d)} ${mesesAbv[parseInt(m)-1]} ${y}`;

                    diasRestantes = diffDias(hoy(), meta.fechaLimite);
                    if (diasRestantes < 0) diasStr = "Vencida";
                    else if (diasRestantes === 0) diasStr = "¡Hoy!";
                    else diasStr = `En ${diasRestantes} días`;
                  }

                  const bgIconColor = PASTEL_COLORS[index % PASTEL_COLORS.length];

                  return (
                    <div key={meta.id} onClick={() => setMetaSeleccionada({ ...meta, indexColor: index })} style={{ ...s.card, padding: "20px", marginBottom: 16, cursor: "pointer" }}>
                      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                        <div style={{ width: 70, height: 70, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 32 }}>
                          {meta.icono}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 6 }}>{meta.nombre}</div>
                          <div style={{ marginBottom: 12 }}>
                            <span style={{ fontSize: 18, fontWeight: 700, color: c.green }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span>
                            <span style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}> de S/ {formatMoney(obj).replace("S/ ", "")}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 8, flex: 1, overflow: "hidden" }}>
                              <div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 4 }}></div>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{pct}%</span>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${c.border}`, paddingTop: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted, fontSize: 13, fontWeight: 500 }}>
                          <Calendar size={16} /> {fechaStr}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, color: (!meta.fechaLimite || diasRestantes > 0) ? c.muted : c.red, fontSize: 13, fontWeight: 500 }}>
                          <Clock size={16} /> {diasStr}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* BOTON FLOTANTE DE CREAR META SOLO VISIBLE EN LA PESTAÑA METAS */}
          {tab === "metas" && (
            <div style={{ position: "fixed", bottom: "calc(64px + env(safe-area-inset-bottom, 0px))", left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, padding: "32px 20px 16px", background: isDark ? "linear-gradient(to top, #0A0A0A 70%, rgba(10,10,10,0))" : "linear-gradient(to top, #F4F5F7 70%, rgba(244,245,247,0))", zIndex: 80, boxSizing: "border-box" }}>
              <button onClick={() => {
                setIsEditingMetaObj(false);
                setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" });
                setShowCrearMeta(true);
              }} style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)" }}>
                <Plus size={20} /> Crear nueva meta
              </button>
            </div>
          )}

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
              <button style={s.fabCircle} onClick={() => setShowAddModal(true)}><Plus size={32} /></button>
            </div>

            {[{ id: "historial", icon: <FileText size={24} strokeWidth={2.5} />, label: "Historial" }, 
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

      {/* NUEVA PANTALLA: RESUMEN DE LA META SELECCIONADA */}
      {metaSeleccionada && (() => {
        const obj = parseFloat(metaSeleccionada.montoObjetivo) || 1;
        const ahorrado = parseFloat(metaSeleccionada.aporteInicial) || 0;
        const faltan = Math.max(0, obj - ahorrado);
        const pct = Math.min(100, Math.round((ahorrado / obj) * 100));

        let fechaStr = "Sin fecha límite";
        let diasRestantes = 0;
        
        if (metaSeleccionada.fechaLimite) {
          const mesesAbv = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
          const [y, m, d] = metaSeleccionada.fechaLimite.split("-");
          fechaStr = `${parseInt(d)} ${mesesAbv[parseInt(m)-1]} ${y}`;
          diasRestantes = diffDias(hoy(), metaSeleccionada.fechaLimite);
        }

        const ahorroDiarioVal = diasRestantes > 0 ? (faltan / diasRestantes) : 0;
        const bgIconColor = PASTEL_COLORS[metaSeleccionada.indexColor % PASTEL_COLORS.length];

        return (
          <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, display: "flex", flexDirection: "column", animation: isClosing === 'detalleMeta' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
            
            {/* Cabecera */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "env(safe-area-inset-top, 20px) 20px 16px", background: c.bg, borderBottom: `1px solid ${c.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <button onClick={() => cerrarPantalla('detalleMeta', () => setMetaSeleccionada(null))} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}>
                  <ArrowLeft size={28} />
                </button>
                <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>{metaSeleccionada.nombre}</h2>
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowMetaMenu(!showMetaMenu)} style={{ background: "none", border: "none", color: c.muted, cursor: "pointer", padding: 0, display: "flex" }}>
                  <MoreVertical size={24} />
                </button>
                
                {/* MENU DESPLEGABLE ELIMINAR META */}
                {showMetaMenu && (
                  <div style={{ position: "absolute", top: 30, right: 0, background: c.card, border: `1px solid ${c.border}`, borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", zIndex: 105, overflow: "hidden", minWidth: 140 }}>
                    <button onClick={() => eliminarMeta(metaSeleccionada.id)} style={{ width: "100%", padding: "14px 16px", background: "transparent", border: "none", color: c.red, textAlign: "left", fontSize: 14, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "inherit" }}>
                      <Trash2 size={18} /> Eliminar
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Contenido scrolleable */}
            <div style={{ padding: "32px 20px 20px", flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
              
              {/* Bloque Central de Progreso */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 40 }}>
                <div style={{ position: "relative", marginBottom: 24 }}>
                  <div style={{ width: 110, height: 110, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 56 }}>
                    {metaSeleccionada.icono}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, right: 0, width: 28, height: 28, background: "#FFF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <CheckCircle2 size={20} color={c.green} />
                  </div>
                </div>

                <div style={{ fontSize: 32, fontWeight: 700, color: c.green, marginBottom: 4 }}>
                  S/ {formatMoney(ahorrado).replace("S/ ", "")}
                </div>
                <div style={{ fontSize: 14, color: c.muted, fontWeight: 500, marginBottom: 24 }}>
                  de S/ {formatMoney(obj).replace("S/ ", "")}
                </div>

                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 6, height: 10, flex: 1, overflow: "hidden" }}>
                    <div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 6 }}></div>
                  </div>
                  <span style={{ fontSize: 16, fontWeight: 700, color: c.text }}>{pct}%</span>
                </div>
              </div>

              {/* Tarjeta Resumen */}
              <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 12 }}>Resumen de tu progreso</div>
              <div style={{ ...s.card, padding: "20px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Fecha limite</span>
                  <span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{fechaStr}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Faltan</span>
                  <span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{metaSeleccionada.fechaLimite ? `${Math.max(0, diasRestantes)} días` : "—"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Ahorrado</span>
                  <span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Falta por ahorrar</span>
                  <span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>S/ {formatMoney(faltan).replace("S/ ", "")}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: c.muted, fontSize: 14, fontWeight: 500 }}>Ahorro diario necesario</span>
                  <span style={{ color: c.text, fontSize: 14, fontWeight: 600 }}>{ahorroDiarioVal > 0 ? `S/ ${ahorroDiarioVal.toFixed(2)}` : "S/ 0.00"}</span>
                </div>
              </div>

              {/* Boton Editar Meta Integrado (Ya no fijo abajo) */}
              <button 
                onClick={abrirEdicionMeta}
                style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}
              >
                Editar meta
              </button>

            </div>
          </div>
        );
      })()}

      {/* NUEVA PANTALLA: CREAR / EDITAR META */}
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
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Aporte inicial <span style={{ color: c.muted, fontWeight: "normal" }}>(opcional)</span></div>
            <input style={{ ...s.input }} type="number" placeholder="S/ 0.00" value={metaForm.aporteInicial} onChange={e => setMetaForm({ ...metaForm, aporteInicial: e.target.value })} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Fecha límite</div>
            <div style={{ position: "relative" }}>
              {!metaForm.fechaLimite && <span style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: c.muted, pointerEvents: "none", fontSize: 15 }}>Selecciona una fecha</span>}
              <input type="date" value={metaForm.fechaLimite} onChange={e => setMetaForm({ ...metaForm, fechaLimite: e.target.value })} style={{ ...s.input, color: metaForm.fechaLimite ? c.text : "transparent" }} />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Prioridad</div>
            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => setMetaForm({ ...metaForm, prioridad: 'alta' })} style={{ flex: 1, padding: "12px", borderRadius: 8, border: metaForm.prioridad === 'alta' ? "1px solid #EF4444" : `1px solid ${c.border}`, background: metaForm.prioridad === 'alta' ? (isDark ? "rgba(239,68,68,0.15)" : "#FEF2F2") : c.card, color: metaForm.prioridad === 'alta' ? "#EF4444" : c.text, fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.2s" }}>
                <ChevronUp size={16} /> Alta
              </button>
              <button onClick={() => setMetaForm({ ...metaForm, prioridad: 'media' })} style={{ flex: 1, padding: "12px", borderRadius: 8, border: metaForm.prioridad === 'media' ? "1px solid #F59E0B" : `1px solid ${c.border}`, background: metaForm.prioridad === 'media' ? (isDark ? "rgba(245,158,11,0.15)" : "#FFFBEB") : c.card, color: metaForm.prioridad === 'media' ? "#F59E0B" : c.text, fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.2s" }}>
                <Minus size={16} /> Media
              </button>
              <button onClick={() => setMetaForm({ ...metaForm, prioridad: 'baja' })} style={{ flex: 1, padding: "12px", borderRadius: 8, border: metaForm.prioridad === 'baja' ? "1px solid #10B981" : `1px solid ${c.border}`, background: metaForm.prioridad === 'baja' ? (isDark ? "rgba(16,185,129,0.15)" : "#ECFDF5") : c.card, color: metaForm.prioridad === 'baja' ? "#10B981" : c.text, fontWeight: 600, display: "flex", justifyContent: "center", alignItems: "center", gap: 6, cursor: "pointer", transition: "0.2s" }}>
                <ChevronDown size={16} /> Baja
              </button>
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Tipo de meta</div>
            <div style={{ background: c.card, borderRadius: 12, border: `1px solid ${c.border}`, overflow: "hidden" }}>
              <div onClick={() => setMetaForm({ ...metaForm, tipo: 'libre' })} style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, cursor: "pointer", background: metaForm.tipo === 'libre' ? (isDark ? "rgba(16,185,129,0.05)" : "#F0FDF4") : "transparent" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>Ahorro libre</div>
                  <div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Tú decides cuánto ahorrar</div>
                </div>
                {metaForm.tipo === 'libre' ? <CheckCircle2 size={24} color="#10B981" /> : <Circle size={24} color={c.muted} />}
              </div>
              <div onClick={() => setMetaForm({ ...metaForm, tipo: 'obligatorio' })} style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer", background: metaForm.tipo === 'obligatorio' ? (isDark ? "rgba(16,185,129,0.05)" : "#F0FDF4") : "transparent" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>Ahorro obligatorio</div>
                  <div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Aportes fijos programados</div>
                </div>
                {metaForm.tipo === 'obligatorio' ? <CheckCircle2 size={24} color="#10B981" /> : <Circle size={24} color={c.muted} />}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Imagen / ícono</div>
            <div className="hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
              {METAS_ICONS.map(ico => (
                <div key={ico} onClick={() => setMetaForm({ ...metaForm, icono: ico })} style={{ width: 56, height: 56, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: metaForm.icono === ico ? `2px solid #10B981` : "2px solid transparent", cursor: "pointer", transition: "0.2s" }}>
                  {ico}
                </div>
              ))}
            </div>
          </div>

          <button onClick={procesarNuevaMeta} style={{ ...s.btnPrimary, background: "#059669", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", padding: 16, fontSize: 16 }}>
            {isEditingMetaObj ? "Guardar cambios" : "Guardar meta"}
          </button>
        </div>
      )}

      {/* MODALES DE MENU, APARIENCIA, ETC... SE MANTIENEN INTACTOS */}
      {showMenu && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 9999, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'menu' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('menu', () => setShowMenu(false))} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 22, color: c.text, fontWeight: 700 }}>Mi Perfil</h2>
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, color: c.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 700 }}>Mi cuenta</div>
            <MenuItem icon={<UserCircle size={24} color="#FF803C" />} text="Mis datos" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("datos")} />
            <MenuItem icon={<Lock size={24} color="#FF803C" />} text="Cambiar mi clave" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("clave")} />
            <MenuItem icon={<Trophy size={24} color="#FF803C" />} text="Mis logros / Insignias" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("logros")} />
          </div>

          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, color: c.text, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 8, fontWeight: 700 }}>Ajustes</div>
            <MenuItem icon={<Target size={24} color="#FF803C" />} text="Mi Meta de Ahorro" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("configuracion")} />
            <MenuItem icon={<Palette size={24} color="#FF803C" />} text="Apariencia (Tema Claro/Oscuro)" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => { setShowApariencia(true); setProfileScreen(null); }} />
            <MenuItem icon={<Download size={24} color="#FF803C" />} text="Exportar Reportes" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => { cerrarPantalla('menu', () => { setShowMenu(false); setShowEmailModal(true); }); }} />
            <MenuItem icon={<Headphones size={24} color="#FF803C" />} text="Centro de ayuda" color={c.text} mutedColor={c.muted} border={c.border} onClick={() => setProfileScreen("ayuda")} />
          </div>

          <div style={{ marginTop: "auto", paddingTop: 32 }}>
            <MenuItem icon={<LogOut size={24}/>} text="Cerrar sesión" color={c.red} mutedColor={c.muted} border={c.border} />
            <MenuItem icon={<Trash2 size={24}/>} text="Eliminar mi cuenta" color={c.red} mutedColor={c.muted} border={c.border} />
          </div>
        </div>
      )}

      {showMenu && profileScreen === "configuracion" && (
        <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'configuracion' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('configuracion', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mi Meta de Ahorro</h2>
          </div>
          
          <div style={{...s.card, marginBottom: 24}}>
            <div style={{ ...s.label, textAlign: "center", marginBottom: 4 }}>Definir meta de ahorro (S/)</div>
            <input style={{ ...s.input, marginBottom: 24, fontSize: 20, textAlign: "center", color: "#FF803C", fontWeight: 600 }} type={isEditingMeta ? "number" : "text"} placeholder="Ej: 100000" value={isEditingMeta ? metaAhorro : (metaAhorro ? formatMoney(metaAhorro) : "")} onFocus={() => setIsEditingMeta(true)} onBlur={() => setIsEditingMeta(false)} onChange={e => setMetaAhorro(e.target.value)} />
            
            <div style={{ ...s.label, textAlign: "center", marginBottom: 4 }}>Período de ahorro</div>
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <div style={{ flex: 1, position: "relative" }}>
                {!fechaInicioPlan && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Del</span>}
                <input type="date" value={fechaInicioPlan} onChange={e => setFechaInicioPlan(e.target.value)} style={{ ...s.input, textAlign: "center", color: fechaInicioPlan ? c.text : "transparent" }} />
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {!fechaFinPlan && <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontWeight: 600, fontSize: 14 }}>Al</span>}
                <input type="date" value={fechaFinPlan} onChange={e => setFechaFinPlan(e.target.value)} style={{ ...s.input, textAlign: "center", color: fechaFinPlan ? c.text : "transparent" }} />
              </div>
            </div>
            
            <div style={{ ...s.label, textAlign: "center", marginBottom: 4 }}>Ingreso mensual (S/)</div>
            <input style={{ ...s.input, marginBottom: 24, fontSize: 20, textAlign: "center", color: c.green, fontWeight: 600 }} type={isEditingIngreso ? "number" : "text"} placeholder="Ej: 5000" value={isEditingIngreso ? ingresoMensual : (ingresoMensual ? formatMoney(ingresoMensual) : "")} onFocus={() => setIsEditingIngreso(true)} onBlur={() => setIsEditingIngreso(false)} onChange={e => setIngresoMensual(e.target.value)} />
            <button style={s.btnPrimary} onClick={guardarConfig} disabled={saving}>{saving ? "Guardando..." : "Guardar configuración"}</button>
          </div>

          {ingMensual > 0 && metaTotalNum > 0 && (
            <div style={s.metaCard}>
              <div style={{ ...s.metaLabel, textAlign: "center", marginBottom: 0 }}>Tu plan para {formatMoney(metaTotalNum)}</div>
              <div style={{ fontSize: 14, color: "#CCC", lineHeight: 1.9, marginTop: 12, textAlign: "center", fontWeight: 500 }}>
                <div>📥 Ingreso mensual: <strong style={{ color: "#E8E0D0", fontWeight: 700 }}>{formatMoney(ingMensual)}</strong></div>
                <div>🎯 Ahorro necesario/mes: <strong style={{ color: "#FF803C", fontWeight: 700 }}>{formatMoney(ahorroMetaDiario * 30)}</strong></div>
                <div>💸 Gasto máximo/mes: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(ingMensual - (ahorroMetaDiario * 30))}</strong></div>
                <div>📆 Gasto máximo/día: <strong style={{ color: c.green, fontWeight: 700 }}>{formatMoney(presupuestoDiario)}</strong></div>
              </div>
            </div>
          )}

          <div style={{...s.card, marginBottom: 12}}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{...s.label, marginBottom:0}}>Categoría para Ingresos</div>
              <button style={{ backgroundColor: "#FF803C", WebkitAppearance: "none", color: "#FFF", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }} onClick={() => setShowNuevaCatBase(v => !v)}>+ Nuevo</button>
            </div>
            
            {showNuevaCatBase && (
              <div style={{ background: c.input, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <input style={{ ...s.input, marginBottom: 12 }} placeholder="Ej: 💰 Bono" value={nuevaCatBaseLabel} onChange={e => setNuevaCatBaseLabel(e.target.value)} />
                <div style={{ ...s.label, marginBottom: 8 }}>Elige un color</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
                  {COLORES_CUSTOM.map(col => <div key={col} onClick={() => setNuevaCatBaseColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: nuevaCatBaseColor === col ? `3px solid ${c.text}` : "3px solid transparent" }} />)}
                </div>
                <div style={{ display: "flex", gap: 10 }}><button style={s.btnSecondary} onClick={() => setShowNuevaCatBase(false)}>Cancelar</button><button style={s.btnPrimary} onClick={agregarCategoriaBase}>Agregar</button></div>
              </div>
            )}

            {safeBase.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "12px 0" }}>No hay categorías de ingresos</div> : safeBase.map((cat, i, arr) => (
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
                       {getIcono(cat.label)}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span>
                  </div>
                  <div>
                    <button style={s.editBtn} onClick={() => abrirEdicionCatBase(cat)}><Edit2 size={16}/></button>
                    <button style={s.deleteBtn} onClick={() => eliminarCategoriaBase(cat.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
              )
            ))}
          </div>

          <div style={s.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><div style={{...s.label, marginBottom:0}}>Categoría para Gastos</div><button style={{ backgroundColor: "#FF803C", WebkitAppearance: "none", color: "#FFF", border: "none", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontFamily: "inherit", fontSize: 13 }} onClick={() => setShowNuevaCat(v => !v)}>+ Nuevo</button></div>
            {showNuevaCat && (
              <div style={{ background: c.input, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <input style={{ ...s.input, marginBottom: 12 }} placeholder="Ej: 🛍️ Compras" value={nuevaCatLabel} onChange={e => setNuevaCatLabel(e.target.value)} />
                <div style={{ ...s.label, marginBottom: 8 }}>Elige un color</div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>{COLORES_CUSTOM.map(col => <div key={col} onClick={() => setNuevaCatColor(col)} style={{ width: 28, height: 28, borderRadius: "50%", background: col, cursor: "pointer", border: nuevaCatColor === col ? `3px solid ${c.text}` : "3px solid transparent" }} />)}</div>
                <div style={{ display: "flex", gap: 10 }}><button style={s.btnSecondary} onClick={() => setShowNuevaCat(false)}>Cancelar</button><button style={s.btnPrimary} onClick={agregarCategoria}>Agregar</button></div>
              </div>
            )}
            {safeExtra.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "12px 0" }}>Aún no hay categorías de gastos</div> : safeExtra.map((cat, i, arr) => (
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
                       {getIcono(cat.label)}
                    </div>
                    <span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span>
                  </div>
                  <div>
                    <button style={s.editBtn} onClick={() => abrirEdicionCat(cat)}><Edit2 size={16}/></button>
                    <button style={s.deleteBtn} onClick={() => eliminarCategoria(cat.id)}><Trash2 size={16}/></button>
                  </div>
                </div>
              )
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: 24 }}>
            <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.red }}>Opciones avanzadas</h3>
          </div>

          <div style={{ ...s.card, borderColor: isDark ? "#3A1A1A" : "#FECACA", padding: 20 }}>
            <div style={{ ...s.label, marginBottom: 16, color: c.red, textAlign: "center" }}>Zona de peligro</div>
            <button style={{ ...s.btnSecondary, padding: 14, color: c.red, borderColor: isDark ? "#5A1A1A" : "#F87171", fontWeight: 600 }} onClick={async () => {
              if (window.prompt("Escribe BORRAR TODO para confirmar:") === "BORRAR TODO") {
                await supabase.from("gastos").delete().neq("id", "00000000-0000-0000-0000-000000000000");
                setGastos([]); showToast("Todos los movimientos eliminados", c.muted);
              }
            }}>Eliminar todos los movimientos</button>
          </div>
        </div>
      )}

      {showApariencia && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'apariencia' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('apariencia', () => { setShowApariencia(false); })} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
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
          
          <button style={{ ...s.btnPrimary, marginTop: 30 }} onClick={() => { guardarConfig(); cerrarPantalla('apariencia', () => setShowApariencia(false)); }}>Guardar Preferencias</button>
        </div>
      )}

      {showMenu && profileScreen === "datos" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'datos' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('datos', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis datos</h2>
          </div>
          
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 32 }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#FF803C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700, color: "#FFF" }}>
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
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'clave' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('clave', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
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
          
          <button style={s.btnPrimary} onClick={() => { showToast("Clave actualizada ✓", c.green); cerrarPantalla('clave', () => setProfileScreen(null)); }}>Actualizar clave</button>
        </div>
      )}

      {showMenu && profileScreen === "logros" && (
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'logros' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('logros', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
            <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis logros</h2>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", border: `2px solid #FF803C` }}>
              <div style={{ fontSize: 44, marginBottom: 16 }}>🌟</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 6 }}>Primer Paso</div>
              <div style={{ fontSize: 12, color: c.muted, lineHeight: 1.4, fontWeight: 500 }}>Registraste tu primer movimiento.</div>
            </div>
            
            <div style={{ ...s.card, textAlign: "center", padding: "24px 12px", border: `2px solid #FF803C` }}>
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
        <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'ayuda' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
            <button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
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
              <button style={s.tipoBtn(form.tipo === "ingreso", c.green)} onClick={() => setForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button>
              <button style={s.tipoBtn(form.tipo === "gasto", c.red)} onClick={() => setForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button>
            </div>
            
            <input autoFocus style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
            
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                {(form.tipo === "ingreso" ? safeBase : safeExtra).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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
              <button style={s.tipoBtn(editForm.tipo === "ingreso", c.green)} onClick={() => setEditForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button>
              <button style={s.tipoBtn(editForm.tipo === "gasto", c.red)} onClick={() => setEditForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button>
            </div>
            <input style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>
                {(editForm.tipo === "ingreso" ? safeBase : safeExtra).map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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