/**
 * ACTIVIDAD 3.3.2 - Contexto de navegación y aislamiento por usuario.
 * Verifica que el listado de notificaciones conserve las referencias
 * para abrir una inscripción, una oportunidad o una donación.
 * No necesita conectarse a PostgreSQL.
 */

jest.mock('../src/config/db', () => ({
  query: jest.fn(),
  connect: jest.fn(),
}));

const db = require('../src/config/db');
const repo = require('../src/repositories/notificacionRepository');
const USUARIO = '11111111-1111-4111-8111-111111111111';

beforeEach(() => jest.resetAllMocks());

describe('Actividad 3.3.2 - Referencias y privacidad del listado', () => {
  test('preserva los identificadores necesarios para navegar desde la notificación', async () => {
    const fila = {
      id_notificacion: '22222222-2222-4222-8222-222222222222',
      id_inscripcion: '33333333-3333-4333-8333-333333333333',
      id_oportunidad: '44444444-4444-4444-8444-444444444444',
      id_donacion: null,
      tipo: 'INSCRIPCION_ACEPTADA',
    };
    db.query.mockResolvedValue({ rows: [fila] });
    const resultado = await repo.listarPorUsuario(USUARIO, 15, 5);
    expect(resultado).toEqual([fila]);
    const [sql] = db.query.mock.calls[0];
    expect(sql).toMatch(/\bid_inscripcion\b/i);
    expect(sql).toMatch(/\bid_oportunidad\b/i);
    expect(sql).toMatch(/\bid_donacion\b/i);
  });

  test('el listado se filtra por usuario y recibe límite y offset', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await repo.listarPorUsuario(USUARIO, 10, 20);
    expect(db.query).toHaveBeenCalledTimes(1);
    const [sql, params] = db.query.mock.calls[0];
    expect(sql).toMatch(/WHERE\s+(?:n\.)?id_usuario\s*=\s*\$1/i);
    expect(params).toEqual([USUARIO, 10, 20]);
  });

  test('el listado vacío no falla', async () => {
    db.query.mockResolvedValue({ rows: [] });
    await expect(repo.listarPorUsuario(USUARIO, 30, 0))
      .resolves.toEqual([]);
  });

  test('los fallos de consulta no se ocultan', async () => {
    db.query.mockRejectedValue(new Error('Error de consulta'));
    await expect(repo.listarPorUsuario(USUARIO, 30, 0))
      .rejects.toThrow('Error de consulta');
  });
});
