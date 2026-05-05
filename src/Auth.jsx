import { useState } from "react";
import { supabase } from "./supabaseClient";
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";

// ─── PANTALLA DE AUTENTICACIÓN ───────────────────────────────────────────────
// Maneja 3 vistas: 'login', 'registro', 'olvide'
// Se muestra cuando el usuario NO está logueado

export default function Auth() {
  const [vista, setVista] = useState("login"); // qué pantalla mostrar
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [claveConfirm, setClaveConfirm] = useState("");
  const [mostrarClave, setMostrarClave] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState(null); // { texto, tipo: 'ok' | 'error' }

  // ── Colores (mismo estilo que el App principal) ───────────────────────────
  const c = {
    bg:     "#0A0A0A",
    card:   "#111111",
    text:   "#E8E0D0",
    muted:  "#888888",
    border: "#1E1E1E",
    input:  "#1A1A1A",
    orange: "#FF803C",
    green:  "#5AE88A",
    red:    "#E85A5A",
  };

  const mostrarMensaje = (texto, tipo = "error") => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  // ── INICIAR SESIÓN ────────────────────────────────────────────────────────
  const iniciarSesion = async () => {
    if (!correo.trim() || !clave.trim()) {
      return mostrarMensaje("Completa todos los campos");
    }
    setCargando(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    });
    setCargando(false);
    if (error) {
      if (error.message.includes("Invalid login")) {
        mostrarMensaje("Correo o contraseña incorrectos");
      } else if (error.message.includes("Email not confirmed")) {
        mostrarMensaje("Confirma tu correo antes de ingresar");
      } else {
        mostrarMensaje("Error al iniciar sesión. Intenta de nuevo.");
      }
    }
    // Si no hay error, Supabase actualiza la sesión y App.jsx detecta el cambio
  };

  // ── CREAR CUENTA ──────────────────────────────────────────────────────────
  const crearCuenta = async () => {
    if (!correo.trim() || !clave.trim() || !claveConfirm.trim()) {
      return mostrarMensaje("Completa todos los campos");
    }
    if (clave.length < 6) {
      return mostrarMensaje("La contraseña debe tener mínimo 6 caracteres");
    }
    if (clave !== claveConfirm) {
      return mostrarMensaje("Las contraseñas no coinciden");
    }
    setCargando(true);
    const { error } = await supabase.auth.signUp({
      email: correo.trim(),
      password: clave,
    });
    setCargando(false);
    if (error) {
      if (error.message.includes("already registered")) {
        mostrarMensaje("Este correo ya tiene una cuenta");
      } else {
        mostrarMensaje("Error al crear cuenta. Intenta de nuevo.");
      }
    } else {
      mostrarMensaje(
        "¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.",
        "ok"
      );
      setTimeout(() => {
        setVista("login");
        setCorreo("");
        setClave("");
        setClaveConfirm("");
        setMensaje(null);
      }, 3000);
    }
  };

  // ── RECUPERAR CONTRASEÑA ──────────────────────────────────────────────────
  const recuperarClave = async () => {
    if (!correo.trim()) {
      return mostrarMensaje("Ingresa tu correo electrónico");
    }
    setCargando(true);
    const { error } = await supabase.auth.resetPasswordForEmail(correo.trim(), {
      redirectTo: window.location.origin, // regresa a tu app
    });
    setCargando(false);
    if (error) {
      mostrarMensaje("Error al enviar el correo. Verifica que sea correcto.");
    } else {
      mostrarMensaje(
        "Te enviamos un enlace para cambiar tu contraseña. Revisa tu correo.",
        "ok"
      );
    }
  };

  // ── ESTILOS COMPARTIDOS ───────────────────────────────────────────────────
  const s = {
    pantalla: {
      minHeight: "100vh",
      background: c.bg,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 24px 40px",
      fontFamily: "'Montserrat', sans-serif",
      maxWidth: 480,
      margin: "0 auto",
      boxSizing: "border-box",
      width: "100%",
    },
    input: {
      width: "100%",
      background: c.input,
      border: `1px solid ${c.border}`,
      borderRadius: 12,
      color: c.text,
      padding: "14px 16px",
      fontSize: 15,
      outline: "none",
      boxSizing: "border-box",
      fontFamily: "inherit",
      fontWeight: 500,
      minHeight: 50,
    },
    btnPrimary: {
      background: c.orange,
      color: "#FFF",
      border: "none",
      borderRadius: 12,
      padding: "16px",
      fontSize: 16,
      fontWeight: 700,
      cursor: "pointer",
      width: "100%",
      fontFamily: "inherit",
      boxShadow: "0 4px 20px rgba(255, 128, 60, 0.3)",
      marginTop: 8,
    },
    link: {
      background: "none",
      border: "none",
      color: c.orange,
      fontSize: 14,
      fontWeight: 600,
      cursor: "pointer",
      fontFamily: "inherit",
      padding: 0,
    },
  };

  // ── VISTA: LOGIN ──────────────────────────────────────────────────────────
  if (vista === "login") return (
    <div style={s.pantalla}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        html, body { background: #0A0A0A !important; margin: 0; padding: 0; }
        input::placeholder { color: #555; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1A1A1A inset !important;
          -webkit-text-fill-color: #E8E0D0 !important;
        }
      `}</style>

      {/* Logo / Título */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 20,
          background: "linear-gradient(135deg, #FF803C, #FF5500)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(255,128,60,0.4)"
        }}>💰</div>
        <h1 style={{ color: c.text, fontSize: 26, fontWeight: 800, margin: "0 0 6px" }}>
          Mis Gastos
        </h1>
        <p style={{ color: c.muted, fontSize: 14, margin: 0, fontWeight: 500 }}>
          Controla tu dinero, cumple tus metas
        </p>
      </div>

      {/* Mensaje de error o éxito */}
      {mensaje && (
        <div style={{
          width: "100%", padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          background: mensaje.tipo === "ok" ? "rgba(90,232,138,0.1)" : "rgba(232,90,90,0.1)",
          border: `1px solid ${mensaje.tipo === "ok" ? c.green : c.red}`,
          color: mensaje.tipo === "ok" ? c.green : c.red,
          fontSize: 13, fontWeight: 600, textAlign: "center"
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Campo correo */}
      <div style={{ width: "100%", marginBottom: 12, position: "relative" }}>
        <Mail size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44 }}
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          onKeyDown={e => e.key === "Enter" && iniciarSesion()}
          autoComplete="email"
        />
      </div>

      {/* Campo contraseña */}
      <div style={{ width: "100%", marginBottom: 8, position: "relative" }}>
        <Lock size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44, paddingRight: 48 }}
          type={mostrarClave ? "text" : "password"}
          placeholder="Contraseña"
          value={clave}
          onChange={e => setClave(e.target.value)}
          onKeyDown={e => e.key === "Enter" && iniciarSesion()}
          autoComplete="current-password"
        />
        <button
          onClick={() => setMostrarClave(!mostrarClave)}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {mostrarClave
            ? <EyeOff size={18} color={c.muted} />
            : <Eye size={18} color={c.muted} />
          }
        </button>
      </div>

      {/* Link olvidé mi clave */}
      <div style={{ width: "100%", textAlign: "right", marginBottom: 20 }}>
        <button style={s.link} onClick={() => { setVista("olvide"); setMensaje(null); }}>
          ¿Olvidaste tu contraseña?
        </button>
      </div>

      {/* Botón ingresar */}
      <button style={s.btnPrimary} onClick={iniciarSesion} disabled={cargando}>
        {cargando
          ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Ingresando...
            </span>
          : "Ingresar"
        }
      </button>

      {/* Link crear cuenta */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ color: c.muted, fontSize: 14 }}>¿No tienes cuenta? </span>
        <button style={s.link} onClick={() => { setVista("registro"); setMensaje(null); }}>
          Crear cuenta
        </button>
      </div>

      {/* Texto legal y versión */}
      <div style={{ marginTop: "auto", paddingTop: 40, textAlign: "center" }}>
        <p style={{ color: "#444", fontSize: 11, lineHeight: 1.6, margin: "0 0 6px" }}>
          Al iniciar sesión, aceptas las{" "}
          <span style={{ color: "#666", textDecoration: "underline" }}>Condiciones de uso</span>
          {" "}y la{" "}
          <span style={{ color: "#666", textDecoration: "underline" }}>Política de privacidad</span>
          {" "}de esta app.
        </p>
        <p style={{ color: "#333", fontSize: 11, margin: 0 }}>Versión 1.0.01</p>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );

  // ── VISTA: REGISTRO ───────────────────────────────────────────────────────
  if (vista === "registro") return (
    <div style={s.pantalla}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        html, body { background: #0A0A0A !important; margin: 0; padding: 0; }
        input::placeholder { color: #555; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1A1A1A inset !important;
          -webkit-text-fill-color: #E8E0D0 !important;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 32 }}>
        <button onClick={() => { setVista("login"); setMensaje(null); }} style={{ background: "none", border: "none", color: c.orange, cursor: "pointer", padding: 0, marginRight: 12 }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 style={{ color: c.text, fontSize: 22, fontWeight: 800, margin: 0 }}>Crear cuenta</h2>
          <p style={{ color: c.muted, fontSize: 13, margin: 0 }}>Únete y empieza a ahorrar</p>
        </div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{
          width: "100%", padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          background: mensaje.tipo === "ok" ? "rgba(90,232,138,0.1)" : "rgba(232,90,90,0.1)",
          border: `1px solid ${mensaje.tipo === "ok" ? c.green : c.red}`,
          color: mensaje.tipo === "ok" ? c.green : c.red,
          fontSize: 13, fontWeight: 600, textAlign: "center"
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Correo */}
      <div style={{ width: "100%", marginBottom: 12, position: "relative" }}>
        <Mail size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44 }}
          type="email"
          placeholder="Correo electrónico"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          autoComplete="email"
        />
      </div>

      {/* Contraseña */}
      <div style={{ width: "100%", marginBottom: 12, position: "relative" }}>
        <Lock size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44, paddingRight: 48 }}
          type={mostrarClave ? "text" : "password"}
          placeholder="Contraseña (mínimo 6 caracteres)"
          value={clave}
          onChange={e => setClave(e.target.value)}
          autoComplete="new-password"
        />
        <button
          onClick={() => setMostrarClave(!mostrarClave)}
          style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0 }}
        >
          {mostrarClave ? <EyeOff size={18} color={c.muted} /> : <Eye size={18} color={c.muted} />}
        </button>
      </div>

      {/* Confirmar contraseña */}
      <div style={{ width: "100%", marginBottom: 24, position: "relative" }}>
        <Lock size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44 }}
          type={mostrarClave ? "text" : "password"}
          placeholder="Repetir contraseña"
          value={claveConfirm}
          onChange={e => setClaveConfirm(e.target.value)}
          onKeyDown={e => e.key === "Enter" && crearCuenta()}
          autoComplete="new-password"
        />
      </div>

      {/* Botón crear */}
      <button style={s.btnPrimary} onClick={crearCuenta} disabled={cargando}>
        {cargando
          ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Creando cuenta...
            </span>
          : "Crear cuenta"
        }
      </button>

      {/* Link ya tengo cuenta */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <span style={{ color: c.muted, fontSize: 14 }}>¿Ya tienes cuenta? </span>
        <button style={s.link} onClick={() => { setVista("login"); setMensaje(null); }}>
          Ingresar
        </button>
      </div>
    </div>
  );

  // ── VISTA: OLVIDÉ MI CONTRASEÑA ───────────────────────────────────────────
  if (vista === "olvide") return (
    <div style={s.pantalla}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        html, body { background: #0A0A0A !important; margin: 0; padding: 0; }
        input::placeholder { color: #555; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px #1A1A1A inset !important;
          -webkit-text-fill-color: #E8E0D0 !important;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      {/* Header */}
      <div style={{ width: "100%", display: "flex", alignItems: "center", marginBottom: 32 }}>
        <button onClick={() => { setVista("login"); setMensaje(null); }} style={{ background: "none", border: "none", color: c.orange, cursor: "pointer", padding: 0, marginRight: 12 }}>
          <ArrowLeft size={24} />
        </button>
        <div>
          <h2 style={{ color: c.text, fontSize: 22, fontWeight: 800, margin: 0 }}>Recuperar contraseña</h2>
          <p style={{ color: c.muted, fontSize: 13, margin: 0 }}>Te enviamos un enlace a tu correo</p>
        </div>
      </div>

      {/* Ícono */}
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{
          width: 72, height: 72, borderRadius: "50%",
          background: "rgba(255,128,60,0.1)",
          border: "2px solid rgba(255,128,60,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, margin: "0 auto"
        }}>🔑</div>
      </div>

      {/* Mensaje */}
      {mensaje && (
        <div style={{
          width: "100%", padding: "12px 16px", borderRadius: 10, marginBottom: 16,
          background: mensaje.tipo === "ok" ? "rgba(90,232,138,0.1)" : "rgba(232,90,90,0.1)",
          border: `1px solid ${mensaje.tipo === "ok" ? c.green : c.red}`,
          color: mensaje.tipo === "ok" ? c.green : c.red,
          fontSize: 13, fontWeight: 600, textAlign: "center", lineHeight: 1.5
        }}>
          {mensaje.texto}
        </div>
      )}

      {/* Correo */}
      <div style={{ width: "100%", marginBottom: 24, position: "relative" }}>
        <Mail size={18} color={c.muted} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
        <input
          style={{ ...s.input, paddingLeft: 44 }}
          type="email"
          placeholder="Tu correo electrónico"
          value={correo}
          onChange={e => setCorreo(e.target.value)}
          onKeyDown={e => e.key === "Enter" && recuperarClave()}
          autoComplete="email"
        />
      </div>

      {/* Botón enviar */}
      <button style={s.btnPrimary} onClick={recuperarClave} disabled={cargando}>
        {cargando
          ? <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              <Loader2 size={18} style={{ animation: "spin 1s linear infinite" }} /> Enviando...
            </span>
          : "Enviar enlace"
        }
      </button>

      {/* Volver al login */}
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <button style={s.link} onClick={() => { setVista("login"); setMensaje(null); }}>
          ← Volver al inicio de sesión
        </button>
      </div>
    </div>
  );
}
