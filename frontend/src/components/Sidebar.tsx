interface SidebarProps {
  user: { username: string; group: string };
  current: string;
  onChange: (key: string) => void;
}

const menu = [
  { key: 'dashboard', icon: 'ti ti-home', label: 'Dashboard' },
  { key: 'usuarios', icon: 'ti ti-users', label: 'Usuarios' },
  { key: 'stock', icon: 'ti ti-building-warehouse', label: 'Almacén' },
  // Agrega más opciones según tu sistema
];

export default function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <nav className="navbar navbar-dark bg-dark flex-column p-3" style={{ minHeight: '100vh', width: 220 }}>
      <div className="text-center mb-4">
        {/* Solo texto, sin logo */}
        <span style={{ fontWeight: 700, fontSize: 28, color: '#fff', letterSpacing: 1 }}>Be-exen</span>
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
