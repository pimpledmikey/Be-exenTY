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
  // Agrega más opciones según tu sistema
];

export default function Sidebar({ current, onChange }: SidebarProps) {
  return (
    <aside className="navbar navbar-vertical navbar-expand-lg" style={{ minHeight: '100vh', background: '#181a2a', color: '#fff', minWidth: 80 }}>
      <div className="container-fluid flex-column align-items-stretch">
        <div className="navbar-brand d-flex align-items-center justify-content-center py-4">
          <img src={logoBeExEn} alt="Logo" style={{ width: 48, height: 48, borderRadius: 12, marginRight: 8 }} />
          <span className="fw-bold" style={{ fontSize: 22 }}>Be-exenTY</span>
        </div>
        <ul className="navbar-nav flex-column w-100 gap-1">
          {menu.map(item => (
            <li className="nav-item" key={item.key}>
              <a
                className={`nav-link${current === item.key ? ' active' : ''}`}
                href="#"
                style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 600, fontSize: 18 }}
                onClick={e => { e.preventDefault(); onChange(item.key); }}
              >
                <span className="nav-link-icon d-md-none d-lg-inline-block">
                  <i className={item.icon}></i>
                </span>
                <span className="nav-link-title">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
