import React, { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney, hoy } from "../utils";

export default function ModalPresupuestoAnual({
  c, s, isDark, isClosing, cerrarPantalla, presupuestosMensuales, gastos, setShowPresupAnual
}) {
  const anioActual = hoy().split("-")[0];
  const mesActual = hoy().split("-")[1];

  const [anioSelec, setAnioSelec] = useState(parseInt(anioActual));
  const [mesActivo, setMesActivo] = useState(mesActual); // Por defecto "05" (Mayo)

  // Nombres de los meses para el eje X
  const nombresMeses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  
  // Procesar los 12 meses del año seleccionado
  const datosAnio = nombresMeses.map((nombre, index) => {
    const mesNum = (index + 1).toString().padStart(2, "0");
    const claveMes = `${anioSelec}-${mesNum}`;
    
    // 1. Obtener Presupuesto del mes
    const p = presupuestosMensuales[claveMes]?.total || 0;
    
    // 2. Obtener Gastos de ese mes
    const g = gastos.filter(gasto => gasto.tipo === "gasto" && gasto.fecha.startsWith(claveMes)).reduce((acc, curr) => acc + curr.monto, 0);

    return { id: mesNum, nombre, clave: claveMes, p, g, disp: p - g };
  });

  // Encontrar el valor más alto del año para escalar el gráfico
  const maxValor = Math.max(...datosAnio.map(d => Math.max(d.p, d.g)), 1);

  // Datos del mes que el usuario tocó en el gráfico
  const datosMesActivo = datosAnio.find(d => d.id === mesActivo);

  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10003, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'presupAnual' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      
      {/* HEADER FIJO */}
      <div style={{ display: "flex", alignItems: "center", marginBottom: 24, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('presupAnual', () => setShowPresupAnual(false))} style={{ background: "none", border: "none", color: c.text, fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16, display: "flex" }}>
            <ArrowLeft size={28} />
        </button>
        <h2 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700, flex: 1, textAlign: "center", paddingRight: 44 }}>Presupuesto por períodos</h2>
      </div>

      {/* SELECTOR DE AÑO */}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 24, marginBottom: 32 }}>
          <button onClick={() => setAnioSelec(anioSelec - 1)} style={{ background: "none", border: "none", color: c.brandBlue, cursor: "pointer", padding: 8, display: "flex" }}><ChevronLeft size={24} /></button>
          <span style={{ fontSize: 22, fontWeight: 800, color: c.text }}>{anioSelec}</span>
          <button onClick={() => setAnioSelec(anioSelec + 1)} style={{ background: "none", border: "none", color: c.brandBlue, cursor: "pointer", padding: 8, display: "flex" }}><ChevronRight size={24} /></button>
      </div>

      {/* ZONA DEL GRÁFICO DE BARRAS */}
      <div style={{ ...s.card, padding: "24px 16px", marginBottom: 24, minHeight: 220 }}>
         <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, marginBottom: 12, position: "relative" }}>
            {/* Líneas de fondo opcionales */}
            <div style={{ position: "absolute", top: 0, left: 0, width: "100%", borderTop: `1px dashed ${c.border}`, zIndex: 0 }}></div>
            <div style={{ position: "absolute", top: "50%", left: 0, width: "100%", borderTop: `1px dashed ${c.border}`, zIndex: 0 }}></div>

            {datosAnio.map(d => {
                const isSelected = d.id === mesActivo;
                const alturaPresupuesto = (d.p / maxValor) * 100;
                const alturaGasto = (d.g / maxValor) * 100;
                
                // Colores dinámicos dependiendo de si está seleccionado
                const colorPresupuesto = isSelected ? "rgba(74, 58, 255, 0.2)" : (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6");
                const colorGasto = isSelected ? c.brandBlue : (isDark ? "rgba(255,255,255,0.2)" : "#D1D5DB");

                return (
                  <div key={d.id} onClick={() => setMesActivo(d.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", zIndex: 1 }}>
                     {/* Contenedor de la barra */}
                     <div style={{ width: "100%", maxWidth: 24, height: 160, display: "flex", alignItems: "flex-end", position: "relative" }}>
                        {/* Barra Presupuesto (Fondo) */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${alturaPresupuesto}%`, background: colorPresupuesto, borderRadius: "6px 6px 0 0", transition: "all 0.3s" }}></div>
                        {/* Barra Gastado (Frente) */}
                        <div style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${alturaGasto}%`, background: colorGasto, borderRadius: "6px 6px 0 0", transition: "all 0.3s" }}></div>
                     </div>
                     {/* Etiqueta del mes */}
                     <span style={{ fontSize: 11, fontWeight: isSelected ? 800 : 600, color: isSelected ? c.text : c.muted, marginTop: 8 }}>{d.nombre}</span>
                  </div>
                );
            })}
         </div>
         <div style={{ textAlign: "center", fontSize: 12, color: c.muted, fontWeight: 500, marginTop: 16 }}>Toca un mes para ver el detalle</div>
      </div>

      {/* LEYENDA Y DETALLE DEL MES SELECCIONADO */}
      <div style={{ ...s.card, padding: "20px" }}>
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
             <span style={{ fontSize: 16, fontWeight: 800, color: c.text }}>Detalle de {nombresMeses[parseInt(mesActivo)-1]}</span>
         </div>
         
         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.brandBlue }}></div>
                <span style={{ color: c.text, fontWeight: 600, fontSize: 15 }}>Presupuesto</span>
             </div>
             <span style={{ fontWeight: 800, color: c.text, fontSize: 15 }}>S/ {formatMoney(datosMesActivo.p).replace("S/ ","")}</span>
         </div>

         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: `1px solid ${c.border}` }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: "rgba(74, 58, 255, 0.4)" }}></div>
                <span style={{ color: c.text, fontWeight: 600, fontSize: 15 }}>Gastado</span>
             </div>
             <span style={{ fontWeight: 800, color: c.text, fontSize: 15 }}>S/ {formatMoney(datosMesActivo.g).replace("S/ ","")}</span>
         </div>

         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0" }}>
             <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: "50%", background: c.green }}></div>
                <span style={{ color: c.text, fontWeight: 600, fontSize: 15 }}>Disponible</span>
             </div>
             <span style={{ fontWeight: 800, color: datosMesActivo.disp >= 0 ? c.green : c.red, fontSize: 15 }}>S/ {formatMoney(datosMesActivo.disp).replace("S/ ","")}</span>
         </div>
      </div>

    </div>
  );
}