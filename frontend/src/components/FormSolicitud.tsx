import React, { useState, useEffect } from 'react';
import SolicitudAutorizacion from './SolicitudAutorizacion';
import { useTheme } from '../hooks/useTheme';

const API_URL = import.meta.env.VITE_API_URL;

interface SolicitudItem {
  codigo?: string;
  descripcion: string;
  unidad: string;
  medida?: string;
  cantidad: number;
  precioU?: number;
  precioT?: number;
}

interface ArticuloStock {
  id: number;
  article_id: number;
  code: string;  // Cambié de 'codigo' a 'code' que es el real
  name: string;
  unit: string;
  stock: number;
}

interface FormSolicitudProps {
  onClose: () => void;
  initialData?: {
    tipo: 'entrada' | 'salida';
    items?: SolicitudItem[];
    proveedor?: string;
  };
}

const FormSolicitud: React.FC<FormSolicitudProps> = ({ onClose, initialData }) => {
  const { theme } = useTheme();
  const [showPreview, setShowPreview] = useState(false);
  
  // Estados para artículos del stock
  const [articulosStock, setArticulosStock] = useState<ArticuloStock[]>([]);
  const [busquedaArticulo, setBusquedaArticulo] = useState('');
  const [itemSeleccionando, setItemSeleccionando] = useState<number | null>(null);
  
  // Datos del formulario
  const [tipo, setTipo] = useState<'entrada' | 'salida'>(initialData?.tipo || 'entrada');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [proveedor, setProveedor] = useState(initialData?.proveedor || '');
  const [solicitante, setSolicitante] = useState('Juan Jesús Ortega Simbrón');
  const [autoriza, setAutoriza] = useState('Lic. Elisa Avila Requena');
  const [folio, setFolio] = useState(`${tipo.toUpperCase()}-${Date.now()}`);
  
  // Items de la solicitud
  const [items, setItems] = useState<SolicitudItem[]>(
    initialData?.items?.length ? initialData.items : [
      { codigo: '', descripcion: '', unidad: 'PZA', cantidad: 1, precioU: 0, precioT: 0 }
    ]
  );

  // Cargar artículos del stock al montar el componente
  useEffect(() => {
    const cargarArticulosStock = async () => {
      try {
        const response = await fetch(`${API_URL}/almacen/stock`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.ok) {
          const data = await response.json();
          setArticulosStock(data);
        }
      } catch (error) {
        console.error('Error al cargar artículos del stock:', error);
      }
    };
    
    cargarArticulosStock();
  }, []);

  // Actualizar folio cuando cambie el tipo
  useEffect(() => {
    setFolio(`${tipo.toUpperCase()}-${Date.now()}`);
  }, [tipo]);

  const agregarItem = () => {
    setItems([...items, { 
      codigo: '', 
      descripcion: '', 
      unidad: 'PZA', 
      cantidad: 1, 
      precioU: 0, 
      precioT: 0 
    }]);
  };

  const seleccionarArticuloStock = (articulo: ArticuloStock, index: number) => {
    console.log('Artículo seleccionado:', articulo); // Debug
    const nuevosItems = [...items];
    const codigoFinal = articulo.code || `ART-${articulo.article_id || articulo.id}`;
    console.log('Código final asignado:', codigoFinal); // Debug
    
    nuevosItems[index] = {
      ...nuevosItems[index],
      codigo: codigoFinal,
      descripcion: articulo.name,
      unidad: articulo.unit
    };
    
    console.log('Nuevo item creado:', nuevosItems[index]); // Debug
    setItems(nuevosItems);
    setItemSeleccionando(null);
    setBusquedaArticulo('');
    
    // Mostrar confirmación visual con código
    const toast = document.createElement('div');
    toast.innerHTML = `✅ Artículo "${articulo.name}" (${codigoFinal}) agregado`;
    toast.style.cssText = `
      position: fixed; top: 20px; right: 20px; z-index: 9999;
      background: #28a745; color: white; padding: 10px 20px;
      border-radius: 5px; font-family: Arial, sans-serif;
    `;
    document.body.appendChild(toast);
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 2000);
  };

  const abrirModalArticulos = (index: number) => {
    setItemSeleccionando(index);
    setBusquedaArticulo('');
  };

  const articulosFiltrados = articulosStock.filter(articulo =>
    articulo.name.toLowerCase().includes(busquedaArticulo.toLowerCase()) ||
    (articulo.code && articulo.code.toLowerCase().includes(busquedaArticulo.toLowerCase()))
  );

  const eliminarItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const actualizarItem = (index: number, campo: keyof SolicitudItem, valor: any) => {
    const nuevosItems = [...items];
    nuevosItems[index] = { ...nuevosItems[index], [campo]: valor };
    
    // Calcular precio total automáticamente
    if (campo === 'cantidad' || campo === 'precioU') {
      const cantidad = campo === 'cantidad' ? valor : nuevosItems[index].cantidad;
      const precioU = campo === 'precioU' ? valor : nuevosItems[index].precioU;
      nuevosItems[index].precioT = cantidad * (precioU || 0);
    }
    
    setItems(nuevosItems);
  };

  const calcularTotal = () => {
    return items.reduce((sum, item) => sum + (item.precioT || 0), 0);
  };

  const generarSolicitud = () => {
    // Filtrar items con descripción
    const itemsValidos = items.filter(item => item.descripcion.trim() !== '');
    
    if (itemsValidos.length === 0) {
      alert('Debe agregar al menos un artículo con descripción');
      return;
    }
    
    setShowPreview(true);
  };

  const solicitudData = {
    tipo: tipo.toUpperCase() as 'ENTRADA' | 'SALIDA', // Convertir a mayúsculas
    fecha: new Date(fecha).toLocaleDateString('es-ES'),
    proveedor,
    items,
    solicitante,
    autoriza,
    folio,
    onClose: () => setShowPreview(false)
  };

  if (showPreview) {
    return (
      <div className="modal show" style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.8)',
        zIndex: 1050
      }}>
        <div className="modal-dialog modal-xl" style={{ maxWidth: '95vw', height: '95vh' }}>
          <div className="modal-content h-100" data-bs-theme={theme}>
            <div className="modal-header bg-dark text-white d-print-none">
              <h4 className="modal-title m-0">Vista Previa - Solicitud de Autorización</h4>
              <div>
                <button 
                  className="btn btn-secondary me-2" 
                  onClick={() => setShowPreview(false)}
                >
                  ← Editar
                </button>
                <button 
                  className="btn btn-outline-light" 
                  onClick={onClose}
                >
                  ✕ Cerrar
                </button>
              </div>
            </div>
            <div className="modal-body p-0" style={{ 
              height: 'calc(100% - 56px)', // Ajustado para el header
              overflowY: 'auto',
              backgroundColor: '#f5f5f5'
            }}>
              <SolicitudAutorizacion {...solicitudData} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid h-100" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
      <div className="row">
        <div className="col-12">
          <div className="card" data-bs-theme={theme}>
            <div className="card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h3 className="card-title m-0">
                  Crear Solicitud de Autorización
                </h3>
                <button className="btn btn-outline-danger" onClick={onClose}>
                  ✕ Cerrar
                </button>
              </div>
            </div>
            
            <div className="card-body">
              <div className="row g-3 mb-4">
                {/* Tipo de Solicitud */}
                <div className="col-md-6">
                  <label className="form-label">Tipo de Solicitud *</label>
                  <select 
                    className="form-select" 
                    value={tipo} 
                    onChange={(e) => {
                      setTipo(e.target.value as 'entrada' | 'salida');
                      setFolio(`${e.target.value.toUpperCase()}-${Date.now()}`);
                    }}
                  >
                    <option value="entrada">Compra (Entrada)</option>
                    <option value="salida">Salida</option>
                  </select>
                </div>
                
                {/* Fecha */}
                <div className="col-md-6">
                  <label className="form-label">Fecha *</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                  />
                </div>
                
                {/* Proveedor (solo para entradas) */}
                {tipo === 'entrada' && (
                  <div className="col-md-12">
                    <label className="form-label">Proveedor *</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={proveedor}
                      onChange={(e) => setProveedor(e.target.value)}
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                )}
                
                {/* Folio */}
                <div className="col-md-6">
                  <label className="form-label">Folio</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={folio}
                    onChange={(e) => setFolio(e.target.value)}
                  />
                </div>
              </div>

              {/* Firmas */}
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <label className="form-label">Solicitante *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={solicitante}
                    onChange={(e) => setSolicitante(e.target.value)}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Autoriza *</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={autoriza}
                    onChange={(e) => setAutoriza(e.target.value)}
                  />
                </div>
              </div>

              {/* Lista de Artículos */}
              <div className="card mb-4">
                <div className="card-header">
                  <h3 className="card-title">Artículos / Materiales</h3>
                  <div className="card-actions d-flex">
                    <button 
                      className="btn btn-success btn-sm me-2"
                      onClick={agregarItem}
                      title="Agregar nuevo artículo"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Agregar Artículo
                    </button>
                    <button 
                      className="btn btn-primary btn-sm"
                      onClick={generarSolicitud}
                      disabled={items.every(item => item.descripcion.trim() === '')}
                      title="Vista previa y generar solicitud"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-1">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14,2 14,8 20,8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                        <polyline points="10,9 9,9 8,9"></polyline>
                      </svg>
                      Generar Solicitud
                    </button>
                  </div>
                </div>
                
                <div className="card-body p-0">
                  <div className="table-responsive" style={{ maxHeight: 'calc(100vh - 400px)', overflowY: 'auto' }}>
                    <table className="table table-striped table-hover mb-0">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: '10%' }}>Código</th>
                          <th style={{ width: '30%' }}>Descripción *</th>
                          <th style={{ width: '10%' }}>Unidad</th>
                          <th style={{ width: '10%' }}>Cantidad *</th>
                          {tipo === 'entrada' && (
                            <>
                              <th style={{ width: '15%' }}>Precio U.</th>
                              <th style={{ width: '15%' }}>Precio T.</th>
                            </>
                          )}
                          <th style={{ width: '10%' }}>Acciones</th>
                        </tr>
                      </thead>
                    <tbody>
                      {items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            <input
                              type="text"
                              className="form-control"
                              value={item.codigo || ''}
                              onChange={(e) => actualizarItem(index, 'codigo', e.target.value)}
                              placeholder="Código"
                              style={{ minHeight: '40px', fontSize: '14px' }}
                            />
                          </td>
                          <td>
                            <div className="input-group">
                              <input
                                type="text"
                                className="form-control"
                                value={item.descripcion}
                                onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                                placeholder="Descripción del artículo *"
                                required
                                style={{ minHeight: '40px', fontSize: '14px' }}
                              />
                              <button
                                type="button"
                                className="btn btn-outline-secondary"
                                onClick={() => abrirModalArticulos(index)}
                                title="Buscar en stock"
                                style={{ minHeight: '40px' }}
                              >
                                🔍
                              </button>
                            </div>
                          </td>
                          <td>
                            <select
                              className="form-select"
                              value={item.unidad}
                              onChange={(e) => actualizarItem(index, 'unidad', e.target.value)}
                              style={{ minHeight: '40px', fontSize: '14px' }}
                            >
                              <option value="PZA">PZA</option>
                              <option value="KG">KG</option>
                              <option value="M">M</option>
                              <option value="LT">LT</option>
                              <option value="M2">M²</option>
                              <option value="M3">M³</option>
                              <option value="PAQ">PAQ</option>
                              <option value="CAJ">CAJ</option>
                              <option value="ROL">ROL</option>
                              <option value="JGO">JGO</option>
                            </select>
                          </td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={item.cantidad}
                              onChange={(e) => actualizarItem(index, 'cantidad', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                              style={{ minHeight: '40px', fontSize: '14px' }}
                            />
                          </td>
                          {tipo === 'entrada' && (
                            <>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.precioU || 0}
                                  onChange={(e) => actualizarItem(index, 'precioU', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                  style={{ minHeight: '40px', fontSize: '14px' }}
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control"
                                  value={item.precioT || 0}
                                  readOnly
                                  style={{ backgroundColor: '#f8f9fa', minHeight: '40px', fontSize: '14px' }}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => eliminarItem(index)}
                              disabled={items.length === 1}
                              title="Eliminar artículo"
                              style={{ minHeight: '40px' }}
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {tipo === 'entrada' && (
                      <tfoot>
                        <tr>
                          <td colSpan={5} className="text-end"><strong>Total:</strong></td>
                          <td><strong>${calcularTotal().toFixed(2)}</strong></td>
                          <td></td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="d-flex justify-content-end gap-2 mt-3">
              <button 
                className="btn btn-secondary" 
                onClick={onClose}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Selección de Artículos del Stock */}
      {itemSeleccionando !== null && (
        <div className="modal show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" data-bs-theme={theme}>
              <div className="modal-header">
                <h5 className="modal-title">Seleccionar Artículo del Stock</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setItemSeleccionando(null)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Búsqueda */}
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Buscar por código o descripción..."
                    value={busquedaArticulo}
                    onChange={(e) => setBusquedaArticulo(e.target.value)}
                    autoFocus
                  />
                </div>
                
                {/* Lista de artículos */}
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-hover">
                    <thead className="table-dark sticky-top">
                      <tr>
                        <th>Código</th>
                        <th>Descripción</th>
                        <th>Unidad</th>
                        <th>Stock</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {articulosFiltrados.length > 0 ? (
                        articulosFiltrados.map((articulo) => (
                          <tr key={articulo.id}>
                            <td><strong>{articulo.code}</strong></td>
                            <td>{articulo.name}</td>
                            <td>
                              <span className="badge bg-secondary">{articulo.unit}</span>
                            </td>
                            <td>
                              <span className={`badge ${articulo.stock > 5 ? 'bg-success' : articulo.stock > 0 ? 'bg-warning' : 'bg-danger'}`}>
                                {articulo.stock}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-primary btn-sm"
                                onClick={() => seleccionarArticuloStock(articulo, itemSeleccionando)}
                              >
                                Seleccionar
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">
                            {busquedaArticulo ? 'No se encontraron artículos con ese criterio' : 'Cargando artículos...'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                <div className="mt-3 text-muted small">
                  <strong>Tip:</strong> También puedes escribir manualmente un artículo nuevo en el campo de descripción.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setItemSeleccionando(null)}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default FormSolicitud;
