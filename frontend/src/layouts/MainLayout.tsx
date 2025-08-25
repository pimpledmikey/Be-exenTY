import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import StockAlertas from '../components/StockAlertas';
import logoBeExEn from '../assets/logoBeExEn.png';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // En móvil, colapsar sidebar por defecto
      if (mobile && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarCollapsed]);

  const sidebarWidth = sidebarCollapsed ? 90 : 270;
  const headerMarginLeft = isMobile ? 0 : sidebarWidth;

  return (
    <div className="main-layout" style={{ display: 'flex', minHeight: '100vh', background: '#f5f6fa' }}>
      <Sidebar 
        isCollapsed={sidebarCollapsed}
        isMobile={isMobile}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onClose={() => setSidebarCollapsed(true)}
      />
      
      <div className="main-content" style={{ 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        marginLeft: isMobile ? 0 : sidebarWidth,
        transition: 'margin-left 0.3s ease'
      }}>
        {/* Header responsivo */}
        <header 
          className="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm" 
          style={{ 
            height: 65, 
            position: 'fixed', 
            top: 0, 
            left: headerMarginLeft,
            right: 0, 
            zIndex: 1040,
            transition: 'left 0.3s ease'
          }}
        >
          <div className="container-fluid d-flex justify-content-between align-items-center h-100">
            <div className="d-flex align-items-center gap-3">
              {/* Botón de menú para móvil */}
              {isMobile && (
                <button
                  className="btn btn-outline-light btn-sm me-2"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  style={{ border: 'none' }}
                >
                  <i className="bi bi-list" style={{ fontSize: '1.2rem' }}></i>
                </button>
              )}
              
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
              <div className="d-none d-md-block">
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
            
            {/* Usuario info - oculto en móvil */}
            <div className="d-none d-md-flex align-items-center gap-2">
              <img 
                src="https://ui-avatars.com/api/?name=Usuario&background=0D6EFD&color=fff&size=40" 
                alt="Usuario" 
                width={32} 
                height={32} 
                style={{ borderRadius: '50%', objectFit: 'cover' }} 
              />
              <div className="d-flex flex-column align-items-end">
                <span style={{ color: '#fff', fontWeight: 500, fontSize: 15 }}>Usuario</span>
                <span style={{ color: '#b0b0b0', fontSize: 13 }}>Rol</span>
              </div>
              <button className="btn btn-outline-light btn-sm ms-2">Salir</button>
            </div>
            
            {/* Menú hamburguesa para móvil */}
            <div className="d-md-none">
              <button className="btn btn-outline-light btn-sm">
                <i className="bi bi-person-circle" style={{ fontSize: '1.2rem' }}></i>
              </button>
            </div>
          </div>
        </header>
        
        {/* Contenido principal responsivo */}
        <main 
          className="container-fluid py-4" 
          style={{ 
            marginTop: 65,
            paddingLeft: isMobile ? '1rem' : '2rem',
            paddingRight: isMobile ? '1rem' : '2rem',
            transition: 'padding 0.3s ease'
          }}
        >
          {children}
        </main>
        
        {/* Alertas de stock bajo */}
        <StockAlertas />
      </div>
      
      {/* Overlay para móvil cuando sidebar está abierto */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 1000,
            transition: 'opacity 0.3s ease'
          }}
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
    </div>
  );
};

export default MainLayout;
