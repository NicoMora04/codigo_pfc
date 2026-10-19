-- ======================================================
-- MIGRACIÓN 010
-- Sistema de reputación bidireccional
-- Actividad 3.2
-- ======================================================

BEGIN;

CREATE TABLE calificacion (

    id_calificacion UUID
        PRIMARY KEY
        DEFAULT uuid_generate_v4(),

    id_inscripcion UUID NOT NULL,

    autor_rol VARCHAR(20) NOT NULL,

    puntuacion SMALLINT NOT NULL,

    comentario TEXT,

    creada_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    -- Relación con la inscripción
    CONSTRAINT fk_calificacion_inscripcion
        FOREIGN KEY (id_inscripcion)
        REFERENCES inscripcion(id_inscripcion),

    -- Roles autorizados para calificar
    CONSTRAINT ck_calificacion_autor_rol
        CHECK (
            autor_rol IN (
                'VOLUNTARIO',
                'ORGANIZACION'
            )
        ),

    -- Puntuación entre 1 y 5 estrellas
    CONSTRAINT ck_calificacion_puntuacion
        CHECK (
            puntuacion BETWEEN 1 AND 5
        ),

    -- Una calificación por dirección e inscripción
    CONSTRAINT uq_calificacion_inscripcion_autor
        UNIQUE (
            id_inscripcion,
            autor_rol
        )

);

COMMIT;