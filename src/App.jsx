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

const formatFullDate = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  return date.toLocaleString("es-PE", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false
  });
};

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

  const showToast = (msg, color = "#D4AF37") => {
    setToast({ msg, color });
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
    setTimeout(() => setToast(null), 2500);
  };

  const fetchData = async () => {
    try {
      const { data: movs } = await supabase.from("gastos").select("*").order("created_at", { ascending: false });
      setGastos(movs || []);
      const { data: cfg } = await supabase.from("config").select("*");
      if (cfg) {
        const ing = cfg.find(c => c.key === "ingresoMensual");
        const fi = cfg.find(c => c.key === "fechaInicio");
        if (ing) setIngresoMensual(ing.value);
        if (fi) setFechaInicio(fi.value);
      }
    } catch (e) { console.error(e); }
    setLoaded(true);
  };

  useEffect(() => { fetchData(); }, []);

  const agregarMovimiento = async () => {
    const monto = parseFloat(form.monto);
    if (!monto || monto <= 0) return;
    setSaving(true);
    const nuevo = {
      fecha: hoy(), monto,
      descripcion: form.descripcion || CATEGORIAS.find(c => c.id === form.categoria)?.label || "Movimiento",
      categoria: form.categoria, tipo: form.tipo,
      created_at: new Date().toISOString()
    };
    const { data } = await supabase.from("gastos").insert([nuevo]).select();
    if (data) setGastos(prev => [data[0], ...prev]);
    setForm(f => ({ ...f, monto: "", descripcion: "" }));
    showToast("✓ Registrado");
    setSaving(false);
  };

  const totalGastado = gastos.filter(g => g.tipo === "gasto").reduce((a, g) => a + g.monto, 0);
  const totalIngresos = gastos.filter(g => g.tipo === "ingreso").reduce((a, g) => a + g.monto, 0);
  const ahorroActual = totalIngresos - totalGastado;
  const progreso = Math.min(100, (ahorroActual / META_TOTAL) * 100);
  const diasTrans = diasTranscurridos(fechaInicio);
  const diasRestantes = Math.max(1, DIAS_TOTAL - diasTrans);
  const ahorroFaltante = META_TOTAL - ahorroActual;
  const ahorroNecesarioDiario = ahorroFaltante / diasRestantes;
  const esFactible = (parseFloat(ingresoMensual) / 30) >= ahorroNecesarioDiario;

  const s = {
    app: { background: "#0A0A0A", minHeight: "100vh", color: "#E8E0D0", maxWidth: 480, margin: "0 auto", paddingBottom: "calc(130px + env(safe-area-inset-bottom))" },
    header: { 
      position: "sticky", top: 0, zIndex: 1000, background: "#0A0A0A", 
      padding: "calc(25px + env(safe-area-inset-top)) 20px 0", borderBottom: "1px solid #1A1A1A"
    },
    title: { fontFamily: "serif", fontSize: 26, color: "#D4AF37", margin: 0, width: "100%" },
    subtitle: { color: "#555", fontSize: 11, margin: "4px 0 10px", height: 14, overflow: "hidden" },
    tabs: { display: "flex", width: "100%", borderTop: "1px solid #111" },
    tab: (a) => ({ 
      flex: 1, textAlign: "center", padding: "14px 0", background: "none", border: "none", 
      borderBottom: a ? "2px solid #D4AF37" : "2px solid transparent",
      color: a ? "#D4AF37" : "#444", fontSize: 13, fontWeight: a ? 700 : 400, transition: "color 0.2s" 
    }),
    section: { padding: "20px" },
    card: { background: "#111", border: "1px solid #1E1E1E", borderRadius: 18, padding: "18px", marginBottom: 12 },
    input: { width: "100%", background: "#181818", border: "2px solid #222", borderRadius: 12, color: "#fff", padding: "12px", fontSize: 16, marginBottom: 10, boxSizing: "border-box", outline: "none", transition: "all 0.2s" },
    // CORRECCIÓN MAESTRA: Menú con altura extra y Safe Area
    navBar: { 
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, 
      background: "rgba(13, 13, 13, 0.9)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", zIndex: 1000, 
      paddingBottom: "calc(25px + env(safe-area-inset-bottom))", // Más aire abajo
      paddingTop: "15px" // Más aire arriba de los iconos
    }
  };

  if (!loaded) return <div style={{background:"#0A0A0A", height:"100vh"}} />;

  return (
    <div style={s.app}>
      <style>{`
        html, body { background-color: #0A0A0A !important; margin: 0; padding: 0; width: 100%; overflow-x: hidden; }
        input:focus { border-color: #D4AF37 !important; box-shadow: 0 0 10px rgba(212,175,55,0.1); }
        .hitos-banner { background: linear-gradient(90deg, #D4AF37, #B08D26); color: #000; padding: 10px; border-radius: 12px; font-weight: 800; text-align: center; font-size: 13px; margin-bottom: 15px; animation: bounce 2s infinite; }
        @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
        * { -webkit-tap-highlight-color: transparent; }
      `}</style>

      <div style={s.header}>
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h1 style={s.title}>Ahorro Meta</h1>
          <button onClick={()=>window.location.reload()} style={{background:"#1A1A1A", border:"none", borderRadius:50, width:35, height:35}}>🔄</button>
        </div>
        <div style={s.subtitle}>Meta: {formatMoney(META_TOTAL)} · Día {diasTrans} de {DIAS_TOTAL}</div>
        <div style={s.tabs}>
          {[{id:"hoy", l:"Hoy"}, {id:"resumen", l:"Resumen"}, {id:"historial", l:"Historial"}, {id:"config", l:"Config"}].map(t => (
            <button key={t.id} style={s.tab(tab === t.id)} onClick={()=>setTab(t.id)}>{t.l}</button>
          ))}
        </div>
      </div>

      <div style={s.section}>
        {tab === "hoy" && (
          <>
            <div style={{...s.card, borderLeft: `5px solid ${esFactible ? "#5AE88A" : "#E85A5A"}`}}>
              <div style={{fontSize:10, color:"#666", marginBottom:4}}>ESTADO DE LA META</div>
              <div style={{fontSize:15, fontWeight:700, color: esFactible ? "#5AE88A" : "#E85A5A"}}>
                {esFactible ? "🟢 Vas por buen camino para los 100k" : "🔴 Meta en riesgo: ahorra más"}
              </div>
            </div>

            {ahorroActual >= 10000 && (
              <div className="hitos-banner">🏆 ¡BRUTAL! Superaste tus primeros S/ 10,000</div>
            )}

            <div style={s.card}>
              <div style={{display:"flex", gap:10, marginBottom:15}}>
                <button style={{flex:1, padding:10, borderRadius:10, border:"none", background: form.tipo==="gasto"?"#E85A5A":"#1A1A1A", color:form.tipo==="gasto"?"#000":"#666"}} onClick={()=>setForm({...form, tipo:"gasto"})}>− Gasto</button>
                <button style={{flex:1, padding:10, borderRadius:10, border:"none", background: form.tipo==="ingreso"?"#5AE88A":"#1A1A1A", color:form.tipo==="ingreso"?"#000":"#666"}} onClick={()=>setForm({...form, tipo:"ingreso"})}>+ Ingreso</button>
              </div>
              <input style={s.input} type="number" placeholder="S/ 0.00" value={form.monto} onChange={e=>setForm({...form, monto:e.target.value})} />
              <input style={s.input} type="text" placeholder="Descripción" value={form.descripcion} onChange={e=>setForm({...form, descripcion:e.target.value})} />
              <button style={{background:"#D4AF37", color:"#000", border:"none", borderRadius:12, padding:14, width:"100%", fontWeight:700}} onClick={agregarMovimiento}>Registrar Movimiento</button>
            </div>
          </>
        )}

        {tab === "resumen" && (
          <div>
            <div style={s.card}>
              <div style={{fontSize:11, color:"#666"}}>PROGRESO TOTAL</div>
              <div style={{fontSize:32, fontWeight:800, color:"#D4AF37", margin:"8px 0"}}>{progreso.toFixed(1)}%</div>
              <div style={{height:10, background:"#1A1A1A", borderRadius:10, overflow:"hidden"}}>
                <div style={{width:`${progreso}%`, height:"100%", background:"#D4AF37", transition:"width 1s ease-out"}} />
              </div>
            </div>
            
            <div style={s.card}>
              <div style={{fontSize:11, color:"#666", marginBottom:15}}>GASTOS POR CATEGORÍA</div>
              {CATEGORIAS.map(cat => {
                const total = gastos.filter(g => g.categoria === cat.id && g.tipo === "gasto").reduce((a, b) => a + b.monto, 0);
                const p = totalGastado > 0 ? (total / totalGastado) * 100 : 0;
                return total > 0 ? (
                  <div key={cat.id} style={{marginBottom:15}}>
                    <div style={{display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:4}}>
                      <span>{cat.label}</span><span>{formatMoney(total)}</span>
                    </div>
                    <div style={{height:6, background:"#1A1A1A", borderRadius:10, overflow:"hidden"}}>
                      <div style={{width:`${p}%`, height:"100%", background:cat.color}} />
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {tab === "historial" && (
          <div>
            {gastos.map(g => (
              <div key={g.id} style={s.card}>
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
                  <div>
                    <div style={{fontWeight:600, fontSize:14}}>{g.descripcion}</div>
                    <div style={{fontSize:10, color:"#555", marginTop:4}}>🕒 {formatFullDate(g.created_at)}</div>
                  </div>
                  <div style={{color: g.tipo==="gasto"?"#E85A5A":"#5AE88A", fontWeight:700}}>
                    {g.tipo==="gasto"?"-":"+"}{formatMoney(g.monto)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "config" && (
          <div style={s.card}>
            <div style={{fontSize:11, color:"#666", marginBottom:15}}>ADMINISTRACIÓN</div>
            <button style={{background:"#1A1A1A", color:"#5AE88A", border:"1px solid #222", padding:12, borderRadius:12, width:"100%", fontWeight:600}} 
              onClick={() => {
                const headers = "Fecha Completa,Monto,Descripcion,Categoria,Tipo\n";
                const data = gastos.map(g => `${formatFullDate(g.created_at)},${g.monto},${g.descripcion},${g.categoria},${g.tipo}`).join("\n");
                const blob = new Blob([headers + data], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `Ahorro_${hoy()}.csv`; a.click();
              }}>📥 Descargar Reporte CSV</button>
          </div>
        )}
      </div>

      <div style={s.navBar}>
        {[{ id: "hoy", icon: "📝", l: "Hoy" }, { id: "resumen", icon: "📊", l: "Resumen" }, { id: "historial", icon: "📋", l: "Historial" }, { id: "config", icon: "⚙️", l: "Config" }].map(n => (
          <button key={n.id} onClick={() => setTab(n.id)} style={{ flex: 1, background: "none", border: "none", color: tab === n.id ? "#D4AF37" : "#444", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 22 }}>{n.icon}</span>
            <span style={{ fontSize: 10, fontWeight: tab === n.id ? 700 : 400 }}>{n.l}</span>
          </button>
        ))}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 130, left: "50%", transform: "translateX(-50%)", background: "rgba(20,20,20,0.9)", border: `1px solid ${toast.color}`, color: toast.color, padding: "12px 25px", borderRadius: 20, zIndex: 1000, fontWeight: 700, backdropFilter: "blur(10px)" }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}