import React from "react";
import { Edit2, Trash2, Plus } from "lucide-react";
import { getIcono, getTexto } from "../utils";

export default function ConfigCategorias({
  c, s, isDark, isClosing, cerrarPantalla, setProfileScreen,
  safeBase, safeExtra, abrirEditarCat, eliminarCat, abrirCrearCat
}) {
  return (
    <div className="hide-scroll" style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 10000, padding: "env(safe-area-inset-top, 20px) 20px 20px", overflowY: "auto", overflowX: "hidden", animation: isClosing === 'categorias' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 30, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16 }}>
        <button onClick={() => cerrarPantalla('categorias', () => setProfileScreen(null))} style={{ background: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Configuración de categorías</h2>
      </div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...s.label, fontSize: 16, color: c.green, marginBottom: 12 }}>Categorías para Ingresos</div>
        <div style={{ ...s.card, padding: 8, marginBottom: 12 }}>
            {safeBase.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "16px 0" }}>No hay categorías creadas</div> : 
              safeBase.map((cat, i, arr) => (
                <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: cat.color || (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#FFF" }}>{getIcono(cat.label)}</div><span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span></div>
                  <div style={{ display: "flex", gap: 4 }}><button style={s.editBtn} onClick={() => abrirEditarCat(cat, 'ingreso')}><Edit2 size={18}/></button><button style={s.deleteBtn} onClick={() => eliminarCat(cat.id, 'ingreso')}><Trash2 size={18}/></button></div>
                </div>
              ))
            }
        </div>
        <button onClick={() => abrirCrearCat('ingreso')} style={{ width: "100%", padding: 14, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}><Plus size={18} /> Crear categoría</button>
      </div>
      <div style={{ marginBottom: 32 }}>
        <div style={{ ...s.label, fontSize: 16, color: c.red, marginBottom: 12 }}>Categorías para Gastos</div>
        <div style={{ ...s.card, padding: 8, marginBottom: 12 }}>
            {safeExtra.length === 0 ? <div style={{ color: c.muted, fontSize: 14, fontWeight: 500, textAlign: "center", padding: "16px 0" }}>No hay categorías creadas</div> : 
              safeExtra.map((cat, i, arr) => (
                <div key={cat.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 8px", borderBottom: i === arr.length - 1 ? "none" : `1px solid ${c.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ width: 38, height: 38, borderRadius: "50%", background: cat.color || (isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: "#FFF" }}>{getIcono(cat.label)}</div><span style={{ fontSize: 15, fontWeight: 600 }}>{getTexto(cat.label)}</span></div>
                  <div style={{ display: "flex", gap: 4 }}><button style={s.editBtn} onClick={() => abrirEditarCat(cat, 'gasto')}><Edit2 size={18}/></button><button style={s.deleteBtn} onClick={() => eliminarCat(cat.id, 'gasto')}><Trash2 size={18}/></button></div>
                </div>
              ))
            }
        </div>
        <button onClick={() => abrirCrearCat('gasto')} style={{ width: "100%", padding: 14, background: "#059669", color: "#FFF", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer", display: "flex", justifyContent: "center", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(5, 150, 105, 0.2)" }}><Plus size={18} /> Crear categoría</button>
      </div>
    </div>
  );
}