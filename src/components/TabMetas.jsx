import React from "react";
import { Calendar, Clock, Plus, ChevronRight } from "lucide-react";
import { formatMoney, formatFecha, diffDias, hoy } from "../utils";

export default function TabMetas({
  c, s, isDark, listaMetas, setMetaSeleccionada, setIsEditingMetaObj, setMetaForm, setShowCrearMeta
}) {
  // Colores pastel para el fondo de los íconos
  const SAFE_PASTEL = ['#F3E8FF', '#DBEAFE', '#D1FAE5', '#FEF3C7', '#FCE7F3'];

  return (
    <div style={s.section}>
      <div style={{ marginBottom: 20 }}>
        <span style={{ fontSize: 14, fontWeight: 500, color: c.muted }}>Tus objetivos financieros</span>
      </div>

      {listaMetas.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 8 }}>Aún no tienes metas</div>
          <div style={{ fontSize: 14, color: c.muted }}>Crea tu primera meta financiera.</div>
        </div>
      ) : (
        listaMetas.map((meta) => {
          const obj = parseFloat(meta.montoObjetivo) || 1;
          const ahorrado = parseFloat(meta.aporteInicial) || 0;
          const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
          
          let fechaStr = "Sin fecha";
          let diasRestantes = 0;
          if (meta.fechaLimite) {
            fechaStr = formatFecha(meta.fechaLimite);
            diasRestantes = diffDias(hoy(), meta.fechaLimite);
          }
          
          // Asigna un color pastel basado en la longitud del nombre
          const bgIconColor = SAFE_PASTEL[Math.abs((meta.nombre || "").length) % SAFE_PASTEL.length];

          return (
            <div 
              key={meta.id} 
              style={{ ...s.card, cursor: "pointer", padding: "20px", marginBottom: 16, position: "relative", WebkitTapHighlightColor: "transparent" }}
              // 👇 AQUÍ ESTÁ LA MAGIA QUE FALTABA 👇
              onClick={() => setMetaSeleccionada(meta)}
            >
              <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                  {meta.icono}
                </div>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 24 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {meta.nombre}
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: c.green }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span>
                    <span style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}>de S/ {formatMoney(obj).replace("S/ ", "")}</span>
                  </div>
                </div>
              </div>

              {/* FLECHITA INDICADORA DE CLIC */}
              <div style={{ position: "absolute", top: 36, right: 20, color: c.muted }}>
                <ChevronRight size={20} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 6, flex: 1, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: c.green, borderRadius: 4 }}></div>
                </div>
                <span style={{ fontSize: 13, fontWeight: 700, color: c.text, width: 32, textAlign: "right" }}>{pct}%</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 16, borderTop: `1px solid ${c.border}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted, fontSize: 13, fontWeight: 500 }}>
                  <Calendar size={14} /> {fechaStr}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted, fontSize: 13, fontWeight: 500 }}>
                  <Clock size={14} /> {diasRestantes > 0 ? `En ${diasRestantes} días` : "—"}
                </div>
              </div>
            </div>
          );
        })
      )}

      <button 
        onClick={() => { 
          setIsEditingMetaObj(false); 
          setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); 
          setShowCrearMeta(true); 
        }} 
        style={{ width: "100%", background: c.green, color: "#FFF", border: "none", borderRadius: 12, padding: "16px", fontSize: 16, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, boxShadow: "0 4px 12px rgba(16, 185, 129, 0.2)" }}
      >
        <Plus size={20} /> Crear nueva meta
      </button>
    </div>
  );
}