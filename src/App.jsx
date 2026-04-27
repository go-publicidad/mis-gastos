import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// =============================================
// CONFIGURACIÓN DE SUPABASE
// =============================================
const SUPABASE_URL = "https://jboazxmcmvvcscqeerbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2F6eG1jbXZ2Y3NjcWVlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMxMjksImV4cCI6MjA5MjcyOTEyOX0.zFKEHscM7-PaXqoSgbk7ra8JFZ3Hh69JJKktm7N4IwY";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CURRENCY = "S/";
const META_TOTAL = 100000;
const MESES = 5;
const DIAS_TOTAL = MESES * 30;

const CATEGORIAS_DEFAULT = [
  { id: "comida", label: "🍽️ Comida", color: "#E8845A" },
  { id: "transporte", label: "🚌 Transporte", color: "#5A9BE8" },
  { id: "trabajo", label: "💼 Trabajo/Negocio", color: "#7BE85A" },
  { id: "salud", label: "❤️ Salud", color: "#E85A8A" },
  { id: "hogar", label: "🏠 Hogar", color: "#C05AE8" },
  { id: "entretenimiento", label: "🎮 Entretenimiento", color: "#E8D85A" },
  { id: "otros", label: "📦 Otros", color: "#8A9BA8" },
];

const COLORES_CUSTOM = ["#FF6B6B","#FFD93D","#6BCB77","#4D96FF","#C77DFF","#FF9F1C","#2EC4B6","#E71D36","#F72585","#B5E48C"];

// AJUSTE DE ZONA HORARIA LIMA (UTC-5)
const hoy = () => {
  const ahora = new Date();
  const offset = -5; // Lima es UTC-5
  const lima = new Date(ahora.getTime() + (offset * 3600000) + (ahora.getTimezoneOffset() * 60000));
  return lima.toISOString().split("T")[0];
};

