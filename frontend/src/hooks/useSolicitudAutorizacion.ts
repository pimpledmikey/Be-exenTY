import { useState } from 'react';

interface SolicitudItem {
  codigo?: string;
  descripcion: string;
  unidad: string;
  medida?: string;
  cantidad: number;
  precioU?: number;
  precioT?: number;
}

interface SolicitudData {
  fecha?: string;
  proveedor?: string;
  items: SolicitudItem[];
  solicitante?: string;
  autoriza?: string;
  tipo: 'entrada' | 'salida';
  folio?: string;
}

export const useSolicitudAutorizacion = () => {
  const [solicitudData, setSolicitudData] = useState<SolicitudData | null>(null);
  const [showSolicitud, setShowSolicitud] = useState(false);

  const generarSolicitudEntrada = (entradas: any[], proveedor?: string) => {
    const items: SolicitudItem[] = entradas.map(entrada => ({
      codigo: entrada.article_id || '',
      descripcion: entrada.articulo_nombre || entrada.description || '',
      unidad: entrada.unit || 'PZA',
      cantidad: entrada.quantity || 0,
      precioU: entrada.unit_cost || 0,
      precioT: (entrada.quantity || 0) * (entrada.unit_cost || 0)
    }));

    const solicitud: SolicitudData = {
      fecha: new Date().toLocaleDateString('es-ES'),
      proveedor: proveedor || entradas[0]?.supplier || 'Por definir',
      items,
      tipo: 'entrada',
      folio: `ENT-${Date.now()}`
    };

    setSolicitudData(solicitud);
    setShowSolicitud(true);
  };

  const generarSolicitudSalida = (salidas: any[]) => {
    const items: SolicitudItem[] = salidas.map(salida => ({
      codigo: salida.article_id || '',
      descripcion: salida.articulo_nombre || salida.description || '',
      unidad: salida.unit || 'PZA',
      cantidad: salida.quantity || 0
    }));

    const solicitud: SolicitudData = {
      fecha: new Date().toLocaleDateString('es-ES'),
      items,
      tipo: 'salida',
      folio: `SAL-${Date.now()}`
    };

    setSolicitudData(solicitud);
    setShowSolicitud(true);
  };

  const generarSolicitudPersonalizada = (data: Partial<SolicitudData>) => {
    const solicitud: SolicitudData = {
      fecha: new Date().toLocaleDateString('es-ES'),
      items: [],
      tipo: 'entrada',
      ...data
    };

    setSolicitudData(solicitud);
    setShowSolicitud(true);
  };

  const cerrarSolicitud = () => {
    setShowSolicitud(false);
    setSolicitudData(null);
  };

  return {
    solicitudData,
    showSolicitud,
    generarSolicitudEntrada,
    generarSolicitudSalida,
    generarSolicitudPersonalizada,
    cerrarSolicitud
  };
};

export default useSolicitudAutorizacion;
