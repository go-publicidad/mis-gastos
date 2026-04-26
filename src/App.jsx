import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// =============================================
// TUS CREDENCIALES (Mantenidas de tu archivo)
// =============================================
const SUPABASE_URL = "https://jboazxmcmvvcscqeerbz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impib2F6eG1jbXZ2Y3NjcWVlcmJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxNTMxMjksImV4cCI6MjA5MjcyOTEyOX0.zFKEHscM7-PaXqoSgbk7ra8JFZ3Hh69JJKktm7N4IwY";
// =============================================

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const CURRENCY = "S/";
const META_TOTAL = 100000;
const MESES = 5;
const DIAS_TOTAL = MESES * 30;

const CATEGORIAS = [
  { id: "comida", label: "🍽️ Comida", color: "#E8845A" },
  { id: "transporte", label: "🚌 Transporte", color: "#5A9BE8" },
  { id: "trabajo", label: "💼 Trabajo/Negocio", color: "#7BE85A" },
  { id: "salud", label: "❤️ Salud", color: "#E85A8A" },
  { id: "hogar", label: "🏠 Hogar", color: "#C05AE8" },
  { id: "entretenimiento", label: "🎮 Entretenimiento", color: "#E8D85A" },
  { id: "otros", label: "📦 Otros", color: "#8A9BA8" },
];

