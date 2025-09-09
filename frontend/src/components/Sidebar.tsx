import React, { useState, useEffect } from 'react';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  isMobile: boolean;
  onToggle: () => void;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  isCollapsed, 
  isMobile, 
  onToggle, 
  onClose 
}) => {
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    // Obtener información del usuario desde localStorage
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const menuItems = [
    {
      label: 'Almacén',
      icon: 'ti ti-package',
      href: '/almacen',
      submenu: [
        { label: 'Inventario', href: '/almacen' },
        { label: 'Solicitudes', href: '/solicitudes' },
        { label: 'Autorización', href: '/autorizacion-solicitudes' },
        { label: 'Dashboard Autorización', href: '/dashboard-autorizacion' },
        { label: 'Ajustes', href: '/ajustes' },
        { label: 'Historial', href: '/historial' }
      ]
    },
    {
      label: 'Catálogos',
      icon: 'ti ti-list',
      href: '/catalogos',
    },
    {
      label: 'Reportes',
      icon: 'ti ti-chart-bar',
      href: '/reportes',
    },
    {
      label: 'Configuración',
      icon: 'ti ti-settings',
      href: '/configuracion',
      submenu: [
        { label: 'Usuarios', href: '/usuarios' },
        { label: 'Roles', href: '/roles' },
        { label: 'Permisos', href: '/permisos' }
      ]
    }
  ];

  const handleMenuClick = (href: string) => {
    window.location.href = href;
    if (isMobile) {
      onClose();
    }
  };

  const sidebarClasses = [
    'sidebar',
    isCollapsed ? 'sidebar-collapsed' : '',
    isMobile ? 'sidebar-mobile' : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      {/* Overlay para móvil */}
      {isMobile && !isCollapsed && (
        <div className="sidebar-overlay" onClick={onClose}></div>
      )}
      
      <aside className={sidebarClasses}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <img 
              src="/src/assets/beexen-logo.png" 
              alt="BeExEn" 
              className="sidebar-logo"
            />
            {!isCollapsed && <span className="brand-text">BeExEn</span>}
          </div>
          
          {isMobile && (
            <button 
              className="btn-close-sidebar d-md-none"
              onClick={onClose}
              aria-label="Cerrar menú"
            >
              <i className="ti ti-x"></i>
            </button>
          )}
        </div>

        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <ul className="nav nav-pills nav-sidebar flex-column">
              {menuItems.map((item, index) => (
                <li key={index} className="nav-item">
                  <a 
                    href={item.href}
                    className="nav-link"
                    onClick={(e) => {
                      e.preventDefault();
                      handleMenuClick(item.href);
                    }}
                  >
                    <i className={item.icon}></i>
                    {!isCollapsed && <span className="nav-text">{item.label}</span>}
                  </a>
                  
                  {item.submenu && !isCollapsed && (
                    <ul className="nav-submenu">
                      {item.submenu.map((subitem, subindex) => (
                        <li key={subindex} className="nav-item">
                          <a 
                            href={subitem.href}
                            className="nav-link nav-link-submenu"
                            onClick={(e) => {
                              e.preventDefault();
                              handleMenuClick(subitem.href);
                            }}
                          >
                            <span className="nav-text">{subitem.label}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Usuario info */}
        {userInfo && !isCollapsed && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                <i className="ti ti-user"></i>
              </div>
              <div className="user-details">
                <div className="user-name">{userInfo.username || userInfo.name}</div>
                <div className="user-role">{userInfo.role || 'Usuario'}</div>
              </div>
            </div>
          </div>
        )}

        {/* Toggle button para desktop */}
        {!isMobile && (
          <button 
            className="btn-toggle-sidebar"
            onClick={onToggle}
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            <i className={`ti ${isCollapsed ? 'ti-chevron-right' : 'ti-chevron-left'}`}></i>
          </button>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
