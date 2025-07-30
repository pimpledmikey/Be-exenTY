import React, { useState } from 'react';
import ArticulosList from './ArticulosList';
import EntradasList from './EntradasList';
import SalidasList from './SalidasList';
import StockList from './StockList';
import AjustesList from './AjustesList';
import GruposList from './GruposList';
import MedidasList from './MedidasList';
import UnidadesList from './UnidadesList';


const AlmacenMenu: React.FC<{ setCurrent: (key: string) => void }> = ({ setCurrent }) => {
  return (
    <div style={{ marginTop: 0, paddingTop: 0 }}>
      <h1 className="mb-3" style={{ fontSize: 24, fontWeight: 600, paddingLeft: 0, paddingTop: 'clamp(60px, 8vw, 120px)', paddingBottom: 0 }}>Almacén</h1>
      <div style={{ height: 24 }}></div>
      <div className="container-xl px-0 mb-3">
        <div className="d-flex flex-wrap align-items-center gap-2 justify-content-between" style={{ minHeight: 40 }}>
          <div className="d-flex gap-2 flex-wrap">
            <button className="btn btn-outline-primary" onClick={() => setCurrent('articulos')}>Artículos</button>
            <button className="btn btn-outline-primary" onClick={() => setCurrent('entradas')}>Entradas</button>
            <button className="btn btn-outline-primary" onClick={() => setCurrent('salidas')}>Salidas</button>
            <button className="btn btn-outline-primary" onClick={() => setCurrent('stock')}>Stock</button>
            <button className="btn btn-outline-primary" onClick={() => setCurrent('ajustes')}>Ajustes</button>
            <button className="btn btn-outline-primary" onClick={() => setCurrent('catalogos')}>Catálogos</button>
          </div>
          <div style={{ minWidth: 120 }}></div>
        </div>
      </div>
    </div>
  );
};

export default AlmacenMenu;
