import React from 'react';
import SolicitudAutorizacion from './SolicitudAutorizacion';

// Datos de prueba para mostrar el componente
const datosPrueba = {
  fecha: '15/12/2024',
  proveedor: 'Proveedor de Ejemplo S.A.',
  dirigido: 'Departamento de Compras',
  departamento: 'Almacén General',
  folio: 'SOL-001-2024',
  tipo: 'entrada' as const,
  justificacion: 'Reposición de inventario para el primer trimestre del 2025. Artículos necesarios para mantener el stock mínimo requerido.',
  observaciones: 'Urgente: Se requiere entrega antes del 30 de diciembre. Verificar calidad de los productos al recibir.',
  solicitante: 'Juan Pérez García',
  autoriza: 'Lic. María González López',
  items: [
    {
      codigo: 'ART-001',
      descripcion: 'Papel bond carta 75g',
      unidad: 'Paquete',
      medida: '500 hojas',
      cantidad: 10,
      precioU: 45.50,
      precioT: 455.00
    },
    {
      codigo: 'ART-002', 
      descripcion: 'Tinta para impresora HP LaserJet',
      unidad: 'Cartucho',
      medida: 'Negro',
      cantidad: 5,
      precioU: 850.00,
      precioT: 4250.00
    },
    {
      codigo: 'ART-003',
      descripcion: 'Folders tamaño carta con broche',
      unidad: 'Caja',
      medida: '100 piezas',
      cantidad: 3,
      precioU: 120.00,
      precioT: 360.00
    }
  ]
};

const PruebaSolicitud: React.FC = () => {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ color: '#333', marginBottom: '10px' }}>
          ✨ Nuevo Sistema de Solicitudes ✨
        </h1>
        <p style={{ color: '#666', fontSize: '18px' }}>
          Sistema mejorado con <strong>react-to-print</strong> - Vista previa perfecta y PDF profesional
        </p>
        <div style={{ 
          background: 'linear-gradient(135deg, #28a745, #20c997)', 
          color: 'white', 
          padding: '15px', 
          borderRadius: '10px',
          margin: '20px 0',
          boxShadow: '0 4px 15px rgba(40, 167, 69, 0.3)'
        }}>
          <strong>🎉 ¡Funcionalidades mejoradas!</strong><br/>
          ✓ Vista previa exacta como se imprimirá<br/>
          ✓ PDF de alta calidad<br/>
          ✓ Sin errores de pantalla negra<br/>
          ✓ Diseño profesional y limpio
        </div>
      </div>
      
      <SolicitudAutorizacion 
        {...datosPrueba}
        onClose={() => alert('Función de cerrar activada')}
      />
    </div>
  );
};

export default PruebaSolicitud;
