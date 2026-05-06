import React from "react";
import { Edit2 } from "lucide-react";
import { formatMoney, getIcono, getTexto, hoy } from "../utils";

export default function TabPresupuesto({
  c, s, isDark, presupuestosMensuales, setPresupForm, setShowCrearPresupuesto
}) {
  const mesActualClave = hoy().slice(0, 7); 
  const presupuestoActual = presupuestosMensuales[mesActualClave];

  if (!presupuestoActual) {
     return (
        <div style={{...s.section, alignItems: "center", justifyContent: "center", minHeight: "80vh", paddingBottom: 120 }}>
           <div style={{ fontSize: 80, marginBottom: 24 }}>💰</div>
           <h2 style={{ fontSize: 22, color: c.text, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Aún no tienes un presupuesto</h2>
           <p style={{ color: c.muted, textAlign: "center", fontSize: 15, marginBottom: 40, lineHeight: 1.6, maxWidth: 300, fontWeight: 500 }}>
              Crea tu primer presupuesto y controla tus gastos por categoría mes a mes.
           </p>
           <button onClick={() => {
              setPresupForm({ periodo: mesActualClave, categorias: {} });
              setShowCrearPresupuesto(true);
           }} style={{...s.btnPrimary, background: c.brandBlue, boxShadow: "0 8px 24px rgba(74, 58, 255, 0.3)", padding: "16px 32px", fontSize: 16, width: "auto", borderRadius: 30 }}>
              Crear presupuesto
           </button>
        </div>
     );
  }

  return (
      <div style={s.section}>
          <div style={{ background: c.brandBlue, borderRadius: 24, padding: 24, color: "#FFF", marginBottom: 24, boxShadow: "0 10px 30px rgba(74, 58, 255, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <span style={{ fontSize: 18, fontWeight: 800 }}>Resumen del mes</span>
                  <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9 }}>{presupuestoActual.total ? `S/ ${formatMoney(presupuestoActual.total).replace("S/ ","")}` : ""}</div>
              </div>
              <div style={{ fontSize: 15, opacity: 0.9, marginBottom: 24, lineHeight: 1.5 }}>
                  ¡Excelente! Has guardado tu presupuesto para este mes.<br/><br/>
                  En el siguiente paso transformaremos esta tarjeta en el dashboard completo con tus barras de progreso por categoría.
              </div>
              <button onClick={() => {
                  setPresupForm({ periodo: mesActualClave, categorias: presupuestoActual.categorias || {} });
                  setShowCrearPresupuesto(true);
              }} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "#FFF", padding: "12px 16px", borderRadius: 12, fontWeight: 700, cursor: "pointer", width: "100%", fontSize: 15 }}>
                  Editar mi presupuesto
              </button>
          </div>
      </div>
  );
}