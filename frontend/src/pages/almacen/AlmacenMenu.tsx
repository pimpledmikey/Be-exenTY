import React, { useState } from 'react';
import ArticulosList from './ArticulosList';
import EntradasList from './EntradasList';
import SalidasList from './SalidasList';
import StockList from './StockList';

const almacenMenus = [
  { key: 'articulos', label: 'Artículos' },
  { key: 'entradas', label: 'Entradas' },
  { key: 'salidas', label: 'Salidas' },
  { key: 'stock', label: 'Stock' },
];

const AlmacenMenu: React.FC = () => {
  const [submenu, setSubmenu] = useState('articulos');
  let content = null;
  if (submenu === 'articulos') content = <ArticulosList />;
  else if (submenu === 'entradas') content = <EntradasList />;
  else if (submenu === 'salidas') content = <SalidasList />;
  else if (submenu === 'stock') content = <StockList />;

  return (
    <div style={{marginTop: 0, paddingTop: 0}}>
      {/* Título "Almacén" pegado a las tabs */}
      <h1 className="mb-0" style={{fontSize: 24, fontWeight: 600, paddingLeft: 0, paddingTop: 8, paddingBottom: 0}}>Almacén</h1>
      <div className="sticky-top" style={{zIndex: 10, top: 64, paddingTop: 0, paddingBottom: 0, background: 'transparent', boxShadow: 'none', border: 'none'}}>
        <div className="mb-0 d-flex gap-2 container-xl p-0" style={{background: 'transparent', boxShadow: 'none', border: 'none'}}>
          {almacenMenus.map(m => (
            <button
              key={m.key}
              className={`btn btn-outline-primary${submenu === m.key ? ' active' : ''}`}
              style={{background: 'transparent', boxShadow: 'none', border: '1px solid #0d6efd', color: '#0d6efd', borderRadius: 4, fontWeight: 500, padding: '4px 16px'}} 
              onClick={() => setSubmenu(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div>{content}</div>
    </div>
  );
};

export default AlmacenMenu;
