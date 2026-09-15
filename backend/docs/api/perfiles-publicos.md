# Contratos API — Perfiles públicos de organizaciones

Actividad 2.5.2 — Migraciones y contratos de API para perfiles.

Los endpoints protegidos de gestión del perfil utilizan la identidad obtenida
del JWT. No reciben `id_organizacion` desde el cliente para decidir qué perfil
puede consultar o modificar una organización.

---

## 1. Consultar perfil propio

### Endpoint

GET /api/organizaciones/mi-perfil

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.

### Objetivo

Obtener la información necesaria para cargar el editor del perfil público de
la organización autenticada.

La organización se determina a partir del usuario autenticado y no mediante
un identificador enviado por el cliente.

### Parámetros

No recibe parámetros de ruta ni cuerpo de solicitud.

### Respuesta — perfil existente

HTTP 200

```json
{
  "organizacion": {
    "razon_social": "Actitud Solidaria",
    "estado_verificacion": "VERIFICADA"
  },
{
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "descripcion_publica": "Construimos comunidad mediante distintas iniciativas solidarias.",
    "slug": "actitud-solidaria",
    "email_contacto_publico": "contacto@actitudsolidaria.org",
    "telefono_contacto_publico": "+54 342 555 0182",
    "sitio_web_url": "https://actitudsolidaria.org",
    "redes_sociales": {
      "instagram": "https://instagram.com/actitudsolidaria"
    },
    "horario_atencion": {
      "texto": "Lunes a viernes de 09:00 a 17:00"
    },
    "estado_publicacion": "BORRADOR",
    "plantilla": {
      "codigo": "clasica",
      "nombre": "Clásica",
      "version": "1.0"
    },
    "tipos_actividad": [
      {
        "id_tipo_actividad": 1,
        "nombre": "Asistencia social"
      }
    ],
    "imagenes": [],
    "secciones": [
      {
        "id_seccion": "uuid",
        "tipo_seccion": "QUIENES_SOMOS",
        "titulo": "Quiénes somos",
        "contenido": {
          "texto": ""
        },
        "orden": 1,
        "visible": true
      },
      {
        "id_seccion": "uuid",
        "tipo_seccion": "AREAS_TRABAJO",
        "titulo": "Áreas de trabajo",
        "contenido": {},
        "orden": 2,
        "visible": true
      },
      {
        "id_seccion": "uuid",
        "tipo_seccion": "OPORTUNIDADES",
        "titulo": "Oportunidades",
        "contenido": {},
        "orden": 3,
        "visible": true
      },
      {
        "id_seccion": "uuid",
        "tipo_seccion": "GALERIA",
        "titulo": "Galería",
        "contenido": {},
        "orden": 4,
        "visible": true
      }
    ]
  }
}
{
  "organizacion": {
    "razon_social": "Actitud Solidaria",
    "estado_verificacion": "VERIFICADA"
  },
  "perfil": null
}
{
  "error": "Token inválido o no proporcionado"
}
{
  "error": "Acceso denegado"
}
{
  "error": "La organización debe estar activa y verificada"
}
{
  "error": "Organización no encontrada"
}
{
  "error": "No se pudo obtener el perfil público"
}

### Por qué usamos `200` con `perfil: null`

Esto es intencional. Según el modelo vigente, la relación es:

```text
Organizacion 1 ───── 0..1 PerfilPublicoOrganizacion

perfil != null → cargar editor existente
perfil == null → ofrecer creación del perfil

---

## 2. Crear perfil propio

### Endpoint

POST /api/organizaciones/mi-perfil

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- La organización no debe poseer todavía un perfil público.

### Objetivo

Crear el único perfil público asociado a la organización autenticada.

El perfil se crea inicialmente en estado:

```text
BORRADOR
```

y no queda visible en el portal público hasta que la organización ejecute
posteriormente la operación de publicación.

### Cuerpo de la solicitud

Ejemplo:

```json
{
  "nombre_visible": "Actitud Solidaria",
  "descripcion_publica": "Organización dedicada al acompañamiento comunitario.",
  "slug": "actitud-solidaria",
  "email_contacto_publico": "contacto@actitudsolidaria.org",
  "telefono_contacto_publico": "+54 342 555 0182",
  "sitio_web_url": "https://actitudsolidaria.org",
  "redes_sociales": {
    "instagram": "https://instagram.com/actitudsolidaria"
  },
  "horario_atencion": {
    "texto": "Lunes a viernes de 09:00 a 17:00"
  }
}
```

### Campos requeridos

Se requieren:

- `nombre_visible`;
- `descripcion_publica`;
- `slug`;
- al menos un medio de contacto público autorizado.

Se considera medio de contacto válido cualquiera de los siguientes:

- `email_contacto_publico`;
- `telefono_contacto_publico`;
- `sitio_web_url`.

### Campos opcionales

Pueden informarse:

- `email_contacto_publico`, cuando ya exista otro medio de contacto;
- `telefono_contacto_publico`, cuando ya exista otro medio de contacto;
- `sitio_web_url`, cuando ya exista otro medio de contacto;
- `redes_sociales`;
- `horario_atencion`.

Cuando no se informen estructuras configurables:

```text
redes_sociales
horario_atencion
```

el backend podrá utilizar sus estructuras vacías predeterminadas.

### Campos no admitidos desde el cliente

El cliente no puede establecer manualmente:

- `id_perfil_publico`;
- `id_organizacion`;
- `id_plantilla`;
- `estado_publicacion`;
- `publicado_en`;
- `retirado_en`;
- `ocultado_por`;
- `ocultado_en`;
- `motivo_ocultamiento`;
- `estado_publicacion_anterior`;
- `creado_en`;
- `actualizado_en`.

Estos valores son administrados exclusivamente por el backend y la base de
datos.

### Plantilla inicial

La organización no selecciona la plantilla durante la creación inicial del
perfil.

El backend asigna automáticamente la plantilla activa:

```text
codigo  = clasica
version = 1.0
```

correspondiente a:

```text
nombre = Clásica
```

Esta decisión mantiene la creación del perfil separada de la selección y
previsualización de plantillas.

La organización puede cambiar posteriormente la presentación mediante:

```text
PATCH /api/organizaciones/mi-perfil/plantilla
```

utilizando alguna de las plantillas activas disponibles.

### Estado inicial

Todo perfil creado mediante este endpoint debe comenzar con:

```text
estado_publicacion = BORRADOR
```

El cliente no puede solicitar su creación directamente como:

```text
PUBLICADO
NO_PUBLICADO
OCULTO
```

La publicación es una operación posterior y explícita.

### Reglas del slug

El `slug`:

- es obligatorio durante la creación;
- debe ser único;
- debe escribirse en minúsculas;
- solo admite letras minúsculas, números y guiones;
- no puede comenzar ni terminar con guion;
- se utiliza como dirección pública estable del perfil.

Formato:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Ejemplo válido:

```text
actitud-solidaria
```

Ejemplos inválidos:

```text
Actitud Solidaria
actitud_solidaria
-actitud-solidaria
actitud-solidaria-
```

La dirección pública futura será:

```text
/organizaciones/actitud-solidaria
```

Modificar posteriormente el nombre visible de la organización no modifica
automáticamente este `slug`.

### Validaciones

El backend debe comprobar que:

- el usuario autenticado posea rol `ORGANIZACION`;
- la cuenta se encuentre activa;
- la organización se encuentre verificada;
- la organización exista;
- la organización todavía no posea un perfil público;
- `nombre_visible` tenga un formato válido;
- `descripcion_publica` sea válida;
- el `slug` cumpla el formato establecido;
- el `slug` no se encuentre utilizado por otro perfil;
- exista al menos un medio de contacto público válido;
- los datos configurables se encuentren sanitizados;
- la plantilla `clasica` versión `1.0` exista y se encuentre activa.

### Respuesta satisfactoria

HTTP 201

```json
{
  "message": "Perfil público creado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "descripcion_publica": "Organización dedicada al acompañamiento comunitario.",
    "slug": "actitud-solidaria",
    "email_contacto_publico": "contacto@actitudsolidaria.org",
    "telefono_contacto_publico": "+54 342 555 0182",
    "sitio_web_url": "https://actitudsolidaria.org",
    "redes_sociales": {
      "instagram": "https://instagram.com/actitudsolidaria"
    },
    "horario_atencion": {
      "texto": "Lunes a viernes de 09:00 a 17:00"
    },
    "estado_publicacion": "BORRADOR",
    "plantilla": {
      "codigo": "clasica",
      "nombre": "Clásica",
      "version": "1.0"
    },
    "publicado_en": null,
    "retirado_en": null,
    "imagenes": [],
    "secciones": [
  {
    "tipo_seccion": "QUIENES_SOMOS",
    "titulo": "Quiénes somos",
    "contenido": {
      "texto": ""
    },
    "orden": 1,
    "visible": true
  },
  {
    "tipo_seccion": "AREAS_TRABAJO",
    "titulo": "Áreas de trabajo",
    "contenido": {},
    "orden": 2,
    "visible": true
  },
  {
    "tipo_seccion": "OPORTUNIDADES",
    "titulo": "Oportunidades",
    "contenido": {},
    "orden": 3,
    "visible": true
  },
  {
    "tipo_seccion": "GALERIA",
    "titulo": "Galería",
    "contenido": {},
    "orden": 4,
    "visible": true
  }
]
    "creado_en": "2026-09-15T10:00:00-03:00",
    "actualizado_en": "2026-09-15T10:00:00-03:00"
  }
}
```

### Errores

#### Datos obligatorios ausentes o inválidos

HTTP 400

```json
{
  "error": "Los datos del perfil son inválidos"
}
```

#### Slug con formato inválido

HTTP 400

```json
{
  "error": "La dirección pública indicada no es válida"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Organización inexistente

HTTP 404

```json
{
  "error": "Organización no encontrada"
}
```

#### La organización ya posee un perfil

HTTP 409

```json
{
  "error": "La organización ya posee un perfil público"
}
```

#### Slug ya utilizado

HTTP 409

```json
{
  "error": "La dirección pública indicada ya se encuentra en uso"
}
```

#### Plantilla predeterminada no disponible

HTTP 500

```json
{
  "error": "No se encuentra disponible la plantilla predeterminada del sistema"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo crear el perfil público"
}
```

### Reglas de negocio

- Cada organización puede poseer como máximo un perfil público.
- La organización se determina mediante la identidad contenida en el JWT.
- El cliente no puede indicar manualmente `id_organizacion`.
- El perfil siempre se crea en estado `BORRADOR`.
- La creación del perfil no implica su publicación.
- El backend asigna automáticamente la plantilla `clasica` versión `1.0`.
- El cliente no selecciona `id_plantilla` durante la creación.
- El perfil debe poseer un `slug` único y estable.
- El `slug` no cambia automáticamente cuando cambia `nombre_visible`.
- Debe existir al menos un medio de contacto público válido.
- Los datos configurables deben validarse y sanitizarse.
- No se admite HTML, CSS ni JavaScript personalizado.
- El perfil creado no aparece en las consultas públicas hasta pasar
  explícitamente a `PUBLICADO`.
- La operación debe ser atómica.

### Atomicidad

La creación debe realizarse como una única operación lógica.

Conceptualmente:

```text
BEGIN

1. validar organización;
2. verificar que no exista otro perfil;
3. obtener plantilla activa clasica versión 1.0;
4. validar unicidad del slug;
5. crear perfil en BORRADOR;
6. crear las cuatro secciones controladas del perfil;
7. asociar la plantilla predeterminada;

