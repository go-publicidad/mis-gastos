import React, { useState } from "react";
import { ChevronDown, Clock } from "lucide-react";
import { formatMoney, getIcono, getTexto, hoy } from "../utils";

export default function TabPresupuesto({
  c, s, isDark, presupuestosMensuales, setPresupForm, setShowCrearPresupuesto,
  gastos, categorias, setCatPresupSelec, setShowHistorial
}) {
  const [mesSelec, setMesSelec] = useState(hoy().slice(0, 7));

  const formatMes = (fechaCadena) => {
    if(!fechaCadena) return "";
    const [year, month] = fechaCadena.split('-');
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    return `${meses[parseInt(month, 10) - 1]} ${year}`;
  };

  const presupuestoActual = presupuestosMensuales[mesSelec];

  if (!presupuestoActual) {
     return (
        <div style={s.section}>
           <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8, marginTop: 8 }}>
               <button onClick={() => setShowHistorial(true)} style={{ background: "none", border: "none", color: c.brandBlue, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                   <Clock size={16} /> Historial
               </button>
           </div>
           <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 6, background: c.card, border: `1px solid ${c.border}`, padding: "8px 16px", borderRadius: 20, cursor: "pointer", boxShadow: c.shadow }}>
                 <span style={{ fontSize: 15, fontWeight: 700, color: c.text }}>{formatMes(mesSelec)}</span>
                 <ChevronDown size={18} color={c.muted} />
                 <input type="month" value={mesSelec} onChange={(e) => setMesSelec(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
              </div>
           </div>

           <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
               <div style={{ fontSize: 80, marginBottom: 24 }}>💰</div>
               <h2 style={{ fontSize: 22, color: c.text, fontWeight: 800, marginBottom: 12, textAlign: "center" }}>Sin presupuesto</h2>
               <p style={{ color: c.muted, textAlign: "center", fontSize: 15, marginBottom: 40, lineHeight: 1.6, maxWidth: 300, fontWeight: 500 }}>
                  Aún no has planificado <strong style={{color: c.text}}>{formatMes(mesSelec)}</strong>. Créalo ahora y toma el control de tus finanzas.
               </p>
               <button onClick={() => { setPresupForm({ periodo: mesSelec, categorias: {} }); setShowCrearPresupuesto(true); }} style={{...s.btnPrimary, background: c.brandBlue, boxShadow: "0 8px 24px rgba(74, 58, 255, 0.3)", padding: "16px 32px", fontSize: 16, width: "auto", borderRadius: 30 }}>
                  Crear presupuesto
               </button>
           </div>
        </div>
     );
  }

  const gastosDelMes = gastos.filter(g => g.tipo === "gasto" && g.fecha.startsWith(mesSelec));
  const totalP = presupuestoActual.total || 0;
  const totalG = gastosDelMes.reduce((acc, g) => acc + g.monto, 0);
  const disponible = totalP - totalG;
  const pctTotal = totalP > 0 ? Math.min(100, (totalG / totalP) * 100) : 0;
  
  return (
      <div style={{ ...s.section, paddingTop: "calc(76px + env(safe-area-inset-top, 0px))" }}>
          
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
              <button onClick={() => setShowHistorial(true)} style={{ background: "none", border: "none", color: c.brandBlue, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                  <Clock size={16} /> Historial
              </button>
          </div>

          {/* 1. TARJETA RESUMEN DEL MES */}
          <div style={{ background: c.brandBlue, borderRadius: 16, padding: "20px", color: "#FFF", marginBottom: 24, boxShadow: "0 10px 30px rgba(74, 58, 255, 0.3)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Resumen del mes</span>
                  <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 4, cursor: "pointer", background: "rgba(255,255,255,0.1)", padding: "6px 12px", borderRadius: 16 }}>
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{formatMes(mesSelec)}</span>
                      <ChevronDown size={16} />
                      <input type="month" value={mesSelec} onChange={(e) => setMesSelec(e.target.value)} style={{ position: "absolute", inset: 0, opacity: 0, cursor: "pointer", width: "100%" }} />
                  </div>
              </div>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, borderRight: "1px solid rgba(255,255,255,0.2)", paddingRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.9, marginBottom: 4 }}>Presupuesto total</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>S/ {formatMoney(totalP).replace("S/ ", "")}</div>
                  </div>
                  <div style={{ flex: 1, borderRight: "1px solid rgba(255,255,255,0.2)", paddingLeft: 12, paddingRight: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.9, marginBottom: 4 }}>Gastado</div>
                      <div style={{ fontSize: 18, fontWeight: 800 }}>S/ {formatMoney(totalG).replace("S/ ", "")}</div>
                  </div>
                  <div style={{ flex: 1, paddingLeft: 12 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.9, marginBottom: 4 }}>Disponible</div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: disponible >= 0 ? "#5AE88A" : "#FFAAAA" }}>S/ {formatMoney(disponible).replace("S/ ", "")}</div>
                  </div>
              </div>
          </div>

          {/* 2. TARJETA PROGRESO GENERAL */}
          <div style={{ ...s.card, padding: "20px", marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>Progreso general</span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>{pctTotal.toFixed(0)}%</span>
              </div>
              <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 8, height: 10, width: "100%", overflow: "hidden", marginBottom: 12 }}>
                  <div style={{ background: pctTotal >= 90 ? c.red : (pctTotal >= 75 ? "#F59E0B" : c.green), height: "100%", width: `${pctTotal}%`, borderRadius: 8 }}></div>
              </div>
              <div style={{ fontSize: 13, color: c.muted, fontWeight: 600 }}>
                  Has gastado el {pctTotal.toFixed(0)}% de tu presupuesto total
              </div>
          </div>

          {/* 3. LISTA DE CATEGORÍAS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: c.text, margin: 0 }}>Por categorías</h3>
              <button onClick={() => { setPresupForm({ periodo: mesSelec, categorias: presupuestoActual.categorias || {} }); setShowCrearPresupuesto(true); }} style={{ background: "none", border: "none", color: c.brandBlue, fontWeight: 700, fontSize: 14, cursor: "pointer", padding: 0, fontFamily: "inherit" }}>
                  Editar
              </button>
          </div>
          
          {Object.keys(presupuestoActual.categorias).map(catId => {
              const limite = parseFloat(presupuestoActual.categorias[catId]);
              if (!limite) return null;

              const catObj = categorias.find(c => c.id === catId);
              const nombreCat = catObj ? getTexto(catObj.label) : "Desconocida";
              const iconoCat = catObj ? getIcono(catObj.label) : "🏷️";
              const catColorOriginal = catObj?.color || "#FBBF24";
              
              const gastadoCat = gastosDelMes.filter(g => g.categoria === catId).reduce((sum, g) => sum + g.monto, 0);
              const pctCatReal = (gastadoCat / limite) * 100;
              const pctCatVisual = Math.min(100, pctCatReal);

              const colorIcono = catColorOriginal;
              const colorBarra = pctCatReal >= 90 ? c.red : catColorOriginal;

              return (
                  <div key={catId} onClick={() => setCatPresupSelec(catId)} style={{ ...s.card, padding: "16px", marginBottom: 12, cursor: "pointer" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 12 }}>
                          <div style={{ width: 44, height: 44, borderRadius: "50%", background: colorIcono, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, color: "#FFF", flexShrink: 0 }}>{iconoCat}</div>
                          <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 4 }}>
                                  <span style={{ fontSize: 15, fontWeight: 800, color: c.text }}>{nombreCat}</span>
                                  <span style={{ fontSize: 15, fontWeight: 800, color: pctCatReal >= 100 ? c.red : c.text }}>{pctCatReal.toFixed(0)}%</span>
                              </div>
                              <div style={{ fontSize: 13, fontWeight: 500, color: c.muted }}>S/ {formatMoney(gastadoCat).replace("S/ ","")} de S/ {formatMoney(limite).replace("S/ ","")}</div>
                          </div>
                      </div>
                      <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 6, height: 6, width: "100%", overflow: "hidden" }}>
                          <div style={{ background: colorBarra, height: "100%", width: `${pctCatVisual}%`, borderRadius: 6 }}></div>
                      </div>
                  </div>
              );
          })}
      </div>
  );
}