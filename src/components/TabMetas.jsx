import React from "react";
import { Calendar, Clock, Plus } from "lucide-react";
import { formatMoney, formatFecha, diffDias, hoy } from "../utils";
import { PASTEL_COLORS } from "../constants";

export default function TabMetas({
  c, s, isDark, listaMetas, setMetaSeleccionada, setIsEditingMetaObj, setMetaForm, setShowCrearMeta
}) {
  return (
    <div style={{ padding: "calc(76px + env(safe-area-inset-top, 0px)) 20px 20px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", paddingBottom: 140 }}>
      <div style={{ fontSize: 14, color: c.muted, marginBottom: 20, fontWeight: 500 }}>Tus objetivos financieros</div>
      {listaMetas.length === 0 ? (
        <div style={{ ...s.card, textAlign: "center", padding: "40px 20px", color: c.muted, fontWeight: 500 }}>Aún no tienes metas creadas. ¡Anímate a crear una!</div>
      ) : (
        listaMetas.map((meta, index) => {
          const obj = parseFloat(meta.montoObjetivo) || 1;
          const ahorrado = parseFloat(meta.aporteInicial) || 0;
          const faltan = Math.max(0, obj - ahorrado);
          const pct = Math.min(100, Math.round((ahorrado / obj) * 100));
          let fechaStr = "Sin fecha límite"; let diasStr = "Sin prisa"; let diasRestantes = 0;
          if (meta.fechaLimite) {
            fechaStr = formatFecha(meta.fechaLimite);
            diasRestantes = diffDias(hoy(), meta.fechaLimite);
            if (diasRestantes < 0) diasStr = "Vencida"; else if (diasRestantes === 0) diasStr = "¡Hoy!"; else diasStr = `En ${diasRestantes} días`;
          }
          const bgIconColor = PASTEL_COLORS[index % PASTEL_COLORS.length];
          return (
            <div key={meta.id} onClick={() => setMetaSeleccionada({ ...meta, indexColor: index })} style={{ ...s.card, padding: "20px", marginBottom: 16, cursor: "pointer" }}>
              <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: bgIconColor, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 32 }}>{meta.icono}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: c.text, marginBottom: 6 }}>{meta.nombre}</div>
                  <div style={{ marginBottom: 12 }}><span style={{ fontSize: 18, fontWeight: 700, color: c.green }}>S/ {formatMoney(ahorrado).replace("S/ ", "")}</span><span style={{ fontSize: 13, color: c.muted, fontWeight: 500 }}> de S/ {formatMoney(obj).replace("S/ ", "")}</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ background: isDark ? "#333" : "#E5E7EB", borderRadius: 4, height: 8, flex: 1, overflow: "hidden" }}><div style={{ background: c.green, height: "100%", width: `${pct}%`, borderRadius: 4 }}></div></div><span style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{pct}%</span></div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${c.border}`, paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.muted, fontSize: 13, fontWeight: 500 }}><Calendar size={16} /> {fechaStr}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: (!meta.fechaLimite || diasRestantes > 0) ? c.muted : c.red, fontSize: 13, fontWeight: 500 }}><Clock size={16} /> {diasStr}</div>
              </div>
            </div>
          );
        })
      )}
      <button onClick={() => { setIsEditingMetaObj(false); setMetaForm({ id: "", nombre: "", montoObjetivo: "", aporteInicial: "", fechaLimite: "", prioridad: "alta", tipo: "libre", icono: "💻" }); setShowCrearMeta(true); }} style={{ width: "100%", padding: 16, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.3)", marginTop: 8 }}><Plus size={20} /> Crear nueva meta</button>
    </div>
  );
}