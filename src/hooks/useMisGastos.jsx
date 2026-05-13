import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { INGRESOS_DEFAULT, GASTOS_DEFAULT, METAS_INICIALES } from "../constants";
import { hoy, getFechaLocal } from "../utils";

export default function useMisGastos() {
  const [usuario, setUsuario] = useState(null);
  const [verificandoSesion, setVerificandoSesion] = useState(true);

  const [gastos, setGastos] = useState([]);
  const [categoriasBase, setCategoriasBase] = useState(INGRESOS_DEFAULT);
  const [categoriasExtra, setCategoriasExtra] = useState(GASTOS_DEFAULT);
  const [listaMetas, setListaMetas] = useState(METAS_INICIALES);
  const [presupuestosMensuales, setPresupuestosMensuales] = useState({});

  const [userName, setUserName] = useState("Usuario");
  const [theme, setTheme] = useState(localStorage.getItem("themePref") || "light");
  const [useBold, setUseBold] = useState(false);

  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setVerificandoSesion(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setUsuario(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const cerrarSesion = async () => {
    // 1. Le decimos a Supabase que cierre la conexión de esta cuenta
    await supabase.auth.signOut();

    // 2. LA MAGIA: Borramos TODA la memoria guardada en el navegador
    localStorage.clear();

    // 3. Limpiamos los estados principales 
    setUsuario(null);
    setUserName("");
    setListaMetas([]);
    setPresupuestosMensuales({});
    setCategoriasBase([]);
    setCategoriasExtra([]);

    // 4. Forzamos una recarga limpia de la página
    window.location.replace("/");
  };

  const loadData = async () => {
    if (!usuario?.id) return;
    try {
      const { data: movimientos, error: err1 } = await supabase.from("gastos").select("*").eq("user_id", usuario.id).order("created_at", { ascending: false });
      if (err1) throw err1;
      setGastos((movimientos || []).map(m => ({ ...m, fecha: getFechaLocal(m.created_at) })));

      const { data: cfg, error: err2 } = await supabase.from("config").select("*").eq("user_id", usuario.id);
      if (err2) throw err2;

      if (cfg) {
        // SOLUCIÓN: Buscamos primero la llave segura con el ID del usuario
        const getVal = (k) => {
          const valSeguro = cfg.find(item => item.key === `${usuario.id}_${k}`);
          if (valSeguro) return valSeguro.value;
          // Respaldo temporal por si se guardó algo sin ID recientemente
          const valTemporal = cfg.find(item => item.key === k);
          return valTemporal?.value;
        };

        if (getVal("themePref")) { setTheme(getVal("themePref")); localStorage.setItem("themePref", getVal("themePref")); }
        if (getVal("useBoldPref")) setUseBold(getVal("useBoldPref") === "true");
        if (getVal("userName")) setUserName(getVal("userName"));
        if (getVal("categoriasCustom")) { try { const p = JSON.parse(getVal("categoriasCustom")); if (Array.isArray(p)) setCategoriasExtra(p); } catch (_) { } }
        if (getVal("categoriasBase")) { try { const p = JSON.parse(getVal("categoriasBase")); if (Array.isArray(p)) setCategoriasBase(p); } catch (_) { } }
        if (getVal("listaMetas")) { try { const p = JSON.parse(getVal("listaMetas")); if (Array.isArray(p)) setListaMetas(p); } catch (_) { } }
        if (getVal("presupuestosMensuales")) { try { const p = JSON.parse(getVal("presupuestosMensuales")); if (p) setPresupuestosMensuales(p); } catch (_) { } }
      }
      setError(null);
    } catch (e) { setError("No se pudo conectar al servidor."); }
    setLoaded(true);
  };

  useEffect(() => { if (usuario) loadData(); }, [usuario]);

  const guardarConfig = async (key, value) => {
    setSaving(true);
    // SOLUCIÓN: Guardamos siempre usando el ID de usuario como candado de seguridad
    const llaveSegura = `${usuario.id}_${key}`;
    const { error } = await supabase.from("config").upsert(
      [{ user_id: usuario.id, key: llaveSegura, value: typeof value === 'string' ? value : JSON.stringify(value) }],
      { onConflict: "key" }
    );
    setSaving(false);
    return { error };
  };

  const agregarGastoBD = async (gastoParcial) => {
    setSaving(true);
    const nuevo = { ...gastoParcial, user_id: usuario.id, fecha: hoy() };
    const { data, error } = await supabase.from("gastos").insert([nuevo]).select();
    if (!error && data) setGastos(prev => [{ ...data[0], fecha: getFechaLocal(data[0].created_at) }, ...prev]);
    setSaving(false);
    return { data, error, gastoAgregado: data ? data[0] : null };
  };

  const actualizarGastoBD = async (id, updates) => {
    setSaving(true);
    const { error } = await supabase.from("gastos").update(updates).eq("id", id);
    if (!error) setGastos(prev => prev.map(g => g.id === id ? { ...g, ...updates } : g));
    setSaving(false);
    return { error };
  };

  const eliminarGastoBD = async (id) => {
    const { error } = await supabase.from("gastos").delete().eq("id", id);
    if (!error) setGastos(prev => prev.filter(item => item.id !== id));
    return { error };
  };

  return {
    usuario, verificandoSesion, loaded, saving, error,
    gastos, categoriasBase, categoriasExtra, listaMetas, presupuestosMensuales, userName, theme, useBold,
    setCategoriasBase, setCategoriasExtra, setListaMetas, setPresupuestosMensuales, setUserName, setTheme, setUseBold,
    loadData, cerrarSesion, guardarConfig, agregarGastoBD, actualizarGastoBD, eliminarGastoBD
  };
}