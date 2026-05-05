import React from "react";
import { X } from "lucide-react";

export default function ExportarReportes({
  c, s, isClosing, cerrarPantalla, setProfileScreen,
  exportFechaDesde, setExportFechaDesde,
  exportFechaHasta, setExportFechaHasta,
  exportEmail, setExportEmail,
  gastos, categorias, showToast
}) {
  
  // Funciones temporales para evitar la pantalla negra
  const exportarCSV = () => showToast("Exportar a Excel en desarrollo 🚀", c.green);
  const exportarPDF = () => showToast("Exportar a PDF en desarrollo 🚀", c.green);

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'exportar' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('exportar', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Exportar Reportes</h2>
      </div>
      <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
        <div style={{ ...s.label, marginBottom: 16 }}>1. Selecciona el rango de fechas</div>
        <div style={{ display: "flex", gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1, position: "relative" }}><input type="date" value={exportFechaDesde} onChange={e => setExportFechaDesde(e.target.value)} style={{ ...s.input, textAlign: "center", color: exportFechaDesde ? c.text : "transparent" }} /></div>
          <div style={{ flex: 1, position: "relative" }}><input type="date" value={exportFechaHasta} onChange={e => setExportFechaHasta(e.target.value)} style={{ ...s.input, textAlign: "center", color: exportFechaHasta ? c.text : "transparent" }} /></div>
        </div>
        {(exportFechaDesde || exportFechaHasta) && <button style={{ width: "100%", fontSize: 14, fontWeight: 700, color: c.red, backgroundColor: "transparent", WebkitAppearance: "none", border: "none", cursor: "pointer", marginTop: 8, fontFamily: "inherit" }} onClick={() => { setExportFechaDesde(""); setExportFechaHasta(""); }}><X size={14} style={{ marginRight: 4, verticalAlign: "middle" }} /> Limpiar fechas</button>}
      </div>
      <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
        <div style={{ ...s.label, marginBottom: 16 }}>2. Descargar archivo</div>
        <div style={{ display: "flex", gap: 12 }}>
          <button style={{...s.btnSecondary, background: c.bg, border: `1px solid ${c.border}`, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16}} onClick={exportarCSV}><span style={{fontSize: 24}}>📊</span> Excel</button>
          <button style={{...s.btnSecondary, background: c.bg, border: `1px solid ${c.border}`, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: 16}} onClick={exportarPDF}><span style={{fontSize: 24}}>📄</span> PDF</button>
        </div>
      </div>
      <div style={{ ...s.card, padding: 20, marginBottom: 24 }}>
        <div style={{ ...s.label, marginBottom: 8 }}>3. O enviar por correo</div>
        <p style={{ margin: "0 0 16px", fontSize: 13, color: c.muted, fontWeight: 500 }}>Recibirás un resumen en tu bandeja de entrada.</p>
        <input style={{ ...s.input, marginBottom: 16 }} type="email" placeholder="correo@ejemplo.com" value={exportEmail} onChange={e => setExportEmail(e.target.value)} />
        <button style={{ ...s.btnPrimary, background: "#4D96FF", boxShadow: "0 4px 12px rgba(77, 150, 255, 0.3)" }} onClick={() => { if(!exportEmail) return showToast("Ingresa un correo", c.red); showToast("Reporte enviado con éxito", c.green); setExportEmail(""); }}>Enviar Reporte</button>
      </div>
    </div>
  );
}