COMMIT
```

Ante cualquier error:

```text
ROLLBACK
```

No debe quedar un perfil creado parcialmente.

### Trazabilidad

- RF-20 — Dirección pública única y estable.
- RF-21 — Gestión exclusiva del perfil propio.
- RF-22 — Uso de plantillas predefinidas.
- RF-23 — Estados de publicación.
- RNF-16 — Validación y sanitización del contenido configurable.
- RNF-17 — Dirección pública estable sin identificadores internos.
- CU-21 — Gestionar perfil público.
- CU-22 — Seleccionar y previsualizar plantilla.
- CP-PRF-001 — Creación única del perfil en estado BORRADOR.
- CP-PRF-003 — Gestión exclusiva del perfil propio.
- CP-WEB-007 — Dirección pública estable.
- WEB-05 — Editor del perfil.
- WEB-06 — Selección posterior de plantilla.
---
## 3. Editar perfil propio

### Endpoint

PATCH /api/organizaciones/mi-perfil

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Actualizar parcialmente el contenido público del perfil perteneciente a la
organización autenticada.

La organización se obtiene a partir del JWT y no mediante un identificador
enviado por el cliente.

Este endpoint modifica contenido, pero no cambia el estado de publicación,
la plantilla seleccionada ni los datos de moderación.

### Cuerpo de la solicitud

PATCH admite actualizaciones parciales.

Ejemplo:

```json
{
  "nombre_visible": "Actitud Solidaria Santa Fe",
  "descripcion_publica": "Acompañamos iniciativas comunitarias en Santa Fe.",
  "telefono_contacto_publico": "+54 342 555 0199",
  "redes_sociales": {
    "instagram": "https://instagram.com/actitudsolidaria",
    "facebook": "https://facebook.com/actitudsolidaria"
  }
}
```

Los campos omitidos conservan su valor anterior.

Los campos opcionales que admitan ausencia de contenido podrán enviarse
explícitamente como `null` cuando corresponda.

### Campos editables

- `nombre_visible`
- `descripcion_publica`
- `email_contacto_publico`
- `telefono_contacto_publico`
- `sitio_web_url`
- `redes_sociales`
- `horario_atencion`

### Campos no editables mediante este endpoint

No pueden modificarse:

- `id_perfil_publico`
- `id_organizacion`
- `id_plantilla`
- `slug`
- `estado_publicacion`
- `publicado_en`
- `retirado_en`
- `ocultado_por`
- `ocultado_en`
- `motivo_ocultamiento`
- `estado_publicacion_anterior`
- `creado_en`
- `actualizado_en`

Las imágenes, secciones configurables, plantilla y estado de publicación se
gestionan mediante contratos específicos.

### Regla de estabilidad del slug

El `slug` definido al crear el perfil permanece estable.

Modificar:

```text
nombre_visible
```

no modifica:

```text
slug
```

Ejemplo:

```text
Nombre anterior:
Actitud Solidaria

Nombre nuevo:
Actitud Solidaria Santa Fe

URL:
 /organizaciones/actitud-solidaria
```

La dirección pública permanece sin cambios.

### Validaciones

El backend debe:

- validar tipos y longitudes;
- eliminar espacios innecesarios al inicio y al final;
- validar formato de correo electrónico cuando se informe;
- validar URLs cuando se informe un sitio web o una red social;
- comprobar que `redes_sociales` sea un objeto JSON válido;
- comprobar que `horario_atencion` sea un objeto JSON válido;
- validar y sanitizar todo contenido configurable;
- rechazar HTML, CSS o JavaScript personalizado;
- rechazar campos protegidos enviados por el cliente.

Si el perfil se encuentra `PUBLICADO`, la actualización no debe dejar el
perfil visible con contenido que incumpla las reglas mínimas de publicación.

### Estados admitidos

La edición del contenido no cambia automáticamente `estado_publicacion`.

Por lo tanto, el perfil conserva su estado previo:

```text
BORRADOR
PUBLICADO
NO_PUBLICADO
OCULTO
```

Un perfil `OCULTO` puede conservar y corregir su contenido, pero permanece
fuera de la vista pública hasta que un ADMIN realice la rehabilitación
correspondiente.

### Estados que permiten edición

La edición del contenido del perfil se permite cuando:

-BORRADOR
-NO_PUBLICADO
-OCULTO


### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Perfil público actualizado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria Santa Fe",
    "slug": "actitud-solidaria",
    "descripcion_publica": "Acompañamos iniciativas comunitarias en Santa Fe.",
    "email_contacto_publico": "contacto@actitudsolidaria.org",
    "telefono_contacto_publico": "+54 342 555 0199",
    "sitio_web_url": "https://actitudsolidaria.org",
    "redes_sociales": {
      "instagram": "https://instagram.com/actitudsolidaria",
      "facebook": "https://facebook.com/actitudsolidaria"
    },
    "horario_atencion": {
      "texto": "Lunes a viernes de 09:00 a 17:00"
    },
    "estado_publicacion": "BORRADOR",
    "actualizado_en": "2026-09-15T10:45:00-03:00"
  }
}
```

### Errores

#### No se enviaron campos editables

HTTP 400

```json
{
  "error": "No se proporcionaron campos válidos para actualizar"
}
```

#### Datos inválidos

HTTP 400

```json
{
  "error": "Los datos del perfil público son inválidos"
}
```

#### Intento de modificar un campo protegido

HTTP 400

```json
{
  "error": "La solicitud contiene campos que no pueden modificarse"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil propio inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### La modificación dejaría inválido un perfil publicado

HTTP 409

```json
{
  "error": "La modificación dejaría el perfil publicado en un estado inválido"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo actualizar el perfil público"
}
```

```markdown
#### Perfil actualmente publicado

HTTP 409

```json
{
  "error": "Retire el perfil de la vista pública antes de modificar su contenido"
}


### Reglas de negocio

- La organización solo puede modificar su propio perfil.
- La propiedad se determina utilizando la identidad del JWT.
- No se recibe `id_organizacion` ni `id_perfil_publico` para seleccionar el
  recurso a modificar.
- PATCH modifica únicamente los campos enviados.
- El `slug` permanece estable después de la creación.
- Modificar `nombre_visible` no modifica la dirección pública.
- La edición no cambia el estado de publicación.
- La edición no cambia la plantilla seleccionada.
- La edición no modifica datos de moderación.
- Un perfil `NO_PUBLICADO` conserva su contenido y continúa siendo editable.
- Un perfil `OCULTO` conserva su contenido, pero la edición no rehabilita su
  visibilidad pública.
- Todo contenido configurable debe validarse y sanitizarse antes de persistirse.
- La operación debe actualizar `actualizado_en`.

### Trazabilidad

- RF-21 — Gestión exclusiva del contenido propio.
- RF-23 — Conservación del contenido fuera de la vista pública.
- RNF-16 — Validación y sanitización del contenido configurable.
- RNF-17 — Dirección única y estable.
- CU-21 — Gestionar perfil público.
- CP-PRF-002 — Edición del perfil propio.
- CP-PRF-003 — Imposibilidad de editar perfiles ajenos.
- CP-PRF-008 — Conservación del contenido al retirar el perfil.
- CA-15 — Edición exclusiva del perfil propio.
- WEB-05 — Editor de perfil público.

---

## 4. Publicar perfil propio

### Endpoint

PATCH /api/organizaciones/mi-perfil/publicar

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Cambiar el perfil público de la organización autenticada al estado
`PUBLICADO`.

La publicación constituye una operación explícita y separada de la edición
del contenido.

Un perfil en estado `BORRADOR` o `NO_PUBLICADO` puede ser publicado cuando
cumple todas las condiciones mínimas requeridas.

### Cuerpo de la solicitud

No requiere cuerpo.

```json
{}
```

La organización, el perfil y el estado actual se determinan en el backend a
partir del usuario autenticado.

### Condiciones previas

Para poder publicar, el perfil debe poseer:

- `nombre_visible`;
- `descripcion_publica`;
- `slug` válido y único;
- una plantilla activa;
- al menos un medio de contacto público válido.

Además:

- la organización debe encontrarse activa y verificada;
- el perfil no puede encontrarse en estado `OCULTO`;
- los datos configurables deben superar las validaciones de seguridad y
  formato.

Las imágenes y secciones configurables no son obligatorias para realizar la
primera publicación.

### Transiciones permitidas

```text
BORRADOR      → PUBLICADO
NO_PUBLICADO  → PUBLICADO
```

No se permite publicar directamente un perfil en estado:

```text
OCULTO
```

porque su rehabilitación corresponde exclusivamente al ADMIN.

### Cambios realizados

Al publicar:

```text
estado_publicacion = PUBLICADO
publicado_en        = fecha y hora actual
retirado_en         = NULL
actualizado_en      = fecha y hora actual
```

`publicado_en` representa el momento de la publicación vigente. Si un perfil
fue retirado y posteriormente vuelve a publicarse, se actualiza con la nueva
fecha de publicación.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Perfil público publicado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "PUBLICADO",
    "publicado_en": "2026-09-15T11:00:00-03:00",
    "retirado_en": null,
    "actualizado_en": "2026-09-15T11:00:00-03:00"
  }
}
```

### Errores

#### Perfil incompleto

HTTP 400

```json
{
  "error": "El perfil no cumple las condiciones mínimas para ser publicado"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil oculto por moderación

HTTP 409

```json
{
  "error": "El perfil se encuentra oculto por moderación y no puede publicarse"
}
```

#### Perfil ya publicado

HTTP 409

```json
{
  "error": "El perfil ya se encuentra publicado"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo publicar el perfil público"
}
```

### Reglas de negocio

La organización solo puede publicar su propio perfil.

El `id_organizacion` y el perfil correspondiente se obtienen utilizando la
identidad del JWT.

La publicación no modifica el contenido, la plantilla, las imágenes ni las
secciones existentes.

Un perfil `OCULTO` no puede ser publicado por la organización hasta que un
ADMIN lo rehabilite.

Solo los perfiles en estado `PUBLICADO` pueden ser expuestos posteriormente
mediante la API pública para visitantes.

La operación debe ser atómica.

### Trazabilidad

- RF-21 — Gestión exclusiva del perfil propio.
- RF-23 — Publicación y retiro del perfil.
- RF-24 — Moderación administrativa.
- CU-21 — Gestionar perfil público.
- CP-PRF-008 — Publicación y retiro conservando el contenido.
- WEB-05 — Editor de perfil público.

---

## 5. Retirar perfil propio

### Endpoint

PATCH /api/organizaciones/mi-perfil/retirar

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público actualmente en estado `PUBLICADO`.

### Objetivo

Retirar voluntariamente el perfil de la vista pública sin eliminar su
contenido.

La operación permite que una organización deje de mostrar temporalmente su
perfil y pueda volver a publicarlo posteriormente.

### Cuerpo de la solicitud

No requiere cuerpo.

```json
{}
```

### Transición permitida

```text
PUBLICADO → NO_PUBLICADO
```

El retiro no elimina:

```text
nombre_visible
descripcion_publica
slug
plantilla
imagenes
secciones
datos de contacto
redes sociales
horarios
```

### Cambios realizados

Al retirar el perfil:

```text
estado_publicacion = NO_PUBLICADO
retirado_en         = fecha y hora actual
actualizado_en      = fecha y hora actual
```

El valor de `publicado_en` puede conservarse como registro de la última
publicación realizada.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Perfil público retirado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "NO_PUBLICADO",
    "publicado_en": "2026-09-15T11:00:00-03:00",
    "retirado_en": "2026-09-15T12:00:00-03:00",
    "actualizado_en": "2026-09-15T12:00:00-03:00"
  }
}
```

### Errores

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Perfil no publicado

HTTP 409

```json
{
  "error": "El perfil no se encuentra publicado"
}
```

#### Perfil oculto por moderación

HTTP 409

```json
{
  "error": "El perfil se encuentra oculto por moderación"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo retirar el perfil público"
}
```

### Reglas de negocio

La organización únicamente puede retirar su propio perfil.

Retirar un perfil no elimina ni modifica su contenido.

El `slug` permanece reservado para ese mismo perfil aunque éste pase a
`NO_PUBLICADO`.

El perfil continúa siendo accesible para su propietario mediante los
endpoints protegidos de gestión.

Un perfil `NO_PUBLICADO` no debe aparecer en las consultas públicas del
portal.

El perfil puede volver a `PUBLICADO` utilizando posteriormente el endpoint
de publicación, siempre que continúe cumpliendo los requisitos.

El retiro voluntario y el ocultamiento administrativo son conceptos
diferentes:

```text
NO_PUBLICADO
    retiro realizado por la propia organización.

OCULTO
    moderación realizada por un ADMIN.
```

La organización no puede utilizar este endpoint para modificar un perfil
`OCULTO`.

### Trazabilidad

- RF-21 — Gestión exclusiva del perfil propio.
- RF-23 — Publicación y retiro conservando el contenido.
- RF-24 — Diferenciación respecto de la moderación administrativa.
- CU-21 — Gestionar perfil público.
- CP-PRF-008 — Retiro del perfil sin pérdida de contenido.
- WEB-05 — Editor de perfil público.

---

## 6. Consultar plantillas disponibles

### Endpoint

GET /api/organizaciones/mi-perfil/plantillas

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Obtener las plantillas activas disponibles para representar el perfil público
de la organización autenticada e identificar cuál se encuentra actualmente
seleccionada.

La consulta no modifica el perfil.

### Parámetros

No recibe parámetros de ruta ni cuerpo de solicitud.

### Respuesta satisfactoria

HTTP 200

```json
{
  "plantilla_actual": {
    "id_plantilla": 1,
    "codigo": "clasica",
    "nombre": "Clásica",
    "version": "1.0"
  },
  "plantillas": [
    {
      "id_plantilla": 1,
      "codigo": "clasica",
      "nombre": "Clásica",
      "version": "1.0",
      "descripcion": "Presentación institucional con secciones ordenadas."
    },
    {
      "id_plantilla": 2,
      "codigo": "comunidad",
      "nombre": "Comunidad",
      "version": "1.0",
      "descripcion": "Presentación orientada a destacar impacto y oportunidades."
    }
  ]
}
```

