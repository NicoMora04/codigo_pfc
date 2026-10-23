/**
 * ACTIVIDAD 3.3.2 - Gestión y seguridad de notificaciones.
 * Tests unitarios del servicio, compartido por voluntarios y organizaciones.
 */

jest.mock('../src/repositories/notificacionRepository', () => ({
  crear: jest.fn(),
  listarPorUsuario: jest.fn(),
  marcarComoLeida: jest.fn(),
  contarNoLeidas: jest.fn(),
  crearPorOportunidadPublicada: jest.fn(),
}));

const repo = require('../src/repositories/notificacionRepository');
const servicio = require('../src/services/notificacionService');
const ID_USUARIO = '11111111-1111-4111-8111-111111111111';
const ID_NOTIFICACION = '22222222-2222-4222-8222-222222222222';
const ID_OPORTUNIDAD = '33333333-3333-4333-8333-333333333333';

beforeEach(() => jest.resetAllMocks());

describe('Actividad 3.3.2 - Gestión de notificaciones', () => {
  test('normaliza los datos de una notificación al crearla', async () => {
    const fila = { id_notificacion: ID_NOTIFICACION };
    repo.crear.mockResolvedValue(fila);
    await expect(servicio.crearNotificacion({
      idUsuario: ID_USUARIO,
      titulo: ' Inscripción aceptada ',
      mensaje: ' Tu inscripción fue aceptada ',
      tipo: 'inscripcion_aceptada',
    })).resolves.toEqual(fila);
    expect(repo.crear).toHaveBeenCalledWith(
      ID_USUARIO,
      'Inscripción aceptada',
      'Tu inscripción fue aceptada',
      'INSCRIPCION_ACEPTADA'
    );
  });

  test('rechaza usuarios con identificador incorrecto', async () => {
    await expect(servicio.crearNotificacion({
      idUsuario: 'no-es-uuid',
      titulo: 'Aviso', mensaje: 'Mensaje', tipo: 'AVISO',
    })).rejects.toMatchObject({ status: 400 });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  test('rechaza títulos vacíos', async () => {
    await expect(servicio.crearNotificacion({
      idUsuario: ID_USUARIO, titulo: '  ', mensaje: 'Mensaje', tipo: 'AVISO',
    })).rejects.toMatchObject({ status: 400 });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  test('rechaza mensajes vacíos', async () => {
    await expect(servicio.crearNotificacion({
      idUsuario: ID_USUARIO, titulo: 'Aviso', mensaje: ' ', tipo: 'AVISO',
    })).rejects.toMatchObject({ status: 400 });
    expect(repo.crear).not.toHaveBeenCalled();
  });

  test('lista notificaciones con paginación predeterminada', async () => {
    const filas = [{ id_notificacion: ID_NOTIFICACION }];
    repo.listarPorUsuario.mockResolvedValue(filas);
    await expect(servicio.listarMisNotificaciones(ID_USUARIO))
      .resolves.toEqual(filas);
    expect(repo.listarPorUsuario).toHaveBeenCalledWith(ID_USUARIO, 30, 0);
  });

  test('respeta la paginación solicitada', async () => {
    repo.listarPorUsuario.mockResolvedValue([]);
    await servicio.listarMisNotificaciones(ID_USUARIO, {
      limite: 15, offset: 30,
    });
    expect(repo.listarPorUsuario).toHaveBeenCalledWith(ID_USUARIO, 15, 30);
  });

  test('rechaza límites fuera de rango', async () => {
    await expect(servicio.listarMisNotificaciones(ID_USUARIO, { limite: 101 }))
      .rejects.toMatchObject({ status: 400 });
    expect(repo.listarPorUsuario).not.toHaveBeenCalled();
  });

  test('rechaza desplazamientos negativos', async () => {
    await expect(servicio.listarMisNotificaciones(ID_USUARIO, { offset: -1 }))
      .rejects.toMatchObject({ status: 400 });
    expect(repo.listarPorUsuario).not.toHaveBeenCalled();
  });

  test('marca como leída la notificación propia', async () => {
    const fila = { id_notificacion: ID_NOTIFICACION, leida_en: new Date() };
    repo.marcarComoLeida.mockResolvedValue(fila);
    await expect(servicio.marcarComoLeida(ID_NOTIFICACION, ID_USUARIO))
      .resolves.toEqual(fila);
    expect(repo.marcarComoLeida).toHaveBeenCalledWith(
      ID_NOTIFICACION, ID_USUARIO
    );
  });

  test('devuelve 404 si la notificación no existe o no pertenece al usuario', async () => {
    repo.marcarComoLeida.mockResolvedValue(null);
    await expect(servicio.marcarComoLeida(ID_NOTIFICACION, ID_USUARIO))
      .rejects.toMatchObject({ status: 404 });
  });

  test('obtiene el contador de notificaciones no leídas', async () => {
    repo.contarNoLeidas.mockResolvedValue(3);
    await expect(servicio.contarMisNoLeidas(ID_USUARIO)).resolves.toBe(3);
    expect(repo.contarNoLeidas).toHaveBeenCalledWith(ID_USUARIO);
  });

  test('genera notificaciones de nueva oportunidad en la misma conexión', async () => {
    const db = { query: jest.fn() };
    const filas = [{ id_notificacion: ID_NOTIFICACION }];
    repo.crearPorOportunidadPublicada.mockResolvedValue(filas);
    await expect(servicio.generarPorNuevaOportunidad(ID_OPORTUNIDAD, db))
      .resolves.toEqual(filas);
    expect(repo.crearPorOportunidadPublicada).toHaveBeenCalledWith(
      ID_OPORTUNIDAD, db
    );
  });
});
