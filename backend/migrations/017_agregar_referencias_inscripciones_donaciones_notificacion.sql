-- ======================================================
-- MIGRACIÓN 017
-- Referencias de inscripciones y donaciones
-- en el sistema de notificaciones
-- Actividad 3.3.2
-- ======================================================

BEGIN;

-- ======================================================
-- 1. AGREGAR REFERENCIA A INSCRIPCIÓN
-- ======================================================

ALTER TABLE notificacion
ADD COLUMN id_inscripcion UUID;

ALTER TABLE notificacion
ADD CONSTRAINT fk_notificacion_inscripcion
FOREIGN KEY (id_inscripcion)
REFERENCES inscripcion(id_inscripcion);


-- ======================================================
-- 2. AGREGAR REFERENCIA A DONACIÓN
-- ======================================================

ALTER TABLE notificacion
ADD COLUMN id_donacion UUID;

ALTER TABLE notificacion
ADD CONSTRAINT fk_notificacion_donacion
FOREIGN KEY (id_donacion)
REFERENCES donacion(id_donacion);


-- ======================================================
-- 3. EVITAR NOTIFICACIONES DUPLICADAS
-- ======================================================

-- Una inscripción no debe generar dos notificaciones
-- del mismo tipo para el mismo destinatario.

ALTER TABLE notificacion
ADD CONSTRAINT uq_notificacion_usuario_tipo_inscripcion
UNIQUE (
    id_usuario,
    tipo,
    id_inscripcion
);


-- Una donación no debe generar dos notificaciones
-- del mismo tipo para el mismo destinatario.

ALTER TABLE notificacion
ADD CONSTRAINT uq_notificacion_usuario_tipo_donacion
UNIQUE (
    id_usuario,
    tipo,
    id_donacion
);


-- ======================================================
-- 4. ÍNDICES DE REFERENCIA
-- ======================================================

CREATE INDEX idx_notificacion_inscripcion
ON notificacion(id_inscripcion)
WHERE id_inscripcion IS NOT NULL;


CREATE INDEX idx_notificacion_donacion
ON notificacion(id_donacion)
WHERE id_donacion IS NOT NULL;


COMMIT;