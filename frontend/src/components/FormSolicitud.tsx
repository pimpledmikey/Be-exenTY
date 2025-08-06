import React, { useState } from 'react';
import SolicitudAutorizacion from './SolicitudAutorizacion';
import { useTheme } from '../hooks/useTheme';

interface SolicitudItem {
  codigo?: string;
  descripcion: string;
  unidad: string;
  medida?: string;
  cantidad: number;
  precioU?: number;
  precioT?: number;
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
    fecha: new Date(fecha).toLocaleDateString('es-ES'),
    proveedor,
    items,
    solicitante,
    autoriza,
    tipo,
    folio
  };

  if (showPreview) {
    return (
      <div className="container-fluid" style={{ height: '100vh' }}>
        <div className="d-flex justify-content-between align-items-center mb-3 p-3 bg-dark">
          <h4 className="text-white m-0">Vista Previa - Solicitud de Autorización</h4>
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
        <SolicitudAutorizacion {...solicitudData} />
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
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="m-0">Artículos / Materiales</h5>
                  <button 
                    className="btn btn-success btn-sm"
                    onClick={agregarItem}
                  >
                    + Agregar Artículo
                  </button>
                </div>
                
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
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
                              className="form-control form-control-sm"
                              value={item.codigo || ''}
                              onChange={(e) => actualizarItem(index, 'codigo', e.target.value)}
                              placeholder="Código"
                            />
                          </td>
                          <td>
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              value={item.descripcion}
                              onChange={(e) => actualizarItem(index, 'descripcion', e.target.value)}
                              placeholder="Descripción del artículo *"
                              required
                            />
                          </td>
                          <td>
                            <select
                              className="form-select form-select-sm"
                              value={item.unidad}
                              onChange={(e) => actualizarItem(index, 'unidad', e.target.value)}
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
                              className="form-control form-control-sm"
                              value={item.cantidad}
                              onChange={(e) => actualizarItem(index, 'cantidad', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          </td>
                          {tipo === 'entrada' && (
                            <>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.precioU || 0}
                                  onChange={(e) => actualizarItem(index, 'precioU', parseFloat(e.target.value) || 0)}
                                  min="0"
                                  step="0.01"
                                  placeholder="0.00"
                                />
                              </td>
                              <td>
                                <input
                                  type="number"
                                  className="form-control form-control-sm"
                                  value={item.precioT || 0}
                                  readOnly
                                  style={{ backgroundColor: '#f8f9fa' }}
                                />
                              </td>
                            </>
                          )}
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => eliminarItem(index)}
                              disabled={items.length === 1}
                              title="Eliminar artículo"
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

              {/* Botones de Acción */}
              <div className="d-flex justify-content-end gap-2">
                <button 
                  className="btn btn-secondary" 
                  onClick={onClose}
                >
                  Cancelar
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={generarSolicitud}
                  disabled={items.every(item => item.descripcion.trim() === '')}
                >
                  🔍 Vista Previa y Generar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormSolicitud;
