-- ======================================================
-- MIGRACIÓN 014
-- COLA PERSISTENTE DE NOTIFICACIONES PUSH
-- ACTIVIDAD 3.3.1
-- ======================================================

BEGIN;


-- ======================================================
-- 1. TABLA ENVIO_PUSH
-- ======================================================

CREATE TABLE envio_push (

    id_envio_push UUID
        PRIMARY KEY
        DEFAULT uuid_generate_v4(),

    id_notificacion UUID NOT NULL,

    id_token_dispositivo UUID NOT NULL,

    estado VARCHAR(30)
        NOT NULL
        DEFAULT 'PENDIENTE',

    intentos INTEGER
        NOT NULL
        DEFAULT 0,

    proximo_intento_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    bloqueado_hasta TIMESTAMPTZ,

    expo_ticket_id TEXT,

    enviado_en TIMESTAMPTZ,

    confirmado_en TIMESTAMPTZ,

    ultimo_error TEXT,

    creado_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    actualizado_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),


    -- ==================================================
    -- RELACIONES
    -- ==================================================

    CONSTRAINT fk_envio_push_notificacion
        FOREIGN KEY (id_notificacion)
        REFERENCES notificacion(id_notificacion)
        ON DELETE CASCADE,


    CONSTRAINT fk_envio_push_dispositivo
        FOREIGN KEY (id_token_dispositivo)
        REFERENCES token_dispositivo(id_token_dispositivo)
        ON DELETE CASCADE,


    -- ==================================================
    -- EVITAR REGISTROS DUPLICADOS
    -- ==================================================

    CONSTRAINT uq_envio_push_notificacion_dispositivo
        UNIQUE (
            id_notificacion,
            id_token_dispositivo
        ),


    -- ==================================================
    -- VALIDAR ESTADOS
    -- ==================================================

    CONSTRAINT chk_envio_push_estado
        CHECK (
            estado IN (
                'PENDIENTE',
                'EN_PROCESO',
                'ESPERANDO_RECIBO',
                'ACEPTADO_PROVEEDOR',
                'REINTENTAR',
                'ERROR_FINAL'
            )
        ),


    CONSTRAINT chk_envio_push_intentos
        CHECK (
            intentos >= 0
        )

);


-- ======================================================
-- 2. ÍNDICES
-- ======================================================

CREATE INDEX idx_envio_push_pendientes
    ON envio_push (
        proximo_intento_en,
        creado_en
    )
    WHERE estado IN (
        'PENDIENTE',
        'REINTENTAR'
    );


CREATE INDEX idx_envio_push_recibos
    ON envio_push (
        enviado_en
    )
    WHERE estado = 'ESPERANDO_RECIBO';


CREATE INDEX idx_envio_push_bloqueados
    ON envio_push (
        bloqueado_hasta
    )
    WHERE estado = 'EN_PROCESO';


COMMIT;