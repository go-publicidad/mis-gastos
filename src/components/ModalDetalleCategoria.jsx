import React from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { formatMoney, getIcono, getTexto, getUIFechaHora, hoy } from "../utils";

export default function ModalDetalleCategoria({
  c, s, isDark, isClosing, cerrarPantalla, catId, categorias, gastos, presupuestoActual
}) {
  const mesActualClave = hoy().slice(0, 7);
  
  // Obtener datos de la categoría
  const catObj = categorias.find(cat => cat.id === catId);
  const nombreCat = catObj ? getTexto(catObj.label) : "Desconocida";
  const iconoCat = catObj ? getIcono(catObj.label) : "🏷️";
  const limite = parseFloat(presupuestoActual.categorias[catId]) || 0;

  // Filtrar solo los gastos de ESTE MES y de ESTA CATEGORÍA
  const gastosCatMes = gastos.filter(g => g.tipo === "gasto" && g.categoria === catId && g.fecha.startsWith(mesActualClave));
  
  const totalGastado = gastosCatMes.reduce((sum, g) => sum + g.monto, 0);
  const faltan = limite - totalGastado;
  
  // Cálculo para la dona (máximo 100% visualmente)
  const pctReal = limite > 0 ? (totalGastado / limite) * 100 : 0;
  const pctVisual = Math.min(pctReal, 100);

  // Colores dinámicos
  let colorPrimario = "#FF803C"; // Naranja por defecto
  if (pctReal > 90) colorPrimario = c.red;
  else if (pctReal < 50) colorPrimario = c.green;

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10002, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'detalleCat' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('detalleCat')} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16, display: "flex" }}>
          <ArrowLeft size={28} />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700, flex: 1, textAlign: "center", paddingRight: 44 }}>Detalle de categoría</h2>
      </div>

      {/* Título Categoría */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: colorPrimario, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, color: "#FFF", boxShadow: `0 4px 12px ${colorPrimario}40` }}>
          {iconoCat}
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: c.text }}>{nombreCat}</span>
      </div>

      {/* Gráfico de Dona */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 32 }}>
        <div style={{ position: "relative", width: 160, height: 160, borderRadius: "50%", background: `conic-gradient(${colorPrimario} ${pctVisual * 3.6}deg, ${isDark ? "#333" : "#F3F4F6"} ${pctVisual * 3.6}deg 360deg)`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <div style={{ width: 130, height: 130, borderRadius: "50%", background: c.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 36, fontWeight: 800, color: c.text, lineHeight: 1 }}>{pctReal.toFixed(0)}%</span>
            <span style={{ fontSize: 11, color: c.muted, textAlign: "center", marginTop: 4, fontWeight: 600, padding: "0 10px" }}>del presupuesto<br/>usado</span>
          </div>
        </div>
        <div style={{ fontSize: 20, fontWeight: 800, color: c.text }}>
          S/ {formatMoney(totalGastado).replace("S/ ", "")} <span style={{ fontSize: 16, fontWeight: 600, color: c.muted }}>de S/ {formatMoney(limite).replace("S/ ", "")}</span>
        </div>
      </div>

      {/* Alerta de saldo */}
      <div style={{ background: faltan >= 0 ? (isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB") : (isDark ? "rgba(239, 68, 68, 0.1)" : "#FEF2F2"), border: `1px solid ${faltan >= 0 ? "#FCD34D" : "#FECACA"}`, borderRadius: 12, padding: "16px", display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
        <AlertTriangle size={24} color={faltan >= 0 ? "#F59E0B" : c.red} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: c.text }}>
            {faltan >= 0 ? "Te quedan" : "Te excediste por"} <span style={{ color: faltan >= 0 ? "#F59E0B" : c.red }}>S/ {formatMoney(Math.abs(faltan)).replace("S/ ", "")}</span> {faltan >= 0 && "para gastar"}
          </div>
          {faltan >= 0 && <div style={{ fontSize: 13, color: c.muted, marginTop: 2, fontWeight: 500 }}>en esta categoría</div>}
        </div>
      </div>

      {/* Lista de Movimientos */}
      <div style={{ fontSize: 15, fontWeight: 800, color: c.text, marginBottom: 16 }}>Movimientos en {nombreCat}</div>
      
      {gastosCatMes.length === 0 ? (
        <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontSize: 14, fontWeight: 500 }}>No hay gastos registrados este mes.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
          {gastosCatMes.map(g => (
            <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <span style={{ fontSize: 13, color: c.muted, fontWeight: 600, width: 45 }}>{g.fecha === hoy() ? "Hoy" : g.fecha.split("-")[2] + " May"}</span>
                <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{g.descripcion}</span>
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: c.red }}>-S/ {formatMoney(g.monto).replace("S/ ", "")}</span>
            </div>
          ))}
        </div>
      )}

      {/* Botón Ver Todos */}
      {gastosCatMes.length > 0 && (
        <button onClick={() => cerrarPantalla('detalleCat')} style={{ width: "100%", padding: "16px", background: isDark ? "rgba(74, 58, 255, 0.1)" : "#F5F3FF", color: "#4A3AFF", border: `1px solid ${isDark ? "#4A3AFF" : "#DDD6FE"}`, borderRadius: 12, fontSize: 15, fontWeight: 800, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8 }}>
          Cerrar detalle
        </button>
      )}
    </div>
  );
}