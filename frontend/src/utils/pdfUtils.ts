// Utilidades para generación de PDFs de alta calidad

export const PDF_CONFIG = {
  // Configuración para html2canvas
  html2canvasOptions: {
    scale: 3, // Mayor resolución para mejor calidad
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false, // Desactivar logs en producción
    removeContainer: true,
    // Mejorar renderizado de texto
    letterRendering: true,
    // Optimizar para impresión
    dpi: 300,
    // Configuración de fuentes
    foreignObjectRendering: true
  },
  
  // Configuración del PDF
  pdfOptions: {
    format: 'a4' as const,
    orientation: 'portrait' as const,
    unit: 'mm' as const,
    margins: {
      top: 10,
      right: 10,
      bottom: 10,
      left: 10
    }
  },

  // Nombres de archivos
  generateFileName: (tipo: string, folio: string) => {
    const fecha = new Date().toISOString().split('T')[0];
    const tipoCapitalizado = tipo.charAt(0).toUpperCase() + tipo.slice(1);
    return `Solicitud_Autorizacion_${tipoCapitalizado}_${folio || 'documento'}_${fecha}.pdf`;
  }
};

// Función para optimizar elemento antes de convertir a PDF
export const optimizeElementForPDF = (element: HTMLElement): void => {
  // Asegurar que todas las imágenes estén cargadas
  const images = element.querySelectorAll('img');
  images.forEach(img => {
    if (!img.complete) {
      img.loading = 'eager';
    }
  });

  // Aplicar estilos específicos para PDF
  element.style.fontFamily = 'Arial, sans-serif';
  element.style.fontSize = '14px';
  element.style.lineHeight = '1.4';
  element.style.color = '#000000';
  element.style.backgroundColor = '#ffffff';
};

// Función para limpiar después de la generación del PDF
export const cleanupAfterPDF = (element: HTMLElement): void => {
  // Remover estilos temporales si es necesario
  element.style.removeProperty('font-family');
  element.style.removeProperty('font-size');
  element.style.removeProperty('line-height');
};

export default PDF_CONFIG;
