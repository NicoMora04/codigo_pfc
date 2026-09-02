const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {

  // Obtener el header Authorization
  const authHeader = req.headers.authorization;

  // Si no se envió token
  if (!authHeader) {
    return res.status(401).json({
      error: 'Token de autenticación requerido'
    });
  }

  // Esperamos:
  // Authorization: Bearer TOKEN
  const parts = authHeader.split(' ');

  if (
    parts.length !== 2 ||
    parts[0] !== 'Bearer'
  ) {
    return res.status(401).json({
      error: 'Formato de token inválido'
    });
  }

  const token = parts[1];

  try {

    // Verificar firma y vencimiento
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Guardar los datos del usuario
    // dentro de la petición
    req.user = decoded;

    // Continuar hacia el controlador
    next();

  } catch (error) {

    return res.status(401).json({
      error: 'Token inválido o expirado'
    });

  }

};

module.exports = verificarToken;