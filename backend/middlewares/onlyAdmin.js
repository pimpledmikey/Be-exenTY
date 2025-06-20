export default function onlyAdmin(req, res, next) {
  console.log('onlyAdmin req.user:', req.user); // Log para depuración
  if (!req.user || req.user.group !== 'admin') {
    return res.status(403).json({ error: 'Acceso solo para administradores' });
  }
  next();
}
