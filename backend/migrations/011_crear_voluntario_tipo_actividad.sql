BEGIN;

-- ============================================================
-- Migración 011
-- Intereses de tipos de actividad del voluntario
--
-- Actividad 3.1.2 - Motor de recomendación basado en reglas
--
-- Permite asociar cada voluntario con uno o más tipos de
-- actividad que representen sus intereses declarados.
-- ============================================================

CREATE TABLE voluntario_tipo_actividad (
    id_voluntario UUID NOT NULL,
    id_tipo_actividad SMALLINT NOT NULL,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT voluntario_tipo_actividad_pkey
        PRIMARY KEY (
            id_voluntario,
            id_tipo_actividad
        ),

    CONSTRAINT fk_voluntario_tipo_actividad_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES perfil_voluntario(id_usuario)
        ON DELETE CASCADE
        ON UPDATE NO ACTION,

    CONSTRAINT fk_voluntario_tipo_actividad_tipo
        FOREIGN KEY (id_tipo_actividad)
        REFERENCES tipo_actividad(id_tipo_actividad)
        ON DELETE CASCADE
        ON UPDATE NO ACTION
);

CREATE INDEX idx_voluntario_tipo_actividad_tipo
    ON voluntario_tipo_actividad(id_tipo_actividad);

COMMIT;