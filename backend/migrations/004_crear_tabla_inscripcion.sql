CREATE TABLE inscripcion (
    id_inscripcion UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    id_oportunidad UUID NOT NULL,
    id_voluntario UUID NOT NULL,

    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',

    inscrita_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    respondida_en TIMESTAMPTZ,
    actualizada_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_inscripcion_oportunidad
        FOREIGN KEY (id_oportunidad)
        REFERENCES oportunidad(id_oportunidad),

    CONSTRAINT fk_inscripcion_voluntario
        FOREIGN KEY (id_voluntario)
        REFERENCES perfil_voluntario(id_usuario),

    CONSTRAINT uq_inscripcion_oportunidad_voluntario
        UNIQUE (id_oportunidad, id_voluntario),

    CONSTRAINT ck_inscripcion_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'ACEPTADA',
                'RECHAZADA',
                'CANCELADA',
                'COMPLETADA',
                'AUSENTE'
            )
        )
);