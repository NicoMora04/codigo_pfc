-- ======================================================
-- MIGRACIÓN 013
-- Referencia de oportunidades en notificaciones
-- Actividad 3.3.1
-- ======================================================

BEGIN;


-- ======================================================
-- 1. AGREGAR REFERENCIA A OPORTUNIDAD
-- ======================================================

ALTER TABLE notificacion

ADD COLUMN id_oportunidad UUID;


-- ======================================================
-- 2. RELACIÓN CON OPORTUNIDAD
-- ======================================================

ALTER TABLE notificacion

ADD CONSTRAINT fk_notificacion_oportunidad

FOREIGN KEY (id_oportunidad)

REFERENCES oportunidad(id_oportunidad);


-- ======================================================
-- 3. EVITAR NOTIFICACIONES DUPLICADAS
-- ======================================================

ALTER TABLE notificacion

ADD CONSTRAINT uq_notificacion_usuario_tipo_oportunidad

UNIQUE (
    id_usuario,
    tipo,
    id_oportunidad
);


COMMIT;