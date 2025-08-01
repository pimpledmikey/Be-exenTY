import Sidebar from '../components/Sidebar';
import StockAlertas from '../components/StockAlertas';
import logoBeExEn from '../assets/logoBeExEn.png';

interface MainLayoutProps {
  children: React.ReactNode;
  onNavChange: (key: string) => void;
  current: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onNavChange, current }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
    <Sidebar current={current} onChange={onNavChange} user={{ username: '', group: '' }} />
    <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <header className="navbar navbar-expand-lg navbar-dark bg-primary px-4 shadow-sm" style={{ height: 65, marginLeft: 220, position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1050 }}>
        <div className="container-fluid d-flex justify-content-between align-items-center h-100">
          <div className="d-flex align-items-center gap-3">
            <div style={{
              height: 45,
              width: 45,
              borderRadius: '8px',
              background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)',
              padding: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
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
            <div>
              <span style={{ 
                fontWeight: 700, 
                fontSize: 24, 
                color: '#fff',
                letterSpacing: '0.8px',
                textShadow: '0 1px 2px rgba(0,0,0,0.1)'
              }}>
                Be-ExEn
              </span>
              <div style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.8)',
                fontWeight: 400,
                marginTop: '-2px'
              }}>
                Sistema de Gestión Empresarial
              </div>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2">
            <img src="https://ui-avatars.com/api/?name=Usuario&background=0D6EFD&color=fff&size=40" alt="Usuario" width={32} height={32} style={{ borderRadius: '50%', objectFit: 'cover' }} />
            <div className="d-flex flex-column align-items-end">
              <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>Usuario</span>
              <span style={{ color: '#b0b0b0', fontSize: 13 }}>Rol</span>
            </div>
            <button className="btn btn-outline-light btn-sm ms-2">Salir</button>
          </div>
        </div>
      </header>
      <main className="container-xl py-4" style={{ marginLeft: 220, marginTop: 65 }}>
        {children}
      </main>
      {/* Alertas de stock bajo que aparecen al iniciar sesión */}
      <StockAlertas />
    </div>
  </div>
);

export default MainLayout;
