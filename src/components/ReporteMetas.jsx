import React, { useState } from "react";
import { ChevronDown, Calendar, X } from "lucide-react";
import { formatMoney, formatFecha, getUIFechaHora, hoy } from "../utils";

export default function ReporteMetas({ c, s, isDark, gastos, listaMetas }) {
  const [reporteMetaId, setReporteMetaId] = useState("");
  const [showFiltrosMenu, setShowFiltrosMenu] = useState(false);
  const [filtroFechaResumenDesde, setFiltroFechaResumenDesde] = useState("");
  const [filtroFechaResumenHasta, setFiltroFechaResumenHasta] = useState("");

  if (listaMetas.length === 0) return (<div style={{ ...s.card, textAlign: "center", padding: "40px 20px", color: c.muted, fontWeight: 500 }}>No tienes metas creadas para analizar. ¡Crea una en la pestaña Metas!</div>);
  
  const metaSelecId = reporteMetaId || listaMetas[0].id;
  const metaSelec = listaMetas.find(m => m.id === metaSelecId) || listaMetas[0];
  const objHistorico = parseFloat(metaSelec.montoObjetivo) || 1;
  const ahorradoHistorico = parseFloat(metaSelec.aporteInicial) || 0;
  const faltanHistorico = Math.max(0, objHistorico - ahorradoHistorico);
  const pctHistorico = Math.min(100, Math.round((ahorradoHistorico / objHistorico) * 100));

  const aportesDeMeta = gastos.filter(g => {
      if (g.tipo !== "aporte" || !g.descripcion.includes(metaSelec.nombre)) return false;
      if (showFiltrosMenu) {
          if (filtroFechaResumenDesde && g.fecha < filtroFechaResumenDesde) return false;
          if (filtroFechaResumenHasta && g.fecha > filtroFechaResumenHasta) return false;
      }
      return true;
  });
  const totalAportadoRango = aportesDeMeta.reduce((acc, g) => acc + g.monto, 0);
  const mayorAporte = aportesDeMeta.length > 0 ? Math.max(...aportesDeMeta.map(a => a.monto)) : 0;
  const aportesPorFecha = aportesDeMeta.reduce((acc, g) => { acc[g.fecha] = (acc[g.fecha] || 0) + g.monto; return acc; }, {});
  const aportesChartData = Object.keys(aportesPorFecha).sort().slice(-6).map(fecha => ({ fecha, total: aportesPorFecha[fecha] }));
  const maxAporteC = aportesChartData.length > 0 ? Math.max(...aportesChartData.map(d => d.total)) : 1;
  const cMaxA = maxAporteC * 1.2;

  return (
    <div>
        <div style={{ marginBottom: showFiltrosMenu ? 16 : 24 }}>
            <div style={{ ...s.label, marginBottom: 8 }}>Selecciona una meta a analizar:</div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <select style={{ ...s.select, paddingRight: 40, fontSize: 16, fontWeight: 700, color: "#10B981", borderColor: "#10B981", marginBottom: 0, appearance: "none", WebkitAppearance: "none", backgroundColor: "transparent" }} value={metaSelecId} onChange={(e) => setReporteMetaId(e.target.value)}>
                        {listaMetas.map(m => <option key={m.id} value={m.id}>{m.icono} {m.nombre}</option>)}
                    </select>
                    <ChevronDown size={20} color="#10B981" style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                </div>
                <button onClick={() => setShowFiltrosMenu(!showFiltrosMenu)} style={{ width: 48, height: 48, borderRadius: "50%", border: `1.5px solid ${c.text}`, background: c.input, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0, transition: "all 0.2s" }}><Calendar size={22} color={c.text} /></button>
            </div>
        </div>

        {showFiltrosMenu && (
            <div style={{...s.card, marginBottom: 24, animation: "slideDown 0.3s ease-out"}}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <div style={{ flex: 1, position: "relative" }}>
                        {!filtroFechaResumenDesde && <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontSize: 14, fontWeight: 600 }}>DEL</span>}
                        <input type="date" value={filtroFechaResumenDesde} onChange={e => setFiltroFechaResumenDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenDesde ? c.text : "transparent" }} />
                    </div>
                    <div style={{ flex: 1, position: "relative" }}>
                        {!filtroFechaResumenHasta && <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", color: c.muted, pointerEvents: "none", fontSize: 14, fontWeight: 600 }}>AL</span>}
                        <input type="date" value={filtroFechaResumenHasta} onChange={e => setFiltroFechaResumenHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: filtroFechaResumenHasta ? c.text : "transparent" }} />
                    </div>
                </div>
                {(filtroFechaResumenDesde || filtroFechaResumenHasta) && (
                    <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 16, fontFamily: "inherit" }} onClick={() => { setFiltroFechaResumenDesde(""); setFiltroFechaResumenHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>
                )}
            </div>
        )}

        <div style={{ ...s.card, padding: "20px" }}>
            <h3 style={{ margin: "0 0 20px 0", fontSize: 16, fontWeight: 600, color: c.text }}>Progreso de la Meta</h3>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <div style={{ width: "50%", display: "flex", justifyContent: "center" }}>
                    <div style={{ width: 130, height: 130, borderRadius: "50%", background: `conic-gradient(${c.green} ${pctHistorico * 3.6}deg, ${isDark ? "#333" : "#E5E7EB"} ${pctHistorico * 3.6}deg 360deg)`, position: "relative", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: 70, height: 70, background: c.card, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><span style={{ fontSize: 18, fontWeight: 700, color: c.text }}>{pctHistorico}%</span></div>
                    </div>
                </div>
                <div style={{ width: "50%", display: "flex", flexDirection: "column", gap: 12, paddingLeft: 10 }}>
                    <div style={{ display: "flex", alignItems: "center" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: c.green, marginRight: 8, flexShrink: 0 }}></div><div><div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Ahorrado</div><div style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>{formatMoney(ahorradoHistorico)}</div></div></div>
                    <div style={{ display: "flex", alignItems: "center" }}><div style={{ width: 12, height: 12, borderRadius: "50%", background: isDark ? "#333" : "#E5E7EB", marginRight: 8, flexShrink: 0 }}></div><div><div style={{ fontSize: 13, fontWeight: 600, color: c.text }}>Te falta</div><div style={{ fontSize: 12, color: c.muted, fontWeight: 500 }}>{formatMoney(faltanHistorico)}</div></div></div>
                </div>
            </div>
            <div style={{ marginTop: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12, fontWeight: 600 }}><span style={{ color: c.green }}>{pctHistorico}% Ahorrado</span><span style={{ color: c.muted }}>{formatMoney(objHistorico)} Total</span></div>
                <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 8, height: 12, width: "100%", overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pctHistorico}%`, borderRadius: 8 }}></div></div>
            </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ background: isDark ? "rgba(16, 185, 129, 0.1)" : "#F0FDF4", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(16, 185, 129, 0.2)" : "none" }}>
                <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>{showFiltrosMenu && (filtroFechaResumenDesde || filtroFechaResumenHasta) ? "Aportado en rango" : "Total Aportado"}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: c.green }}>{formatMoney(totalAportadoRango)}</div>
            </div>
            <div style={{ background: isDark ? "rgba(245, 158, 11, 0.1)" : "#FFFBEB", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(245, 158, 11, 0.2)" : "none" }}>
                <div style={{ fontSize: 13, color: c.muted, marginBottom: 6, fontWeight: 500 }}>Te falta</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#F59E0B" }}>{formatMoney(faltanHistorico)}</div>
            </div>
        </div>
        
        <div style={{ background: isDark ? "rgba(168, 85, 247, 0.1)" : "#F3E8FF", borderRadius: 16, padding: 16, border: isDark ? "1px solid rgba(168, 85, 247, 0.2)" : "none", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
                <div style={{ fontSize: 13, color: c.muted, marginBottom: 4, fontWeight: 500 }}>Mayor aporte realizado</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: "#A855F7" }}>{formatMoney(mayorAporte)}</div>
            </div>
            <div style={{ fontSize: 32 }}>💪</div>
        </div>

        <div style={{ ...s.card, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px solid ${c.border}`, paddingBottom: 12, marginBottom: 20 }}>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: c.text }}>Evolución de Aportes</h3>
            </div>
            {aportesChartData.length === 0 ? (
                <div style={{ textAlign: "center", color: c.muted, padding: "30px 0", fontSize: 14 }}>Aún no has hecho aportes a esta meta.</div>
            ) : (
                <>
                    <div style={{ display: "flex", height: 160, marginTop: 12, gap: 8 }}>
                        <div style={{ width: 35, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 0 }}>{[cMaxA, cMaxA * 0.75, cMaxA * 0.5, cMaxA * 0.25, 0].map((t, i) => <span key={i} style={{ fontSize: 10, color: c.muted, fontWeight: 500, lineHeight: 1 }}>{t > 0 ? Math.round(t) : 0}</span>)}</div>
                        <div style={{ flex: 1, display: "flex", gap: 8, borderBottom: `1px solid ${c.border}`, position: "relative" }}>{aportesChartData.map((d, index) => (<div key={index} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: 6 }}><span style={{ fontSize: 10, fontWeight: 700, color: c.text, whiteSpace: "nowrap" }}>S/ {d.total % 1 === 0 ? d.total : d.total.toFixed(1)}</span><div style={{ width: "100%", maxWidth: 36, height: `${(d.total / cMaxA) * 100}%`, background: "#10B981", borderRadius: "4px 4px 0 0", minHeight: 2 }} /></div>))}</div>
                    </div>
                    <div style={{ display: "flex", paddingLeft: 43, gap: 8, marginTop: 8 }}>{aportesChartData.map((d, index) => { const parts = d.fecha.split("-"); return (<div key={index} style={{ flex: 1, textAlign: "center", fontSize: 10, fontWeight: 600, color: c.muted }}>{`${parts[2]}/${parts[1]}`}</div>) })}</div>
                </>
            )}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 0, marginBottom: 12 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Historial de la Meta</h3>
        </div>
        {aportesDeMeta.length > 0 ? (
            <div style={{ ...s.card, padding: "0 16px" }}>
                {aportesDeMeta.slice(0, 10).map((g, i, arr) => (
                    <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 0", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                        <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 14 }}>
                            <div style={{ width: 44, height: 44, borderRadius: 14, background: isDark ? "rgba(16,185,129,0.15)" : "#D1FAE5", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{metaSelec.icono}</div>
                            <div style={{ minWidth: 0 }}><div style={{ fontSize: 15, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: 4, color: c.text }}>Aporte realizado</div><div style={{ fontSize: 12, fontWeight: 400, color: c.muted }}>{getUIFechaHora(g.created_at)}</div></div>
                        </div>
                        <div style={{ textAlign: "right" }}><span style={{ fontSize: 16, fontWeight: 600, color: c.green }}>+{formatMoney(g.monto)}</span></div>
                    </div>
                ))}
            </div>
        ) : (
            <div style={{ ...s.card, textAlign: "center", color: c.muted, padding: "24px 0", fontWeight: 500 }}>Aún no hay aportes registrados</div>
        )}
    </div>
  );
}