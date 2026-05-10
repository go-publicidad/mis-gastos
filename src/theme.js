// src/theme.js

export const getThemeStyles = (isDark) => {
  // Objeto de colores (c)
  const c = {
    bg: isDark ? "#0A0A0A" : "#F4F5F7", 
    card: isDark ? "#111111" : "#FFFFFF", 
    text: isDark ? "#E8E0D0" : "#1A1A1A",
    muted: isDark ? "#888888" : "#6B7280", 
    border: isDark ? "#1E1E1E" : "#E5E7EB", 
    nav: isDark ? "#0D0D0D" : "#FFFFFF",
    input: isDark ? "#1A1A1A" : "#F9FAFB", 
    green: isDark ? "#5AE88A" : "#10B981", 
    red: isDark ? "#E85A5A" : "#EF4444",
    shadow: isDark ? "none" : "0 4px 12px rgba(0,0,0,0.04)", 
    iconBgGreen: isDark ? "rgba(16, 185, 129, 0.15)" : "#D1FAE5",
    iconBgRed: isDark ? "rgba(239, 68, 68, 0.15)" : "#FEE2E2", 
    iconBgOrange: isDark ? "rgba(255, 128, 60, 0.15)" : "#FFEDD5",
    iconBgPurple: isDark ? "rgba(168, 85, 247, 0.15)" : "#F3E8FF", 
    iconTextPurple: isDark ? "#D8B4FE" : "#A855F7", 
    brandBlue: "#4A3AFF"
  };

  // Objeto de estilos CSS (s)
  const s = {
    app: { minHeight: "100vh", fontFamily: "'Montserrat', sans-serif", maxWidth: "480px", margin: "0 auto", position: "relative", boxShadow: isDark ? "0 0 40px rgba(0,0,0,0.6)" : "0 0 40px rgba(0,0,0,0.1)", background: c.bg, paddingBottom: "calc(110px + env(safe-area-inset-bottom, 0px))", width: "100%" },
    section: { padding: "calc(60px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "stretch" },
    card: { width: "100%", background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "16px", marginBottom: 24, overflow: "hidden", boxSizing: "border-box", boxShadow: c.shadow },
    sliderCard: { width: "100%", background: "#111", borderRadius: 20, padding: "20px", boxSizing: "border-box", color: "#FFF", boxShadow: "none", position: "relative" },
    label: { fontSize: 14, fontWeight: 700, color: c.text, marginBottom: 8 },
    greenNum: { fontSize: 20, fontWeight: 600, color: c.green },
    redNum: { fontSize: 20, fontWeight: 600, color: c.red },
    grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 24, width: "100%" },
    input: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, WebkitAppearance: "none", minHeight: 48 },
    select: { width: "100%", background: c.input, border: `1px solid ${c.border}`, borderRadius: 10, color: c.text, padding: "12px 14px", fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit", fontWeight: 500, cursor: "pointer", WebkitAppearance: "none", minHeight: 48 },
    btnPrimary: { background: "#FF803C", color: "#FFF", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.2)" },
    btnSecondary: { background: c.input, color: c.text, border: `1px solid ${c.border}`, borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 600, cursor: "pointer", width: "100%", fontFamily: "inherit" },
    tipoBtn: (a, col) => ({ flex: 1, padding: "10px", background: a ? col : c.input, border: `1px solid ${a ? col : c.border}`, color: a ? "#FFF" : c.muted, borderRadius: 10, cursor: "pointer", fontSize: 15, fontWeight: a ? 600 : 500, transition: "all 0.2s", fontFamily: "inherit" }),
    deleteBtn: { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: c.red, cursor: "pointer", fontSize: 18, padding: "4px 6px" },
    editBtn: { backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", cursor: "pointer", fontSize: 15, padding: "4px 6px" },
    errorCard: { background: isDark ? "#1A0A0A" : "#FEF2F2", border: `1px solid ${c.red}`, borderRadius: 12, padding: "16px", margin: "20px", color: c.red, fontSize: 14, fontWeight: 400 },
    navBar: { position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, background: c.nav, display: "flex", zIndex: 100, paddingTop: 0, paddingBottom: `calc(20px + env(safe-area-inset-bottom, 0px))`, boxShadow: isDark ? "0 -2px 10px rgba(0,0,0,0.4)" : "0 -2px 10px rgba(0,0,0,0.06)" },
    navBtn: (a) => ({ flex: 1, paddingTop: 10, paddingBottom: 8, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: a ? "#FF803C" : c.muted, fontSize: 12, fontWeight: 400, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2, fontFamily: "inherit", position: "relative" }),
    fabCircle: { position: "absolute", top: 0, left: "50%", transform: "translate(-50%, -50%)", width: 68, height: 68, borderRadius: "50%", background: "#FF803C", color: "#FFF", border: `6px solid ${c.bg}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 12px rgba(255, 128, 60, 0.4)", zIndex: 999, padding: 0 },
    overlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 99999, padding: "0", backdropFilter: "blur(10px)" },
    modal: { background: c.card, borderTop: `1px solid ${c.border}`, borderLeft: `1px solid ${c.border}`, borderRight: `1px solid ${c.border}`, borderRadius: "24px 24px 0 0", padding: "24px 24px calc(24px + env(safe-area-inset-bottom, 0px))", width: "100%", maxWidth: 480, boxSizing: "border-box", boxShadow: "0 -10px 40px rgba(0,0,0,0.3)" }
  };

  return { c, s };
};