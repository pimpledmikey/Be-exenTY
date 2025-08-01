import React, { useState, useEffect } from 'react';
import ArticulosList from './ArticulosList';
import EntradasList from './EntradasList';
import SalidasList from './SalidasList';
import StockList from './StockList';
import AjustesList from './AjustesList';

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
        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-start" style={{ minHeight: 40 }}>
          <div className="d-flex gap-1 gap-md-2 flex-wrap w-100">
            {almacenMenus.map(m => (
              <button
                key={m.key}
                className={`btn ${submenu === m.key ? 'btn-primary' : 'btn-outline-primary'} btn-sm flex-grow-1 flex-md-grow-0`}
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
        </div>
      </div>
      
      <div>{content}</div>
    </div>
  );
};

export default AlmacenMenu;
