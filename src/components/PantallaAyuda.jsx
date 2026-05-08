import React from "react";
import { Search, Target, Book, ChevronRight, Headphones } from "lucide-react";

export default function PantallaAyuda({ c, s, cerrarPantalla, setProfileScreen }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('ayuda', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Centro de ayuda</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", background: c.card, border: `1px solid ${c.border}`, borderRadius: 12, padding: "12px 16px", marginBottom: 32, boxShadow: c.shadow }}><Search size={20} color={c.muted} style={{ marginRight: 12 }} /><input type="text" placeholder="Buscar ayuda..." style={{ border: "none", background: "transparent", outline: "none", color: c.text, fontSize: 15, width: "100%" }} /></div>
      <div style={{ background: c.card, borderRadius: 16, border: `1px solid ${c.border}`, overflow: "hidden", marginBottom: 32 }}>
        {["metas", "movimientos"].map((catId) => (
          <div key={catId} onClick={() => alert(`Sección: ${catId}`)} style={{ display: "flex", alignItems: "center", padding: "16px", borderBottom: `1px solid ${c.border}`, cursor: "pointer" }}>
            <div style={{ flex: 1 }}><div style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{catId}</div></div>
            <ChevronRight size={20} color={c.muted} />
          </div>
        ))}
      </div>
      <button style={{ width: "100%", padding: "16px", background: "transparent", border: `1.5px solid ${c.border}`, borderRadius: 16, color: "#FF803C", fontSize: 16, fontWeight: 700 }}><Headphones size={20} /> Contactar soporte</button>
    </div>
  );
}