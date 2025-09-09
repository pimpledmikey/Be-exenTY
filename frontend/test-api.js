// Este script debe ejecutarse en la consola del navegador para probar la conexión
fetch('/api/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'mavila', password: 'Soldier10-' })
})
.then(res => res.json())
.then(data => {
  localStorage.setItem('token', data.token);
  console.log('Token guardado:', data.token);
  return fetch('/api/solicitudes/pendientes', {
    headers: { 
      'Authorization': 'Bearer ' + data.token,
      'Content-Type': 'application/json'
    }
  });
})
.then(res => res.json())
.then(data => console.log('Solicitudes pendientes:', data))
.catch(err => console.error('Error:', err));
