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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/api/ubicaciones',ubicacionRoutes);

// Enlazamos las rutas bajo el prefijo /api/auth
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/oportunidades', oportunidadRoutes);
app.use('/api/organizaciones', organizacionRoutes);
app.use('/api/tipos-actividad',tipoActividadRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
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
    res.status(500).json({ status: 'ERROR', message: error.message });
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