import React from "react";
import { METAS_ICONS } from "../constants";

export default function ModalCrearMeta({
  c, s, isDark, isClosing, cerrarPantalla, setShowCrearMeta, setIsEditingMetaObj, 
  isEditingMetaObj, metaForm, setMetaForm, procesarNuevaMeta
}) {
  return (
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
        <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Aporte inicial <span style={{ color: c.muted, fontWeight: "normal" }}>{isEditingMetaObj ? "(No se puede editar)" : "(Opcional)"}</span></div>
        <input style={{ ...s.input, opacity: isEditingMetaObj ? 0.6 : 1 }} type="number" placeholder="S/ 0.00" value={metaForm.aporteInicial} onChange={e => setMetaForm({ ...metaForm, aporteInicial: e.target.value })} disabled={isEditingMetaObj} />
      </div>
      <div style={{ marginBottom: 24 }}>
        <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Fecha límite</div>
        <div style={{ position: "relative" }}>
          {!metaForm.fechaLimite && <span style={{ position: "absolute", top: "50%", left: 14, transform: "translateY(-50%)", color: c.muted, pointerEvents: "none", fontSize: 15 }}>Selecciona una fecha</span>}
          <input type="date" value={metaForm.fechaLimite} onChange={e => setMetaForm({ ...metaForm, fechaLimite: e.target.value })} style={{ ...s.input, color: metaForm.fechaLimite ? c.text : "transparent" }} />
        </div>
      </div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ ...s.label, marginBottom: 8, fontSize: 13 }}>Imagen / ícono</div>
        <div className="hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 4 }}>
          {METAS_ICONS.map(ico => (
            <div key={ico} onClick={() => setMetaForm({ ...metaForm, icono: ico })} style={{ width: 56, height: 56, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0, border: metaForm.icono === ico ? `2px solid #10B981` : "2px solid transparent", cursor: "pointer", transition: "0.2s" }}>{ico}</div>
          ))}
        </div>
      </div>
      <button onClick={procesarNuevaMeta} style={{ ...s.btnPrimary, background: "#059669", boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", padding: 16, fontSize: 16 }}>{isEditingMetaObj ? "Guardar cambios" : "Guardar meta"}</button>
    </div>
  );
}