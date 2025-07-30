const bcrypt = require('bcrypt');

// Script para generar contraseñas hasheadas
async function hashPasswords() {
  const password = '123456';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('Password hasheada para "123456":', hash);
    console.log('\nSQL para actualizar usuarios:');
    console.log(`
UPDATE users SET password = '${hash}' WHERE username IN ('pavelino', 'gflores', 'mcabrera', 'eavila');
    `);
  } catch (error) {
    console.error('Error al hashear password:', error);
  }
}

hashPasswords();
