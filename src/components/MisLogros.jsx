import React, { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Book, Coins, Rocket, Trophy, Award } from "lucide-react";

export default function MisLogros({
  c, s, isDark, isClosing, cerrarPantalla, setProfileScreen, listaMetas, gastos, userName
}) {
  const [filtro, setFiltro] = useState("todos");

  // --- Lógica de cálculos ---
  const safeMetas = listaMetas || [];
  const safeGastos = gastos || [];

  const primerPasoUnl = safeMetas.length > 0;
  let primerPasoDate = "Recientemente";
  if (primerPasoUnl) {
     const oldestMeta = [...safeMetas].sort((a,b) => parseInt(a.id.split('_')[1] || 0) - parseInt(b.id.split('_')[1] || 0))[0];
     const ts = parseInt(oldestMeta.id.split('_')[1]);
     if (ts) { const d = new Date(ts); primerPasoDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`; }
  }

  let maxMetaPct = 0;
  if (safeMetas.length > 0) {
     maxMetaPct = Math.max(...safeMetas.map(m => {
         const obj = parseFloat(m.montoObjetivo) || 1;
         const aho = parseFloat(m.aporteInicial) || 0;
         return (aho / obj) * 100;
     }));
  }
  const metaEnMarchaUnl = maxMetaPct >= 50;
  const granAhorradorUnl = maxMetaPct >= 100;

  let maxAporteStreak = 0;
  if (safeGastos.length > 0) {
     const aporteDates = [...new Set(safeGastos.filter(g => g.tipo === 'aporte').map(g => g.fecha))].sort((a,b) => a.localeCompare(b));
     if (aporteDates.length > 0) {
        let currentStreak = 1; maxAporteStreak = 1;
        for (let i = 0; i < aporteDates.length - 1; i++) {
            const d1 = new Date(aporteDates[i]); const d2 = new Date(aporteDates[i+1]);
            const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) { currentStreak++; maxAporteStreak = Math.max(maxAporteStreak, currentStreak); } else { currentStreak = 1; }
        }
     }
  }
  const ahorradorConstanteUnl = maxAporteStreak >= 7;

  let maxAppUsageStreak = 0;
  if (safeGastos.length > 0) {
     const allActivityDates = [...new Set(safeGastos.map(g => g.fecha))].sort((a,b) => a.localeCompare(b));
     if (allActivityDates.length > 0) {
        let currentStreak = 1; maxAppUsageStreak = 1;
        for (let i = 0; i < allActivityDates.length - 1; i++) {
            const d1 = new Date(allActivityDates[i]); const d2 = new Date(allActivityDates[i+1]);
            const diffDays = Math.ceil(Math.abs(d2 - d1) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) { currentStreak++; maxAppUsageStreak = Math.max(maxAppUsageStreak, currentStreak); } else { currentStreak = 1; }
        }
     }
  }
  const expertoFinancieroUnl = maxAppUsageStreak >= 30;

  const achievements = [
     { id: 'primer_paso', title: 'Primer paso', desc: 'Registra tu primera meta', unlocked: primerPasoUnl, date: primerPasoDate, progress: primerPasoUnl ? 100 : 0, icon: <Book size={20} color={primerPasoUnl ? "#10B981" : c.muted} />, bg: primerPasoUnl ? (isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5") : (isDark ? "#222" : "#F3F4F6") },
     { id: 'ahorrador_constante', title: 'Ahorrador constante', desc: 'Ahorra 7 días seguidos', unlocked: ahorradorConstanteUnl, date: "Recientemente", progress: Math.min(100, (maxAporteStreak / 7) * 100), icon: <Coins size={20} color={ahorradorConstanteUnl ? "#3B82F6" : c.muted} />, bg: ahorradorConstanteUnl ? (isDark ? "rgba(59,130,246,0.15)" : "#DBEAFE") : (isDark ? "#222" : "#F3F4F6") },
     { id: 'meta_marcha', title: 'Meta en marcha', desc: 'Completa el 50% de una meta', unlocked: metaEnMarchaUnl, date: "Recientemente", progress: Math.min(100, (maxMetaPct / 50) * 100), icon: <Rocket size={20} color={metaEnMarchaUnl ? "#A855F7" : c.muted} />, bg: metaEnMarchaUnl ? (isDark ? "rgba(168,85,247,0.15)" : "#F3E8FF") : (isDark ? "#222" : "#F3F4F6") },
     { id: 'gran_ahorrador', title: 'Gran ahorrador', desc: 'Completa el 100% de una meta', unlocked: granAhorradorUnl, date: "Recientemente", progress: Math.min(100, maxMetaPct), icon: <Trophy size={20} color={granAhorradorUnl ? "#F59E0B" : c.muted} />, bg: granAhorradorUnl ? (isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7") : (isDark ? "#222" : "#F3F4F6") },
     { id: 'experto_financiero', title: 'Experto financiero', desc: 'Usa la app por 30 días seguidos', unlocked: expertoFinancieroUnl, date: "Recientemente", progress: Math.min(100, (maxAppUsageStreak / 30) * 100), icon: <Award size={20} color={expertoFinancieroUnl ? "#EC4899" : c.muted} />, bg: expertoFinancieroUnl ? (isDark ? "rgba(236,72,153,0.15)" : "#FCE7F3") : (isDark ? "#222" : "#F3F4F6") }
  ];

  const filtered = achievements.filter(a => {
     if (filtro === 'obtenidos') return a.unlocked;
     if (filtro === 'bloqueados') return !a.unlocked;
     return true;
  });

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'logros' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('logros', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16, display: "flex" }}><ArrowLeft size={28} /></button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 800 }}>Mis logros / Insignias</h2>
      </div>

      <div style={{ 
        background: "#064E3B", 
        borderRadius: 24, 
        padding: "24px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: 24,
        boxShadow: "0 8px 24px rgba(6, 78, 59, 0.2)"
      }}>
          <div style={{ flex: 1 }}>
              <h3 style={{ margin: "0 0 8px 0", fontSize: 20, color: "#FFF", fontWeight: 800 }}>
                ¡Sigue así, {userName.split(' ')[0]}!
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.9)", fontWeight: 500, lineHeight: 1.4, maxWidth: 190 }}>
                Cada pequeño paso te acerca a tus grandes metas.
              </p>
          </div>
          <div style={{ fontSize: 60, filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.2))" }}>🏆</div>
      </div>

      {/* ========================================== */}
      {/* BOTONES DE FILTRO CON DISEÑO DE LA IMAGEN  */}
      {/* ========================================== */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }} className="hide-scroll">
          {["Todos", "Obtenidos", "Bloqueados"].map(t => {
              const tabId = t.toLowerCase();
              const isActive = filtro === tabId;
              return (
                  <button 
                    key={tabId} 
                    onClick={() => setFiltro(tabId)} 
                    style={{ 
                      padding: "10px 20px", 
                      borderRadius: 20, 
                      fontSize: 14, 
                      fontWeight: 700, 
                      cursor: "pointer", 
                      whiteSpace: "nowrap", 
                      border: "none", 
                      background: isActive ? "#059669" : (isDark ? "#222" : "#F3F4F6"), 
                      color: isActive ? "#FFF" : c.muted,
                      transition: "all 0.2s ease"
                    }}
                  >
                    {t}
                  </button>
              );
          })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, paddingBottom: 40 }}>
          {filtered.map(logro => (
              <div key={logro.id} style={{ ...s.card, padding: "20px", marginBottom: 0, display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: "50%", background: logro.unlocked ? logro.bg : (isDark ? "#222" : "#F3F4F6"), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {logro.unlocked ? logro.icon : <Lock size={20} color={c.muted} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 4 }}>{logro.title}</div>
                      <div style={{ fontSize: 13, color: c.muted, fontWeight: 500, marginBottom: 8 }}>{logro.desc}</div>
                      {logro.unlocked ? (
                          <div style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>Obtenido el {logro.date}</div>
                      ) : (
                          <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 6, width: "100%", maxWidth: 120, overflow: "hidden" }}>
                              <div style={{ background: c.muted, height: "100%", width: `${logro.progress}%` }}></div>
                          </div>
                      )}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", minWidth: 32 }}>
                      {logro.unlocked ? <CheckCircle2 size={24} color="#10B981" /> : <span style={{ fontSize: 13, fontWeight: 700, color: c.muted }}>{logro.progress.toFixed(0)}%</span>}
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
}