/**
 * ACTIVIDAD 3.3.2 - Preparación de envíos push por notificación.
 * Verifica generación por dispositivo activo, idempotencia y fallos SQL.
 * No realiza llamadas a Expo ni utiliza una base de datos real.
 */

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const pool = require('../src/config/db');
const envios = require('../src/repositories/envioPushRepository');

const ID_NOTIFICACION = '11111111-1111-4111-8111-111111111111';
const ID_TOKEN = '22222222-2222-4222-8222-222222222222';
const ID_ENVIO = '33333333-3333-4333-8333-333333333333';

beforeEach(() => jest.clearAllMocks());

const generar = async (query) => {
  expect(typeof envios.crearPendientesPorNotificacion).toBe('function');
  const db = { query };
  const resultado = await envios.crearPendientesPorNotificacion(
    ID_NOTIFICACION,
    db
  );
  return { resultado, db };
};

describe('Actividad 3.3.2 - Envíos push por notificación', () => {
  test('crea envíos PENDIENTE para los dispositivos elegibles', async () => {
    const fila = {
      id_envio_push: ID_ENVIO,
      id_notificacion: ID_NOTIFICACION,
      id_token_dispositivo: ID_TOKEN,
      estado: 'PENDIENTE',
    };
    const { resultado, db } = await generar(
      jest.fn().mockResolvedValue({ rows: [fila] })
    );
    expect(resultado).toEqual([fila]);
    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, parametros] = db.query.mock.calls[0];
    expect(sql).toMatch(/INSERT\s+INTO\s+envio_push/i);
    expect(sql).toMatch(/token_dispositivo/i);
    expect(sql).toMatch(/PENDIENTE/i);
    expect(parametros).toEqual([ID_NOTIFICACION]);
    expect(pool.query).not.toHaveBeenCalled();
  });

  test('filtra los tokens de dispositivo activos', async () => {
    const { db } = await generar(
      jest.fn().mockResolvedValue({ rows: [] })
    );
    const [sql] = db.query.mock.calls[0];
    expect(sql).toMatch(/activo\s*=\s*TRUE/i);
  });

  test('evita insertar envíos duplicados al reintentarse', async () => {
    const { db } = await generar(
      jest.fn().mockResolvedValue({ rows: [] })
    );
    const [sql] = db.query.mock.calls[0];
    expect(sql).toMatch(/ON\s+CONFLICT/i);
    expect(sql).toMatch(/DO\s+NOTHING/i);
  });

  test('sin dispositivos activos devuelve una lista vacía', async () => {
    const { resultado } = await generar(
      jest.fn().mockResolvedValue({ rows: [] })
    );
    expect(resultado).toEqual([]);
  });

  test('propaga errores de inserción para permitir rollback', async () => {
    const db = {
      query: jest.fn().mockRejectedValue(new Error('Fallo de envío push')),
    };
    await expect(
      envios.crearPendientesPorNotificacion(ID_NOTIFICACION, db)
    ).rejects.toThrow('Fallo de envío push');
  });
});