Los nombres y códigos anteriores son representativos del contrato. Los valores
definitivos deberán coincidir con las plantillas cargadas mediante la migración
de datos iniciales.

Solo se devuelven plantillas con:

```text
activo = true
```

### Errores

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil propio inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudieron obtener las plantillas disponibles"
}
```

### Reglas de negocio

- Se muestran únicamente plantillas mantenidas por el sistema.
- No se admiten plantillas externas.
- No se admite HTML, CSS ni JavaScript personalizado.
- La consulta no modifica el perfil.
- La respuesta identifica la plantilla actualmente asociada al perfil.
- El frontend utiliza el `codigo` para seleccionar la presentación
  correspondiente durante la previsualización.

### Previsualización protegida

La previsualización no crea un segundo perfil ni una copia pública del
contenido.

El frontend utiliza el perfil autenticado, su configuración de secciones,
imágenes y la plantilla seleccionada para construir la vista previa.

La previsualización permanece protegida por autenticación.

Copiar o abrir una dirección de previsualización sin una sesión válida no debe
permitir acceder al contenido del borrador.

La previsualización:

- no cambia `estado_publicacion`;
- no modifica `publicado_en`;
- no hace accesible el slug público;
- no duplica el perfil ni su contenido.

---

## 7. Cambiar plantilla del perfil propio

### Endpoint

PATCH /api/organizaciones/mi-perfil/plantilla

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Cambiar la plantilla utilizada para representar el perfil público de la
organización autenticada sin modificar ni duplicar su contenido.

### Cuerpo de la solicitud

```json
{
  "id_plantilla": 2
}
```

### Validaciones

El backend debe comprobar que:

- `id_plantilla` haya sido informado;
- la plantilla exista;
- la plantilla se encuentre activa;
- el perfil pertenezca a la organización autenticada.

### Estados admitidos

La plantilla puede modificarse cuando el perfil se encuentre en:

```text
BORRADOR
NO_PUBLICADO
OCULTO

### Cambios realizados

La operación modifica únicamente:

```text
perfil_publico_organizacion.id_plantilla
perfil_publico_organizacion.actualizado_en
```

No modifica:

```text
nombre_visible
descripcion_publica
slug
datos de contacto
redes sociales
horarios
imagenes
secciones
estado_publicacion
publicado_en
retirado_en
datos de moderacion
```

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Plantilla actualizada correctamente",
  "plantilla": {
    "id_plantilla": 2,
    "codigo": "comunidad",
    "nombre": "Comunidad",
    "version": "1.0"
  },
  "perfil": {
    "id_perfil_publico": "uuid",
    "slug": "actitud-solidaria",
    "estado_publicacion": "BORRADOR",
    "actualizado_en": "2026-09-15T11:30:00-03:00"
  }
}
```

### Errores

#### Identificador de plantilla ausente o inválido

HTTP 400

```json
{
  "error": "La plantilla indicada es inválida"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil propio inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Plantilla inexistente

HTTP 404

```json
{
  "error": "Plantilla no encontrada"
}
```

#### Plantilla inactiva

HTTP 409

```json
{
  "error": "Retire el perfil de la vista pública antes de cambiar la plantilla"
}
```

#### La plantilla ya está seleccionada

HTTP 409

```json
{
  "error": "La plantilla seleccionada ya se encuentra aplicada al perfil"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo actualizar la plantilla del perfil"
}
```

### Reglas de negocio

- La organización solo puede cambiar la plantilla de su propio perfil.
- El perfil conserva el mismo `id_perfil_publico`.
- Cambiar la plantilla no crea un perfil nuevo.
- Cambiar la plantilla no duplica contenido.
- Los textos, contactos, imágenes y secciones permanecen asociados al mismo
  perfil.
- El cambio de plantilla no modifica el `slug`.
- El cambio de plantilla no modifica automáticamente el estado de publicación.
- Solo pueden seleccionarse plantillas activas mantenidas por el sistema.
- No se aceptan plantillas, plugins ni código personalizado enviado por el
  cliente.
- La operación debe actualizar `actualizado_en`.

### Previsualización

La previsualización de WEB-06 no requiere persistir una nueva copia del perfil.

El frontend puede obtener:

- el contenido actual del perfil;
- el listado de plantillas activas;

y representar temporalmente el mismo contenido utilizando otra plantilla.

La selección solo se vuelve persistente cuando se ejecuta:

```text
PATCH /api/organizaciones/mi-perfil/plantilla
```

Esto permite previsualizar una plantilla sin alterar el perfil guardado.

### Trazabilidad

- RF-22 — Selección y previsualización de plantilla.
- CU-22 — Seleccionar y previsualizar plantilla.
- CP-PRF-004 — Previsualización sin exposición pública.
- CP-PRF-005 — Cambio de plantilla sin pérdida de contenido.
- WEB-06 — Plantillas y previsualización.

---

## 8. Configurar visibilidad y orden de secciones

### Endpoint

PATCH /api/organizaciones/mi-perfil/secciones/configuracion

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Modificar la visibilidad y el orden de las secciones configurables
pertenecientes al perfil de la organización autenticada.

Este endpoint no modifica el contenido almacenado dentro de las secciones.

### Cuerpo de la solicitud

```json
{
  "secciones": [
    {
      "id_seccion": "uuid-seccion-1",
      "visible": true,
      "orden": 1
    },
    {
      "id_seccion": "uuid-seccion-2",
      "visible": false,
      "orden": 2
    },
    {
      "id_seccion": "uuid-seccion-3",
      "visible": true,
      "orden": 3
    }
  ]
}
```

### Campos admitidos por sección

- `id_seccion`
- `visible`
- `orden`

Este contrato no permite modificar mediante esta operación:

- `tipo_seccion`
- `titulo`
- `contenido`
- `id_perfil_publico`

La edición del contenido de una sección se gestiona mediante un contrato
separado.

### Validaciones

El backend debe comprobar que:

- `secciones` sea un arreglo no vacío;
- cada `id_seccion` exista;
- cada sección pertenezca al perfil de la organización autenticada;
- `visible` sea booleano;
- `orden` sea un entero mayor o igual a cero;
- la configuración final no contenga valores de orden duplicados;
- no se incluyan dos veces la misma sección en la solicitud;
- no se intenten configurar secciones pertenecientes a otro perfil.

Los tipos de sección admitidos son controlados por el sistema. Este endpoint
no permite crear tipos arbitrarios de sección.

### Actualización parcial

No es obligatorio enviar todas las secciones del perfil.

Las secciones omitidas conservan:

- su visibilidad actual;
- su posición actual;
- su contenido.

Sin embargo, antes de persistir la operación, el backend debe validar la
configuración final completa del perfil para impedir órdenes duplicados.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Configuración de secciones actualizada correctamente",
  "secciones": [
    {
      "id_seccion": "uuid-seccion-1",
      "tipo_seccion": "QUIENES_SOMOS",
      "titulo": "Quiénes somos",
      "visible": true,
      "orden": 1
    },
    {
      "id_seccion": "uuid-seccion-2",
      "tipo_seccion": "AREAS_TRABAJO",
      "titulo": "Áreas de trabajo",
      "visible": false,
      "orden": 2
    },
    {
      "id_seccion": "uuid-seccion-3",
      "tipo_seccion": "GALERIA",
      "titulo": "Galería",
      "visible": true,
      "orden": 3
    }
  ],
  "actualizado_en": "2026-09-15T12:00:00-03:00"
}
```

Los tipos de sección admitidos por la línea base actual son:

```text
QUIENES_SOMOS
AREAS_TRABAJO
OPORTUNIDADES
GALERIA

### Ocultamiento de una sección

Cuando:

```text
visible = false
```

la sección deja de mostrarse en la vista pública y en la previsualización,
pero su registro y su contenido permanecen almacenados.

No se ejecuta:

```text
DELETE
```

ni se reemplaza el contenido por `NULL`.

Si posteriormente se establece nuevamente:

```text
visible = true
```

la sección vuelve a utilizar el contenido que ya tenía almacenado.

### Orden de secciones

El campo:

```text
orden
```

determina la posición relativa de las secciones dentro del perfil.

Ejemplo:

```text
1  Quiénes somos
2  Áreas de trabajo
3  Oportunidades
4  Galería
```

No pueden existir dos secciones del mismo perfil con el mismo valor de
`orden` dentro de la configuración válida.

La plantilla seleccionada debe respetar este orden al representar las
secciones configurables.

```markdown
### Estados admitidos

La configuración puede modificarse cuando el perfil se encuentre en:

```text
BORRADOR
NO_PUBLICADO
OCULTO

### Previsualización

La previsualización utiliza únicamente:

- secciones visibles;
- orden persistido;
- contenido existente;
- plantilla seleccionada.

Una sección marcada como no visible no aparece en la previsualización, aunque
su contenido continúe almacenado.

### Respuesta ante configuración inválida

HTTP 400

```json
{
  "error": "La configuración de secciones es inválida"
}
```

### Orden duplicado

HTTP 400

```json
{
  "error": "El orden de las secciones no puede contener valores duplicados"
}
```

### Sección repetida en la solicitud

HTTP 401

```json
{
  "error": "Una sección no puede aparecer más de una vez en la configuración"
}
```

### JWT ausente, inválido o vencido

HTTP 402

```json
{
  "error": "Token inválido o no proporcionado"
}
```

### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

### Organización no activa o no verificada

HTTP 404

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

### Intento de configurar una sección ajena

HTTP 405

```json
{
  "error": "La sección indicada no pertenece al perfil de la organización"
}
```

### Perfil inexistente

HTTP 406

```json
{
  "error": "Perfil público no encontrado"
}
```

### Sección inexistente

HTTP 407

```json
{
  "error": "Sección de perfil no encontrada"
}
```

### Error interno

HTTP 408

