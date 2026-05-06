import React from "react";

export default function ModalRegistrarMovimiento({
  s, c, form, setForm, safeBase, safeExtra, agregarMovimiento, setShowAddModal, saving
}) {
  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
      <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Registrar Movimiento</h3>
          <button onClick={() => setShowAddModal(false)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button style={s.tipoBtn(form.tipo === "ingreso", c.green)} onClick={() => setForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button>
          <button style={s.tipoBtn(form.tipo === "gasto", c.red)} onClick={() => setForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button>
        </div>
        <input autoFocus style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
            {(form.tipo === "ingreso" ? safeBase : safeExtra).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
          <input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} onKeyDown={e => e.key === "Enter" && agregarMovimiento()} />
        </div>
        <button style={{...s.btnPrimary, padding: "16px"}} onClick={agregarMovimiento} disabled={saving}>{saving ? "Guardando..." : "Guardar Registro"}</button>
      </div>
    </div>
  );
}