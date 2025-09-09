import pool from '../db.js';

console.log('🔄 Creando solicitudes de prueba...');

try {
  // Crear solicitudes de prueba
  const solicitudes = [
    {
      folio: 'SALIDA-2025-DEMO-001',
      tipo: 'SALIDA',
      fecha: '2025-01-09',
      usuario_solicita_id: 1,
      observaciones: 'Materiales para proyecto urgente - Demo sistema autorización'
    },
    {
      folio: 'ENTRADA-2025-DEMO-001', 
      tipo: 'ENTRADA',
      fecha: '2025-01-09',
      usuario_solicita_id: 1,
      observaciones: 'Compra de equipos nuevos - Demo sistema autorización'
    }
  ];
  
  for (const sol of solicitudes) {
    const [result] = await pool.query(
      'INSERT INTO solicitudes (folio, tipo, fecha, usuario_solicita_id, estado, observaciones) VALUES (?, ?, ?, ?, ?, ?)',
      [sol.folio, sol.tipo, sol.fecha, sol.usuario_solicita_id, 'PENDIENTE', sol.observaciones]
    );
    
    const solicitudId = result.insertId;
    
    // Agregar algunos items de prueba
    const items = [
      { article_id: 1, cantidad: 5, observaciones: 'Item de prueba 1' },
      { article_id: 2, cantidad: 3, observaciones: 'Item de prueba 2' }
    ];
    
    for (const item of items) {
      await pool.query(
        'INSERT INTO solicitudes_items (solicitud_id, article_id, cantidad, observaciones) VALUES (?, ?, ?, ?)',
        [solicitudId, item.article_id, item.cantidad, item.observaciones]
      );
    }
    
    console.log(`✅ Solicitud creada: ${sol.folio} (ID: ${solicitudId})`);
  }
  
  // Verificar solicitudes pendientes
  const [pendientes] = await pool.query(`
    SELECT s.id, s.folio, s.tipo, s.fecha, s.estado, 
           COUNT(si.id) as total_items
    FROM solicitudes s
    LEFT JOIN solicitudes_items si ON s.id = si.solicitud_id
    WHERE s.estado = 'PENDIENTE'
    GROUP BY s.id
    ORDER BY s.created_at DESC
    LIMIT 5
  `);
  
  console.log('\n📋 Solicitudes pendientes:');
  pendientes.forEach(s => {
    console.log(`- ${s.folio} (${s.tipo}) - ${s.total_items} items`);
  });
  
  console.log('\n🎉 Sistema de autorización listo para probar!');
  process.exit(0);
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
