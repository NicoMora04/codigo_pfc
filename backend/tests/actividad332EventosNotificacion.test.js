/**
 * ACTIVIDAD 3.3.2 - Eventos que generan notificaciones internas.
 * Pruebas unitarias del repositorio: no requieren PostgreSQL.
 * Cada consulta se ejecuta con un cliente transaccional simulado.
 *
 * Se verifican los cinco eventos, el identificador vinculado,
 * la protección contra duplicados y la propagación de errores SQL.
 */

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../src/config/db');
const repositorio = require('../src/repositories/notificacionRepository');

const ID = '11111111-1111-4111-8111-111111111111';
const USUARIO = '22222222-2222-4222-8222-222222222222';
const NOTIFICACION = '33333333-3333-4333-8333-333333333333';

const eventos = [
  {
    nombre: 'Inscripción aceptada',
    metodo: 'crearPorInscripcionAceptada',
    tipo: 'INSCRIPCION_ACEPTADA',
    referencia: 'id_inscripcion',
  },
  {
    nombre: 'Cancelación de inscripción aceptada',
    metodo: 'crearPorCancelacionInscripcionAceptada',
    tipo: 'INSCRIPCION_CANCELADA_ORGANIZACION',
    referencia: 'id_inscripcion',
  },
  {
    nombre: 'Oportunidad cancelada',
    metodo: 'crearPorOportunidadCancelada',
    tipo: 'OPORTUNIDAD_CANCELADA',
    referencia: 'id_oportunidad',
  },
  {
    nombre: 'Nueva donación para la organización',
    metodo: 'crearPorNuevaDonacionOrganizacion',
    tipo: 'NUEVA_DONACION_ORGANIZACION',
    referencia: 'id_donacion',
  },
  {
    nombre: 'Donación coordinada',
    metodo: 'crearPorDonacionCoordinada',
    tipo: 'DONACION_COORDINADA',
    referencia: 'id_donacion',
  },
];

beforeEach(() => jest.clearAllMocks());

describe.each(eventos)('Actividad 3.3.2 - $nombre', (evento) => {
  const ejecutar = (cliente) => {
    expect(typeof repositorio[evento.metodo]).toBe('function');
    return repositorio[evento.metodo](ID, cliente);
  };

  test('registra el evento con la referencia y el tipo correctos', async () => {
    const fila = {
      id_notificacion: NOTIFICACION,
      id_usuario: USUARIO,
      tipo: evento.tipo,
      [evento.referencia]: ID,
    };
    const db = { query: jest.fn().mockResolvedValue({ rows: [fila] }) };

    const resultado = await ejecutar(db);

    expect(resultado).toEqual([fila]);
    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, parametros] = db.query.mock.calls[0];
    expect(sql).toMatch(/INSERT\s+INTO\s+notificacion\b/i);
    expect(sql).toContain(evento.tipo);
    expect(sql).toMatch(new RegExp(`\\b${evento.referencia}\\b`, 'i'));
    expect(parametros).toEqual([ID]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('sin destinatarios elegibles no devuelve notificaciones', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    await expect(ejecutar(db)).resolves.toEqual([]);
    expect(db.query).toHaveBeenCalledTimes(1);
  });

  test('el SQL evita duplicados del mismo evento', async () => {
    const db = { query: jest.fn().mockResolvedValue({ rows: [] }) };
    await ejecutar(db);
    const [sql] = db.query.mock.calls[0];
    expect(sql).toMatch(/ON\s+CONFLICT/i);
    expect(sql).toMatch(/DO\s+NOTHING/i);
  });

  test('propaga el error de base de datos para permitir rollback', async () => {
    const error = new Error('Error SQL de prueba');
    const db = { query: jest.fn().mockRejectedValue(error) };
    await expect(ejecutar(db)).rejects.toThrow('Error SQL de prueba');
  });
});
