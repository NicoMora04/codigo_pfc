-- ======================================================
-- MIGRACIÓN 012
-- Sistema de notificaciones
-- Actividad 3.3
-- ======================================================

BEGIN;

-- ======================================================
-- 1. TABLA NOTIFICACION
-- ======================================================

CREATE TABLE notificacion (

    id_notificacion UUID
        PRIMARY KEY
        DEFAULT uuid_generate_v4(),

    id_usuario UUID NOT NULL,

    titulo VARCHAR(180) NOT NULL,

    mensaje TEXT NOT NULL,

    tipo VARCHAR(50) NOT NULL,

    creada_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    leida_en TIMESTAMPTZ,

    -- Relación con el usuario destinatario
    CONSTRAINT fk_notificacion_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE

);


-- ======================================================
-- 2. TABLA TOKEN DISPOSITIVO
-- ======================================================

CREATE TABLE token_dispositivo (

    id_token_dispositivo UUID
        PRIMARY KEY
        DEFAULT uuid_generate_v4(),

    id_usuario UUID NOT NULL,

    token TEXT NOT NULL,

    plataforma VARCHAR(30) NOT NULL,

    activo BOOLEAN
        NOT NULL
        DEFAULT TRUE,

    registrado_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    actualizado_en TIMESTAMPTZ
        NOT NULL
        DEFAULT NOW(),

    -- Relación con el usuario
    CONSTRAINT fk_token_dispositivo_usuario
        FOREIGN KEY (id_usuario)
        REFERENCES usuario(id_usuario)
        ON DELETE CASCADE,

    -- Un mismo token no puede registrarse dos veces
    CONSTRAINT uq_token_dispositivo_token
        UNIQUE (token)

);


-- ======================================================
-- 3. ÍNDICES
-- ======================================================

-- Consultar notificaciones de un usuario
-- ordenadas por fecha

CREATE INDEX idx_notificacion_usuario_fecha
    ON notificacion (
        id_usuario,
        creada_en DESC
    );


-- Consultar notificaciones no leídas

CREATE INDEX idx_notificacion_no_leidas
    ON notificacion (id_usuario)
    WHERE leida_en IS NULL;


-- Consultar dispositivos activos de un usuario

CREATE INDEX idx_token_dispositivo_usuario_activo
    ON token_dispositivo (id_usuario)
    WHERE activo = TRUE;


COMMIT;