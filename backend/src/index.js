const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes'); // Importamos las rutas de auth
const adminRoutes = require('./routes/adminRoutes');
const organizacionRoutes = require('./routes/organizacionRoutes');
const oportunidadRoutes =require('./routes/oportunidadRoutes');
const ubicacionRoutes =require('./routes/ubicacionRoutes');
const tipoActividadRoutes =require('./routes/tipoActividadRoutes');
const inscripcionRoutes = require('./routes/inscripcionRoutes');
const publicRoutes = require('./routes/publicRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const corsOrigins = (
  process.env.CORS_ORIGINS ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {

      // Permite solicitudes sin Origin:
      // app móvil, curl, Postman, servidor a servidor.
      if (
        !origin ||
        corsOrigins.includes(origin)
      ) {
        return callback(null, true);
      }

      // Para otros orígenes no se habilita CORS.
      return callback(null, false);
    },
  })
);
app.use(express.json());
app.use('/api/ubicaciones',ubicacionRoutes);

// Enlazamos las rutas bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/organizaciones', organizacionRoutes);
app.use('/api/tipos-actividad',tipoActividadRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/public', publicRoutes);
// Ruta de diagnóstico (Health Check)
app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'OK',
      message: 'Servidor y Base de Datos funcionando correctamente',
      timestamp: result.rows[0].now
    });
  } catch (error) {
  console.error(
    'ERROR EN HEALTH CHECK:',
    error
  );

  res.status(500).json({
    status: 'ERROR',
    message:
      'No se pudo verificar el estado del servicio'
  });
}
});

if (require.main === module) {

  app.listen(PORT, () => {
    console.log(
      `Servidor backend corriendo en el puerto ${PORT}`
    );
  });

}

module.exports = app;