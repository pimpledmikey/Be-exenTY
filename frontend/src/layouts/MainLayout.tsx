import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavChange: (key: string) => void;
  current: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavChange, current }) => (
  <div className="d-flex" style={{ minHeight: '100vh', background: '#f5f6fa' }}>
    <Sidebar current={current} onChange={onNavChange} user={{ username: '', group: '' }} />
    <div className="flex-grow-1">
      <header className="navbar navbar-expand-lg navbar-dark bg-primary px-4" style={{ height: 60 }}>
        <div className="container-fluid d-flex justify-content-between align-items-center h-100">
          <div className="d-flex align-items-center">
            <img src="/logo192.png" alt="Logo" height={32} style={{ objectFit: 'contain' }} className="me-2" />
            <span style={{ fontWeight: 700, fontSize: 20 }}>Be-exenTY</span>
          </div>
          <button className="btn btn-outline-light btn-sm">Salir</button>
        </div>
      </header>
      <main className="container-xl py-4">
        {children}
      </main>
    </div>
  </div>
);

export default MainLayout;
