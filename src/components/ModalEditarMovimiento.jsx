import React from "react";

export default function ModalEditarMovimiento({
  s, c, editForm, setEditForm, safeBase, safeExtra, guardarEdicion, setEditando, saving
}) {
  return (
    <div style={s.overlay} onClick={e => { if (e.target === e.currentTarget) setEditando(null); }}>
      <div style={{...s.modal, animation: "slideUp 0.3s ease-out"}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, fontSize: 18, color: c.text, fontWeight: 700 }}>Editar Movimiento</h3>
          <button onClick={() => setEditando(null)} style={{ background: "none", border: "none", color: c.muted, fontSize: 24, cursor: "pointer", padding: 0 }}>×</button>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <button style={s.tipoBtn(editForm.tipo === "ingreso", c.green)} onClick={() => setEditForm(f => ({ ...f, tipo: "ingreso", categoria: safeBase[0]?.id || "" }))}>+ Ingreso</button>
          <button style={s.tipoBtn(editForm.tipo === "gasto", c.red)} onClick={() => setEditForm(f => ({ ...f, tipo: "gasto", categoria: safeExtra[0]?.id || "" }))}>− Gasto</button>
        </div>
        <input style={{ ...s.input, marginBottom: 16, fontSize: 32, textAlign: "center", fontWeight: 700, padding: "20px 10px", height: "auto" }} type="number" placeholder="0.00" value={editForm.monto} onChange={e => setEditForm(f => ({ ...f, monto: e.target.value }))} />
        <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
          <select style={{ ...s.select, flex: 1, marginBottom: 0 }} value={editForm.categoria} onChange={e => setEditForm(f => ({ ...f, categoria: e.target.value }))}>
            {(editForm.tipo === "ingreso" ? safeBase : safeExtra).map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
          </select>
          <input style={{ ...s.input, flex: 1, marginBottom: 0, fontSize: 15, fontWeight: 500 }} type="text" placeholder="Descripción" value={editForm.descripcion} onChange={e => setEditForm(f => ({ ...f, descripcion: e.target.value }))} />
        </div>
        <button style={{...s.btnPrimary, padding: "16px"}} onClick={guardarEdicion} disabled={saving}>{saving ? "Guardando..." : "Guardar Cambios"}</button>
      </div>
    </div>
  );
}