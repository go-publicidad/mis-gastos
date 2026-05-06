import React from "react";
import { ArrowLeft } from "lucide-react";
import { formatMoney } from "../utils";

export default function ModalHistorialPresupuestos({
  c, s, isDark, isClosing, cerrarPantalla, presupuestosMensuales, setShowHistorial, setResumenMes
}) {
  const formatMes = (fechaCadena) => {
    if(!fechaCadena) return "";
    const [year, month] = fechaCadena.split('-');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${meses[parseInt(month, 10) - 1]} ${year}`;
  };

  const mesesOrdenados = Object.keys(presupuestosMensuales).sort((a, b) => b.localeCompare(a));

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10002, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'historialPresup' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('historialPresup', () => setShowHistorial(false))} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16, display: "flex" }}>
          <ArrowLeft size={28} />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700, flex: 1, textAlign: "center", paddingRight: 44 }}>Historial de presupuesto</h2>
      </div>

      {mesesOrdenados.length === 0 ? (
         <div style={{ textAlign: "center", color: c.muted, padding: "40px 0", fontSize: 15, fontWeight: 500 }}>No hay presupuestos registrados aún.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", background: c.card, borderRadius: 16, border: `1px solid ${c.border}`, overflow: "hidden", boxShadow: c.shadow }}>
          {mesesOrdenados.map((mes, index) => {
            const data = presupuestosMensuales[mes];
            const isLast = index === mesesOrdenados.length - 1;
            return (
              <div 
                key={mes} 
                onClick={() => setResumenMes(mes)} 
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px", borderBottom: isLast ? "none" : `1px solid ${c.border}`, cursor: "pointer" }}
              >
                <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{formatMes(mes)}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: c.green }}>S/ {formatMoney(data.total).replace("S/ ", "")}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}