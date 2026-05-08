import React from "react";

export default function PantallaApariencia({ c, s, theme, setTheme, guardarConfig, showToast, cerrarPantalla, setProfileScreen, setShowApariencia, setShowMenu }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('apariencia', () => { setShowApariencia(false); setProfileScreen(null); setShowMenu(true); })} style={{ backgroundColor: "transparent", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: "700" }}>Pantalla y brillo</h2>
      </div>
      <div style={{ fontSize: 14, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12, fontWeight: 700 }}>Aspecto</div>
      <div style={{ background: c.card, borderRadius: 16, padding: "20px 20px 0", marginBottom: 24, border: `1px solid ${c.border}`, boxShadow: c.shadow }}>
        <div style={{ display: "flex", justifyContent: "space-around", paddingBottom: 24 }}>
          {/* TEMA CLARO */}
          <div onClick={async () => { setTheme("light"); localStorage.setItem("themePref", "light"); showToast("Tema Claro guardado ✓"); await guardarConfig("themePref", "light"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <div style={{ width: 66, height: 130, borderRadius: 12, background: "#FFF", border: theme === "light" ? "3px solid #34C759" : "1px solid #CCC", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 12, left: 6, right: 6, height: 24, background: "#E5E5E5", borderRadius: 4 }} />
              <div style={{ position: "absolute", top: 44, left: 6, right: 6, height: 18, background: "#E5E5E5", borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 16, fontWeight: 600 }}>Claro</span>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: theme === "light" ? "none" : `1px solid ${c.muted}`, background: theme === "light" ? "#34C759" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {theme === "light" && <span style={{ color: "#FFF", fontSize: 14 }}>✓</span>}
            </div>
          </div>
          {/* TEMA OSCURO */}
          <div onClick={async () => { setTheme("dark"); localStorage.setItem("themePref", "dark"); showToast("Tema Oscuro guardado ✓"); await guardarConfig("themePref", "dark"); }} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, cursor: "pointer" }}>
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
      </div>
    </div>
  );
}