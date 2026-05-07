import React from "react";
import { Calendar, Edit2, Trash2, PiggyBank } from "lucide-react";
import { formatMoney, getIcono, getTexto, getUIFechaHora } from "../utils";

export default function PantallaMovimientos({
  c, s, isDark, gastos, categorias, 
  vtFechaDesde, setVtFechaDesde, vtFechaHasta, setVtFechaHasta,
  showVtFiltro, setShowVtFiltro, setViewAll,
  swipedId, currentSwipeX, isSwiping, handleSwipeStart, handleSwipeMove, handleSwipeEnd,
  abrirEdicion, eliminar
}) {
  const gastosFiltrados = gastos.filter(g => 
    (!vtFechaDesde || g.fecha >= vtFechaDesde) && 
    (!vtFechaHasta || g.fecha <= vtFechaHasta)
  );

  return (
    <>
      <div style={{ padding: "calc(12px + env(safe-area-inset-top, 0px)) 20px 12px", borderBottom: `1px solid ${c.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: c.bg, position: "fixed", top: 0, left: "50%", transform: "translateX(-50%)", width: "100%", maxWidth: 480, zIndex: 110, boxSizing: "border-box" }}>
        <button style={{ backgroundColor: "transparent", border: "none", color: "#FF803C", fontSize: 24, cursor: "pointer", padding: 0 }} onClick={() => { setViewAll(false); window.scrollTo(0, 0); }}>←</button>
        <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 600 }}>Movimientos</h2>
        <button style={{ backgroundColor: "transparent", border: "none", color: "#FF803C", fontSize: 20, cursor: "pointer", padding: 0 }} onClick={() => setShowVtFiltro(!showVtFiltro)}><Calendar size={20} /></button>
      </div>

      <div style={s.section}>
        {showVtFiltro && (
          <div style={{ padding: "16px 20px", background: c.card, borderBottom: `1px solid ${c.border}`, borderRadius: 16, marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div style={{ flex: 1, position: "relative" }}>
                {!vtFechaDesde && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: c.muted, fontSize: 15, fontWeight: 600, pointerEvents: "none", zIndex: 2 }}>Del</span>}
                <input type="date" value={vtFechaDesde} onChange={e => setVtFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaDesde ? c.text : "transparent", position: "relative", zIndex: 1 }} />
              </div>
              <div style={{ flex: 1, position: "relative" }}>
                {!vtFechaHasta && <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: c.muted, fontSize: 15, fontWeight: 600, pointerEvents: "none", zIndex: 2 }}>Al</span>}
                <input type="date" value={vtFechaHasta} onChange={e => setVtFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: vtFechaHasta ? c.text : "transparent", position: "relative", zIndex: 1 }} />
              </div>
            </div>
            {(vtFechaDesde || vtFechaHasta) && (
              <button style={{ width: "100%", fontSize: 14, fontWeight: 600, color: c.red, background: "none", border: "none", cursor: "pointer", padding: "12px 0 0", marginTop: 4 }} onClick={() => { setVtFechaDesde(""); setVtFechaHasta(""); }}>Limpiar fechas</button>
            )}
          </div>
        )}

        <div style={{ ...s.label, textAlign: "center", marginBottom: 12 }}>{gastosFiltrados.length} movimientos</div>
        
        {gastosFiltrados.map(g => {
          const isAporte = g.tipo === "aporte"; 
          const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
          const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";
          
          let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB"; 
          let montoColor = c.text; 
          let iconColor = c.muted;
          
          if (isAporte) { iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5"; montoColor = c.green; iconColor = c.green; }
          else if (g.tipo === "gasto") { iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2"; montoColor = c.red; iconColor = c.red; }
          else if (g.tipo === "ingreso") { iconBg = isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6"; iconColor = isDark ? "#D1D5DB" : "#4B5563"; montoColor = c.text; }
          
          const isCurrentSwiped = swipedId === g.id;

          return (
            <div key={g.id} style={{ position: "relative", marginBottom: 10, borderRadius: 16, overflow: "hidden", height: 72 }}>
              <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div onClick={() => abrirEdicion(g)} style={{ flex: 1, height: "100%", background: "#10B981", color: "#FFF", display: "flex", alignItems: "center", paddingLeft: 24, cursor: "pointer" }}><Edit2 size={24} /></div>
                <div onClick={() => eliminar(g)} style={{ flex: 1, height: "100%", background: c.red, color: "#FFF", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 24, cursor: "pointer" }}><Trash2 size={24} /></div>
              </div>
              
              <div 
                onTouchStart={(e) => handleSwipeStart(g.id, e)} 
                onTouchMove={(e) => handleSwipeMove(g.id, e)} 
                onTouchEnd={handleSwipeEnd} 
                style={{ position: "absolute", inset: 0, background: c.card, border: `1px solid ${c.border}`, borderRadius: 16, padding: "0 16px", display: "flex", alignItems: "center", justifyContent: "space-between", transform: isCurrentSwiped ? `translateX(${currentSwipeX}px)` : "translateX(0)", transition: isSwiping && isCurrentSwiped ? "none" : "transform 0.3s ease", zIndex: 2, touchAction: "pan-y" }} 
              >
                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isAporte ? <PiggyBank size={24} /> : getIcono(cat ? cat.label : (g.descripcion || "?"))}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text }}>
                      {isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}
                      {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500 }}>{descAdicional}</span>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center" }}><span style={{ fontSize: 16, fontWeight: 600, color: montoColor }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}