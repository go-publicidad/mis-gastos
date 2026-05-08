import React from "react";
import { ArrowDownToLine, ArrowUpFromLine, PiggyBank, Target } from "lucide-react";
import { formatMoney, getUIFechaHora, getIcono, getTexto } from "../utils";
import CarruselMetas from "./CarruselMetas";

const IconBadge = ({ emoji, bg, color }) => (
  <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{emoji}</div>
);

export default function TabInicio({
  c, s, isDark, listaMetas, setAporteMetaId, setShowAporteModal, setIsEditingMetaObj,
  setMetaForm, setShowCrearMeta, setViewAll, movimientosHoy, totalIngresosHoy,
  totalGastadoHoy, presupuestoDiario, categorias, setMetaSeleccionada,
  isRefreshing, pullDistance, handleTouchStart, handleTouchMove, handleTouchEnd
}) {

  // ESCUDO PARA COLORES DE METAS
  const SAFE_PASTEL = ['#F3E8FF', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3'];

  return (
    <div
      style={{ ...s.section, background: "transparent", minHeight: "100vh", position: "relative", zIndex: 20, transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`, transition: pullDistance === 0 || isRefreshing ? "transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)" : "none" }}
      onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}
    >
      {/* EL CEREBRO DEL CARRUSEL AHORA ES UN COMPONENTE INDEPENDIENTE */}
      {listaMetas.length === 0 ? (
        <div style={{ ...s.sliderCard, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", marginBottom: 24, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Aún no tienes metas</div>
          <button onClick={() => { setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); setShowCrearMeta(true); }} style={{ background: c.green, color: "#FFF", padding: "14px 24px", borderRadius: 30, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer" }}>+ Crea tu primera meta</button>
        </div>
      ) : (
        <CarruselMetas
          listaMetas={listaMetas} c={c} s={s} isDark={isDark}
          setAporteMetaId={setAporteMetaId} setShowAporteModal={setShowAporteModal}
          setMetaSeleccionada={setMetaSeleccionada} SAFE_PASTEL={SAFE_PASTEL}
        />
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

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 24, marginBottom: 12 }}>
        <h3 style={{ fontSize: 18, fontWeight: 600, margin: 0, color: c.text }}>Últimos movimientos</h3>
        <button onClick={() => setViewAll(true)} style={{ background: "none", border: "none", color: c.muted, fontWeight: 600, fontSize: 14, cursor: "pointer" }}>Ver todos</button>
      </div>

      {movimientosHoy.length > 0 ? (
        <div style={{ ...s.card, padding: "0 16px" }}>
          {movimientosHoy.map((g, i, arr) => {
            const isAporte = g.tipo === "aporte";
            const cat = isAporte ? null : categorias.find(c => c.id === g.categoria);

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
              <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: iconBg, color: iconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {isAporte ? <PiggyBank size={24} /> : getIcono(cat ? cat.label : (g.descripcion || "?"))}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: c.text }}>{isAporte ? g.descripcion : (cat ? getTexto(cat.label) : g.descripcion)}</div>
                    <div style={{ fontSize: 12, color: c.muted }}>{getUIFechaHora(g.created_at)}</div>
                  </div>
                </div>
                <span style={{ fontSize: 16, fontWeight: 600, color: montoColor }}>{g.tipo === "gasto" ? "-" : "+"}{formatMoney(g.monto)}</span>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0" }}>Aún no hay movimientos hoy</div>
      )}
    </div>
  );
}