import React from "react";
import { formatMoney, getIcono, getTexto } from "../utils";

export default function ModalCrearPresupuesto({
  c, s, isDark, isClosing, cerrarPantalla, setShowCrearPresupuesto, 
  presupForm, setPresupForm, safeExtra, setProfileScreen, setShowMenu, 
  guardarPresupuesto, saving
}) {
  const totalCalculado = Object.values(presupForm.categorias).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  
  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'crearPresupuesto' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('crearPresupuesto', () => setShowCrearPresupuesto(false))} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Crear presupuesto</h2>
      </div>
      
      <div style={{ ...s.label, marginBottom: 8, fontSize: 13, color: c.muted }}>¿Para qué período?</div>
      <input type="month" style={{...s.input, marginBottom: 24, fontSize: 16, fontWeight: 700}} value={presupForm.periodo} onChange={e => setPresupForm({...presupForm, periodo: e.target.value})} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 16, borderBottom: `1px solid ${c.border}`, marginBottom: 24 }}>
         <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>Presupuesto total</span>
         <span style={{ fontSize: 20, fontWeight: 800, color: c.green }}>S/ {formatMoney(totalCalculado).replace("S/ ","")}</span>
      </div>

      <div style={{ ...s.label, marginBottom: 16, fontSize: 15 }}>Asignar por categorías</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
         {safeExtra.map(cat => (
             <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                   <div style={{ width: 44, height: 44, borderRadius: "50%", background: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: c.text }}>{getIcono(cat.label)}</div>
                   <span style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{getTexto(cat.label)}</span>
                </div>
                <div style={{ position: "relative", width: 130 }}>
                   <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: c.muted, fontWeight: 600, fontSize: 15 }}>S/</span>
                   <input type="number" style={{ ...s.input, paddingLeft: 36, textAlign: "right", fontSize: 16, fontWeight: 700 }} placeholder="0.00" 
                      value={presupForm.categorias[cat.id] || ""}
                      onChange={e => setPresupForm({ ...presupForm, categorias: { ...presupForm.categorias, [cat.id]: e.target.value } })}
                   />
                </div>
             </div>
         ))}
      </div>

      <div style={{ textAlign: "center", marginBottom: 32 }}>
         <p style={{ fontSize: 13, color: c.muted, margin: 0, fontWeight: 500 }}>
            ¿Falta alguna? Administra tus categorías desde la <button onClick={() => { setShowCrearPresupuesto(false); setProfileScreen("categorias"); setShowMenu(true); }} style={{ background: "none", border: "none", color: c.brandBlue, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "underline", fontFamily: "inherit" }}>Configuración</button>.
         </p>
      </div>

      <button onClick={guardarPresupuesto} disabled={saving} style={{ ...s.btnPrimary, background: c.brandBlue, boxShadow: "0 8px 24px rgba(74, 58, 255, 0.3)", padding: 16, fontSize: 16, borderRadius: 16 }}>
         {saving ? "Guardando..." : "Guardar presupuesto"}
      </button>
    </div>
  );
}