const formatMoney = (n) =>
  `${CURRENCY} ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// CORRECCIÓN PUNTO 3: HORA EXACTA LIMA
const formatDateTime = (isoStr) => {
  if (!isoStr) return { fecha: "", hora: "" };
  const dt = new Date(isoStr);
  const tz = "America/Lima";
  const fecha = dt.toLocaleDateString("es-PE", { timeZone: tz, day: "2-digit", month: "2-digit", year: "numeric" });
  const hora = dt.toLocaleTimeString("es-PE", { timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
  return { fecha, hora };
};

const diasTranscurridos = (inicio) => {
  if (!inicio) return 1;
  const diff = Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000);
  return Math.max(1, diff + 1);
};

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [categoriasExtra, setCategoriasExtra] = useState([]);
  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  const [ingresoMensual, setIngresoMensual] = useState("");
  const [fechaInicio, setFechaInicio] = useState(hoy());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);
  const [editando, setEditando] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [filtroResumen, setFiltroResumen] = useState("todo");
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState(hoy());
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState(hoy());

  const categorias = [...CATEGORIAS_DEFAULT, ...categoriasExtra];

  const showToast = (msg, color = "#D4AF37") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data: movimientos } = await supabase.from("gastos").select("*").order("created_at", { ascending: false });
        setGastos(movimientos || []);
        const { data: cfg } = await supabase.from("config").select("*");
        if (cfg) {
          const ing = cfg.find(c => c.key === "ingresoMensual");
          const fi = cfg.find(c => c.key === "fechaInicio");
          if (ing) setIngresoMensual(ing.value);
          if (fi) setFechaInicio(fi.value);
        }
      } catch (e) { setError("Error de conexión"); }
      setLoaded(true);
    })();
  }, []);

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) return;
    setSaving(true);
    const nuevo = { fecha: hoy(), monto, descripcion: form.descripcion || "Movimiento", categoria: form.categoria, tipo: form.tipo };
    const { data } = await supabase.from("gastos").insert([nuevo]).select();
    if (data) setGastos(prev => [data[0], ...prev]);
    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast("Registrado ✓");
    setSaving(false);
  };

  const guardarEdicion = async () => {
    setSaving(true);
    const updates = { monto: parseFloat(editForm.monto), descripcion: editForm.descripcion, categoria: editForm.categoria, tipo: editForm.tipo };
    await supabase.from("gastos").update(updates).eq("id", editando.id);
    setGastos(prev => prev.map(g => g.id === editando.id ? { ...g, ...updates } : g));
    setEditando(null);
    setSaving(false);
    showToast("Actualizado ✓");
  };

  const totalGastado = gastos.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ahorroAcumulado = totalIngresos - totalGastado;
  const progreso = Math.max(0, Math.min(100, (ahorroAcumulado / META_TOTAL) * 100));
  const diasTrans = diasTranscurridos(fechaInicio);
  const diasRestantes = Math.max(0, DIAS_TOTAL - diasTrans);

  const getFiltradosResumen = () => {
    if (filtroResumen === "hoy") return gastos.filter(g => g.fecha === hoy());
    if (filtroResumen === "rango") return gastos.filter(g => g.fecha >= filtroFechaResumenDesde && g.fecha <= filtroFechaResumenHasta);
    return gastos;
  };

  const s = {
    // CORRECCIÓN PUNTO 1: ELIMINAR BORDES BLANCOS
    app: { background: "#0A0A0A", minHeight: "100vh", color: "#E8E0D0", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(80px + env(safe-area-inset-bottom))", width: "100%", overflowX: "hidden" },
    header: { padding: "24px 20px 0", borderBottom: "1px solid #1E1E1E" },
    card: { background: "#111", border: "1px solid #1E1E1E", borderRadius: 12, padding: "16px", marginBottom: 12 },
    input: { width: "100%", background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, color: "#E8E0D0", padding: "10px", fontSize: 15, boxSizing: "border-box" },
    navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0D0D0D", borderTop: "1px solid #1A1A1A", display: "flex", paddingBottom: "env(safe-area-inset-bottom)" },
    navBtn: (a) => ({ flex: 1, padding: "12px 0", background: "none", border: "none", color: a ? "#D4AF37" : "#444", fontSize: 10, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }),
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 },
  };

  if (!loaded) return <div style={{ background: "#0A0A0A", height: "100vh" }} />;

  return (
    <div style={s.app}>
      {/* CORRECCIÓN PUNTO 1: ESTILOS GLOBALES */}
      <style>{`
        html, body { background: #0A0A0A !important; margin: 0; padding: 0; width: 100%; height: 100%; overflow-x: hidden; }
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div style={s.header}>
        <h1 style={{ color: "#D4AF37", fontSize: 28, margin: 0 }}>Ahorro Meta</h1>
        <div style={{ display: "flex", gap: 10, marginTop: 15, borderBottom: "1px solid #1A1A1A" }}>
          {["hoy", "resumen", "historial", "config"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{ padding: "10px", background: "none", border: "none", color: tab === t ? "#D4AF37" : "#555", borderBottom: tab === t ? "2px solid #D4AF37" : "none", textTransform: "capitalize" }}>{t}</button>
          ))}
        </div>
      </div>

      <div style={{ padding: 20 }}>
        {tab === "hoy" && (
          <div style={s.card}>
            <div style={{ fontSize: 11, color: "#666" }}>PROGRESO</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#D4AF37" }}>{formatMoney(ahorroAcumulado)}</div>
            <div style={{ background: "#1A1A1A", height: 8, borderRadius: 4, margin: "10px 0" }}>
              <div style={{ width: `${progreso}%`, height: "100%", background: "#D4AF37", borderRadius: 4 }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span>{progreso.toFixed(1)}%</span>
              <span>{diasRestantes} días faltan</span>
            </div>
          </div>
        )}

        {tab === "resumen" && (
          <>
            <div style={{ display: "flex", gap: 8, marginBottom: 15 }}>
              {["todo", "hoy", "rango"].map(f => (
                <button key={f} onClick={() => setFiltroResumen(f)} style={{ flex: 1, padding: "8px", borderRadius: 20, background: filtroResumen === f ? "#D4AF37" : "#111", color: filtroResumen === f ? "#000" : "#666", border: "1px solid #222" }}>{f}</button>
              ))}
            </div>

            {/* CORRECCIÓN PUNTO 2: RANGO EN UNA FILA */}
            {filtroResumen === "rango" && (
              <div style={{ ...s.card, display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>DESDE</div>
                  <input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={s.input} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 9, color: "#555", marginBottom: 3 }}>HASTA</div>
                  <input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={s.input} />
                </div>
              </div>
            )}
          </>
        )}

        {tab === "historial" && (
          <div>
            {getFiltradosResumen().map(g => {
              const { fecha, hora } = formatDateTime(g.created_at);
              return (
                <div key={g.id} style={{ ...s.card, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 14 }}>{g.descripcion}</div>
                    <div style={{ fontSize: 10, color: "#555" }}>{fecha} · <span style={{ color: "#D4AF37" }}>{hora}</span></div>
                  </div>
                  <div style={{ color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", fontWeight: 700 }}>
                    {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                    <button onClick={() => { setEditando(g); setEditForm(g); }} style={{ marginLeft: 10, background: "none", border: "none" }}>✏️</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editando && (
        <div style={s.overlay}>
          <div style={{ background: "#111", padding: 20, borderRadius: 15, width: "100%", maxWidth: 350 }}>
            <h3 style={{ margin: "0 0 15px", color: "#D4AF37" }}>Editar Movimiento</h3>
            <input type="number" value={editForm.monto} onChange={e => setEditForm({ ...editForm, monto: e.target.value })} style={s.input} />
            <input type="text" value={editForm.descripcion} onChange={e => setEditForm({ ...editForm, descripcion: e.target.value })} style={{ ...s.input, margin: "10px 0" }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={guardarEdicion} style={{ flex: 1, padding: 10, background: "#D4AF37", borderRadius: 8, border: "none" }}>Guardar</button>
              <button onClick={() => setEditando(null)} style={{ flex: 1, padding: 10, background: "#333", color: "#fff", borderRadius: 8, border: "none" }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      <div style={s.navBar}>
        {[{ id: "hoy", i: "📝" }, { id: "resumen", i: "📊" }, { id: "historial", i: "📋" }, { id: "config", i: "⚙️" }].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={s.navBtn(tab === n.id)}>
            <span style={{ fontSize: 20 }}>{n.i}</span>
            <span style={{ textTransform: "capitalize" }}>{n.id}</span>
          </button>
        ))}
      </div>
    </div>
  );
}