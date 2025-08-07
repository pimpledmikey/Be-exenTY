import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
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
  fecha = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-'),
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
  
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Solicitud_Autorizacion_Compra_${fecha}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 10mm;
      }
      @media print {
        body { 
          -webkit-print-color-adjust: exact; 
          color-adjust: exact;
        }
      }
    `,
  });
  
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
          onClick={handlePrint}
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
          <div className="fecha-container-print">
            <div className="fecha-label-print">Fecha:</div>
            <div className="fecha-valor-print">{fecha}</div>
            <div className="folio-print">Folio: ENTRADA-{new Date().getTime().toString().slice(-9)}</div>
          </div>
          <div className="titulo-container-print">
            <h1 className="titulo-principal-print">SOLICITUD DE AUTORIZACIÓN</h1>
            <h2 className="subtitulo-verde-print">ENTRADA DE MATERIALES</h2>
          </div>
          <div className="logo-container-print">
            <img src={logoBeExEn} alt="Logo BE-EX-EN" className="logo-beexen-print"/>
          </div>
        </div>

        <table className="tabla-articulos-print">
          <thead>
            <tr>
              <th>No.</th>
              <th>Código</th>
              <th>Descripción</th>
              <th>Unidad</th>
              <th>Medida</th>
              <th>Cantidad</th>
              <th>Precio U</th>
              <th>Precio T</th>
            </tr>
          </thead>
          <tbody>
            {filasCompletas.map((item, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{item.codigo}</td>
                <td>{item.descripcion}</td>
                <td>{item.unidad}</td>
                <td>{item.medida || ''}</td>
                <td>{item.cantidad || ''}</td>
                <td>{item.precioU ? `$${item.precioU.toFixed(2)}` : ''}</td>
                <td>{item.precioT ? `$${item.precioT.toFixed(2)}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>

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
