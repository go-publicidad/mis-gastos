import React from "react";
import { ArrowLeft } from "lucide-react";
import { formatMoney, getTexto } from "../utils";

export default function ModalResumenMensual({
  c, s, isDark, isClosing, cerrarPantalla, mes, presupuestosMensuales, gastos, categorias, setResumenMes
}) {
  // REVISIÓN 1, 2 Y 3: Función formatMes corregida a prueba de fallos (usando fechaCadena)
  const formatMes = (fechaCadena) => {
    if(!fechaCadena) return "";
    const [year, month] = fechaCadena.split('-');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${meses[parseInt(month, 10) - 1]} ${year}`;
  };

  const presupuesto = presupuestosMensuales[mes];
  if (!presupuesto) return null;

  const gastosDelMes = gastos.filter(g => g.tipo === "gasto" && g.fecha.startsWith(mes));
  const totalP = presupuesto.total || 0;
  const totalG = gastosDelMes.reduce((acc, g) => acc + g.monto, 0);
  const disponible = totalP - totalG;
  const pctTotal = totalP > 0 ? Math.min(100, (totalG / totalP) * 100) : 0;

  // Calcular datos para la dona agrupados por categoría
  const agrupado = {};
  Object.keys(presupuesto.categorias).forEach(catId => {
     const gastadoCat = gastosDelMes.filter(g => g.categoria === catId).reduce((sum, g) => sum + g.monto, 0);
     if (gastadoCat > 0) {
         const catObj = categorias.find(c => c.id === catId);
         agrupado[catId] = {
             id: catId,
             label: catObj ? catObj.label : "Desconocida",
             color: catObj?.color || "#888", // Extraemos el color original
             total: gastadoCat
         };
     }
  });
  const catsData = Object.values(agrupado).sort((a, b) => b.total - a.total);
  const totGastosDonut = catsData.reduce((s, d) => s + d.total, 0) || 1;

  // Crear el string de colores para el gráfico
  let deg = 0;
  const conic = catsData.length > 0 ? catsData.map(cat => {
      const pct = (cat.total / totGastosDonut) * 360;
      const str = `${cat.color} ${deg}deg ${deg + pct}deg`;
      deg += pct;
      return str;
  }).join(", ") : `${isDark ? "#333" : "#E5E7EB"} 0deg 360deg`;

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10003, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'resumenMes' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      
      {/* Header Fijo */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 20, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('resumenMes', () => setResumenMes(null))} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16, display: "flex" }}>
            <ArrowLeft size={28} />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700, flex: 1, textAlign: "center", paddingRight: 44 }}>Resumen mensual</h2>
      </div>

      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginBottom: 24 }}>
         <span style={{ fontSize: 18, fontWeight: 800, color: c.text }}>{formatMes(mes)}</span>
      </div>

      {/* Tarjeta de Resumen en texto */}
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: c.text }}>Resumen</h3>
      <div style={{ ...s.card, padding: "0 16px", marginBottom: 24 }}>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${c.border}` }}>
             <span style={{ color: c.text, fontWeight: 600 }}>Presupuesto total</span>
             <span style={{ fontWeight: 800, color: c.text }}>S/ {formatMoney(totalP).replace("S/ ","")}</span>
         </div>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${c.border}` }}>
             <span style={{ color: c.text, fontWeight: 600 }}>Gastado total</span>
             <span style={{ fontWeight: 800, color: c.red }}>S/ {formatMoney(totalG).replace("S/ ","")}</span>
         </div>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", borderBottom: `1px solid ${c.border}` }}>
             <span style={{ color: c.text, fontWeight: 600 }}>Disponible</span>
             <span style={{ fontWeight: 800, color: c.green }}>S/ {formatMoney(disponible).replace("S/ ","")}</span>
         </div>
         <div style={{ display: "flex", justifyContent: "space-between", padding: "16px 0" }}>
             <span style={{ color: c.text, fontWeight: 600 }}>Porcentaje usado</span>
             <span style={{ fontWeight: 800, color: c.text }}>{pctTotal.toFixed(0)}%</span>
         </div>
      </div>

      {/* Gráfico y Leyenda */}
      <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: c.text }}>Distribución por categorías</h3>
      <div style={{ ...s.card, padding: "24px 20px" }}>
          {catsData.length === 0 ? (
              <div style={{ textAlign: "center", color: c.muted, padding: "20px 0", fontWeight: 500 }}>No hay gastos registrados en este mes.</div>
          ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                 {/* Dona */}
                 <div style={{ width: 120, height: 120, borderRadius: "50%", background: `conic-gradient(${conic})`, position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%" }}></div>
                 </div>
                 {/* Lista a la derecha */}
                 <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
                    {catsData.slice(0,5).map(cat => (
                       <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                             <div style={{ width: 12, height: 12, borderRadius: "50%", background: cat.color }}></div>
                             <span style={{ fontSize: 13, fontWeight: 700, color: c.text, width: 85, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {getTexto(cat.label)}
                             </span>
                          </div>
                          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                             <span style={{ fontSize: 13, fontWeight: 600, color: c.text, width: 35, textAlign: "right" }}>{Math.round((cat.total / totGastosDonut) * 100)}%</span>
                             <span style={{ fontSize: 13, fontWeight: 600, color: c.muted, width: 60, textAlign: "right" }}>S/ {Math.round(cat.total)}</span>
                          </div>
                       </div>
                    ))}
                 </div>
              </div>
          )}
      </div>
    </div>
  );
}