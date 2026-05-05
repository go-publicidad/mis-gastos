import React from "react";
import { ChevronRight } from "lucide-react";

export default function Novedades({ c, isDark, isClosing, cerrarPantalla, setShowNovedades }) {
  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'novedades' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('novedades', () => setShowNovedades(false))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Novedades</h2>
      </div>
      <div style={{ background: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFF5EB", borderRadius: 16, padding: "24px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, border: `1px solid ${isDark ? "rgba(255, 128, 60, 0.3)" : "transparent"}` }}>
         <div><div style={{ fontSize: 22, fontWeight: 800, color: c.text, marginBottom: 8, lineHeight: 1.2 }}>¡Descubre<br/><span style={{color: "#FF803C"}}>novedades!</span></div><div style={{ fontSize: 14, color: "#FF803C", fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>Para ti <ChevronRight size={16}/></div></div><div style={{ fontSize: 64 }}>🚀</div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 16 }}>Lo nuevo del App</div>
      <div className="hide-scroll" style={{ display: "flex", gap: 16, overflowX: "auto", paddingBottom: 16, marginBottom: 24, scrollSnapType: "x mandatory" }}>
          <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(16, 185, 129, 0.15)" : "#ECFDF5", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(16, 185, 129, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#065F46" }}>Gestión de metas individuales</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>🎯</div></div>
          <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(77, 150, 255, 0.15)" : "#EFF6FF", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(77, 150, 255, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#1E3A8A" }}>Nuevo historial separado</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>📋</div></div>
          <div style={{ minWidth: 160, scrollSnapAlign: "start", background: isDark ? "rgba(168, 85, 247, 0.15)" : "#F5F3FF", borderRadius: 16, padding: 16, display: "flex", flexDirection: "column", gap: 12, border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "none" }}><div style={{ fontSize: 14, fontWeight: 700, color: isDark ? c.text : "#4C1D95" }}>Pull-to-refresh en Inicio</div><div style={{ fontSize: 32, alignSelf: "flex-end", marginTop: "auto" }}>👇</div></div>
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 16 }}>Consejos para tu app</div>
      <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 16, scrollSnapType: "x mandatory" }} className="hide-scroll">
          <div style={{ minWidth: 200, scrollSnapAlign: "start", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 28 }}>📊</div><div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>¡Exporta tus datos en Excel o PDF!</div></div>
          <div style={{ minWidth: 200, scrollSnapAlign: "start", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: 16, display: "flex", alignItems: "center", gap: 16 }}><div style={{ fontSize: 28 }}>🎨</div><div style={{ fontSize: 13, fontWeight: 600, color: c.text, lineHeight: 1.4 }}>¡Personaliza tus propias categorías!</div></div>
      </div>
    </div>
  );
}