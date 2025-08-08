import React, { useRef } from 'react';
import logoBeExEn from '../assets/logoBeExEn.png';
import '../styles/SolicitudAutorizacion.css';

interface SolicitudItem {
  codigo?: string;
  descripcion: string;
  unidad: string;
  medida?: string;
  cantidad: number;
  precioU?: number;
  precioT?: number;
}

interface SolicitudAutorizacionProps {
  tipo?: 'ENTRADA' | 'SALIDA'; // Nuevo campo para tipo
  fecha?: string;
  proveedor?: string;
  items: SolicitudItem[];
  codigo?: string;
  descripcion?: string;
  unidad?: string;
  cantidad?: number;
  precioU?: number;
  precioT?: number;
  usuario?: { nombre: string };
  solicitante?: string;
  autoriza?: string;
  onClose?: () => void;
}

const SolicitudAutorizacion: React.FC<SolicitudAutorizacionProps> = ({
  tipo = 'ENTRADA', // Por defecto ENTRADA
  fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }),
  items = [],
  codigo,
  descripcion,
  unidad,
  cantidad,
  precioU,
  precioT,
  usuario,
  solicitante,
  autoriza,
  onClose = () => {}
}) => {
  const componentRef = useRef<HTMLDivElement>(null);

  const downloadBackendPdf = async () => {
    if (!componentRef.current) return;

    try {
      // Obtener folio
      let folio = `${tipo}-${new Date().getTime().toString().slice(-9)}`;
      
      // Convertir logo a base64
      let logoBase64 = '';
      try {
        const response = await fetch(logoBeExEn);
        const blob = await response.blob();
        logoBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64 = reader.result as string;
            resolve(base64.split(',')[1]); // Remover prefijo data:image/...;base64,
          };
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.log('No se pudo cargar el logo:', e);
      }

      // Preparar datos para el PDF
      const pdfData = {
        folio,
        fecha,
        tipo,
        sucursal: 'SUCURSAL PRINCIPAL', // Puedes hacer esto dinámico
        items: filasCompletas.filter(item => item.descripcion), // Solo items con contenido
        observaciones: '', // Puedes agregar un campo de observaciones si lo necesitas
        usuarioSolicita: solicitante || usuario?.nombre || 'JUAN JESÚS ORTEGA SIMBRÓN',
        usuarioAutoriza: autoriza || 'LIC. ELISA AVILA REQUENA',
        logoBase64
      };

      const API_URL = (import.meta as any).env?.VITE_API_URL || '/api';
      const resp = await fetch(`${API_URL}/pdf/solicitud`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : ''
        },
        body: JSON.stringify(pdfData)
      });
      
      if (!resp.ok) {
        const errorText = await resp.text();
        throw new Error(`Error del servidor: ${errorText}`);
      }
      
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Solicitud_Autorizacion_${folio}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
    } catch (e) {
      console.error('Error al generar PDF:', e);
      // Fallback a impresión del navegador
      window.print();
    }
  };
  
  const filasCompletas: SolicitudItem[] = [];
  
  if (codigo && descripcion && unidad && cantidad) {
    filasCompletas.push({
      codigo,
      descripcion,
      unidad,
      cantidad,
      precioU,
      precioT
    });
  }
  
  items.forEach(item => {
    filasCompletas.push(item);
  });

  while (filasCompletas.length < 10) {
    filasCompletas.push({
      codigo: '',
      descripcion: '',
      unidad: '',
      cantidad: 0,
      precioU: 0,
      precioT: 0
    });
  }

  return (
    <div className="solicitud-container-wrapper">
      <div className="botones-accion-wrapper d-print-none">
        <button 
          className="btn-accion-print btn-pdf-print" 
          onClick={downloadBackendPdf}
        >
          🖨️ Imprimir / Guardar PDF
        </button>
        {onClose && (
          <button 
            className="btn-accion-print btn-volver-print" 
            onClick={onClose}
          >
            ↩️ Volver
          </button>
        )}
      </div>

      <div ref={componentRef} className="solicitud-documento-print">
        <div className="header-print">
          <div className="logo-container-print">
            <img src={logoBeExEn} alt="Logo BE-EX-EN" className="logo-beexen-print"/>
          </div>
          <div className="titulo-container-print">
            <h1 className="titulo-principal-print">SOLICITUD DE AUTORIZACIÓN</h1>
            <h2 className="subtitulo-verde-print">{tipo} DE MATERIALES</h2>
            <div className="fecha-container-print">
              <div className="fecha-label-print">Fecha:</div>
              <div className="fecha-valor-print">{fecha}</div>
              <div className="folio-print">Folio: {tipo}-{new Date().getTime().toString().slice(-9)}</div>
              {solicitante && (
                <div className="solicitante-print">
                  <span className="solicitante-label-print">Solicitante: </span>
                  <span className="solicitante-valor-print">{solicitante}</span>
                </div>
              )}
              {autoriza && (
                <div className="autoriza-print">
                  <span className="autoriza-label-print">Autoriza: </span>
                  <span className="autoriza-valor-print">{autoriza}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="contenido-scroll-print">
          <div className="tabla-container-print">
            <table className="tabla-articulos-print">
              <thead>
                <tr>
                  <th>No.</th>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Unidad</th>
                  <th>Cantidad</th>
                  {tipo === 'ENTRADA' && (
                    <>
                      <th>Precio U</th>
                      <th>Precio T</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {filasCompletas.map((item, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{item.codigo}</td>
                    <td>{item.descripcion}</td>
                    <td>{item.unidad}</td>
                    <td>{item.cantidad || ''}</td>
                    {tipo === 'ENTRADA' && (
                      <>
                        <td>{item.precioU ? `$${item.precioU.toFixed(2)}` : ''}</td>
                        <td>{item.precioT ? `$${item.precioT.toFixed(2)}` : ''}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="firmas-section-print">
          <div className="firma-campo-print">
            <div className="firma-label-print">
              <strong>SOLICITADO POR:</strong>
            </div>
            <div className="linea-firma-print"></div>
            <div className="nombre-firma-print">
              {solicitante || usuario?.nombre || 'JUAN JESÚS ORTEGA SIMBRÓN'}
            </div>
          </div>
          
          <div className="firma-campo-print">
            <div className="firma-label-print">
              <strong>AUTORIZADO POR:</strong>
            </div>
            <div className="linea-firma-print"></div>
            <div className="nombre-firma-print">
              {autoriza || 'LIC. ELISA AVILA REQUENA'}
            </div>
          </div>

          <div className="firma-campo-print">
            <div className="firma-label-print">
              <strong>RECIBIDO POR:</strong>
            </div>
            <div className="linea-firma-print"></div>
            <div className="nombre-firma-print">
              ___________________
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolicitudAutorizacion;
