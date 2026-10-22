-- ======================================================
-- MIGRACIÓN 015
-- ESTADO SIN CONFIRMACIÓN PARA ENVÍOS PUSH
-- ACTIVIDAD 3.3.1
-- ======================================================

BEGIN;

-- Eliminar restricción anterior

ALTER TABLE envio_push
DROP CONSTRAINT chk_envio_push_estado;


-- Crear restricción actualizada

ALTER TABLE envio_push
ADD CONSTRAINT chk_envio_push_estado

CHECK (
    estado IN (
        'PENDIENTE',
        'EN_PROCESO',
        'ESPERANDO_RECIBO',
        'ACEPTADO_PROVEEDOR',
        'REINTENTAR',
        'ERROR_FINAL',
        'SIN_CONFIRMACION'
    )
);

COMMIT;