import React from "react";
import { 
  UserCircle, Lock, Trophy, Palette, Download, Headphones, 
  LogOut, Trash2, Settings, ChevronRight
} from "lucide-react";

// Mudamos MenuItem aquí porque solo se usa en el menú
const MenuItem = ({ icon, text, color, bgColor, border, showArrow = true, onClick }) => (
  <button onClick={onClick} style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, backgroundColor: bgColor || "transparent", WebkitAppearance: "none", border: "none", padding: "16px 20px", cursor: "pointer", color: color, fontSize: 14, fontWeight: 600, borderBottom: `1px solid ${border}`, textAlign: "left", fontFamily: "inherit", transition: "background-color 0.2s" }}>
    <span style={{ display: "flex", alignItems: "center", color: color }}>{icon}</span>
    <span style={{ flex: 1 }}>{text}</span>
    {showArrow && <span style={{ color: "#FF803C", display: "flex", alignItems: "center" }}><ChevronRight size={18} /></span>}
  </button>
);

export default function MenuPrincipal({ 
  c, 
  isClosing, 
  cerrarPantalla, 
  setShowMenu, 
  setProfileScreen, 
  setShowApariencia, 
  cerrarSesion 
}) {
  
  const menuGroupHeader = { fontSize: 13, color: c.muted, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700, padding: "16px 20px 8px", margin: 0 };

  return (
    <div style={{ position: "fixed", inset: 0, background: c.bg, zIndex: 9999, padding: "env(safe-area-inset-top, 20px) 0 20px", overflowY: "auto", overflowX: "hidden", display: "flex", flexDirection: "column", animation: isClosing === 'menu' ? "slideOutToLeft 0.28s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" : "slideInFromLeft 0.3s cubic-bezier(0.25, 0.8, 0.25, 1) forwards" }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 0, borderBottom: `1px solid ${c.border}`, paddingBottom: 16, marginTop: 16, paddingLeft: 20, paddingRight: 20 }}>
        <button onClick={() => cerrarPantalla('menu', () => setShowMenu(false))} style={{ backgroundColor: "transparent", WebkitAppearance: "none", border: "none", color: "#FF803C", fontSize: 28, cursor: "pointer", padding: 0, marginRight: 16 }}>←</button>
        <h2 style={{ margin: 0, fontSize: 20, color: c.text, fontWeight: 700 }}>Menú Principal</h2>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <div style={menuGroupHeader}>MI CUENTA</div>
        <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <MenuItem bgColor={c.card} icon={<UserCircle size={20} color="#FF803C" />} text="Mis datos" color={c.text} border={c.border} onClick={() => setProfileScreen("datos")} />
          <MenuItem bgColor={c.card} icon={<Lock size={20} color="#FF803C" />} text="Cambiar mi clave" color={c.text} border={c.border} onClick={() => setProfileScreen("clave")} />
          <MenuItem bgColor={c.card} icon={<Trophy size={20} color="#FF803C" />} text="Mis logros / Insignias" color={c.text} border={"transparent"} onClick={() => setProfileScreen("logros")} />
        </div>
      </div>
      
      <div style={{ marginBottom: 24 }}>
        <div style={menuGroupHeader}>AJUSTES</div>
        <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <MenuItem bgColor={c.card} icon={<Settings size={20} color="#FF803C" />} text="Configuración de categorías" color={c.text} border={c.border} onClick={() => setProfileScreen("categorias")} />
          <MenuItem bgColor={c.card} icon={<Palette size={20} color="#FF803C" />} text="Apariencia (Tema Claro/Oscuro)" color={c.text} border={c.border} onClick={() => { setShowApariencia(true); setShowMenu(false); }} />
          <MenuItem bgColor={c.card} icon={<Download size={20} color="#FF803C" />} text="Exportar Reportes" color={c.text} border={c.border} onClick={() => setProfileScreen("exportar")} />
          <MenuItem bgColor={c.card} icon={<Headphones size={20} color="#FF803C" />} text="Centro de ayuda" color={c.text} border={"transparent"} onClick={() => setProfileScreen("ayuda")} />
        </div>
      </div>
      
      <div style={{ marginTop: "auto", paddingTop: 32, paddingBottom: 20 }}>
        <div style={{ borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}` }}>
          <MenuItem bgColor={c.card} icon={<LogOut size={20}/>} text="Cerrar sesión" color={c.red} border={c.border} showArrow={false} onClick={cerrarSesion} />
          <MenuItem bgColor={c.card} icon={<Trash2 size={20}/>} text="Eliminar mi cuenta" color={c.red} border={"transparent"} showArrow={false} />
        </div>
      </div>
    </div>
  );
}