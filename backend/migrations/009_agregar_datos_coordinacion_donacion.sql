-- ======================================================
-- MIGRACIÓN 009
-- Datos de coordinación de entrega para donaciones
-- ======================================================

ALTER TABLE donacion
ADD COLUMN detalle_coordinacion TEXT,
ADD COLUMN telefono_contacto VARCHAR(30);