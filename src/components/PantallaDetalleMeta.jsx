import React from "react";
import { ArrowLeft, MoreVertical, Trash2, CheckCircle2 } from "lucide-react";
import { formatMoney, formatFecha, diffDias, hoy } from "../utils";

export default function PantallaDetalleMeta({
  c, s, isDark, isClosing, metaSeleccionada, cerrarPantalla, setMetaSeleccionada,
  showMetaMenu, setShowMetaMenu, eliminarMeta, setIsEditingMetaObj, setMetaForm,
  setShowCrearMeta, SAFE_PASTEL
}) {
  if (!metaSeleccionada) return null;

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
  const bgIconColor = SAFE_PASTEL[Math.abs((metaSeleccionada.nombre || "").length) % SAFE_PASTEL.length];

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
        <button onClick={() => { setIsEditingMetaObj(true); setMetaForm(metaSeleccionada); setShowCrearMeta(true); setMetaSeleccionada(null); }} style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}>Editar meta</button>
      </div>
    </div>
  );
}