```json
{
  "error": "No se pudo actualizar la configuración de secciones"
}
```
HTTP 409
'''json
{
  "error": "Retire el perfil de la vista pública antes de modificar el contenido"
}
´´´

### Reglas de negocio

- La organización únicamente puede configurar secciones de su propio perfil.
- La propiedad se determina utilizando el JWT.
- Ocultar una sección nunca elimina su contenido.
- Reactivar una sección recupera el contenido previamente almacenado.
- El orden final debe ser válido y no contener valores duplicados.
- Cambiar visibilidad u orden no modifica la plantilla.
- Cambiar visibilidad u orden no modifica el estado de publicación.
- La operación no crea tipos de sección arbitrarios.
- Las secciones siguen siendo parte del mismo perfil público.
- Si se actualizan varias secciones en una misma solicitud, la operación debe
  aplicarse de forma atómica.
- La configuración guardada debe ser utilizada tanto por la previsualización
  como por el perfil público.

### Trazabilidad

- RF-21 — Gestión del contenido público propio.
- RF-22 — Presentación mediante plantilla y previsualización.
- CU-21 — Gestionar perfil público.
- CU-22 — Seleccionar y previsualizar plantilla.
- CP-PRF-006 — Configuración de visibilidad y orden de secciones.
- CA-15 — Edición exclusiva del perfil propio.
- WEB-05 — Editor de perfil.
- WEB-06 — Plantillas y previsualización.

---

---

## 9. Editar contenido de una sección controlada

### Endpoint

PATCH /api/organizaciones/mi-perfil/secciones/:idSeccion/contenido

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.
- Sección perteneciente al perfil propio.

### Objetivo

Modificar el contenido editorial de una sección controlada perteneciente al
perfil de la organización autenticada.

Las secciones no son creadas libremente por la organización.

Cada perfil dispone del conjunto controlado:

```text
QUIENES_SOMOS
AREAS_TRABAJO
OPORTUNIDADES
GALERIA
```

Cada una representa una parte concreta del perfil y utiliza la fuente de datos
correspondiente.

### Fuentes de información por sección

#### QUIENES_SOMOS

Fuente:

```text
seccion_perfil_organizacion.contenido
```

Es la sección editorial del perfil.

Su contenido puede ser actualizado mediante este endpoint.

#### AREAS_TRABAJO

Fuente:

```text
organizacion_tipo_actividad
+
tipo_actividad
```

No se modifica mediante este endpoint.

Las áreas declaradas se gestionan mediante:

```text
PUT /api/organizaciones/mis-tipos-actividad
```

#### OPORTUNIDADES

Fuente:

```text
oportunidad
```

No se almacena una copia de las oportunidades dentro del perfil público.

La sección muestra las oportunidades de la misma organización que cumplan las
reglas vigentes para exposición pública.

La creación, edición, publicación, pausa, finalización o cancelación de una
oportunidad se realiza mediante el módulo existente de oportunidades.

#### GALERIA

Fuente:

```text
imagen_perfil_organizacion
```

No se almacenan imágenes duplicadas dentro de
`seccion_perfil_organizacion.contenido`.

Las imágenes se gestionan mediante los endpoints específicos definidos en el
contrato 10.

### Parámetro de ruta

```text
idSeccion
```

Corresponde a:

```text
seccion_perfil_organizacion.id_seccion
```

El backend debe comprobar que dicha sección pertenece al perfil de la
organización autenticada.

### Sección editable mediante este endpoint

En la línea base actual, este endpoint admite modificación editorial directa
únicamente para:

```text
QUIENES_SOMOS
```

Las otras secciones obtienen su información desde módulos o tablas
especializadas del sistema.

### Cuerpo de la solicitud

Ejemplo:

```json
{
  "contenido": {
    "texto": "Trabajamos junto a comunidades e instituciones de Santa Fe promoviendo distintas iniciativas solidarias."
  }
}
```

### Campos admitidos

El cuerpo admite únicamente:

```text
contenido
```

El objeto `contenido` de `QUIENES_SOMOS` utiliza actualmente:

```text
texto
```

Ejemplo:

```json
{
  "texto": "Nuestra organización trabaja desde 2015 acompañando distintas iniciativas comunitarias."
}
```

### Campos no modificables mediante este endpoint

No pueden enviarse:

```text
id_seccion
id_perfil_publico
tipo_seccion
titulo
visible
orden
actualizada_en
```

El título y el tipo de las secciones son controlados por el sistema.

La visibilidad y el orden se modifican mediante:

```text
PATCH /api/organizaciones/mi-perfil/secciones/configuracion
```

### Títulos controlados

La línea base utiliza:

```text
QUIENES_SOMOS  → Quiénes somos
AREAS_TRABAJO  → Áreas de trabajo
OPORTUNIDADES  → Oportunidades
GALERIA        → Galería
```

La organización no crea nuevos títulos estructurales ni nuevos tipos de
sección mediante este endpoint.

### Validaciones

El backend debe comprobar que:

- el perfil pertenezca a la organización autenticada;
- la sección exista;
- la sección pertenezca al perfil propio;
- el tipo de sección permita edición directa;
- `contenido` sea un objeto JSON válido;
- `texto` posea un formato válido;
- no se incluyan propiedades no admitidas;
- el contenido haya sido validado y sanitizado antes de persistirse.

No se permite contenido ejecutable.

### Contenido no permitido

No se admite:

- HTML personalizado;
- CSS;
- JavaScript;
- scripts;
- código embebido;
- plugins;
- contenido ejecutable.

El texto recibido se trata como contenido estructurado y no como código de
presentación.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Contenido de la sección actualizado correctamente",
  "seccion": {
    "id_seccion": "uuid",
    "tipo_seccion": "QUIENES_SOMOS",
    "titulo": "Quiénes somos",
    "contenido": {
      "texto": "Trabajamos junto a comunidades e instituciones de Santa Fe promoviendo distintas iniciativas solidarias."
    },
    "visible": true,
    "orden": 1,
    "actualizada_en": "2026-09-15T13:10:00-03:00"
  }
}
```

### Edición de una sección derivada

Si se intenta utilizar este endpoint sobre:

```text
AREAS_TRABAJO
OPORTUNIDADES
GALERIA
```

```markdown
### Estados admitidos

La modificación editorial se permite cuando el perfil se encuentre en:

```text
BORRADOR
NO_PUBLICADO
OCULTO

### Errores

#### Contenido ausente o inválido

HTTP 400

```json
{
  "error": "El contenido de la sección es inválido"
}
```

#### Campos no permitidos

HTTP 400

```json
{
  "error": "La solicitud contiene campos que no pueden modificarse mediante este endpoint"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Sección perteneciente a otro perfil

HTTP 403

```json
{
  "error": "La sección indicada no pertenece al perfil de la organización"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Sección inexistente

HTTP 404

```json
{
  "error": "Sección de perfil no encontrada"
}
```

#### Tipo de sección no editable directamente

HTTP 409

```json
{
  "error": "El contenido de esta sección se administra mediante su módulo correspondiente"
}
```

HTTP 409

```json
{
  "error": "Retire el perfil de la vista pública antes de modificar el contenido"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo actualizar el contenido de la sección"
}
```

### Relación con visibilidad y orden

La edición del contenido no modifica:

```text
visible
orden
```

Una sección `QUIENES_SOMOS` puede encontrarse oculta y continuar conservando
su contenido.

Ejemplo:

```text
visible = false
```

El contenido editorial sigue almacenado.

Si posteriormente se cambia a:

```text
visible = true
```

el mismo contenido vuelve a mostrarse.

### Construcción de las secciones derivadas

Al consultar o previsualizar el perfil, el backend utiliza la configuración de
`seccion_perfil_organizacion` para determinar:

```text
visible
orden
```

y obtiene el contenido real desde la fuente correspondiente.

Conceptualmente:

```text
QUIENES_SOMOS
    └── seccion_perfil_organizacion.contenido

AREAS_TRABAJO
    └── organizacion_tipo_actividad
            └── tipo_actividad

OPORTUNIDADES
    └── oportunidad

GALERIA
    └── imagen_perfil_organizacion
```

Esto evita mantener copias independientes de información que ya existe en el
sistema.

### Previsualización

La previsualización debe respetar:

- plantilla seleccionada;
- orden de las secciones;
- visibilidad de cada sección;
- contenido editorial persistido;
- áreas actualmente declaradas;
- oportunidades actualmente publicables;
- imágenes actualmente visibles.

La previsualización no crea copias de esos datos.

### Vista pública

Cuando el perfil se encuentre `PUBLICADO`, la vista pública aplica las mismas
reglas.

Una sección marcada:

```text
visible = false
```

no aparece en la respuesta pública, aunque la información original continúe
existiendo en su fuente correspondiente.

### Reglas de negocio

- Las secciones son controladas por el sistema.
- La organización no crea tipos de sección arbitrarios.
- Cada perfil puede poseer como máximo una sección de cada tipo.
- `QUIENES_SOMOS` contiene información editorial gestionada mediante este
  endpoint.
- `AREAS_TRABAJO` utiliza los tipos de actividad declarados por la
  organización.
- `OPORTUNIDADES` utiliza los registros reales del módulo de oportunidades.
- `GALERIA` utiliza las imágenes reales del perfil.
- No se duplican áreas, oportunidades ni imágenes dentro del JSON de las
  secciones.
- Solo la organización propietaria puede editar su contenido.
- No se admite HTML, CSS ni JavaScript personalizado.
- Editar contenido no modifica visibilidad ni orden.
- Editar contenido no modifica la plantilla.
- Editar contenido no modifica el estado de publicación.
- La operación actualiza `actualizada_en`.

### Trazabilidad

- RF-21 — Gestión del contenido público propio.
- RF-22 — Secciones configurables y previsualización.
- RNF-16 — Validación y sanitización del contenido configurable.
- RNF-18 — Uso compartido de la misma fuente de datos.
- CU-21 — Gestionar perfil público.
- CU-22 — Previsualizar el perfil.
- CP-PRF-002 — Edición del perfil propio.
- CP-PRF-003 — Imposibilidad de modificar contenido ajeno.
- CP-PRF-006 — Visibilidad, orden y conservación del contenido.
- CP-WEB-010 — Oportunidades obtenidas desde la fuente común.
- WEB-05 — Editor del perfil.
- WEB-06 — Previsualización del perfil.
---

## 10. Gestión de imágenes del perfil

Las imágenes forman parte del perfil público, pero los archivos binarios no se
almacenan dentro de PostgreSQL.

La base de datos conserva únicamente:

- referencia HTTPS del archivo;
- tipo de imagen;
- texto alternativo;
- orden;
- visibilidad;
- tipo MIME;
- tamaño en bytes;
- fecha de creación.

El mecanismo concreto de almacenamiento externo se implementará en la
actividad correspondiente a carga de imágenes.

---

### 10.1 Cargar una imagen

### Endpoint

POST /api/organizaciones/mi-perfil/imagenes

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.
- Perfil público previamente creado.

### Objetivo

Cargar una imagen asociada al perfil de la organización autenticada.

### Tipo de solicitud

```text
multipart/form-data
```

### Campos

```text
archivo
tipo
texto_alternativo
```

Ejemplo conceptual:

```text
archivo            imagen.jpg
tipo               GALERIA
texto_alternativo  Voluntarios durante una actividad comunitaria
```

`archivo` es obligatorio.

```markdown
### Tipos de imagen admitidos

El campo `tipo` solo admite:

```text
LOGO
PORTADA
GALERIA

`texto_alternativo` debe informarse cuando la imagen transmita información
relevante para el visitante.

### Formatos admitidos

Se aceptan únicamente imágenes con tipos MIME:

```text
image/jpeg
image/png

No debe confiarse únicamente en la extensión del nombre del archivo.

### Tamaño máximo

Cada archivo puede tener como máximo:

```text
5 MiB

El backend debe rechazar el archivo antes de completar la operación cuando
supere ese límite.

### Procesamiento

El flujo previsto es:

```text
1. Validar autenticación y propiedad del perfil.
2. Validar formato y tamaño.
3. Almacenar el archivo mediante el servicio de imágenes definido.
4. Obtener una referencia HTTPS.
5. Registrar la referencia y sus metadatos en
   imagen_perfil_organizacion.
```

Si falla la persistencia de los metadatos luego de haberse cargado el archivo,
el backend debe evitar dejar recursos huérfanos siempre que el proveedor de
almacenamiento permita revertir la carga.

### Valores asignados por el backend

El cliente no envía:

```text
id_imagen
id_perfil_publico
url
mime_type
tamano_bytes
creada_en
```

El backend determina esos valores.

La posición inicial se asigna automáticamente utilizando la siguiente posición
disponible dentro del perfil.

Por defecto:

```text
visible = true
```

### Respuesta satisfactoria

HTTP 201

```json
{
  "message": "Imagen agregada correctamente",
  "imagen": {
    "id_imagen": "uuid",
    "url": "https://cdn.ejemplo.org/perfiles/imagen.jpeg",
    "tipo": "GALERIA",
    "texto_alternativo": "Voluntarios durante una actividad comunitaria",
    "orden": 1,
    "visible": true,
    "mime_type": "image/jpeg"
    "tamano_bytes": 482315,
    "creada_en": "2026-09-15T14:00:00-03:00"
  }
}
```

### Estado del perfil

Las imágenes pueden agregarse, editarse o eliminarse cuando el perfil se
encuentre en:

```text
BORRADOR
NO_PUBLICADO
OCULTO
```

### Errores

#### Archivo no informado

HTTP 400

```json
{
  "error": "Debe seleccionar una imagen"
}
```

#### Formato no permitido

HTTP 400

```json
{
  "error": "El formato de la imagen no está permitido"
}
```

#### Archivo demasiado grande

HTTP 413

```json
{
  "error": "La imagen supera el tamaño máximo permitido"
}
```

#### Datos de imagen inválidos

HTTP 400

```json
{
  "error": "Los datos de la imagen son inválidos"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

### Publicado
```json
{
  "error": "Retire el perfil de la vista pública antes de modificar sus imágenes"
}
```
#### Fallo en el almacenamiento

HTTP 500

```json
{
  "error": "No se pudo almacenar la imagen"
}
```

### Reglas de negocio

- La imagen siempre se asocia al perfil propio obtenido desde el JWT.
- El cliente no puede indicar manualmente `id_perfil_publico`.
- PostgreSQL no almacena el archivo binario.
- Solo se persiste una referencia HTTPS y sus metadatos.
- La carga de una imagen no modifica el estado de publicación.
- Una imagen puede formar parte de un perfil en BORRADOR, PUBLICADO,
  NO_PUBLICADO u OCULTO.
- La publicación pública de la imagen depende del estado del perfil y de su
  atributo `visible`.
- El archivo debe cumplir formato y tamaño permitidos.
- Solo se aceptan los tipos `LOGO`, `PORTADA` y `GALERIA`.
- Un perfil no puede tener más de un `LOGO`.
- Un perfil no puede tener más de una `PORTADA`.
- Puede contener múltiples imágenes de tipo `GALERIA`.
- Solo se admiten archivos JPEG y PNG.
- El tamaño máximo permitido es 5 MiB.

---

### 10.2 Editar metadatos de una imagen

### Endpoint

PATCH /api/organizaciones/mi-perfil/imagenes/:idImagen

### Objetivo

Modificar propiedades de presentación de una imagen ya almacenada.

### Cuerpo de la solicitud

Ejemplo:

```json
{
  "texto_alternativo": "Equipo de voluntariado durante la jornada solidaria",
  "visible": true,
  "orden": 2
}
```

### Campos editables

- `texto_alternativo`
- `visible`
- `orden`

El endpoint no permite modificar:

- `id_imagen`
- `id_perfil_publico`
- `url`
- `mime_type`
- `tamano_bytes`
- `creada_en`

Reemplazar el archivo físico debe realizarse mediante una nueva operación de
carga, no modificando manualmente su URL.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Imagen actualizada correctamente",
  "imagen": {
    "id_imagen": "uuid",
    "url": "https://cdn.ejemplo.org/perfiles/imagen.webp",
    "tipo": "GALERIA",
    "texto_alternativo": "Equipo de voluntariado durante la jornada solidaria",
    "orden": 2,
    "visible": true
  }
}
```

### Errores principales

HTTP 400 si los metadatos son inválidos.

HTTP 401 si el JWT no es válido.

HTTP 403 si la imagen no pertenece al perfil de la organización autenticada.

HTTP 404 si el perfil o la imagen no existen.

HTTP 500 ante un error interno.

### Reglas

- Solo pueden modificarse imágenes pertenecientes al perfil propio.
- Ocultar una imagen no elimina el archivo ni su registro.
- Modificar orden o visibilidad no altera el estado del perfil.
- El orden debe ser válido dentro de la colección de imágenes.
- El texto alternativo debe conservarse como información de accesibilidad.

---

### 10.3 Eliminar una imagen

### Endpoint

DELETE /api/organizaciones/mi-perfil/imagenes/:idImagen

### Acceso

Requiere JWT válido, rol ORGANIZACION, organización activa y verificada y
propiedad de la imagen.

### Objetivo

Eliminar una imagen perteneciente al perfil propio.

La operación debe eliminar:

```text
registro de imagen en PostgreSQL
+
archivo físico en el servicio de almacenamiento
```

cuando el proveedor utilizado permita efectuar ambas operaciones.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Imagen eliminada correctamente"
}
```

### Errores

#### Imagen perteneciente a otro perfil

HTTP 403

```json
{
  "error": "La imagen indicada no pertenece al perfil de la organización"
}
```

#### Imagen inexistente

HTTP 404

```json
{
  "error": "Imagen de perfil no encontrada"
}
```

#### Error durante la eliminación

HTTP 500

```json
{
  "error": "No se pudo eliminar la imagen"
}
```

### Reglas de negocio

- La organización solo puede eliminar imágenes de su propio perfil.
- La propiedad se valida mediante la identidad autenticada.
- Eliminar una imagen no elimina el perfil.
- Eliminar una imagen no modifica automáticamente el estado de publicación.
- La operación debe procurar consistencia entre PostgreSQL y el proveedor de
  almacenamiento.
- No deben quedar referencias a archivos inexistentes ni archivos huérfanos
  evitables.

### Trazabilidad

- RF-21 — Gestión exclusiva del contenido propio.
- RNF-16 — Exposición controlada de información pública.
- RNF-21 — Restricciones para imágenes del perfil.
- CU-21 — Gestionar perfil público.
- WEB-05 — Editor de perfil.

---

## 11. Consultar directorio público de organizaciones

### Endpoint

GET /api/public/organizaciones

### Acceso

Público.

No requiere:

- JWT;
- registro;
- inicio de sesión;
- rol de usuario.

### Objetivo

Obtener el directorio público de organizaciones elegibles para difusión en el
portal web.

Solo pueden formar parte del resultado organizaciones que cumplan
simultáneamente:

```text
cuenta activa
+
organización verificada
+
perfil PUBLICADO
```

Una organización que incumpla cualquiera de estas condiciones no debe
aparecer en la respuesta.

### Filtros

Todos los filtros son opcionales.

#### Nombre

```text
?nombre=actitud
```

Permite buscar organizaciones por su nombre visible.

La búsqueda debe ser insensible a mayúsculas y minúsculas.

#### Tipo de actividad

```text
?tipo_actividad=2
```

Permite limitar los resultados a organizaciones relacionadas con el tipo de
actividad indicado.

El valor debe corresponder al catálogo de tipos de actividad mantenido por el
sistema.

#### Ubicación aproximada

```text
?ubicacion=Santa Fe
```

Permite filtrar utilizando información geográfica aproximada, por ejemplo
localidad o provincia.

La consulta pública no requiere ni debe exponer la ubicación exacta de una
organización para realizar este filtro.

### Combinación de filtros

Los filtros pueden combinarse.

Ejemplo:

```text
GET /api/public/organizaciones?nombre=red&id_tipo_actividad=2&ubicacion=Santa%20Fe
```

Cuando se informan varios filtros, el resultado debe cumplir todos los
criterios enviados.

### Consulta sin filtros

```text
GET /api/public/organizaciones
```

Devuelve todas las organizaciones elegibles para el directorio público.

### Respuesta satisfactoria

HTTP 200

```json
{
  "organizaciones": [
    {
      "nombre_visible": "Actitud Solidaria",
      "slug": "actitud-solidaria",
      "descripcion_publica": "Asistencia integral y acompañamiento comunitario.",
      "ubicacion_aproximada": {
        "localidad": "Santa Fe",
        "provincia": "Santa Fe"
      },
      "tipos_actividad": [
        "Asistencia social"
      ],
      "imagen_principal": {
        "url": "https://cdn.ejemplo.org/perfiles/actitud-solidaria.webp",
        "texto_alternativo": "Identidad visual de Actitud Solidaria"
      }
    },
    {
      "nombre_visible": "Red Comunitaria",
      "slug": "red-comunitaria",
      "descripcion_publica": "Talleres educativos y acompañamiento a familias.",
      "ubicacion_aproximada": {
        "localidad": "Santo Tomé",
        "provincia": "Santa Fe"
      },
      "tipos_actividad": [
        "Educación"
      ],
      "imagen_principal": null
    }
  ]
}
```

### Resultado vacío

Una búsqueda sin coincidencias no constituye un error.

HTTP 200

```json
{
  "organizaciones": []
}
```

Este comportamiento también se aplica cuando el término buscado corresponde a
una organización que existe internamente pero no cumple las condiciones de
publicación.

La API no debe indicar si esa organización:

- existe;
- está pendiente;
- fue rechazada;
- está inactiva;
- tiene un perfil BORRADOR;
- tiene un perfil NO_PUBLICADO;
- tiene un perfil OCULTO.

### Datos permitidos en el directorio

La respuesta puede incluir únicamente información destinada a difusión
pública, por ejemplo:

- nombre visible;
- slug;
- descripción pública;
- ubicación aproximada;
- tipos de actividad;
- referencia de imagen pública;
- texto alternativo de la imagen.

### Datos que NO deben exponerse

El directorio no debe devolver:

- `id_usuario`;
- `id_organizacion`;
- `id_perfil_publico`;
- CUIT;
- contraseña o hash;
- correo utilizado para iniciar sesión;
- documentación de verificación;
- motivos de rechazo;
- datos de bloqueo;
- estado interno de cuenta;
- estado interno de verificación;
- estados BORRADOR, NO_PUBLICADO u OCULTO;
- identificadores administrativos;
- ubicación exacta cuando no sea necesaria para la difusión pública.

Los medios de contacto autorizados se reservan para el perfil institucional
detallado y no son necesarios para construir las tarjetas del directorio.

### Elegibilidad

La consulta debe aplicar el filtro de elegibilidad en el backend.

Conceptualmente:

```text
usuario.estado_cuenta = ACTIVA
AND organizacion.estado_verificacion = VERIFICADA
AND perfil_publico_organizacion.estado_publicacion = PUBLICADO
```

No es suficiente ocultar organizaciones no elegibles únicamente desde React.

### Orden de resultados

El contrato base no impone un único criterio de ordenamiento.

Como mínimo, la API debe producir un resultado determinista.

Las opciones de ordenamiento mostradas por la interfaz podrán incorporarse
durante la implementación sin modificar las reglas de elegibilidad ni
privacidad de este contrato.

### Errores

#### Filtros con formato inválido

HTTP 400

```json
{
  "error": "Los filtros del directorio son inválidos"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo obtener el directorio de organizaciones"
}
```

La consulta pública no devuelve errores 401 o 403 por ausencia de JWT, ya que
el visitante no necesita autenticarse.

### Reglas de negocio

- El endpoint es público.
- No debe requerir encabezado `Authorization`.
- Solo devuelve organizaciones activas, verificadas y con perfil PUBLICADO.
- Los filtros se aplican en el backend.
- Buscar una organización no elegible produce simplemente ausencia de
  resultados.
- La API no revela por qué una organización quedó excluida.
- Los datos retornados corresponden a una lista controlada de información
  pública.
- El `slug` permite navegar posteriormente al perfil institucional estable.
- La ubicación utilizada para el directorio es aproximada.
- No se exponen UUID internos necesarios únicamente para persistencia o
  administración.
- La consulta no modifica ningún registro.
- La respuesta procede de la misma base de datos utilizada por la aplicación
  móvil y el resto del sistema.

### Trazabilidad

- RF-18 — Acceso público sin autenticación.
- RF-19 — Búsqueda y filtrado de organizaciones públicas.
- RF-20 — Acceso posterior mediante dirección estable.
- RNF-16 — Exposición controlada de información pública.
- CU-18 — Consultar portal público.
- CU-19 — Buscar organizaciones públicas.
- CP-WEB-001 — Acceso público sin autenticación.
- CP-WEB-003 — Directorio limitado a organizaciones elegibles.
- WEB-02 — Directorio de organizaciones.

---

## 12. Consultar perfil institucional público por slug

### Endpoint

GET /api/public/organizaciones/:slug

### Acceso

Público.

No requiere:

- JWT;
- registro;
- inicio de sesión;
- rol de usuario.

### Objetivo

Obtener el perfil institucional público correspondiente a una organización
mediante una dirección estable basada en `slug`.

Ejemplo:

```text
GET /api/public/organizaciones/actitud-solidaria
```

La URL visible del portal podrá representarse como:

```text
/organizaciones/actitud-solidaria
```

El visitante no necesita conocer ni utilizar:

```text
id_usuario
id_organizacion
id_perfil_publico
```

### Condiciones de visibilidad

El backend solo devuelve el perfil cuando se cumplen simultáneamente las
condiciones necesarias para exposición pública:

```text
cuenta activa
+
organización verificada
+
perfil PUBLICADO
+
slug coincidente
```

Si alguna de esas condiciones no se cumple, el contenido no debe exponerse.

### Parámetro de ruta

```text
slug
```

Debe respetar el formato definido para las direcciones públicas:

```text
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

Ejemplo válido:

```text
actitud-solidaria
```

### Respuesta satisfactoria

HTTP 200

```json
{
  "perfil": {
    "slug": "actitud-solidaria",
    "nombre_visible": "Actitud Solidaria",
    "descripcion_publica": "Construimos comunidad mediante distintas iniciativas solidarias.",
    "ubicacion_aproximada": {
      "localidad": "Santa Fe",
      "provincia": "Santa Fe"
    },
    "contacto": {
      "email": "contacto@actitudsolidaria.org",
      "telefono": "+54 342 555 0182",
      "sitio_web": "https://actitudsolidaria.org",
      "redes_sociales": {
        "instagram": "https://instagram.com/actitudsolidaria"
      },
      "horario_atencion": {
        "texto": "Lunes a viernes de 09:00 a 17:00"
      }
    },
    "plantilla": {
      "codigo": "clasica",
      "version": "1.0"
    },
    "logo": {
      "url": "https://cdn.ejemplo.org/perfiles/actitud-solidaria-logo.png",
      "texto_alternativo": "Logotipo de Actitud Solidaria"
    },
    "portada": {
      "url": "https://cdn.ejemplo.org/perfiles/actitud-solidaria-portada.jpg",
      "texto_alternativo": "Actividad comunitaria de Actitud Solidaria"
    },
    "secciones": [
      {
        "tipo": "QUIENES_SOMOS",
        "titulo": "Quiénes somos",
        "orden": 1,
        "contenido": {
          "texto": "Somos una organización dedicada al acompañamiento comunitario."
        }
      },
      {
        "tipo": "AREAS_TRABAJO",
        "titulo": "Áreas de trabajo",
        "orden": 2,
        "contenido": {
          "tipos_actividad": [
            {
              "nombre": "Asistencia social"
            },
            {
              "nombre": "Educación"
            }
          ]
        }
      },
      {
        "tipo": "OPORTUNIDADES",
        "titulo": "Oportunidades",
        "orden": 3,
        "contenido": {
          "oportunidades": [
            {
              "titulo": "Clasificación de alimentos",
              "fecha_inicio": "2026-09-25T09:00:00-03:00",
              "ubicacion_aproximada": "Santa Fe",
              "cupos_disponibles": 6
            }
          ]
        }
      },
      {
        "tipo": "GALERIA",
        "titulo": "Galería",
        "orden": 4,
        "contenido": {
          "imagenes": [
            {
              "url": "https://cdn.ejemplo.org/perfiles/actividad-comunitaria.jpg",
              "texto_alternativo": "Actividad comunitaria"
            }
          ]
        }
      }
    ]
  }
}
```

### Plantilla pública

La respuesta incluye únicamente los datos necesarios para que el frontend
aplique la presentación seleccionada.

No es necesario exponer:

```text
id_plantilla
```

El frontend puede utilizar:

```text
plantilla.codigo
plantilla.version
```

para seleccionar el componente visual correspondiente.

Cambiar de plantilla no genera una segunda copia de los datos del perfil.

### Imágenes públicas

La respuesta incluye únicamente imágenes:

```text
visible = true
```

Cada imagen pública puede exponer:

- referencia HTTPS;
- tipo;
- texto alternativo;
- orden.

No se devuelven rutas internas del proveedor de almacenamiento ni metadatos
que no sean necesarios para la presentación pública.

Las imágenes se ordenan utilizando:

```text
orden ASC
```

### Secciones públicas

Solo se incluyen secciones:

```text
visible = true
```

Las secciones se devuelven respetando:

```text
orden ASC
```

Una sección oculta conserva su contenido en PostgreSQL, pero ese contenido no
debe formar parte de la respuesta pública.

El campo `contenido` debe haber sido previamente validado y sanitizado por el
backend.

### Oportunidades de la organización

La respuesta obtiene las oportunidades desde la misma tabla y la misma API
utilizadas por el resto del sistema.

No se crean copias de oportunidades específicas para el portal web.

Solo deben incluirse oportunidades de la organización consultada que cumplan
las reglas vigentes para exposición pública.

No deben aparecer oportunidades:

- en borrador;
- pausadas cuando no correspondan a exposición;
- finalizadas cuando la regla pública indique retirarlas;
- canceladas;
- pertenecientes a otra organización.

La lógica exacta de visibilidad debe reutilizar las reglas del módulo de
oportunidades y no duplicarse únicamente en React.

### Datos autorizados

La respuesta puede contener únicamente información expresamente destinada a
difusión pública:

- nombre visible;
- descripción pública;
- ubicación aproximada;
- tipos de actividad;
- contactos públicos configurados por la organización;
- sitio web;
- redes sociales;
- horario de atención;
- plantilla necesaria para representación;
- imágenes visibles;
- secciones visibles;
- oportunidades publicables.

### Datos que no deben exponerse

La respuesta pública no debe contener:

- `id_usuario`;
- `id_organizacion`;
- `id_perfil_publico`;
- CUIT;
- contraseña o hash;
- correo utilizado exclusivamente para autenticación;
- documentación administrativa;
- motivo de rechazo de la organización;
- estado interno de cuenta;
- estado de verificación interno;
- motivo de bloqueo;
- `ocultado_por`;
- `motivo_ocultamiento`;
- identificadores internos de moderación;
- contenido de imágenes o secciones marcadas como no visibles.

### Recurso no disponible

Si el `slug`:

- no existe;
- corresponde a un perfil BORRADOR;
- corresponde a un perfil NO_PUBLICADO;
- corresponde a un perfil OCULTO;
- pertenece a una organización no verificada;
- pertenece a una cuenta no habilitada;

la API devuelve la misma respuesta pública.

HTTP 404

```json
{
  "error": "Perfil público no disponible"
}
```

La respuesta no debe indicar cuál de las condiciones anteriores provocó el
rechazo.

### Slug con formato inválido

HTTP 400

```json
{
  "error": "La dirección del perfil es inválida"
}
```

### Error interno

HTTP 500

```json
{
  "error": "No se pudo obtener el perfil público"
}
```

### Comportamiento de seguridad

La consulta pública no devuelve:

```text
401 Unauthorized
```

por ausencia de JWT, porque no requiere autenticación.

La API tampoco debe utilizar respuestas diferentes que permitan deducir si un
perfil existe internamente pero está oculto, en borrador o retirado.

La selección de datos públicos se realiza en el backend.

No es suficiente recuperar el registro completo y ocultar propiedades desde
el frontend.

### Estabilidad de la dirección

El `slug` identifica de forma estable el perfil.

Modificar:

```text
nombre_visible
```

no modifica automáticamente:

```text
slug
```

Ejemplo:

```text
Nombre inicial:
Actitud Solidaria

Nombre posterior:
Actitud Solidaria Santa Fe

Dirección:
 /organizaciones/actitud-solidaria
```

La misma dirección continúa resolviendo el perfil.

### Consistencia multicliente

Las oportunidades, la organización y el contenido institucional proceden de
la misma base de datos PostgreSQL utilizada por la aplicación móvil.

El portal no mantiene copias independientes de organizaciones ni
oportunidades.

Una modificación realizada mediante un flujo autorizado debe reflejarse en
las consultas posteriores sin crear registros web duplicados.

### Reglas de negocio

- El endpoint es completamente público.
- El recurso se identifica por `slug`.
- No se exponen UUID internos en la dirección pública.
- Solo un perfil PUBLICADO puede responder con contenido.
- La organización asociada debe cumplir las condiciones vigentes de
  habilitación y verificación.
- Un perfil BORRADOR, NO_PUBLICADO u OCULTO se comporta públicamente como un
  recurso no disponible.
- Solo se devuelven datos autorizados.
- Solo se devuelven imágenes visibles.
- Solo se devuelven secciones visibles.
- Las imágenes y secciones respetan su orden persistido.
- Solo se devuelven oportunidades publicables pertenecientes a esa
  organización.
- Los textos configurables deben encontrarse validados y sanitizados.
- La consulta no modifica información persistente.

### Trazabilidad

- RF-18 — Consulta pública sin autenticación.
- RF-20 — Perfil mediante dirección única y estable.
- RF-23 — Control de visibilidad según estado de publicación.
- RF-24 — Exclusión pública de perfiles ocultos.
- RNF-16 — Exposición exclusiva de datos autorizados.
- RNF-17 — Dirección única y estable sin identificadores internos.
- RNF-18 — Fuente de datos compartida entre aplicación móvil y web.
- CU-18 — Consultar portal público.
- CU-20 — Consultar perfil institucional.
- CP-WEB-002 — Navegación pública hacia WEB-03.
- CP-WEB-007 — Acceso mediante dirección estable.
- CP-WEB-008 — Denegación de perfiles no disponibles.
- CP-WEB-009 — Visualización exclusiva de datos autorizados.
- CP-WEB-010 — Oportunidades publicadas de la organización.
- CA-12 — Consulta pública sin autenticación.
- CA-14 — Dirección única y datos autorizados.
- CA-16 — Estados que controlan la visibilidad pública.
- WEB-03 — Perfil institucional público.

---

## 13. Ocultar perfil público — ADMIN

### Endpoint

PATCH /api/admin/perfiles/:idPerfil/ocultar

### Acceso

Requiere:

- JWT válido.
- Rol `ADMIN`.
- Cuenta administrativa activa.
- Perfil público existente.

### Objetivo

Permitir que un administrador retire un perfil de la vista pública por motivos
de moderación, conservando íntegramente su contenido y registrando la
trazabilidad de la acción.

El ocultamiento administrativo no elimina el perfil.

### Parámetro de ruta

```text
idPerfil
```

Corresponde al identificador interno:

```text
perfil_publico_organizacion.id_perfil_publico
```

Este identificador se utiliza únicamente dentro de operaciones administrativas
protegidas y no forma parte de la dirección pública del perfil.

### Cuerpo de la solicitud

```json
{
  "motivo": "El perfil contiene información que requiere revisión."
}
```

### Campo requerido

```text
motivo
```

El motivo:

- es obligatorio;
- no puede contener únicamente espacios;
- debe almacenarse como parte de la trazabilidad;
- no debe mostrarse posteriormente en la API pública.

### Estados desde los cuales puede ocultarse

El administrador puede ocultar un perfil que se encuentre en:

```text
PUBLICADO
NO_PUBLICADO
```

La operación registra el estado anterior antes de pasar a:

```text
OCULTO
```

Ejemplos:

```text
PUBLICADO
    │
    └── ADMIN oculta
            │
            ▼
          OCULTO
```

```text
NO_PUBLICADO
    │
    └── ADMIN oculta
            │
            ▼
          OCULTO
```

Un perfil en `BORRADOR` no requiere ocultamiento administrativo porque ya no
es accesible públicamente.

Un perfil que ya se encuentra `OCULTO` no vuelve a ocultarse.

### Cambios realizados

La operación debe actualizar:

```text
estado_publicacion          = OCULTO
estado_publicacion_anterior = estado previo
ocultado_por                = id del ADMIN autenticado
ocultado_en                 = fecha y hora actual
motivo_ocultamiento         = motivo informado
actualizado_en              = fecha y hora actual
```

No debe modificar:

```text
nombre_visible
descripcion_publica
slug
plantilla
imagenes
secciones
datos de contacto
redes sociales
horario de atencion
publicado_en
retirado_en
```

### Ejemplo

Antes:

```text
estado_publicacion = PUBLICADO
```

Después:

```text
estado_publicacion          = OCULTO
estado_publicacion_anterior = PUBLICADO
ocultado_por                = uuid-admin
ocultado_en                 = 2026-09-15T15:00:00-03:00
motivo_ocultamiento         = El perfil contiene información que requiere revisión.
```

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Perfil ocultado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "OCULTO",
    "estado_publicacion_anterior": "PUBLICADO",
    "ocultado_en": "2026-09-15T15:00:00-03:00",
    "motivo_ocultamiento": "El perfil contiene información que requiere revisión."
  }
}
```

La respuesta administrativa puede incluir información de moderación que nunca
debe formar parte de los endpoints públicos.

### Efecto sobre el portal público

Una vez ocultado, el perfil debe desaparecer inmediatamente de:

```text
GET /api/public/organizaciones
```

y dejar de estar disponible mediante:

```text
GET /api/public/organizaciones/:slug
```

La consulta pública por slug debe responder:

HTTP 404

```json
{
  "error": "Perfil público no disponible"
}
```

No debe informar al visitante que el perfil fue ocultado por un administrador.

### Efecto sobre el propietario

El perfil:

- continúa existiendo;
- conserva todo su contenido;
- continúa asociado a la misma organización;
- conserva su slug;
- conserva plantilla, imágenes y secciones.

La organización puede seguir accediendo a sus datos mediante los endpoints
protegidos de gestión para realizar correcciones.

Sin embargo, la organización no puede cambiar por sí misma el estado:

```text
OCULTO → PUBLICADO
```

ni:

```text
OCULTO → NO_PUBLICADO
```

La rehabilitación corresponde exclusivamente a un `ADMIN`.

### Errores

#### Motivo ausente o inválido

HTTP 400

```json
{
  "error": "Debe indicar el motivo del ocultamiento"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ADMIN

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Perfil en BORRADOR

HTTP 409

```json
{
  "error": "Un perfil en borrador no requiere ocultamiento administrativo"
}
```

#### Perfil ya oculto

HTTP 409

```json
{
  "error": "El perfil ya se encuentra oculto"
}
```

#### Estado incompatible con la operación

HTTP 409

```json
{
  "error": "El estado actual del perfil no permite realizar el ocultamiento"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo ocultar el perfil público"
}
```

### Reglas de negocio

- Solo un usuario con rol ADMIN puede ocultar un perfil.
- El motivo es obligatorio.
- El perfil no se elimina.
- El contenido no se modifica.
- El slug no cambia.
- Antes de ocultar se registra el estado anterior.
- `estado_publicacion_anterior` solo puede registrar un estado válido para
  rehabilitación.
- El administrador responsable queda registrado en `ocultado_por`.
- Se registra la fecha del ocultamiento.
- Un perfil OCULTO desaparece de todas las consultas públicas.
- El propietario no puede rehabilitar el perfil.
- La organización conserva acceso protegido al contenido para realizar
  correcciones.
- El motivo y los datos de moderación nunca se exponen a visitantes.
- La operación debe ser atómica.

### Trazabilidad

- RF-24 — Moderación administrativa de perfiles.
- RF-23 — Estados de publicación.
- RNF-16 — No exposición de información interna de moderación.
- CU-24 — Moderar perfiles públicos.
- CP-PRF-009 — Ocultamiento administrativo conservando el contenido.
- CA-16 — Control de visibilidad pública.
- WEB-08 — Moderación administrativa.

---

## 14. Rehabilitar perfil público — ADMIN

### Endpoint

PATCH /api/admin/perfiles/:idPerfil/rehabilitar

### Acceso

Requiere:

- JWT válido.
- Rol `ADMIN`.
- Cuenta administrativa activa.
- Perfil público existente.
- Perfil actualmente en estado `OCULTO`.

### Objetivo

Rehabilitar un perfil previamente ocultado por moderación administrativa,
restaurando el estado que poseía antes del ocultamiento y conservando la
trazabilidad completa de la actuación administrativa.

La rehabilitación no crea un perfil nuevo ni modifica su contenido.

### Parámetro de ruta

```text
idPerfil
```

Corresponde a:

```text
perfil_publico_organizacion.id_perfil_publico
```

Este identificador se utiliza únicamente dentro de operaciones
administrativas protegidas.

### Cuerpo de la solicitud

No requiere cuerpo obligatorio.

```json
{}
```

El estado de destino se determina mediante:

```text
estado_publicacion_anterior
```

El ADMIN no selecciona manualmente el estado al cual retorna el perfil.

### Transiciones permitidas

Si el perfil fue ocultado desde:

```text
PUBLICADO
```

la rehabilitación intenta restaurar:

```text
OCULTO → PUBLICADO
```

Si el perfil fue ocultado desde:

```text
NO_PUBLICADO
```

la rehabilitación restaura:

```text
OCULTO → NO_PUBLICADO
```

### Validaciones previas

El backend debe comprobar que:

- el perfil exista;
- el estado actual sea `OCULTO`;
- `estado_publicacion_anterior` contenga `PUBLICADO` o `NO_PUBLICADO`;
- el usuario autenticado posea rol `ADMIN`.

Si el estado anterior era `PUBLICADO`, además debe verificarse que la
organización continúe cumpliendo las condiciones vigentes para exposición
pública.

Esto incluye:

```text
cuenta activa
+
organización verificada
+
perfil válido para publicación
```

Si dichas condiciones dejaron de cumplirse, el perfil no puede restaurarse
automáticamente a `PUBLICADO`.

### Cambios realizados

Cuando la rehabilitación es válida:

```text
estado_publicacion = estado_publicacion_anterior
actualizado_en     = fecha y hora actual
```

Los campos que describen el último ocultamiento pueden conservarse como
fotografía de la última medida administrativa.

El historial completo se conserva en:

```text
historial_moderacion_perfil
```

### Registro de historial

La misma transacción debe insertar una nueva actuación:

```text
accion          = REHABILITAR
estado_anterior = OCULTO
estado_nuevo    = estado restaurado
id_admin        = ADMIN autenticado
motivo          = NULL
creado_en       = fecha y hora actual
```

Por lo tanto, la operación debe realizar conceptualmente:

```text
BEGIN

1. validar estado actual y estado anterior;
2. actualizar perfil_publico_organizacion;
3. insertar evento REHABILITAR en historial_moderacion_perfil;

COMMIT
```

Ante cualquier error:

```text
ROLLBACK
```

### Contenido preservado

La rehabilitación no modifica:

```text
nombre_visible
descripcion_publica
slug
plantilla
imagenes
secciones
datos de contacto
redes sociales
horario de atencion
publicado_en
retirado_en
```

El perfil conserva el mismo:

```text
id_perfil_publico
```

### Respuesta satisfactoria

Ejemplo restaurando `PUBLICADO`.

HTTP 200

```json
{
  "message": "Perfil rehabilitado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "PUBLICADO",
    "estado_restaurado": "PUBLICADO",
    "actualizado_en": "2026-09-15T16:00:00-03:00"
  },
  "moderacion": {
    "accion": "REHABILITAR",
    "rehabilitado_por": "uuid-admin",
    "rehabilitado_en": "2026-09-15T16:00:00-03:00"
  }
}
```

Ejemplo restaurando `NO_PUBLICADO`.

HTTP 200

```json
{
  "message": "Perfil rehabilitado correctamente",
  "perfil": {
    "id_perfil_publico": "uuid",
    "slug": "actitud-solidaria",
    "estado_publicacion": "NO_PUBLICADO",
    "estado_restaurado": "NO_PUBLICADO",
    "actualizado_en": "2026-09-15T16:00:00-03:00"
  },
  "moderacion": {
    "accion": "REHABILITAR",
    "rehabilitado_por": "uuid-admin",
    "rehabilitado_en": "2026-09-15T16:00:00-03:00"
  }
}
```

### Efecto público

Si recupera:

```text
PUBLICADO
```

el perfil vuelve a poder aparecer en:

```text
GET /api/public/organizaciones
GET /api/public/organizaciones/:slug
```

siempre que la organización continúe siendo elegible.

Si recupera:

```text
NO_PUBLICADO
```

permanece fuera del portal hasta que la organización vuelva a publicarlo
mediante:

```text
PATCH /api/organizaciones/mi-perfil/publicar
```

### Errores

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ADMIN

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Perfil no oculto

HTTP 409

```json
{
  "error": "El perfil no se encuentra oculto"
}
```

#### Estado anterior inexistente o inválido

HTTP 409

```json
{
  "error": "No se puede determinar el estado previo del perfil"
}
```

#### No puede restaurarse a PUBLICADO

HTTP 409

```json
{
  "error": "La organización ya no cumple las condiciones necesarias para publicar el perfil"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo rehabilitar el perfil público"
}
```

### Reglas de negocio

- Solo un `ADMIN` puede rehabilitar un perfil.
- Solo puede rehabilitarse un perfil actualmente `OCULTO`.
- El ADMIN no elige el estado de destino.
- Se recupera el estado anterior registrado.
- Solo pueden restaurarse `PUBLICADO` o `NO_PUBLICADO`.
- Volver a `PUBLICADO` requiere que la organización continúe siendo elegible.
- La rehabilitación no modifica ni elimina contenido.
- El `slug` permanece sin cambios.
- La acción debe registrarse en `historial_moderacion_perfil`.
- El historial de ocultamientos anteriores no se elimina.
- Actualización del perfil e inserción del historial forman una única
  transacción atómica.

### Trazabilidad

- RF-24 — Moderación administrativa y trazabilidad.
- RF-23 — Estados de publicación.
- RNF-06 — Autorización por roles.
- RNF-07 — Protección de operaciones restringidas.
- RNF-16 — Protección de información administrativa.
- CU-24 — Moderar perfiles públicos.
- CP-PRF-010 — Ocultamiento y rehabilitación conservando ambas actuaciones.
- CA-16 — Control administrativo de la visibilidad.
- WEB-08 — Moderación administrativa.

---

## 15. Consultar catálogo público de tipos de actividad

### Endpoint

GET /api/public/tipos-actividad

### Acceso

Público.

No requiere:

- JWT;
- registro;
- inicio de sesión;
- rol de usuario.

### Objetivo

Obtener el catálogo de tipos de actividad disponible para construir los
filtros públicos del portal web.

El endpoint reutiliza la tabla existente:

```text
tipo_actividad
```

y no mantiene un catálogo independiente para el frontend web.

### Parámetros

No requiere parámetros de ruta ni cuerpo.

### Respuesta satisfactoria

HTTP 200

```json
{
  "tipos_actividad": [
    {
      "id_tipo_actividad": 1,
      "nombre": "Asistencia social"
    },
    {
      "id_tipo_actividad": 2,
      "nombre": "Educación"
    },
    {
      "id_tipo_actividad": 3,
      "nombre": "Ambiente"
    }
  ]
}
```

### Orden

Los tipos de actividad se devuelven ordenados alfabéticamente:

```text
nombre ASC
```

### Catálogo vacío

Si no existen tipos configurados:

HTTP 200

```json
{
  "tipos_actividad": []
}
```

### Errores

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo obtener el catálogo de tipos de actividad"
}
```

### Reglas de negocio

- El endpoint es público.
- No requiere encabezado `Authorization`.
- Utiliza el mismo catálogo `tipo_actividad` empleado por el resto del sistema.
- No crea ni modifica categorías.
- No duplica información específicamente para el portal web.
- Los identificadores retornados se utilizan como valores técnicos del
  catálogo y no identifican usuarios, organizaciones ni perfiles.
- La consulta es exclusivamente de lectura.

### Uso en WEB-02

El frontend puede utilizar la respuesta para construir el selector:

```text
Tipo de actividad
```

del directorio público.

Al aplicar el filtro, el identificador seleccionado puede utilizarse en la
consulta del directorio:

```text
GET /api/public/organizaciones?id_tipo_actividad=2
```

Por lo tanto, el contrato del directorio definido en la sección 11 adopta
`id_tipo_actividad` como parámetro técnico para este filtro.

### Trazabilidad

- RF-18 — Consulta pública sin autenticación.
- RF-19 — Filtrado público por tipo de actividad.
- CP-WEB-005 — Filtro público por tipo de actividad.
- WEB-02 — Directorio público de organizaciones.

---

## 16. Gestionar tipos de actividad de la organización

### Endpoint

PUT /api/organizaciones/mis-tipos-actividad

### Acceso

Requiere:

- JWT válido.
- Rol `ORGANIZACION`.
- Cuenta activa.
- Organización verificada.

### Objetivo

Definir el conjunto de tipos de actividad o áreas declaradas por la
organización autenticada.

La relación se almacena mediante:

```text
organizacion_tipo_actividad
```

y reutiliza el catálogo:

```text
tipo_actividad
```

### Motivo del contrato

El directorio público debe permitir filtrar organizaciones por tipo de
actividad.

Estos valores representan áreas declaradas por la organización y no deben
inferirse automáticamente a partir de las oportunidades que haya publicado.

### Cuerpo de la solicitud

```json
{
  "tipos_actividad": [
    1,
    3
  ]
}
```

Cada valor corresponde a:

```text
tipo_actividad.id_tipo_actividad
```

### Semántica de PUT

La operación sustituye completamente el conjunto actual.

Ejemplo:

Estado anterior:

```text
Asistencia social
Educación
```

Solicitud:

```json
{
  "tipos_actividad": [
    3
  ]
}
```

Estado posterior:

```text
Ambiente
```

No se conservan automáticamente los valores omitidos.

### Eliminar todas las asociaciones

Se permite enviar:

```json
{
  "tipos_actividad": []
}
```

Esto elimina todas las áreas declaradas de la organización sin eliminar los
registros del catálogo `tipo_actividad`.

### Validaciones

El backend debe comprobar que:

- `tipos_actividad` sea un arreglo;
- todos sus elementos sean identificadores válidos;
- cada identificador exista en `tipo_actividad`;
- no existan identificadores duplicados en la solicitud;
- la organización autenticada exista;
- la cuenta se encuentre activa;
- la organización se encuentre verificada.

### Respuesta satisfactoria

HTTP 200

```json
{
  "message": "Tipos de actividad actualizados correctamente",
  "tipos_actividad": [
    {
      "id_tipo_actividad": 1,
      "nombre": "Asistencia social"
    },
    {
      "id_tipo_actividad": 3,
      "nombre": "Ambiente"
    }
  ]
}
```

### Solicitud con arreglo vacío

HTTP 200

```json
{
  "message": "Tipos de actividad actualizados correctamente",
  "tipos_actividad": []
}
```

### Errores

#### Formato inválido

HTTP 400

```json
{
  "error": "Los tipos de actividad enviados son inválidos"
}
```

#### Identificador duplicado

HTTP 400

```json
{
  "error": "Un tipo de actividad no puede aparecer más de una vez"
}
```

#### Tipo inexistente

HTTP 400

```json
{
  "error": "Uno o más tipos de actividad no existen"
}
```

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ORGANIZACION

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Organización no activa o no verificada

HTTP 403

```json
{
  "error": "La organización debe estar activa y verificada"
}
```

#### Organización inexistente

HTTP 404

```json
{
  "error": "Organización no encontrada"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudieron actualizar los tipos de actividad"
}
```

### Atomicidad

La sustitución del conjunto debe realizarse dentro de una misma transacción.

Conceptualmente:

```text
BEGIN

eliminar asociaciones actuales
validar e insertar nuevas asociaciones

COMMIT
```

Si ocurre un error:

```text
ROLLBACK
```

La organización nunca debe quedar con una actualización parcial del conjunto.

### Reglas de negocio

- Una organización únicamente modifica sus propias asociaciones.
- La organización se determina desde el JWT.
- El cliente no envía `id_organizacion`.
- Los tipos deben existir previamente en `tipo_actividad`.
- Este endpoint no permite crear, editar ni eliminar categorías del catálogo.
- Las áreas declaradas no se calculan automáticamente a partir de las
  oportunidades publicadas.
- La operación sustituye el conjunto completo.
- La operación es atómica.
- Los cambios se reflejan posteriormente en los filtros públicos del portal.
- Aplicación móvil y portal web utilizan la misma fuente de datos.

### Trazabilidad

- RF-19 — Filtro de organizaciones por tipo de actividad.
- RF-21 — Gestión de información propia de la organización.
- CP-WEB-005 — Organizaciones asociadas a diferentes tipos de actividad.
- RNF-18 — Fuente compartida entre clientes.
- WEB-02 — Directorio público.
- WEB-05 — Gestión de información propia.

---

## 17. Consultar historial de moderación de un perfil — ADMIN

### Endpoint

GET /api/admin/perfiles/:idPerfil/historial-moderacion

### Acceso

Requiere:

- JWT válido.
- Rol `ADMIN`.
- Cuenta administrativa activa.

### Objetivo

Consultar la trazabilidad completa de las medidas administrativas aplicadas
sobre un perfil público.

El historial procede de:

```text
historial_moderacion_perfil
```

y permite reconstruir sucesivos ciclos de ocultamiento y rehabilitación sin
depender únicamente del estado actual del perfil.

### Parámetro de ruta

```text
idPerfil
```

Corresponde a:

```text
perfil_publico_organizacion.id_perfil_publico
```

El identificador se utiliza exclusivamente en una operación administrativa
protegida.

### Respuesta satisfactoria

HTTP 200

```json
{
  "perfil": {
    "id_perfil_publico": "uuid-perfil",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "PUBLICADO"
  },
  "historial": [
    {
      "id_historial_moderacion": "uuid-historial-2",
      "accion": "REHABILITAR",
      "estado_anterior": "OCULTO",
      "estado_nuevo": "PUBLICADO",
      "motivo": null,
      "administrador": {
        "id_usuario": "uuid-admin-2",
        "email": "admin2@voluntariado.org"
      },
      "creado_en": "2026-09-15T16:00:00-03:00"
    },
    {
      "id_historial_moderacion": "uuid-historial-1",
      "accion": "OCULTAR",
      "estado_anterior": "PUBLICADO",
      "estado_nuevo": "OCULTO",
      "motivo": "El perfil contiene información que requiere revisión.",
      "administrador": {
        "id_usuario": "uuid-admin-1",
        "email": "admin@voluntariado.org"
      },
      "creado_en": "2026-09-15T15:00:00-03:00"
    }
  ]
}
```

### Orden

El historial se devuelve desde la actuación más reciente hacia la más antigua:

```text
creado_en DESC
```

### Perfil sin actuaciones

Si el perfil existe pero nunca fue moderado:

HTTP 200

```json
{
  "perfil": {
    "id_perfil_publico": "uuid-perfil",
    "nombre_visible": "Actitud Solidaria",
    "slug": "actitud-solidaria",
    "estado_publicacion": "PUBLICADO"
  },
  "historial": []
}
```

### Información almacenada por actuación

Cada evento conserva:

```text
accion
estado_anterior
estado_nuevo
administrador
motivo
fecha
```

Las acciones permitidas son:

```text
OCULTAR
REHABILITAR
```

### Registro durante un ocultamiento

Cuando se ejecuta:

```text
PATCH /api/admin/perfiles/:idPerfil/ocultar
```

la misma transacción debe:

```text
1. actualizar perfil_publico_organizacion;
2. insertar un evento OCULTAR en historial_moderacion_perfil.
```

Ejemplo:

```text
accion          = OCULTAR
estado_anterior = PUBLICADO
estado_nuevo    = OCULTO
id_admin        = ADMIN autenticado
motivo          = motivo obligatorio
```

### Registro durante una rehabilitación

Cuando se ejecuta:

```text
PATCH /api/admin/perfiles/:idPerfil/rehabilitar
```

la misma transacción debe:

```text
1. restaurar el estado correspondiente;
2. insertar un evento REHABILITAR en historial_moderacion_perfil.
```

Ejemplo:

```text
accion          = REHABILITAR
estado_anterior = OCULTO
estado_nuevo    = PUBLICADO
id_admin        = ADMIN autenticado
motivo          = NULL
```

### Preservación histórica

Una rehabilitación no elimina el registro de ocultamiento previo.

Un nuevo ciclo tampoco sobrescribe los anteriores.

Ejemplo:

```text
PUBLICADO
   │
   ├─ OCULTAR
   ▼
 OCULTO
   │
   ├─ REHABILITAR
   ▼
PUBLICADO
   │
   ├─ OCULTAR
   ▼
 OCULTO
```

produce cuatro eventos independientes cuando posteriormente se realiza la
segunda rehabilitación.

### Errores

#### JWT ausente, inválido o vencido

HTTP 401

```json
{
  "error": "Token inválido o no proporcionado"
}
```

#### Usuario sin rol ADMIN

HTTP 403

```json
{
  "error": "Acceso denegado"
}
```

#### Perfil inexistente

HTTP 404

```json
{
  "error": "Perfil público no encontrado"
}
```

#### Error interno

HTTP 500

```json
{
  "error": "No se pudo obtener el historial de moderación"
}
```

### Seguridad y privacidad

Este endpoint nunca forma parte de las rutas públicas.

Información como:

- motivo de ocultamiento;
- administrador responsable;
- estados internos;
- fechas de moderación;

solo puede consultarse mediante una sesión ADMIN autorizada.

Ningún dato del historial debe incorporarse a:

```text
GET /api/public/organizaciones
```

ni a:

```text
GET /api/public/organizaciones/:slug
```

### Reglas de negocio

- Solo un ADMIN puede consultar el historial.
- Cada actuación se conserva como un registro independiente.
- Ocultar y registrar el evento forman una operación atómica.
- Rehabilitar y registrar el evento forman una operación atómica.
- El historial no se sobrescribe al producirse nuevas actuaciones.
- La eliminación o modificación del contenido del perfil no altera registros
  históricos previos.
- El historial se ordena cronológicamente en forma descendente.
- Los datos administrativos nunca se exponen mediante la API pública.

### Trazabilidad

- RF-24 — Moderación con trazabilidad.
- RNF-06 — Autorización por roles.
- RNF-07 — Protección de operaciones restringidas.
- RNF-16 — Protección de información administrativa.
- CU-24 — Moderar perfiles públicos.
- CP-PRF-010 — Conservación de ambas actuaciones.
- AD-05 — Moderación y consulta de historial.

Decisiones técnicas — Actividad 2.5.2

Propósito

Este archivo registra las decisiones adoptadas durante la actividad 2.5.2 — Migraciones y contratos de API para perfiles, para mantener trazabilidad entre la línea base aprobada por la SC-01, PostgreSQL y los contratos de API.

Prioridad de fuentes aplicada

Solicitud de Cambio SC-01 aprobada.

Actividad 2.0 — Replanificación técnica y actualización de líneas base.

Actividad 1.1.7 — Plan de Pruebas y Criterios de Aceptación v2.0.

Documentos técnicos e implementación existente.

Mockups SC-01 como referencia funcional.

D-2.5.2-01 — Plantillas

La línea base productiva tendrá dos plantillas activas:

clasica — Clásica 1.0.

comunidad — Comunidad 1.0.

clasica será la plantilla predeterminada asignada internamente por el backend al crear un perfil.

La Actividad 2.0 establece dos plantillas, mientras que el plan de pruebas y WEB-06 todavía mencionan tres: Clásica, Comunidad y Visual. Se aplica el orden de prioridad documental. Visual queda fuera de la línea base actual y puede considerarse una ampliación futura.

D-2.5.2-02 — Dirección pública estable

El slug se define al crear el perfil y no se modifica mediante la edición ordinaria. Cambiar nombre_visible no modifica la URL pública.

D-2.5.2-03 — Creación de perfiles

Todo perfil se crea en BORRADOR. El cliente no envía estado_publicacion ni id_plantilla; el backend asigna la plantilla clasica.

D-2.5.2-04 — Secciones controladas

Las secciones forman un conjunto controlado y no un constructor libre. Como catálogo funcional inicial se adoptan:

QUIENES_SOMOS

AREAS_TRABAJO

OPORTUNIDADES

GALERIA

No puede repetirse el mismo tipo_seccion dentro de un perfil ni existir dos secciones con el mismo orden. La unicidad del orden se define como diferible para permitir reordenamientos atómicos.

El catálogo se validará en backend y no se fija mediante un CHECK cerrado en PostgreSQL para permitir evolución controlada.

D-2.5.2-05 — Imágenes del perfil

Tipos admitidos:

LOGO

PORTADA

GALERIA

Cada perfil puede tener un único LOGO, una única PORTADA y múltiples imágenes de GALERIA.

Formatos de entrada de la línea base: JPEG y PNG.

El tamaño máximo se fija como decisión técnica en 5 MiB por archivo. RNF-21 exige un límite pero no fija un valor numérico; se adopta 5 MiB para mantener una política coherente con el tratamiento de imágenes ya existente en el proyecto.

El contrato redactado inicialmente con 2 MB y WEBP debe corregirse antes de cerrar 2.5.2.

D-2.5.2-06 — Almacenamiento externo

PostgreSQL guarda únicamente referencias y metadatos. Los bytes se almacenan fuera de PostgreSQL mediante un proveedor encapsulado por un Adapter. Las referencias publicadas serán HTTPS controladas.

D-2.5.2-07 — Historial de moderación

Se incorpora historial_moderacion_perfil como historial auditable de cada acción OCULTAR y REHABILITAR.

Los campos de moderación existentes en perfil_publico_organizacion funcionan como fotografía de la última medida. El historial conserva todos los ciclos.

Ocultar y rehabilitar deberán ejecutarse en transacciones que actualicen el perfil e inserten el historial de forma atómica.

El id_admin del historial es obligatorio y usa ON DELETE NO ACTION para preservar la trazabilidad administrativa.

D-2.5.2-08 — Rehabilitación

El ADMIN no elige arbitrariamente el estado de destino:

OCULTO → PUBLICADO si el perfil estaba PUBLICADO y la organización sigue siendo elegible.

OCULTO → NO_PUBLICADO si el perfil estaba NO_PUBLICADO.

D-2.5.2-09 — Tipos de actividad de una organización

Se incorpora la relación N organizacion_tipo_actividad, reutilizando el catálogo tipo_actividad.

No se infieren automáticamente las áreas de una organización a partir de sus oportunidades. Las áreas son información declarada por la organización y reutilizable por móvil y web.

D-2.5.2-10 — Contratos auxiliares pendientes de incorporar al documento API

Antes de cerrar 2.5.2 se documentarán tres contratos breves:

GET /api/public/tipos-actividad

PUT /api/organizaciones/mis-tipos-actividad

GET /api/admin/perfiles/:idPerfil/historial-moderacion

El primero permite que WEB-02 consulte el catálogo sin JWT; el segundo mantiene las áreas declaradas; el tercero permite a AD-05 consultar la trazabilidad de moderación.

D-2.5.2-11 — Seguridad pública

Un slug inexistente, BORRADOR, NO_PUBLICADO, OCULTO o perteneciente a una organización no elegible devuelve la misma respuesta pública de recurso no disponible, evitando revelar estados internos.

D-2.5.2-12 — Migraciones versionadas

No se modifica una migración que ya fue aplicada.

Secuencia:

001_crear_estructura_perfiles_publicos.sql

002_agregar_nombre_visible_perfil_publico.sql

003_ajustes_finales_perfiles_publicos.sql

Puntos que deben aparecer en el informe de 2.5.2

El informe deberá registrar:

la discrepancia dos vs. tres plantillas y la aplicación de la prioridad documental;

la incorporación del historial de moderación para RF-24 y CP-PRF-010;

la relación organización–tipo de actividad necesaria para RF-19;

el límite técnico de 5 MiB como decisión de implementación;

la corrección del contrato de imágenes a JPEG/PNG;

las restricciones de unicidad de secciones, logotipo y portada;

la decisión de mantener el slug estable;

las pruebas de migraciones realizadas primero con ROLLBACK y luego con COMMIT;

que los contratos de 2.5.2 serán la referencia para 2.5.3 y actividades posteriores.

## D-2.5.2-13 — Inicialización controlada de secciones

Al crear un perfil público se crean automáticamente cuatro configuraciones de
sección:

```text
QUIENES_SOMOS
AREAS_TRABAJO
OPORTUNIDADES
GALERIA
```

Se crean visibles y con orden inicial 1 a 4.

La decisión evita la creación arbitraria de secciones y mantiene el alcance
como editor estructurado y no como constructor libre de páginas.

## D-2.5.2-14 — Fuente única de contenido por sección

Las secciones utilizan las siguientes fuentes:

```text
QUIENES_SOMOS  → seccion_perfil_organizacion.contenido
AREAS_TRABAJO  → organizacion_tipo_actividad + tipo_actividad
OPORTUNIDADES  → oportunidad
GALERIA        → imagen_perfil_organizacion
```

No se duplican tipos de actividad, oportunidades ni imágenes dentro del JSON
de las secciones.

## D-2.5.2-15 — Edición y publicación

Para evitar mantener simultáneamente una versión pública y una versión de
borrador sin disponer de un sistema de versionado, las operaciones de edición
del perfil, plantilla, secciones e imágenes se admiten en:

```text
BORRADOR
NO_PUBLICADO
OCULTO
```

Un perfil PUBLICADO debe retirarse primero y pasar a NO_PUBLICADO antes de
ser modificado.

La edición de un perfil OCULTO no implica su rehabilitación.

## D-2.5.2-16 — Previsualización sin duplicación

La previsualización se construye a partir de los datos protegidos del mismo
perfil y de la plantilla seleccionada.

No se crea una segunda entidad de perfil, una copia pública temporal ni un
estado adicional.

La vista previa requiere autenticación y no modifica el estado de publicación.

## D-2.5.2-17 — Alcance de ocultamiento administrativo

En la línea base actual la transición funcional de ocultamiento es:

```text
PUBLICADO → OCULTO
```

La rehabilitación restaura el estado anterior permitido y conserva el historial
de moderación.