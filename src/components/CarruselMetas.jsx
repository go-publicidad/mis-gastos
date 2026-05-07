import React, { useState } from "react";
import { TrendingDown, Calendar, Clock, PlusCircle } from "lucide-react";
import { formatMoney, formatFecha, diffDias, hoy } from "../utils";

export default function CarruselMetas({ 
  listaMetas, c, s, isDark, setAporteMetaId, setShowAporteModal, setMetaSeleccionada, SAFE_PASTEL 
}) {
  const N = listaMetas.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [swipeDir, setSwipeDir] = useState(0);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);

  const onSliderTouchStart = (e) => {
    if (animating || N <= 1) return;
    setStartX(e.touches[0].clientX);
    setStartY(e.touches[0].clientY);
    setIsDragging(true);
    setDragOffset(0);
  };

  const onSliderTouchMove = (e) => {
    if (!isDragging || animating || N <= 1) return;
    const diffX = e.touches[0].clientX - startX;
    const diffY = e.touches[0].clientY - startY;
    if (Math.abs(diffX) > Math.abs(diffY)) {
      e.stopPropagation(); 
      setDragOffset(diffX);
    } else {
      setIsDragging(false);
    }
  };

  const onSliderTouchEnd = () => {
    if (!isDragging || N <= 1) return;
    setIsDragging(false);
    const threshold = 40;
    if (dragOffset > threshold) {
        setSwipeDir(1);
        setAnimating(true);
        setTimeout(() => {
            setActiveIndex((prev) => (prev - 1 + N) % N);
            setSwipeDir(0); setDragOffset(0); setAnimating(false);
        }, 300);
    } else if (dragOffset < -threshold) {
        setSwipeDir(-1);
        setAnimating(true);
        setTimeout(() => {
            setActiveIndex((prev) => (prev + 1) % N);
            setSwipeDir(0); setDragOffset(0); setAnimating(false);
        }, 300);
    } else {
        // SOLUCIÓN: Si soltaste el dedo y no se movió casi nada (un simple clic), 
        // solo reseteamos pero NO animamos para no tragarnos el toque del botón.
        setDragOffset(0); 
    }
  };

  const getTransform = () => {
    if (isDragging) return `translateX(${dragOffset}px)`;
    if (animating) {
        if (swipeDir === 1) return `translateX(100%)`;
        if (swipeDir === -1) return `translateX(-100%)`;
    }
    return `translateX(0)`;
  };

  let cardsToRender = [];
  if (N === 1) cardsToRender.push({ meta: listaMetas[0], pos: '0%', key: 'single' });
  else if (N > 1) {
    cardsToRender.push({ meta: listaMetas[(activeIndex - 1 + N) % N], pos: '-100%', key: 'prev' });
    cardsToRender.push({ meta: listaMetas[activeIndex], pos: '0%', key: 'curr' });
    cardsToRender.push({ meta: listaMetas[(activeIndex + 1) % N], pos: '100%', key: 'next' });
  }

  return (
    <div style={{ overflow: "hidden", width: "100%", paddingBottom: 8, marginTop: 4 }}>
      <div 
        style={{ 
          position: "relative", width: "100%", 
          transform: getTransform(), 
          transition: (isDragging || !animating) ? "none" : "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" 
        }}
        onTouchStart={onSliderTouchStart} onTouchMove={onSliderTouchMove} onTouchEnd={onSliderTouchEnd}
      >
        {cardsToRender.map((item) => {
          const meta = item.meta;
          const obj = parseFloat(meta.montoObjetivo) || 1;
          const ahorrado = parseFloat(meta.aporteInicial) || 0;
          const faltan = Math.max(0, obj - ahorrado);
          const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
          let fechaStr = meta.fechaLimite ? formatFecha(meta.fechaLimite) : "Sin límite";
          let diasRestantes = meta.fechaLimite ? diffDias(hoy(), meta.fechaLimite) : 0;
          const bgIconColor = SAFE_PASTEL[Math.abs((meta.nombre || "").length) % SAFE_PASTEL.length];

          return (
            <div key={item.key} style={{ position: item.pos === '0%' ? 'relative' : 'absolute', top: 0, left: item.pos, width: "100%" }}>
              <div style={{ ...s.sliderCard, cursor: "pointer", overflow: "hidden" }} onClick={() => setMetaSeleccionada(meta)}>
                <div style={{ position: "absolute", top: 16, left: 20, background: meta.id === listaMetas[0].id ? "rgba(168,85,247,0.2)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"), color: meta.id === listaMetas[0].id ? "#D8B4FE" : (isDark ? "#AAA" : "#666"), padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>{meta.id === listaMetas[0].id ? "★ Meta principal" : "Meta secundaria"}</div>
                
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, marginBottom: 16 }}>
                  <div style={{ minWidth: 0, flex: 1, paddingRight: 12 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 4, display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{meta.nombre} <span style={{ fontSize: 24, flexShrink: 0 }}>{meta.icono}</span></div>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}><span style={{ fontSize: 20, fontWeight: 700, color: "#FFF" }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span><span style={{ fontSize: 14, color: "#999", fontWeight: 500 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</span></div>
                  </div>
                  <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(#10B981 ${pct}%, #333 0)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <div style={{ position: "absolute", inset: 5, background: "#111", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16, fontWeight: 700, color: "#FFF" }}>{pct}%</span></div>
                  </div>
                </div>

                <div style={{ background: "#333", borderRadius: 4, height: 6, marginBottom: 20, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "#10B981", borderRadius: 4 }}></div></div>
                
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24, gap: 8 }}>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><TrendingDown size={14} color="#10B981" /> <span>Te faltan</span></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>S/ {formatMoney(faltan).replace("S/ ", "")}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><Calendar size={14} color="#10B981" /> <span>Fecha límite</span></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{fechaStr}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
                    <span style={{ fontSize: 11, color: "#999", display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}><Clock size={14} color="#F59E0B" /> <span>Llegarás en</span></span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#FFF" }}>{diasRestantes > 0 ? `${diasRestantes} días` : "—"}</span>
                  </div>
                </div>
                
                <button onClick={(e) => { e.stopPropagation(); setAporteMetaId(meta.id); setShowAporteModal(true); }} style={{ width: "100%", background: "#10B981", color: "#FFF", padding: "14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
                  <PlusCircle size={18} /> Aportar a esta meta
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {N > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 4, marginBottom: 20 }}>
          {listaMetas.map((_, idx) => (<div key={idx} style={{ width: activeIndex === idx ? 18 : 8, height: 8, borderRadius: 4, background: activeIndex === idx ? "#10B981" : (isDark ? "#333" : "#E5E7EB"), transition: "all 0.3s ease" }} />))}
        </div>
      )}
    </div>
  );
}