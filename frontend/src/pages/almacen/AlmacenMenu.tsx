import React, { useState, useEffect } from 'react';
import ArticulosList from './ArticulosList';
import EntradasList from './EntradasList';
import SalidasList from './SalidasList';
import StockList from './StockList';
import AjustesList from './AjustesList';
import FormSolicitud from '../../components/FormSolicitud';
import PruebaSolicitud from '../../components/PruebaSolicitud';

const almacenMenus = [
  { key: 'articulos', label: 'Artículos' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'salidas', label: 'Salidas' },
  { key: 'stock', label: 'Stock' },
  { key: 'ajustes', label: 'Ajustes' },
];

interface AlmacenMenuProps {
  initialTab: string;
}

const AlmacenMenu: React.FC<AlmacenMenuProps> = ({ initialTab }) => {
  const [submenu, setSubmenu] = useState(initialTab || 'articulos');
  const [showFormSolicitud, setShowFormSolicitud] = useState(false);
  const [showPruebaSolicitud, setShowPruebaSolicitud] = useState(false);

  useEffect(() => {
    setSubmenu(initialTab);
  }, [initialTab]);

  let content = null;
  if (submenu === 'articulos') {
    content = <ArticulosList />;
  } else if (submenu === 'entradas') {
    content = <EntradasList />;
  } else if (submenu === 'salidas') {
    content = <SalidasList />;
  } else if (submenu === 'stock') {
    content = <StockList />;
  } else if (submenu === 'ajustes') {
    content = <AjustesList />;
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div style={{ marginTop: 0, paddingTop: 0 }}>
      <h1 className="mb-3 d-none d-md-block" style={{ 
        fontSize: 24, 
        fontWeight: 600, 
        paddingLeft: 0, 
        paddingTop: 'clamp(60px, 8vw, 120px)', 
        paddingBottom: 0 
      }}>
        Almacén
      </h1>
      <h2 className="mb-3 d-md-none" style={{ 
        fontSize: 20, 
        fontWeight: 600, 
        paddingTop: 20 
      }}>
        Almacén
      </h2>
      
      <div style={{ height: isMobile ? 12 : 24 }}></div>
      
      <div className="container-xl px-0 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between" style={{ minHeight: 40 }}>
          <div className="d-flex gap-1 gap-md-2 flex-wrap">
            {almacenMenus.map(m => (
              <button
                key={m.key}
                className={`btn ${submenu === m.key ? 'btn-primary' : 'btn-outline-primary'} btn-sm`}
                style={{ 
                  minWidth: 'max-content',
                  fontSize: isMobile ? '12px' : '14px',
                  padding: isMobile ? '6px 12px' : '8px 16px'
                }}
                onClick={() => setSubmenu(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
          
          {/* Botón para crear solicitud personalizada */}
          <button
            className="btn btn-success btn-sm"
            onClick={() => setShowFormSolicitud(true)}
            style={{ 
              minWidth: 'max-content',
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '6px 12px' : '8px 16px'
            }}
            title="Crear Solicitud Personalizada"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            {isMobile ? 'Nueva' : 'Nueva Solicitud'}
          </button>
          
          {/* Botón para probar el nuevo sistema */}
          <button
            className="btn btn-warning btn-sm"
            onClick={() => setShowPruebaSolicitud(true)}
            style={{ 
              minWidth: 'max-content',
              fontSize: isMobile ? '12px' : '14px',
              padding: isMobile ? '6px 12px' : '8px 16px'
            }}
            title="Probar Nuevo Sistema de Solicitudes"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10,8 16,12 10,16 10,8"></polygon>
            </svg>
            ✨ Probar Nuevo Sistema
          </button>
        </div>
      </div>
      
      <div>{content}</div>
      
      {/* Modal de Formulario de Solicitud */}
      {showFormSolicitud && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.8)', zIndex: 9999 }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content" data-bs-theme="dark">
              <FormSolicitud 
                onClose={() => setShowFormSolicitud(false)}
                initialData={{ tipo: 'entrada' }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Prueba del Nuevo Sistema */}
      {showPruebaSolicitud && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ background: 'rgba(0,0,0,0.9)', zIndex: 9999 }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content" data-bs-theme="light" style={{ background: '#f5f5f5' }}>
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  🎉 ¡Nuevo Sistema de Solicitudes con react-to-print!
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPruebaSolicitud(false)}
                ></button>
              </div>
              <div className="modal-body p-0" style={{ background: '#f5f5f5' }}>
                <PruebaSolicitud />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlmacenMenu;
