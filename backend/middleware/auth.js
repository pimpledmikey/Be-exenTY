// Middleware de autenticación básico para Express
// Por ahora solo deja pasar la petición (placeholder)

export default function auth(req, res, next) {
  // Aquí puedes agregar lógica de autenticación real si lo necesitas
  next();
}
