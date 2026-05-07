import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import ReporteGeneral from "./ReporteGeneral";
import ReporteMetas from "./ReporteMetas";

export default function TabReportes({ c, s, isDark, gastos, categoriasBase, categoriasExtra, categorias, listaMetas }) {
  const [filtroReporteTipo, setFiltroReporteTipo] = useState("general");

  return (
    <div style={s.section}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ position: "relative" }}>
            <select 
              style={{ ...s.select, paddingRight: 40, fontSize: 16, fontWeight: 700, color: filtroReporteTipo === "general" ? c.text : "#10B981", borderColor: filtroReporteTipo === "general" ? (isDark ? "#555" : "#000") : "#10B981", borderWidth: 2, appearance: "none", WebkitAppearance: "none", backgroundColor: "transparent" }} 
              value={filtroReporteTipo} 
              onChange={(e) => setFiltroReporteTipo(e.target.value)}
            >
                <option value="general">📊 Ingresos y Gastos</option>
                <option value="metas">🎯 Metas de ahorro</option>
            </select>
            <ChevronDown size={20} color={filtroReporteTipo === "general" ? c.text : "#10B981"} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
        </div>
      </div>

      {filtroReporteTipo === "general" ? (
        <ReporteGeneral c={c} s={s} isDark={isDark} gastos={gastos} categoriasBase={categoriasBase} categoriasExtra={categoriasExtra} categorias={categorias} />
      ) : (
        <ReporteMetas c={c} s={s} isDark={isDark} gastos={gastos} listaMetas={listaMetas} />
      )}
    </div>
  );
}