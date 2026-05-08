import React from "react";
import { Search, Target, Book, ChevronRight, Headphones } from "lucide-react";

export default function PantallaAyuda({ c, s, cerrarPantalla, setProfileScreen }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Centro de ayuda</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 32, boxShadow: c.shadow }}><Search size={20} color={c.muted} style={{ marginRight: 12 }} /><input type="text" placeholder="Buscar ayuda..." style={{ border: "none", background: "transparent", outline: "none", color: c.text, fontSize: 15, width: "100%", fontFamily: "inherit" }} /></div>
      
      <div style={{ fontSize: 13, color: c.muted, fontWeight: 700, letterSpacing: "1px", marginBottom: 12, textTransform: "uppercase" }}>Categorías</div>
      <div style={{ background: c.card, borderRadius: 16, border: `1px solid ${c.border}`, overflow: "hidden", marginBottom: 32, boxShadow: c.shadow }}>
        {["primeros_pasos", "metas", "movimientos", "presupuesto", "reportes", "cuenta"].map((catId) => (
          <div key={catId} onClick={() => alert(`Sección: ${catId}`)} style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: `1px solid ${c.border}`, cursor: "pointer" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 40, height: 40, marginRight: 16 }}>
              {catId === 'metas' ? <Target size={24} color="#FF803C" /> : <Book size={24} color="#FF803C" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{catId.replace('_', ' ')}</div>
              <div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Descripción de ayuda</div>
            </div>
            <ChevronRight size={20} color={c.muted} />
          </div>
        ))}
      </div>
      <button style={{ width: "100%", padding: "16px", background: "transparent", border: `1.5px solid ${c.border}`, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer", color: "#FF803C", fontSize: 16, fontWeight: 700, fontFamily: "inherit" }}><Headphones size={20} /> Contactar soporte</button>
    </div>
  );
}