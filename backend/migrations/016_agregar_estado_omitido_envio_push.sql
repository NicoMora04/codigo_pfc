-- ======================================================
-- MIGRACIÓN 016
-- ESTADO OMITIDO PARA ENVÍOS PUSH
-- ACTIVIDAD 3.3.1
-- ======================================================

BEGIN;

-- Eliminar restricción de estados anterior

ALTER TABLE envio_push
DROP CONSTRAINT chk_envio_push_estado;


-- Incorporar estado OMITIDO

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
        'SIN_CONFIRMACION',
        'OMITIDO'
    )
);

COMMIT;