import React from "react";
import { CheckCircle2, Lock } from "lucide-react";

export default function MisLogros({
  c, s, isDark, isClosing, cerrarPantalla, setProfileScreen,
  listaMetas, filtroLogros, setFiltroLogros
}) {
  const hasMetas = listaMetas.length > 0;
  let fechaPrimerPaso = "Pendiente";
  if (hasMetas) {
    const oldestMeta = listaMetas[listaMetas.length - 1]; 
    if (oldestMeta.id.startsWith("meta_")) {
        const d = new Date(parseInt(oldestMeta.id.replace("meta_", "")));
        fechaPrimerPaso = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } else { fechaPrimerPaso = "12/04/2025"; }
  }

  const achievements = [
    { id: 1, title: "Primer paso", desc: "Registra tu primera meta", unlocked: hasMetas, date: hasMetas ? `Obtenido el ${fechaPrimerPaso}` : "", icon: "🔰", bg: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5" },
    { id: 2, title: "Ahorrador constante", desc: "Ahorra 7 días seguidos", unlocked: true, date: "Obtenido el 20/04/2025", icon: "🪙", bg: isDark ? "rgba(59,130,246,0.15)" : "#DBEAFE" },
    { id: 3, title: "Meta en marcha", desc: "Completa el 50% de una meta", unlocked: true, date: "Obtenido el 25/04/2025", icon: "🚀", bg: isDark ? "rgba(168,85,247,0.15)" : "#F3E8FF" },
    { id: 4, title: "Gran ahorrador", desc: "Completa el 100% de una meta", unlocked: false, progress: 62, icon: <Lock size={20} color={c.muted} />, bg: isDark ? "#333" : "#F3F4F6" },
    { id: 5, title: "Experto financiero", desc: "Usa la app por 30 días seguidos", unlocked: false, progress: 20, icon: <Lock size={20} color={c.muted} />, bg: isDark ? "#333" : "#F3F4F6" }
  ];

  const filteredAchievements = achievements.filter(a => filtroLogros === "desbloqueados" ? a.unlocked : filtroLogros === "bloqueados" ? !a.unlocked : true);

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'logros' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('logros', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Mis logros / Insignias</h2>
      </div>
      <div style={{ background: isDark ? "#1E120A" : "#FFF5EB", borderRadius: 16, padding: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div><div style={{ fontSize: 18, fontWeight: 800, color: c.text, marginBottom: 4 }}>¡Vas increíble!</div><div style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>Sigue así para desbloquear<br/>más logros 🤞</div></div>
        <div style={{ fontSize: 48 }}>🏆</div>
      </div>
      <div className="hide-scroll" style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto" }}>
        {['Todos', 'Desbloqueados', 'Bloqueados'].map(t => {
            const val = t.toLowerCase(); const act = filtroLogros === val;
            return (<button key={val} onClick={() => setFiltroLogros(val)} style={{ padding: "8px 16px", borderRadius: 20, fontSize: 14, fontWeight: act ? 700 : 600, background: "transparent", border: act ? `1px solid #FF803C` : `1px solid transparent`, color: act ? "#FF803C" : c.muted, cursor: "pointer", fontFamily: "inherit", transition: "0.2s" }}>{t}</button>)
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {filteredAchievements.map(ach => (
          <div key={ach.id} style={{ ...s.card, padding: 16, display: "flex", alignItems: "center", gap: 16, marginBottom: 0, opacity: ach.unlocked ? 1 : 0.6 }}>
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: ach.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{ach.icon}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: c.text, marginBottom: 4 }}>{ach.title}</div>
                <div style={{ fontSize: 13, color: c.muted, fontWeight: 500, marginBottom: 2 }}>{ach.desc}</div>
                {ach.unlocked && <div style={{ fontSize: 12, color: c.muted, fontWeight: 400 }}>{ach.date}</div>}
                {!ach.unlocked && (<div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}><div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 6, flex: 1, overflow: "hidden" }}><div style={{ background: "#9CA3AF", height: "100%", width: `${ach.progress}%`, borderRadius: 4 }}></div></div></div>)}
              </div>
              <div>{ach.unlocked ? <CheckCircle2 size={24} color="#10B981" /> : <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>{ach.progress}%</span>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}