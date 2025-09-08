const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF() {
  console.log('🔄 Generando PDF de cotización...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // Cargar el archivo HTML
  const htmlPath = path.join(__dirname, 'cotizacion-beexenty.html');
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
  
  // Configuraciones del PDF
  const pdfOptions = {
    path: 'Cotizacion-Sistema-BeExenTY.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
      top: '1cm',
      right: '1cm',
      bottom: '1cm',
      left: '1cm'
    },
    displayHeaderFooter: false
  };
  
  // Generar PDF
  await page.pdf(pdfOptions);
  
  await browser.close();
  
  console.log('✅ PDF generado exitosamente: Cotizacion-Sistema-BeExenTY.pdf');
}

// Ejecutar si se llama directamente
if (require.main === module) {
  generatePDF().catch(console.error);
}

module.exports = generatePDF;
