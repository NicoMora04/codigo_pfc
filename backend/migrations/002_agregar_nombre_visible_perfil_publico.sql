-- ============================================================
-- Migración 002
-- Incorporación del nombre visible al perfil público
--
-- Actividad 2.5.2 - Migraciones y contratos de API para perfiles
--
-- El nombre visible forma parte del contenido público editable
-- y se mantiene separado de la razón social administrativa.
-- ============================================================

BEGIN;

ALTER TABLE perfil_publico_organizacion
ADD COLUMN nombre_visible VARCHAR(150);

COMMIT;