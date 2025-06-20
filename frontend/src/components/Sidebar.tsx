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
    <nav className="navbar navbar-dark bg-dark flex-column p-3" style={{ minHeight: '100vh', width: 220 }}>
      <div className="text-center mb-4">
        <img src={logoBeExEn} alt="Logo" width={120} style={{ objectFit: 'contain' }} />
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
    </nav>
  );
}