const hoy = () => new Date().toISOString().split("T")[0];
const formatMoney = (n) =>
  `${CURRENCY} ${Number(n || 0).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const diasTranscurridos = (inicio) => {
  if (!inicio) return 1;
  const diff = Math.floor((Date.now() - new Date(inicio).getTime()) / 86400000);
  return Math.max(1, diff + 1);
};

export default function App() {
  const [gastos, setGastos] = useState([]);
  const [tab, setTab] = useState("hoy");
  const [form, setForm] = useState({ monto: "", descripcion: "", categoria: "comida", tipo: "gasto" });
  const [ingresoMensual, setIngresoMensual] = useState("");
  const [fechaInicio, setFechaInicio] = useState(hoy());
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [error, setError] = useState(null);

  const showToast = (msg, color = "#D4AF37") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = async () => {
    try {
      const { data: movimientos, error: err1 } = await supabase
        .from("gastos")
        .select("*")
        .order("created_at", { ascending: false });
      if (err1) throw err1;
      setGastos(movimientos || []);

      const { data: cfg, error: err2 } = await supabase.from("config").select("*");
      if (err2) throw err2;
      if (cfg) {
        const ing = cfg.find(c => c.key === "ingresoMensual");
        const fi = cfg.find(c => c.key === "fechaInicio");
        if (ing) setIngresoMensual(ing.value);
        if (fi) setFechaInicio(fi.value);
      }
      setError(null);
    } catch (e) {
      setError("No se pudo conectar. Verifica tu configuración de Supabase.");
    }
    setLoaded(true);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) { showToast("Ingresa un monto válido", "#E85A5A"); return; }
    setSaving(true);
    const nuevo = {
      fecha: hoy(),
      monto,
      descripcion: form.descripcion || CATEGORIAS.find(c => c.id === form.categoria)?.label || "Movimiento",
      categoria: form.categoria,
      tipo: form.tipo,
    };
    const { data, error: err } = await supabase.from("gastos").insert([nuevo]).select();
    if (err) { showToast("Error al guardar", "#E85A5A"); setSaving(false); return; }
    setGastos(prev => [data[0], ...prev]);
    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast(form.tipo === "gasto" ? "Gasto registrado ✓" : "Ingreso registrado ✓");
    setSaving(false);
  };

  const eliminar = async (id) => {
    const { error: err } = await supabase.from("gastos").delete().eq("id", id);
    if (err) { showToast("Error al eliminar", "#E85A5A"); return; }
    setGastos(prev => prev.filter(g => g.id !== id));
    showToast("Eliminado", "#888");
  };

  const guardarConfig = async () => {
    setSaving(true);
    const upserts = [
      { key: "ingresoMensual", value: ingresoMensual },
      { key: "fechaInicio", value: fechaInicio },
    ];
    const { error: err } = await supabase.from("config").upsert(upserts, { onConflict: "key" });
    setSaving(false);
    if (err) { showToast("Error al guardar config", "#E85A5A"); return; }
    showToast("Configuración guardada ✓");
  };

  const fechaHoy = hoy();
  const gastosHoy = gastos.filter(g => g.fecha === fechaHoy && g.tipo === "gasto");
  const ingresosHoy = gastos.filter(g => g.fecha === fechaHoy && g.tipo === "ingreso");
  const totalGastadoHoy = gastosHoy.reduce((a, g) => a + g.monto, 0);
  const totalGastado = gastos.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ingMensual = parseFloat(ingresoMensual) || 0;
  const diasTrans = diasTranscurridos(fechaInicio);
  const diasRestantes = Math.max(0, DIAS_TOTAL - diasTrans);
  const ahorroAcumulado = totalIngresos - totalGastado;
  const progreso = Math.max(0, Math.min(100, (ahorroAcumulado / META_TOTAL) * 100));
  const ingDiario = ingMensual / 30;
  const ahorroMetaDiario = META_TOTAL / DIAS_TOTAL;
  const presupuestoDiario = ingDiario - ahorroMetaDiario;
  const gastoDiarioProm = diasTrans > 0 ? totalGastado / diasTrans : 0;

  const porCategoria = CATEGORIAS.map(cat => ({
    ...cat,
    total: gastos.filter(g => g.tipo === "gasto" && g.categoria === cat.id).reduce((a, g) => a + g.monto, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);
  const maxCat = porCategoria[0]?.total || 1;

  const gastosUltimos7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const fecha = d.toISOString().split("T")[0];
    const label = d.toLocaleDateString("es-PE", { weekday: "short" });
    const total = gastos.filter(g => g.fecha === fecha && g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
    return { label, total, fecha };
  });
  const maxBar = Math.max(...gastosUltimos7.map(d => d.total), 1);

  const s = {
    // CAMBIO: overscrollBehaviorY a "none" para evitar rebotes blancos
    app: { background: "#0A0A0A", minHeight: "100vh", color: "#E8E0D0", fontFamily: "'DM Sans','Segoe UI',sans-serif", maxWidth: 480, margin: "0 auto", paddingBottom: 100, overscrollBehaviorY: "none" },
    header: { padding: "24px 20px 0", borderBottom: "1px solid #1E1E1E" },
    title: { fontFamily: "'Playfair Display','Georgia',serif", fontSize: 28, fontWeight: 700, color: "#D4AF37", margin: 0 },
    refreshBtn: { background: "#1A1A1A", border: "1px solid #333", borderRadius: "50%", width: 38, height: 38, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 18, transition: "background 0.2s" },
    subtitle: { color: "#666", fontSize: 13, margin: "4px 0 0" },
    tabs: { display: "flex", padding: "16px 20px 0", borderBottom: "1px solid #1A1A1A" },
    tab: (a) => ({ padding: "8px 16px", background: "none", border: "none", borderBottom: a ? "2px solid #D4AF37" : "2px solid transparent", color: a ? "#D4AF37" : "#555", cursor: "pointer", fontSize: 13, fontWeight: a ? 600 : 400, transition: "all 0.2s" }),
    section: { padding: "20px" },
    card: { background: "#111", border: "1px solid #1E1E1E", borderRadius: 12, padding: "16px", marginBottom: 12 },
    metaCard: { background: "linear-gradient(135deg,#1A1500,#0F1000)", border: "1px solid #3A2E00", borderRadius: 16, padding: "20px", marginBottom: 16 },
    label: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 4 },
    bigNum: { fontFamily: "monospace", fontSize: 30, fontWeight: 700, color: "#D4AF37", lineHeight: 1 },
    smallNum: { fontFamily: "monospace", fontSize: 18, fontWeight: 600, color: "#E8E0D0" },
    redNum: { fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#E85A5A" },
    greenNum: { fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#5AE88A" },
    progressBg: { background: "#1A1A1A", borderRadius: 4, height: 8, margin: "12px 0 4px", overflow: "hidden" },
    progressFill: (p) => ({ height: "100%", width: `${p}%`, background: p >= 100 ? "#5AE88A" : p >= 50 ? "#D4AF37" : "#E85A5A", borderRadius: 4, transition: "width 0.6s ease" }),
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 },
    input: { width: "100%", background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, color: "#E8E0D0", padding: "10px 12px", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
    select: { width: "100%", background: "#111", border: "1px solid #2A2A2A", borderRadius: 8, color: "#E8E0D0", padding: "10px 12px", fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", cursor: "pointer" },
    btnPrimary: { background: "#D4AF37", color: "#000", border: "none", borderRadius: 8, padding: "12px", fontSize: 14, fontWeight: 700, cursor: "pointer", width: "100%", letterSpacing: "0.5px" },
    btnSecondary: { background: "#1A1A1A", color: "#D4AF37", border: "1px solid #3A3A00", borderRadius: 8, padding: "10px", fontSize: 13, cursor: "pointer", width: "100%" },
    tipoBtn: (a, c) => ({ flex: 1, padding: "8px", background: a ? c : "#111", border: `1px solid ${a ? c : "#2A2A2A"}`, color: a ? "#000" : "#666", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: a ? 700 : 400, transition: "all 0.2s" }),
    itemRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #161616" },
    catDot: (c) => ({ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block", marginRight: 8 }),
    deleteBtn: { background: "none", border: "none", color: "#333", cursor: "pointer", fontSize: 18, padding: "4px" },
    errorCard: { background: "#1A0A0A", border: "1px solid #5A0A0A", borderRadius: 12, padding: "16px", margin: "20px", color: "#E85A5A", fontSize: 13, lineHeight: 1.6 },
    // CAMBIO: paddingBottom env(safe-area-inset-bottom) para iPhones modernos
    navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: "#0D0D0D", borderTop: "1px solid #1A1A1A", display: "flex", zIndex: 100, paddingBottom: "env(safe-area-inset-bottom)" },
    navBtn: (a) => ({ flex: 1, padding: "12px 0", background: "none", border: "none", color: a ? "#D4AF37" : "#444", fontSize: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }),
  };

  if (!loaded) return (
    <div style={{ background: "#0A0A0A", height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <div style={{ width: 32, height: 32, border: "2px solid #1A1A1A", borderTop: "2px solid #D4AF37", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <span style={{ color: "#555", fontSize: 13 }}>Conectando...</span>
    </div>
  );

  return (
    <div style={s.app}>
      {/* --- NUEVOS ESTILOS PARA EVITAR ESPACIOS BLANCOS EN IPHONE --- */}
      <style>{`
        html, body {
          background-color: #0A0A0A !important;
          margin: 0;
          padding: 0;
          height: 100%;
          overscroll-behavior-y: none;
        }
        #root {
          background-color: #0A0A0A;
          min-height: 100vh;
        }
      `}</style>
      {/* ----------------------------------------------------------- */}

      <div style={s.header}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={s.title}>Ahorro Meta</h1>
          <button onClick={handleRefresh} style={s.refreshBtn} title="Actualizar">🔄</button>
        </div>
        <p style={s.subtitle}>
          Meta: {formatMoney(META_TOTAL)} en {MESES} meses · Día {diasTrans} de {DIAS_TOTAL}
          {saving && <span style={{ color: "#555", marginLeft: 8, fontSize: 11 }}>· Guardando...</span>}
        </p>
        <div style={s.tabs}>
          {[{ id: "hoy", label: "Hoy" }, { id: "resumen", label: "Resumen" }, { id: "historial", label: "Historial" }, { id: "config", label: "Config" }].map(t => (
            <button key={t.id} style={s.tab(tab === t.id)} onClick={() => setTab(t.id)}>{t.label}</button>
          ))}
        </div>
      </div>

      {error && <div style={s.errorCard}>⚠️ {error}</div>}

      {tab === "hoy" && (
        <div style={s.section}>
          <div style={s.metaCard}>
            <div style={s.label}>Progreso hacia tu meta</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={s.bigNum}>{formatMoney(Math.max(0, ahorroAcumulado))}</span>
              <span style={{ color: "#555", fontSize: 13 }}>de {formatMoney(META_TOTAL)}</span>
            </div>
            <div style={s.progressBg}><div style={s.progressFill(progreso)} /></div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#888" }}>
              <span>{progreso.toFixed(1)}% completado</span>
              <span>{diasRestantes} días restantes</span>
            </div>
          </div>

          <div style={s.grid2}>
            <div style={s.card}><div style={s.label}>Gastado hoy</div><div style={{ ...s.redNum, fontSize: 20 }}>{formatMoney(totalGastadoHoy)}</div></div>
            <div style={s.card}><div style={s.label}>Límite/día</div><div style={{ ...s.greenNum, fontSize: 20 }}>{ingMensual > 0 ? formatMoney(presupuestoDiario) : "—"}</div></div>
          </div>

          {ingMensual > 0 && (
            <div style={{ ...s.card, marginBottom: 16, background: totalGastadoHoy > presupuestoDiario ? "#1A0A0A" : "#0A1A0A", border: `1px solid ${totalGastadoHoy > presupuestoDiario ? "#3A1000" : "#103A10"}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={s.label}>Saldo disponible hoy</div>
                  <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: (presupuestoDiario - totalGastadoHoy) >= 0 ? "#5AE88A" : "#E85A5A" }}>
                    {formatMoney(presupuestoDiario - totalGastadoHoy)}
                  </div>
                </div>
                <span style={{ fontSize: 28 }}>{(presupuestoDiario - totalGastadoHoy) >= 0 ? "✅" : "⚠️"}</span>
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
                {CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
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
                const cat = CATEGORIAS.find(c => c.id === g.categoria);
                return (
                  <div key={g.id} style={s.itemRow}>
                    <div style={{ display: "flex", alignItems: "center", flex: 1 }}>
                      {cat && <span style={s.catDot(cat.color)} />}
                      <span style={{ fontSize: 14, color: "#C0B8A8" }}>{g.descripcion}</span>
                    </div>
                    <span style={{ fontFamily: "monospace", fontWeight: 600, color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", marginRight: 8 }}>
                      {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                    </span>
                    <button style={s.deleteBtn} onClick={() => eliminar(g.id)}>×</button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ ...s.card, textAlign: "center", color: "#333", padding: "24px" }}>Sin movimientos hoy</div>
          )}
        </div>
      )}

      {tab === "resumen" && (
        <div style={s.section}>
          <div style={s.grid2}>
            <div style={s.card}><div style={s.label}>Total gastado</div><div style={s.redNum}>{formatMoney(totalGastado)}</div></div>
            <div style={s.card}><div style={s.label}>Total ingresos</div><div style={s.greenNum}>{formatMoney(totalIngresos)}</div></div>
            <div style={s.card}><div style={s.label}>Ahorro actual</div><div style={{ ...s.smallNum, color: ahorroAcumulado >= 0 ? "#D4AF37" : "#E85A5A" }}>{formatMoney(ahorroAcumulado)}</div></div>
            <div style={s.card}><div style={s.label}>Gasto prom/día</div><div style={s.smallNum}>{formatMoney(gastoDiarioProm)}</div></div>
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
          {porCategoria.length > 0 && (
            <div style={s.card}>
              <div style={{ ...s.label, marginBottom: 14 }}>Por categoría</div>
              {porCategoria.map(cat => (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13 }}>{cat.label}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 13, color: cat.color }}>{formatMoney(cat.total)}</span>
                  </div>
                  <div style={{ background: "#1A1A1A", borderRadius: 3, height: 4, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${(cat.total / maxCat) * 100}%`, background: cat.color, borderRadius: 3 }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "historial" && (
        <div style={s.section}>
          {gastos.length === 0 ? (
            <div style={{ ...s.card, textAlign: "center", color: "#333", padding: "32px" }}>Sin movimientos aún</div>
          ) : (
            <>
              <div style={{ ...s.label, marginBottom: 12 }}>{gastos.length} movimientos totales</div>
              {gastos.map(g => {
                const cat = CATEGORIAS.find(c => c.id === g.categoria);
                return (
                  <div key={g.id} style={{ ...s.card, padding: "12px 14px", marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", marginBottom: 2 }}>
                          {cat && <span style={s.catDot(cat.color)} />}
                          <span style={{ fontSize: 14 }}>{g.descripcion}</span>
                        </div>
                        <span style={{ fontSize: 11, color: "#444" }}>{g.fecha}</span>
                      </div>
                      <span style={{ fontFamily: "monospace", fontWeight: 700, color: g.tipo === "gasto" ? "#E85A5A" : "#5AE88A", marginRight: 8 }}>
                        {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                      </span>
                      <button style={s.deleteBtn} onClick={() => eliminar(g.id)}>×</button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {tab === "config" && (
        <div style={s.section}>
          <div style={s.card}>
            <div style={{ ...s.label, marginBottom: 8 }}>Ingreso mensual (S/)</div>
            <input style={{ ...s.input, marginBottom: 16, fontSize: 20 }} type="number" placeholder="Ej: 5000" value={ingresoMensual} onChange={e => setIngresoMensual(e.target.value)} />
            <div style={{ ...s.label, marginBottom: 8 }}>Fecha de inicio del plan</div>
            <input style={{ ...s.input, marginBottom: 16 }} type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} />
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
          <div style={{ ...s.card, borderColor: "#2A0A0A" }}>
            <div style={{ ...s.label, marginBottom: 8, color: "#E85A5A" }}>Zona de peligro</div>
            <button style={{ ...s.btnSecondary, color: "#E85A5A", borderColor: "#3A1A1A" }}
              onClick={async () => {
                if (window.confirm("¿Borrar TODOS los movimientos? Esta acción no se puede deshacer.")) {
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

      <div style={s.navBar}>
        {[{ id: "hoy", icon: "📝", label: "Hoy" }, { id: "resumen", icon: "📊", label: "Resumen" }, { id: "historial", icon: "📋", label: "Historial" }, { id: "config", icon: "⚙️", label: "Config" }].map(n => (
          <button key={n.id} style={s.navBtn(tab === n.id)} onClick={() => setTab(n.id)}>
            <span style={{ fontSize: 20 }}>{n.icon}</span>
            <span>{n.label}</span>
          </button>
        ))}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 90, left: "50%", transform: "translateX(-50%)", background: "#1A1A1A", border: `1px solid ${toast.color}`, color: toast.color, padding: "10px 20px", borderRadius: 8, fontSize: 13, zIndex: 999, whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,0.5)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}