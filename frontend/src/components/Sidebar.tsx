import logoBeExEn from '../assets/logoBeExEn.png';

interface SidebarProps {
  user: { username: string; group: string };
  current: string;
  onChange: (key: string) => void;
}

const menu = [
  { key: 'dashboard', icon: 'ti ti-home', label: 'Dashboard' },
  { key: 'usuarios', icon: 'ti ti-users', label: 'Usuarios' },
  { key: 'stock', icon: 'ti ti-building-warehouse', label: 'Almacén' },
  { key: 'administracion', icon: 'ti ti-settings', label: 'Administración' },
  // Agrega más opciones según tu sistema
];

export default function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <nav className="navbar navbar-dark bg-dark flex-column p-3" style={{ minHeight: '100vh', width: 220 }}>
      <div className="text-center mb-4">
        {/* Logo y nombre de Be-ExEn */}
        <div className="d-flex flex-column align-items-center gap-2">
          <div style={{
            height: 50,
            width: 50,
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            <img 
              src={logoBeExEn} 
              alt="Be-ExEn Logo" 
              style={{ 
                height: '100%', 
                width: '100%',
                objectFit: 'contain'
              }} 
            />
          </div>
          <div className="text-center">
            <div style={{ 
              fontWeight: 700, 
              fontSize: 24, 
              color: '#fff', 
              letterSpacing: '0.8px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              Be-ExEn
            </div>
            <div style={{
              fontSize: 11,
              color: 'rgba(255,255,255,0.7)',
              fontWeight: 400,
              marginTop: '-2px'
            }}>
              Sistema de Gestión
            </div>
          </div>
        </div>
      </div>
      <ul className="nav nav-pills flex-column mb-auto">
        {menu.map(item => (
          <li className="nav-item mb-2" key={item.key}>
            <button
              className={`nav-link d-flex align-items-center ${current === item.key ? 'active bg-primary' : 'text-white bg-dark'}`}
              style={{ borderRadius: 8 }}
              onClick={() => onChange(item.key)}
            >
              <i className={`${item.icon} me-2`}></i>
              {item.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-auto text-center">
        {/* Imagen de usuario dummy y datos */}
        <img src="https://ui-avatars.com/api/?name=Usuario&background=0D6EFD&color=fff&size=64" alt="Usuario" width={48} height={48} style={{ borderRadius: '50%', objectFit: 'cover', marginBottom: 8 }} />
        <div style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>Usuario</div>
        <div style={{ color: '#b0b0b0', fontSize: 13 }}>Rol</div>
      </div>
    </nav>
  );
}
