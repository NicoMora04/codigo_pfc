-- ============================================================
-- Migración 003
-- Ajustes finales de integridad y trazabilidad para perfiles públicos
-- Actividad 2.5.2 - Migraciones y contratos de API para perfiles
--
-- Decisiones:
-- - Dos plantillas activas de línea base: Clásica y Comunidad.
-- - Clásica será la plantilla predeterminada del backend.
-- - Orden y tipo de secciones sin duplicados por perfil.
-- - Imágenes controladas como LOGO, PORTADA o GALERIA.
-- - JPEG/PNG y límite técnico de 5 MiB por imagen de perfil.
-- - Historial auditable de ocultamiento y rehabilitación.
-- - Relación N:M organización-tipo de actividad.
--
-- No elimina información existente.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Plantillas iniciales de la línea base
-- ============================================================

INSERT INTO plantilla_perfil (
    codigo,
    nombre,
    version,
    descripcion,
    activo
)
VALUES
    (
        'clasica',
        'Clásica',
        '1.0',
        'Presentación institucional con portada y secciones ordenadas.',
        TRUE
    ),
    (
        'comunidad',
        'Comunidad',
        '1.0',
        'Presentación orientada a destacar impacto, participación y oportunidades.',
        TRUE
    )
ON CONFLICT (codigo, version)
DO UPDATE SET
    nombre = EXCLUDED.nombre,
    descripcion = EXCLUDED.descripcion,
    activo = TRUE,
    actualizada_en = NOW();

-- La línea base vigente limita el sistema a dos plantillas activas.
-- Las filas adicionales se conservan pero quedan inactivas.
UPDATE plantilla_perfil
SET
    activo = FALSE,
    actualizada_en = NOW()
WHERE codigo NOT IN ('clasica', 'comunidad')
  AND activo = TRUE;


-- ============================================================
-- 2. Integridad de secciones configurables
-- ============================================================

ALTER TABLE seccion_perfil_organizacion
ADD CONSTRAINT seccion_perfil_organizacion_perfil_tipo_key
UNIQUE (id_perfil_publico, tipo_seccion);

-- Se define como diferible para permitir reordenamientos atómicos,
-- por ejemplo intercambiar posiciones 1 y 2 dentro de una transacción.
ALTER TABLE seccion_perfil_organizacion
ADD CONSTRAINT seccion_perfil_organizacion_perfil_orden_key
UNIQUE (id_perfil_publico, orden)
DEFERRABLE INITIALLY DEFERRED;


-- ============================================================
-- 3. Integridad de imágenes
-- ============================================================

ALTER TABLE imagen_perfil_organizacion
ADD CONSTRAINT chk_imagen_perfil_tipo
CHECK (tipo IN ('LOGO', 'PORTADA', 'GALERIA'));

ALTER TABLE imagen_perfil_organizacion
ADD CONSTRAINT chk_imagen_perfil_mime
CHECK (
    mime_type IS NULL
    OR mime_type IN ('image/jpeg', 'image/png')
);

ALTER TABLE imagen_perfil_organizacion
ADD CONSTRAINT chk_imagen_perfil_tamano_max
CHECK (
    tamano_bytes IS NULL
    OR tamano_bytes <= 5242880
);

CREATE UNIQUE INDEX uq_imagen_perfil_logo
ON imagen_perfil_organizacion (id_perfil_publico)
WHERE tipo = 'LOGO';

CREATE UNIQUE INDEX uq_imagen_perfil_portada
ON imagen_perfil_organizacion (id_perfil_publico)
WHERE tipo = 'PORTADA';


-- ============================================================
-- 4. Historial de moderación
-- ============================================================

CREATE TABLE historial_moderacion_perfil (
    id_historial_moderacion UUID NOT NULL DEFAULT uuid_generate_v4(),
    id_perfil_publico UUID NOT NULL,
    accion VARCHAR(20) NOT NULL,
    estado_anterior VARCHAR(20) NOT NULL,
    estado_nuevo VARCHAR(20) NOT NULL,
    id_admin UUID NOT NULL,
    motivo TEXT,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT historial_moderacion_perfil_pkey
        PRIMARY KEY (id_historial_moderacion),

    CONSTRAINT fk_historial_moderacion_perfil
        FOREIGN KEY (id_perfil_publico)
        REFERENCES perfil_publico_organizacion (id_perfil_publico)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    -- El historial es evidencia de auditoría: no se permite eliminar
    -- físicamente al ADMIN si existen actuaciones referenciadas.
    CONSTRAINT fk_historial_moderacion_admin
        FOREIGN KEY (id_admin)
        REFERENCES usuario (id_usuario)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION,

    CONSTRAINT chk_historial_moderacion_accion
        CHECK (accion IN ('OCULTAR', 'REHABILITAR')),

    CONSTRAINT chk_historial_moderacion_transicion
        CHECK (
            (
                accion = 'OCULTAR'
                AND estado_anterior IN ('PUBLICADO', 'NO_PUBLICADO')
                AND estado_nuevo = 'OCULTO'
                AND motivo IS NOT NULL
                AND BTRIM(motivo) <> ''
            )
            OR
            (
                accion = 'REHABILITAR'
                AND estado_anterior = 'OCULTO'
                AND estado_nuevo IN ('PUBLICADO', 'NO_PUBLICADO')
            )
        )
);

CREATE INDEX idx_historial_moderacion_perfil_fecha
ON historial_moderacion_perfil (id_perfil_publico, creado_en DESC);

-- Si ya existiera un perfil actualmente oculto al aplicar la migración,
-- se conserva la medida disponible como primer evento histórico.
INSERT INTO historial_moderacion_perfil (
    id_perfil_publico,
    accion,
    estado_anterior,
    estado_nuevo,
    id_admin,
    motivo,
    creado_en
)
SELECT
    p.id_perfil_publico,
    'OCULTAR',
    p.estado_publicacion_anterior,
    'OCULTO',
    p.ocultado_por,
    p.motivo_ocultamiento,
    p.ocultado_en
FROM perfil_publico_organizacion p
WHERE p.estado_publicacion = 'OCULTO'
  AND p.estado_publicacion_anterior IN ('PUBLICADO', 'NO_PUBLICADO')
  AND p.ocultado_por IS NOT NULL
  AND p.ocultado_en IS NOT NULL
  AND p.motivo_ocultamiento IS NOT NULL
  AND BTRIM(p.motivo_ocultamiento) <> ''
  AND NOT EXISTS (
      SELECT 1
      FROM historial_moderacion_perfil h
      WHERE h.id_perfil_publico = p.id_perfil_publico
        AND h.accion = 'OCULTAR'
        AND h.creado_en = p.ocultado_en
  );


-- ============================================================
-- 5. Tipos de actividad declarados por organización
-- ============================================================

CREATE TABLE organizacion_tipo_actividad (
    id_organizacion UUID NOT NULL,
    id_tipo_actividad SMALLINT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT organizacion_tipo_actividad_pkey
        PRIMARY KEY (id_organizacion, id_tipo_actividad),

    CONSTRAINT fk_organizacion_tipo_actividad_organizacion
        FOREIGN KEY (id_organizacion)
        REFERENCES organizacion (id_organizacion)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT fk_organizacion_tipo_actividad_tipo
        FOREIGN KEY (id_tipo_actividad)
        REFERENCES tipo_actividad (id_tipo_actividad)
        ON DELETE NO ACTION
        ON UPDATE NO ACTION
);

CREATE INDEX idx_organizacion_tipo_actividad_tipo
ON organizacion_tipo_actividad (id_tipo_actividad);

COMMIT;
