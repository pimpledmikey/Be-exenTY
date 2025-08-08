import { chromium } from 'playwright';

// Genera un PDF desde una URL pública o HTML enviado por POST
// Body soportado:
// { url?: string, html?: string, fileName?: string, emulate?: 'print'|'screen', margin?: {top,right,bottom,left} }
export async function generarPdfSolicitud(req, res) {
  const { url, html, fileName = 'Solicitud_Autorizacion.pdf', emulate = 'print', margin } = req.body || {};

  if (!url && !html) {
    return res.status(400).json({ error: 'Falta url o html en el cuerpo de la solicitud.' });
  }

  let browser;
  try {
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();
    await page.setViewportSize({ width: 1280, height: 960 });

    // Emular media para aplicar estilos correctos
    await page.emulateMedia({ media: emulate === 'screen' ? 'screen' : 'print' });

    if (url) {
      await page.goto(url, { waitUntil: 'networkidle' });
    } else if (html) {
      await page.setContent(html, { waitUntil: 'networkidle' });
    }

    // Esperar a que las fuentes estén listas
    try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}

    // Generar PDF con Playwright
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      margin: margin || { top: '10mm', right: '10mm', bottom: '12mm', left: '10mm' },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizeFileName(fileName)}"`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generando PDF:', err);
    return res.status(500).json({ error: 'No se pudo generar el PDF', details: String(err) });
  } finally {
    if (browser) {
      try { await browser.close(); } catch {}
    }
  }
}

export function pingPdf(req, res) {
  res.json({ ok: true });
}

function sanitizeFileName(name) {
  return String(name || 'document.pdf').replace(/[^a-zA-Z0-9_\-.]/g, '_');
}
