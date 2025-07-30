import React, { useState } from 'react';
import GruposList from './GruposList';
import MedidasList from './MedidasList';
import UnidadesList from './UnidadesList';

const catalogoMenus = [
  { key: 'grupos', label: 'Grupos' },
  { key: 'medidas', label: 'Medidas' },
  { key: 'unidades', label: 'Unidades' },
];

const CatalogosMenu: React.FC = () => {
  const [submenu, setSubmenu] = useState('grupos');
  let content = null;
  if (submenu === 'grupos') content = <GruposList />;
  else if (submenu === 'medidas') content = <MedidasList />;
  else if (submenu === 'unidades') content = <UnidadesList />;

  return (
    <div style={{ marginTop: 0, paddingTop: 0 }}>
      <h1 className="mb-3" style={{ fontSize: 24, fontWeight: 600, paddingLeft: 0, paddingTop: 'clamp(60px, 8vw, 120px)', paddingBottom: 0 }}>Catálogos</h1>
      <div style={{ height: 24 }}></div>
      <div className="container-xl px-0 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between" style={{ minHeight: 40 }}>
          <div className="d-flex gap-2 flex-wrap">
            {catalogoMenus.map(m => (
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
          <div style={{ minWidth: 120 }}></div>
        </div>
      </div>
      <div>{content}</div>
    </div>
  );
};

export default CatalogosMenu;
