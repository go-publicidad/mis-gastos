import React, { useState } from "react";
import { ArrowDownToLine, ArrowUpFromLine, PiggyBank, Target, Calendar, Clock, TrendingDown, PlusCircle } from "lucide-react";
import { formatMoney, getTexto, getIcono, formatFecha, diffDias, hoy, getUIFechaHora } from "../utils";

const IconBadge = ({ emoji, bg, color }) => (
  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{emoji}</div>
);

export default function TabInicio({
  c, s, isDark, listaMetas, setAporteMetaId, setShowAporteModal, setIsEditingMetaObj,
  setMetaForm, setShowCrearMeta, setViewAll, movimientosHoy, totalIngresosHoy,
  totalGastadoHoy, presupuestoDiario, categorias, setMetaSeleccionada
}) {
  const [activeSlide, setActiveSlide] = useState(0);

  const handleScroll = (e) => {
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.offsetWidth;
    setActiveSlide(Math.round(scrollLeft / width));
  };

  return (
    <div style={{ ...s.section, background: "transparent", minHeight: "100vh", position: "relative", zIndex: 20 }}>
      {listaMetas.length === 0 ? (
        <div style={{ ...s.sliderCard, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no tienes metas</div>
          <div style={{ fontSize: 14, color: "#AAA", marginBottom: 24, lineHeight: 1.4 }}>Crea tu primera meta y empieza a ahorrar para lo que siempre quisiste.</div>
          <button onClick={() => { setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); setShowCrearMeta(true); }} style={{ background: c.green, color: "#FFF", padding: "14px 24px", borderRadius: 30, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ Crea tu primera meta</button>
        </div>
      ) : (
        <>
          {/* AQUÍ SE CORRIGE EL CARRUSEL APILADO */}
          <div className="hide-scroll" style={{ display: "flex", overflowX: "auto", scrollSnapType: "x mandatory", gap: 16, paddingBottom: 8, marginTop: 4, WebkitOverflowScrolling: "touch", msOverflowStyle: "none", scrollbarWidth: "none" }} onScroll={handleScroll}>
            {listaMetas.map((meta, i) => {
              const obj = parseFloat(meta.montoObjetivo) || 1;
              const ahorrado = parseFloat(meta.aporteInicial) || 0;
              const faltan = Math.max(0, obj - ahorrado);
              const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
              let fechaStr = "Sin límite"; let diasRestantes = 0;
              if (meta.fechaLimite) { fechaStr = formatFecha(meta.fechaLimite); diasRestantes = diffDias(hoy(), meta.fechaLimite); }

              return (
                <div key={meta.id} style={{ minWidth: "100%", scrollSnapAlign: "center", flexShrink: 0 }}>
                  <div 
                    style={{ ...s.sliderCard, cursor: "pointer" }}
                    onClick={() => setMetaSeleccionada(meta)} // <-- AQUÍ SE RESTAURA EL CLIC PARA EDITAR
                  >
                    <div style={{ position: "absolute", top: 16, left: 20, background: i === 0 ? "rgba(168,85,247,0.2)" : (isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"), color: i === 0 ? "#D8B4FE" : (isDark ? "#AAA" : "#666"), padding: "4px 10px", borderRadius: 12, fontSize: 11, fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>{i === 0 ? "★ Meta principal" : "Meta secundaria"}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 28, marginBottom: 16 }}>
                      <div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: "#FFF", marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>{meta.nombre} <span style={{ fontSize: 24 }}>{meta.icono}</span></div>
                        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <span style={{ fontSize: 20, fontWeight: 700, color: "#FFF" }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span>
                          <span style={{ fontSize: 14, color: "#999", fontWeight: 500 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</span>
                        </div>
                      </div>
                      <div style={{ width: 64, height: 64, borderRadius: "50%", background: `conic-gradient(#10B981 ${pct}%, #333 0)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ position: "absolute", inset: 5, background: "#111", borderRadius: "50%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 16, fontWeight: 700, color: "#FFF" }}>{pct}%</span></div>
                      </div>
                    </div>
                    <div style={{ background: "#333", borderRadius: 4, height: 6, marginBottom: 20, overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: "#10B981", borderRadius: 4 }}></div></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><TrendingDown size={14} color="#10B981" /> Te faltan</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>S/ {formatMoney(faltan).replace("S/ ", "")}</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><Calendar size={14} color="#10B981" /> Fecha límite</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>{fechaStr}</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}><span style={{ fontSize: 12, color: "#999", display: "flex", alignItems: "center", gap: 4 }}><Clock size={14} color="#F59E0B" /> Llegarás en</span><span style={{ fontSize: 14, fontWeight: 600, color: "#FFF", paddingLeft: 18 }}>{diasRestantes > 0 ? `${diasRestantes} días` : "—"}</span></div>
                    </div>
                    
                    <button 
                      onClick={(e) => { e.stopPropagation(); setAporteMetaId(meta.id); setShowAporteModal(true); }} 
                      style={{ width: "100%", background: "#10B981", color: "#FFF", padding: "14px", borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)" }}
                    >
                      <PlusCircle size={18} /> Aportar a esta meta
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
          {listaMetas.length > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 4, marginBottom: 20 }}>
              {listaMetas.map((_, idx) => (<div key={idx} style={{ width: activeSlide === idx ? 18 : 8, height: 8, borderRadius: 4, background: activeSlide === idx ? "#10B981" : (isDark ? "#333" : "#E5E7EB"), transition: "all 0.3s ease" }} />))}
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, marginTop: listaMetas.length <= 1 ? 8 : 0 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.text }}>Resumen de hoy</h3>
      </div>
      <div style={s.grid2}>
        <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<ArrowDownToLine size={18} />} bg={c.iconBgGreen} color={c.green} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ingresos hoy</span></div>
          <div style={{ ...s.greenNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy)}</div>
        </div>
        <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<ArrowUpFromLine size={18} />} bg={c.iconBgRed} color={c.red} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Gastos hoy</span></div>
          <div style={{ ...s.redNum, textAlign: "center", marginTop: 0 }}>{formatMoney(totalGastadoHoy)}</div>
        </div>
        <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<PiggyBank size={18} />} bg={c.iconBgOrange} color="#FF803C" /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Ahorro hoy</span></div>
          <div style={{ fontSize: 20, fontWeight: 600, color: "#FF803C", textAlign: "center", marginTop: 0 }}>{formatMoney(totalIngresosHoy - totalGastadoHoy)}</div>
        </div>
        <div style={{ ...s.card, padding: "16px 12px", marginBottom: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 0 }}><IconBadge emoji={<Target size={18} />} bg={c.iconBgPurple} color={c.iconTextPurple} /><span style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>Límite / día</span></div>
          <div style={{ fontSize: 20, fontWeight: 600, color: c.text, textAlign: "center", marginTop: 0 }}>{formatMoney(presupuestoDiario)}</div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.text }}>Últimos movimientos</h3>
        <button onClick={() => { setViewAll(true); window.scrollTo(0, 0); }} style={{ background: "none", border: "none", color: c.muted, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Ver todos</button>
      </div>

      {movimientosHoy.length > 0 ? (
        <div style={{ ...s.card, padding: "0 16px" }}>
          {movimientosHoy.map((g, i, arr) => {
            const isAporte = g.tipo === "aporte";
            const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);
            const descAdicional = (!isAporte && g.descripcion && cat && g.descripcion !== getTexto(cat.label)) ? g.descripcion : "";

            let iconBg = isDark ? "rgba(255,255,255,0.05)" : "#E5E7EB";
            let montoColor = c.text;
            let iconColor = c.muted;

            if (isAporte) {
              iconBg = isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5";
              montoColor = c.green;
              iconColor = c.green;
            } else if (g.tipo === "gasto") {
              iconBg = isDark ? "rgba(239,68,68,0.15)" : "#FEE2E2";
              montoColor = c.red;
              iconColor = c.red;
            } else if (g.tipo === "ingreso") {
              iconBg = isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6";
              iconColor = isDark ? "#D1D5DB" : "#4B5563";
              montoColor = c.text;
            }

            return (
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}`, height: 72, boxSizing: "border-box" }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>

                  <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isAporte ? <PiggyBank size={24} strokeWidth={2} /> : getIcono(cat ? cat.label : (g.descripcion || "?"))}
                  </div>

                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 2, color: c.text, textDecoration: (!cat && !isAporte) ? "line-through" : "none" }}>
                      {isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}
                      {cat && descAdicional && <span style={{ color: c.muted, fontSize: 13, marginLeft: 6, fontWeight: 500, textDecoration: "none" }}>{descAdicional}</span>}
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: c.muted }}>{getUIFechaHora(g.created_at)}</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 600, color: montoColor, marginRight: 4 }}>
                    {g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0", fontWeight: 500 }}>Aún no hay movimientos hoy</div>
      )}
    </div>
  );
}