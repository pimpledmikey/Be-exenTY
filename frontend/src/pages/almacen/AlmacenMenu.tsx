import React, { useState } from 'react';
import ArticulosList from './ArticulosList';
import EntradasList from './EntradasList';
import SalidasList from './SalidasList';
import StockList from './StockList';
import AjustesList from './AjustesList';
import CatalogosList from './CatalogosList';

const almacenMenus = [
  { key: 'articulos', label: 'Artículos' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'salidas', label: 'Salidas' },
  { key: 'stock', label: 'Stock' },
  { key: 'ajustes', label: 'Ajustes' },
  { key: 'catalogos', label: 'Catálogos' },
];

const AlmacenMenu: React.FC = () => {
  const [submenu, setSubmenu] = useState('articulos');
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
  } else if (submenu === 'catalogos') {
    content = <CatalogosList />;
  }

  return (
    <div style={{ marginTop: 0, paddingTop: 0 }}>
      <h1 className="mb-3" style={{ fontSize: 24, fontWeight: 600, paddingLeft: 0, paddingTop: 'clamp(60px, 8vw, 120px)', paddingBottom: 0 }}>Almacén</h1>
      <div style={{ height: 24 }}></div>
      <div className="container-xl px-0 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between" style={{ minHeight: 40 }}>
          <div className="d-flex gap-2 flex-wrap">
            {almacenMenus.map(m => (
              <button
                key={m.key}
                className={`btn btn-outline-primary${submenu === m.key ? ' active' : ''}`}
                style={{ background: 'transparent', boxShadow: 'none', border: '1px solid #0d6efd', color: '#0d6efd', borderRadius: 4, fontWeight: 500, padding: '4px 12px', minWidth: 80, fontSize: 'clamp(12px,2vw,16px)' }}
                onClick={() => setSubmenu(m.key)}
              >
                {m.label}
              </button>
            ))}
          </div>
          {/* Espacio para el botón de crear, que debe estar en cada lista */}
          <div style={{ minWidth: 120 }}></div>
        </div>
      </div>
      <div>{content}</div>
      <style>{`
        @media (max-width: 900px) {
          h1.mb-3 { padding-top: 80px !important; font-size: 18px !important; }
          .btn-outline-primary { font-size: 12px !important; min-width: 70px !important; padding: 4px 6px !important; }
        }
        @media (max-width: 700px) {
          h1.mb-3 { padding-top: 100px !important; font-size: 16px !important; }
          .btn-outline-primary { font-size: 11px !important; min-width: 60px !important; padding: 4px 4px !important; }
        }
        @media (max-width: 500px) {
          h1.mb-3 { padding-top: 120px !important; font-size: 14px !important; }
          .btn-outline-primary { font-size: 10px !important; min-width: 50px !important; padding: 3px 2px !important; }
        }
      `}</style>
    </div>
  );
};

export default AlmacenMenu;
