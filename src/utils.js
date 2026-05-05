import { CURRENCY } from "./constants";

// ─── FECHAS (zona horaria Lima, Perú UTC-5) ───────────────────────────────────

export const getLimaTime = () => new Date(Date.now() - 18000000);

export const hoy = () => getLimaTime().toISOString().split("T")[0];

export const calcularFechaFutura = (dias) =>
  new Date(Date.now() - 18000000 + dias * 86400000).toISOString().split("T")[0];

export const getFechaLocal = (isoStr) => {
  if (!isoStr) return hoy();
  const dt = new Date(
    isoStr.includes("Z") || isoStr.includes("+") ? isoStr : `${isoStr}Z`
  );
  return new Date(dt.getTime() - 18000000).toISOString().split("T")[0];
};

export const formatFecha = (fechaStr) => {
  if (!fechaStr) return "";
  const mesesAbv = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"];
  const [y, m, d] = fechaStr.split("-");
  return `${parseInt(d)} ${mesesAbv[parseInt(m) - 1]} ${y}`;
};

export const getUIFechaHora = (isoStr) => {
  if (!isoStr) return "";
  const dt = new Date(
    isoStr.includes("Z") || isoStr.includes("+") ? isoStr : `${isoStr}Z`
  );
  const limaDate = new Date(dt.getTime() - 18000000);
  let h = limaDate.getUTCHours();
  let m = limaDate.getUTCMinutes();
  const ampm = h >= 12 ? "p.m." : "a.m.";
  h = h % 12;
  h = h ? h : 12;
  m = m < 10 ? "0" + m : m;
  const strTime = `${h}:${m} ${ampm}`;
  const isoDate = limaDate.toISOString().split("T")[0];
  const todayIso = hoy();
  const ayerIso = new Date(Date.now() - 18000000 - 86400000)
    .toISOString()
    .split("T")[0];
  if (isoDate === todayIso) return `Hoy ${strTime}`;
  if (isoDate === ayerIso) return `Ayer ${strTime}`;
  const meses = ["Ene.","Feb.","Mar.","Abr.","May.","Jun.","Jul.","Ago.","Sep.","Oct.","Nov.","Dic."];
  return `${limaDate.getUTCDate()} ${meses[limaDate.getUTCMonth()]} ${limaDate.getUTCFullYear()} - ${strTime}`;
};

export const diffDias = (d1Str, d2Str) => {
  if (!d1Str || !d2Str) return 0;
  const [y1, m1, day1] = d1Str.split("-");
  const [y2, m2, day2] = d2Str.split("-");
  return Math.round(
    (Date.UTC(y2, m2 - 1, day2) - Date.UTC(y1, m1 - 1, day1)) / 86400000
  );
};

// ─── DINERO ───────────────────────────────────────────────────────────────────

export const formatMoney = (n) =>
  `${CURRENCY} ${Number(n || 0).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

// ─── CATEGORÍAS ───────────────────────────────────────────────────────────────

export const getIcono = (label) => {
  if (!label || !label.trim()) return "📌";
  const arr = label.trim().split(" ");
  if (arr.length > 1 && !/[a-zA-Z0-9]/.test(arr[0])) return arr[0];
  const firstChar = Array.from(label.trim())[0];
  return firstChar ? firstChar.toUpperCase() : "📌";
};

export const getTexto = (label) => {
  if (!label || !label.trim()) return "Sin nombre";
  const arr = label.trim().split(" ");
  if (arr.length > 1 && !/[a-zA-Z0-9]/.test(arr[0])) return arr.slice(1).join(" ");
  const firstChar = Array.from(label.trim())[0];
  if (firstChar && !/[a-zA-Z0-9]/.test(firstChar))
    return Array.from(label.trim()).slice(1).join("").trim() || label.trim();
  return label.trim();
};

export const formatCatName = (label) => {
  const clean = getTexto(label);
  return clean.length > 8 ? clean.substring(0, 8) + "..." : clean;
};
