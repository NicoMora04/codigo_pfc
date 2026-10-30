import {
  useEffect,
  useState,
} from 'react'

import {
  Link,
} from 'react-router-dom'

import {
  cerrarSesion,
} from '../services/authService.js'

import {
  obtenerMiPerfilOrganizacion,
  actualizarMiPerfilOrganizacion,
  crearMiPerfilOrganizacion,
  listarPlantillasPerfil,
  actualizarPlantillaMiPerfil,
  subirLogoPerfil,
  subirPortadaPerfil,
  agregarImagenGaleriaPerfil,
  eliminarImagenGaleriaPerfil,
  guardarSeccionPerfil,
  publicarMiPerfil,
  retirarMiPerfil,
  listarTiposActividad,
  actualizarTiposActividadMiPerfil,
  buscarUbicaciones,
  actualizarUbicacionMiPerfil,
  actualizarOrdenSeccionesMiPerfil,
} from '../services/publicPortalService.js'

import {
  BACKEND_URL,
} from '../config/env.js'

function MiPerfilOrganizacionPage() {

const [
    perfil,
    setPerfil,
  ] = useState(null)


const [
    loading,
    setLoading,
  ] = useState(true)


const [
    guardando,
    setGuardando,
  ] = useState(false)


const [
    editando,
    setEditando,
  ] = useState(false)


const [
    error,
    setError,
  ] = useState('')


const [
    mensaje,
    setMensaje,
  ] = useState('')


const [
  formulario,
  setFormulario,
] = useState({
  nombreVisible: '',
  descripcionPublica: '',
  emailContactoPublico: '',
  telefonoContactoPublico: '',
  sitioWebUrl: '',

  instagram: '',
  facebook: '',
  linkedin: '',
  horarioAtencion: '',
})

const [
  creando,
  setCreando,
] = useState(false)

const [
  plantillas,
  setPlantillas,
] = useState([])

const [
  cambiandoPlantilla,
  setCambiandoPlantilla,
] = useState(false)

const [
  subiendoImagen,
  setSubiendoImagen,
] = useState(false)

const [
  textoAlternativoLogo,
  setTextoAlternativoLogo,
] = useState('')

const [
  textoAlternativoPortada,
  setTextoAlternativoPortada,
] = useState('')

const [
  textoAlternativoGaleria,
  setTextoAlternativoGaleria,
] = useState('')

const [
  guardandoSeccion,
  setGuardandoSeccion,
] = useState(false)

const [
  ordenSecciones,
  setOrdenSecciones,
] = useState([
  'SOBRE_NOSOTROS',
  'MISION',
  'IMPACTO',
  'ACTUALIDAD',
])

const [
  cambiandoOrdenSecciones,
  setCambiandoOrdenSecciones,
] = useState(false)

const [
  seccionesFormulario,
  setSeccionesFormulario,
] = useState({
  SOBRE_NOSOTROS: {
    titulo: '',
    texto: '',
    visible: true,
  },

  MISION: {
    titulo: '',
    texto: '',
    visible: true,
  },

  IMPACTO: {
    titulo: '',
    texto: '',
    visible: true,
  },

  ACTUALIDAD: {
    titulo: '',
    visible: true,
    items: [],
  },
})

const [
  cambiandoPublicacion,
  setCambiandoPublicacion,
] = useState(false)

const [
  tiposActividad,
  setTiposActividad,
] = useState([])


const [
  idsTiposActividad,
  setIdsTiposActividad,
] = useState([])

const [
  busquedaUbicacion,
  setBusquedaUbicacion,
] = useState('')


const [
  resultadosUbicacion,
  setResultadosUbicacion,
] = useState([])


const [
  ubicacionSeleccionada,
  setUbicacionSeleccionada,
] = useState(null)


const [
  buscandoUbicacion,
  setBuscandoUbicacion,
] = useState(false)

  // ======================================================
  // CARGAR PERFIL
  // ======================================================

  useEffect(() => {

    const cargarPerfil =
      async () => {

        try {

          setLoading(true)

          setError('')


          const [
              data,
              plantillasDisponibles,
              tiposActividadDisponibles,
            ] =
              await Promise.all([
                obtenerMiPerfilOrganizacion(),
                listarPlantillasPerfil(),
                listarTiposActividad(),
              ])
          
          setPerfil(
            data
          )

          const seccionesOrdenadas =
            Array.isArray(data?.secciones)
              ? [...data.secciones]
                  .sort(
                    (a, b) =>
                      Number(a.orden) -
                      Number(b.orden)
                  )
                  .map(
                    seccion =>
                      seccion.tipo_seccion
                  )
              : []


          if (
            seccionesOrdenadas.length > 0
          ) {

            setOrdenSecciones(
              seccionesOrdenadas
            )

          }

          const seccionSobreNosotros =
            data?.secciones?.find(
              seccion =>
                seccion.tipo_seccion ===
                  'SOBRE_NOSOTROS'
            )


          const seccionMision =
            data?.secciones?.find(
              seccion =>
                seccion.tipo_seccion ===
                  'MISION'
            )


          const seccionImpacto =
            data?.secciones?.find(
              seccion =>
                seccion.tipo_seccion ===
                  'IMPACTO'
            )


          const seccionActualidad =
            data?.secciones?.find(
              seccion =>
                seccion.tipo_seccion ===
                  'ACTUALIDAD'
            )


          setSeccionesFormulario({

            SOBRE_NOSOTROS: {
              titulo:
                seccionSobreNosotros
                  ?.titulo || '',

              texto:
                seccionSobreNosotros
                  ?.contenido
                  ?.texto || '',

              visible:
                seccionSobreNosotros
                  ?.visible !== false,
            },


            MISION: {
              titulo:
                seccionMision
                  ?.titulo || '',

              texto:
                seccionMision
                  ?.contenido
                  ?.texto || '',

              visible:
                seccionMision
                  ?.visible !== false,
            },


            IMPACTO: {
              titulo:
                seccionImpacto
                  ?.titulo || '',

              texto:
                seccionImpacto
                  ?.contenido
                  ?.texto || '',

              visible:
                seccionImpacto
                  ?.visible !== false,
            },


            ACTUALIDAD: {
              titulo:
                seccionActualidad
                  ?.titulo || '',

              visible:
                seccionActualidad
                  ?.visible !== false,

              items:
                Array.isArray(
                  seccionActualidad
                    ?.contenido
                    ?.items
                )
                  ? seccionActualidad
                      .contenido
                      .items
                  : [],
            },

          })

          setPlantillas(
            plantillasDisponibles
          )

          setTiposActividad(
            tiposActividadDisponibles
          )


          setIdsTiposActividad(
            Array.isArray(
              data?.tipos_actividad
            )
              ? data.tipos_actividad.map(
                  tipo =>
                    Number(
                      tipo.id_tipo_actividad
                    )
                )
              : []
          )

          const ubicacionActual =
            data?.organizacion
              ?.ubicacion ||
            null


          setUbicacionSeleccionada(
            ubicacionActual
          )


          setBusquedaUbicacion(
            ubicacionActual
              ? [
                  ubicacionActual.direccion,
                  ubicacionActual.localidad,
                  ubicacionActual.provincia,
                ]
                  .filter(Boolean)
                  .join(', ')
              : ''
          )



          if (data) {

            setFormulario({

              nombreVisible:
                data.nombre_visible || '',

              descripcionPublica:
                data.descripcion_publica || '',

              emailContactoPublico:
                data.email_contacto_publico || '',

              telefonoContactoPublico:
                data.telefono_contacto_publico || '',

              sitioWebUrl:
                data.sitio_web_url || '',
              
              instagram:
                data.redes_sociales
                  ?.instagram || '',

              facebook:
                data.redes_sociales
                  ?.facebook || '',

              linkedin:
                data.redes_sociales
                  ?.linkedin || '',

              horarioAtencion:
                data.horario_atencion
                  ?.texto || '',

            })

          }

        }
        catch (error) {

          setError(
            error.message ||
            'No se pudo cargar el perfil institucional'
          )

        }
        finally {

          setLoading(false)

        }

      }


    cargarPerfil()

  }, [])

  useEffect(() => {

    if (
      !editando ||
      busquedaUbicacion
        .trim()
        .length < 3
    ) {

      setResultadosUbicacion([])

      return

    }


    const textoActual =
      [
        ubicacionSeleccionada
          ?.direccion,

        ubicacionSeleccionada
          ?.localidad,

        ubicacionSeleccionada
          ?.provincia,
      ]
        .filter(Boolean)
        .join(', ')


    if (
      ubicacionSeleccionada &&
      busquedaUbicacion ===
        textoActual
    ) {

      setResultadosUbicacion([])

      return

    }


    const timeout =
      setTimeout(
        async () => {

          try {

            setBuscandoUbicacion(
              true
            )


            const resultados =
              await buscarUbicaciones(
                busquedaUbicacion
                  .trim()
              )


            setResultadosUbicacion(
              resultados
            )

          }
          catch {

            setResultadosUbicacion(
              []
            )

          }
          finally {

            setBuscandoUbicacion(
              false
            )

          }

        },
        600
      )


    return () =>
      clearTimeout(
        timeout
      )

  }, [
    busquedaUbicacion,
    editando,
    ubicacionSeleccionada,
  ])

  const obtenerUrlImagen =
    (url) => {

      if (!url) {
        return ''
      }

      if (
        url.startsWith(
          'http://'
        ) ||
        url.startsWith(
          'https://'
        )
      ) {
        return url
      }

      return `${BACKEND_URL}${url}`

    }

  // ======================================================
  // CAMBIOS DEL FORMULARIO
  // ======================================================

  const handleChange =
    (
      event
    ) => {

      const {
        name,
        value
      } =
        event.target


      setFormulario(
        anterior => ({
          ...anterior,
          [name]: value,
        })
      )

    }


  // ======================================================
  // ACTIVAR EDICIÓN
  // ======================================================

  const handleEditar =
    () => {

      setError('')

      setMensaje('')

      setEditando(true)

    }


  // ======================================================
  // CANCELAR EDICIÓN
  // ======================================================

  const handleCancelar =
    () => {

      if (perfil) {

        setFormulario({

          nombreVisible:
            perfil.nombre_visible || '',

          descripcionPublica:
            perfil.descripcion_publica || '',

          emailContactoPublico:
            perfil.email_contacto_publico || '',

          telefonoContactoPublico:
            perfil.telefono_contacto_publico || '',

          sitioWebUrl:
            perfil.sitio_web_url || '',

        })

        const ubicacionOriginal =
          perfil?.organizacion
            ?.ubicacion ||
          null


        setUbicacionSeleccionada(
          ubicacionOriginal
        )


        setBusquedaUbicacion(
          ubicacionOriginal
            ? [
                ubicacionOriginal.direccion,
                ubicacionOriginal.localidad,
                ubicacionOriginal.provincia,
              ]
                .filter(Boolean)
                .join(', ')
            : ''
        )


        setResultadosUbicacion([])

        setIdsTiposActividad(
          Array.isArray(
            perfil.tipos_actividad
          )
            ? perfil.tipos_actividad.map(
                tipo =>
                  Number(
                    tipo.id_tipo_actividad
                  )
              )
            : []
        )

      }


      setError('')

      setMensaje('')

      setEditando(false)

    }

  const handleSubirLogo =
  async (
    event
  ) => {

    const archivo =
      event.target.files?.[0]


    if (!archivo) {
      return
    }


    try {

      setSubiendoImagen(true)

      setError('')

      setMensaje('')


      await subirLogoPerfil(
        archivo,
        textoAlternativoLogo
      )


      const perfilActualizado =
        await obtenerMiPerfilOrganizacion()


      setPerfil(
        perfilActualizado
      )

      const ubicacionActualizada =
        perfilActualizado
          ?.organizacion
          ?.ubicacion ||
        null


      setUbicacionSeleccionada(
        ubicacionActualizada
      )


      setBusquedaUbicacion(
        ubicacionActualizada
          ? [
              ubicacionActualizada.direccion,
              ubicacionActualizada.localidad,
              ubicacionActualizada.provincia,
            ]
              .filter(Boolean)
              .join(', ')
          : ''
      )


      setMensaje(
        'Logo actualizado correctamente.'
      )

    }
    catch (error) {

      setError(
        error.message ||
        'No se pudo actualizar el logo'
      )

    }
    finally {

      setSubiendoImagen(false)

      event.target.value = ''

    }

  }


const handleSubirPortada =
  async (
    event
  ) => {

    const archivo =
      event.target.files?.[0]


    if (!archivo) {
      return
    }


    try {

      setSubiendoImagen(true)

      setError('')

      setMensaje('')


      await subirPortadaPerfil(
        archivo,
        textoAlternativoPortada
      )


      const perfilActualizado =
        await obtenerMiPerfilOrganizacion()


      setPerfil(
        perfilActualizado
      )


      setMensaje(
        'Portada actualizada correctamente.'
      )

    }
    catch (error) {

      setError(
        error.message ||
        'No se pudo actualizar la portada'
      )

    }
    finally {

      setSubiendoImagen(false)

      event.target.value = ''

    }

  }


const handleAgregarGaleria =
  async (
    event
  ) => {

    const archivo =
      event.target.files?.[0]


    if (!archivo) {
      return
    }


    try {

      setSubiendoImagen(true)

      setError('')

      setMensaje('')


      await agregarImagenGaleriaPerfil(
        archivo,
        textoAlternativoGaleria
      )


      const perfilActualizado =
        await obtenerMiPerfilOrganizacion()


      setPerfil(
        perfilActualizado
      )


      setTextoAlternativoGaleria(
        ''
      )


      setMensaje(
        'Imagen agregada a la galería.'
      )

    }
    catch (error) {

      setError(
        error.message ||
        'No se pudo agregar la imagen'
      )

    }
    finally {

      setSubiendoImagen(false)

      event.target.value = ''

    }

  }

// ======================================================
// SELECCIONAR TIPOS DE ACTIVIDAD
// ACTIVIDAD 3.6.5
// ======================================================

const handleCambiarTipoActividad =
  (
    idTipoActividad
  ) => {

    const id =
      Number(
        idTipoActividad
      )


    setIdsTiposActividad(
      anteriores => {

        if (
          anteriores.includes(
            id
          )
        ) {

          return anteriores.filter(
            idActual =>
              idActual !== id
          )

        }


        return [
          ...anteriores,
          id,
        ]

      }
    )

  }

  // ======================================================
  // SELECCIONAR UBICACIÓN
  // ======================================================
  const handleSeleccionarUbicacion =
  (
    ubicacion
  ) => {

    setUbicacionSeleccionada(
      ubicacion
    )


    setBusquedaUbicacion(
      [
        ubicacion.nombre,
        ubicacion.localidad,
        ubicacion.provincia,
      ]
        .filter(Boolean)
        .join(', ')
    )


    setResultadosUbicacion(
      []
    )

  }

  // ======================================================
  // GUARDAR CAMBIOS
  // ======================================================

  const handleGuardar =
    async (
      event
    ) => {

      event.preventDefault()


      setError('')

      setMensaje('')


      if (
        !formulario.nombreVisible
          .trim()
      ) {

        setError(
          'El nombre público es obligatorio'
        )

        return

      }


      try {

        setGuardando(true)


        const perfilActualizado =
          await actualizarMiPerfilOrganizacion(
            {
              nombreVisible:
                formulario
                  .nombreVisible
                  .trim(),

              descripcionPublica:
                formulario
                  .descripcionPublica
                  .trim(),

              emailContactoPublico:
                formulario
                  .emailContactoPublico
                  .trim(),

              telefonoContactoPublico:
                formulario
                  .telefonoContactoPublico
                  .trim(),

              sitioWebUrl:
                formulario
                  .sitioWebUrl
                  .trim(),
              
              redesSociales: {

                instagram:
                  formulario.instagram.trim(),

                facebook:
                  formulario.facebook.trim(),

                linkedin:
                  formulario.linkedin.trim(),

              },

              horarioAtencion: {

                texto:
                  formulario
                    .horarioAtencion
                    .trim(),

              },
            }
          )


          await actualizarTiposActividadMiPerfil(
            idsTiposActividad
          )

          if (
              ubicacionSeleccionada
            ) {

              await actualizarUbicacionMiPerfil({
                latitud:
                  Number(
                    ubicacionSeleccionada
                      .latitud
                  ),

                longitud:
                  Number(
                    ubicacionSeleccionada
                      .longitud
                  ),

                direccion:
                  ubicacionSeleccionada
                    .direccion ||
                  ubicacionSeleccionada
                    .nombre ||
                  null,

                localidad:
                  ubicacionSeleccionada
                    .localidad ||
                  null,

                provincia:
                  ubicacionSeleccionada
                    .provincia ||
                  null,
              })

            }


          const perfilRecargado =
            await obtenerMiPerfilOrganizacion()


          setPerfil(
            perfilRecargado
          )

          const ubicacionActualizada =
            perfilRecargado
              ?.organizacion
              ?.ubicacion ||
            null


          setUbicacionSeleccionada(
            ubicacionActualizada
          )


          setBusquedaUbicacion(
            ubicacionActualizada
              ? [
                  ubicacionActualizada.direccion,
                  ubicacionActualizada.localidad,
                  ubicacionActualizada.provincia,
                ]
                  .filter(Boolean)
                  .join(', ')
              : ''
          )


          setFormulario({

            nombreVisible:
              perfilRecargado
                .nombre_visible || '',

            descripcionPublica:
              perfilRecargado
                .descripcion_publica || '',

            emailContactoPublico:
              perfilRecargado
                .email_contacto_publico || '',

            telefonoContactoPublico:
              perfilRecargado
                .telefono_contacto_publico || '',

            sitioWebUrl:
              perfilRecargado
                .sitio_web_url || '',

          })


          setMensaje(
            'Los cambios se guardaron correctamente.'
          )


          setEditando(false)

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudieron guardar los cambios'
        )

      }
      finally {

        setGuardando(false)

      }

    }

// ======================================================
// CREAR PERFIL
// ======================================================

const handleCrearPerfil =
    async () => {

      setError('')
      setMensaje('')


      try {

        setCreando(true)


        const perfilCreado =
          await crearMiPerfilOrganizacion()


        setPerfil(
          perfilCreado
        )


        setFormulario({

          nombreVisible:
            perfilCreado
              .nombre_visible || '',

          descripcionPublica:
            perfilCreado
              .descripcion_publica || '',

          emailContactoPublico:
            perfilCreado
              .email_contacto_publico || '',

          telefonoContactoPublico:
            perfilCreado
              .telefono_contacto_publico || '',

          sitioWebUrl:
            perfilCreado
              .sitio_web_url || '',

        })


        setMensaje(
          'El perfil institucional fue creado correctamente.'
        )


        setEditando(true)

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo crear el perfil institucional'
        )

      }
      finally {

        setCreando(false)

      }

    }

  // ======================================================
  // CAMBIAR PLANTILLA
  // ACTIVIDAD 3.6.3
  // ======================================================

  const handleCambiarPlantilla =
    async (
      codigoPlantilla
    ) => {

      if (
        cambiandoPlantilla ||
        perfil?.plantilla?.codigo ===
          codigoPlantilla
      ) {

        return

      }


      setError('')
      setMensaje('')


      try {

        setCambiandoPlantilla(
          true
        )


        await actualizarPlantillaMiPerfil(
          codigoPlantilla
        )


        const perfilActualizado =
          await obtenerMiPerfilOrganizacion()


        setPerfil(
          perfilActualizado
        )


        setMensaje(
          'La plantilla se actualizó correctamente.'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo actualizar la plantilla'
        )

      }
      finally {

        setCambiandoPlantilla(
          false
        )

      }

    }

  // ======================================================
  // ELIMINAR IMAGEN DE GALERÍA
  // ACTIVIDAD 3.6.3
  // ======================================================
  const handleEliminarImagenGaleria =
    async (
      idImagen
    ) => {

      const confirmar =
        window.confirm(
          '¿Seguro que querés eliminar esta imagen de la galería?'
        )


      if (!confirmar) {
        return
      }


      try {

        setSubiendoImagen(true)

        setError('')

        setMensaje('')


        await eliminarImagenGaleriaPerfil(
          idImagen
        )


        const perfilActualizado =
          await obtenerMiPerfilOrganizacion()


        setPerfil(
          perfilActualizado
        )


        setMensaje(
          'Imagen eliminada de la galería.'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo eliminar la imagen'
        )

      }
      finally {

        setSubiendoImagen(false)

      }

    }


  // ======================================================
  // CREAR SECCIONES PERFIL 3.6.3
  // ======================================================
  const handleGuardarSeccion =
    async (
      tipo
    ) => {

      try {

        setGuardandoSeccion(true)

        setError('')

        setMensaje('')


        const datos =
          seccionesFormulario[
            tipo
          ]


        await guardarSeccionPerfil(
          tipo,
          datos
        )


        const perfilActualizado =
          await obtenerMiPerfilOrganizacion()


        setPerfil(
          perfilActualizado
        )


        setMensaje(
          'Sección guardada correctamente.'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo guardar la sección'
        )

      }
      finally {

        setGuardandoSeccion(false)

      }

    }
  
// ======================================================
// CAMBIAR ORDEN DE SECCIONES
// CP-PRF-006
// ======================================================

const handleMoverSeccion =
  async (
    tipoSeccion,
    direccion
  ) => {

    if (
      cambiandoOrdenSecciones
    ) {
      return
    }


    const indiceActual =
      ordenSecciones.indexOf(
        tipoSeccion
      )


    if (
      indiceActual === -1
    ) {
      return
    }


    const indiceDestino =
      direccion === 'SUBIR'
        ? indiceActual - 1
        : indiceActual + 1


    if (
      indiceDestino < 0 ||
      indiceDestino >=
        ordenSecciones.length
    ) {
      return
    }


    const nuevoOrden = [
      ...ordenSecciones,
    ]


    const temporal =
      nuevoOrden[indiceActual]


    nuevoOrden[indiceActual] =
      nuevoOrden[indiceDestino]


    nuevoOrden[indiceDestino] =
      temporal


    setError('')
    setMensaje('')


    try {

      setCambiandoOrdenSecciones(
        true
      )


      await actualizarOrdenSeccionesMiPerfil(
        nuevoOrden
      )


      setOrdenSecciones(
        nuevoOrden
      )


      const perfilActualizado =
        await obtenerMiPerfilOrganizacion()


      setPerfil(
        perfilActualizado
      )


      setMensaje(
        'El orden de las secciones se actualizó correctamente.'
      )

    }
    catch (error) {

      setError(
        error.message ||
        'No se pudo actualizar el orden de las secciones'
      )

    }
    finally {

      setCambiandoOrdenSecciones(
        false
      )

    }

  }

  // ======================================================
  // CAMBIAR SECCION PERFIL 3.6.3
  // ======================================================
  const handleCambiarSeccion =
  (
    tipo,
    campo,
    valor
  ) => {

    setSeccionesFormulario(
      anterior => ({

        ...anterior,

        [tipo]: {

          ...anterior[tipo],

          [campo]:
            valor,

        },

      })
    )

  }

  // ======================================================
  // AGREGAR ACTUALIDAD 3.6.3
  // ======================================================
  const handleAgregarActualidad =
  () => {

    setSeccionesFormulario(
      anterior => ({

        ...anterior,

        ACTUALIDAD: {

          ...anterior.ACTUALIDAD,

          items: [
            ...anterior
              .ACTUALIDAD
              .items,

            {
              titulo: '',
              fecha: '',
              texto: '',
              imagen: '',
              enlace: '',
            },
          ],

        },

      })
    )

  }


const handleCambiarItemActualidad =
  (
    indice,
    campo,
    valor
  ) => {

    setSeccionesFormulario(
      anterior => {

        const itemsActualizados =
          anterior
            .ACTUALIDAD
            .items
            .map(
              (
                item,
                index
              ) => {

                if (
                  index !== indice
                ) {
                  return item
                }

                return {
                  ...item,
                  [campo]: valor,
                }

              }
            )


        return {

          ...anterior,

          ACTUALIDAD: {

            ...anterior
              .ACTUALIDAD,

            items:
              itemsActualizados,

          },

        }

      }
    )

  }


const handleEliminarItemActualidad =
  (
    indice
  ) => {

    const confirmar =
      window.confirm(
        '¿Seguro que querés eliminar esta novedad?'
      )


    if (!confirmar) {
      return
    }


    setSeccionesFormulario(
      anterior => ({

        ...anterior,

        ACTUALIDAD: {

          ...anterior
            .ACTUALIDAD,

          items:
            anterior
              .ACTUALIDAD
              .items
              .filter(
                (
                  _,
                  index
                ) =>
                  index !== indice
              ),

        },

      })
    )

  }

  const handlePublicarPerfil =
    async () => {

      const confirmar =
        window.confirm(
          '¿Querés publicar este perfil? Será visible en el portal público.'
        )


      if (!confirmar) {
        return
      }


      try {

        setCambiandoPublicacion(true)

        setError('')

        setMensaje('')


        await publicarMiPerfil()


        const perfilActualizado =
          await obtenerMiPerfilOrganizacion()


        setPerfil(
          perfilActualizado
        )


        setMensaje(
          'Perfil publicado correctamente.'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo publicar el perfil'
        )

      }
      finally {

        setCambiandoPublicacion(false)

      }

    }


  const handleRetirarPerfil =
    async () => {

      const confirmar =
        window.confirm(
          '¿Querés retirar este perfil de la vista pública? El contenido se conservará.'
        )


      if (!confirmar) {
        return
      }


      try {

        setCambiandoPublicacion(true)

        setError('')

        setMensaje('')


        await retirarMiPerfil()


        const perfilActualizado =
          await obtenerMiPerfilOrganizacion()


        setPerfil(
          perfilActualizado
        )


        setMensaje(
          'Perfil retirado de la vista pública.'
        )

      }
      catch (error) {

        setError(
          error.message ||
          'No se pudo retirar el perfil'
        )

      }
      finally {

        setCambiandoPublicacion(false)

      }

    }
  // ======================================================
  // CERRAR SESIÓN
  // ======================================================

  const handleCerrarSesion =
    () => {

      cerrarSesion()

      window.location.href =
        '/acceso-organizacion'

    }


  // ======================================================
  // ESTADO DE CARGA
  // ======================================================

  if (loading) {

    return (

      <main className="site-container">

        <div
          className="loading-state"
          style={{
            marginTop:
              '3rem',
          }}
        >
          Cargando perfil institucional...
        </div>

      </main>

    )

  }


  return (

    <main
      className="site-container"
      style={{
        padding:
          '3rem 0',
      }}
    >

      {/* ================================================= */}
      {/* ENCABEZADO */}
      {/* ================================================= */}

      <div
        style={{
          display:
            'flex',

          justifyContent:
            'space-between',

          alignItems:
            'flex-start',

          gap:
            '1rem',

          marginBottom:
            '2rem',

          flexWrap:
            'wrap',
        }}
      >

        <div>

          <span
            className="home-section-eyebrow"
          >
            Gestión institucional
          </span>


          <h1
            style={{
              margin:
                '0.3rem 0 0',

              color:
                'var(--primary-dark)',
            }}
          >
            Mi perfil institucional
          </h1>

        </div>


        <button
          type="button"
          className="secondary-button"
          onClick={
            handleCerrarSesion
          }
        >
          Cerrar sesión
        </button>

      </div>


      {/* ================================================= */}
      {/* MENSAJES */}
      {/* ================================================= */}

      {error && (

        <div
          className="error-state"
          style={{
            marginBottom:
              '1rem',
          }}
        >
          {error}
        </div>

      )}


      {mensaje && (

        <div
          className="reset-password-success"
          style={{
            marginBottom:
              '1rem',
          }}
        >
          {mensaje}
        </div>

      )}


      {/* ================================================= */}
      {/* PERFIL INEXISTENTE */}
      {/* ================================================= */}

      {!perfil && (

        <section
          className="panel"
          style={{
            padding:
              '2rem',
          }}
        >

          <span
            className="verified-badge"
          >
            SIN CREAR
          </span>


          <h2
            style={{
              color:
                'var(--primary-dark)',

              marginTop:
                '1rem',
            }}
          >
            Tu perfil público todavía no fue creado
          </h2>


          <p
            style={{
              color:
                'var(--muted)',

              lineHeight:
                1.6,

              maxWidth:
                '650px',
            }}
          >
            Completá la información institucional
            para crear el perfil público de tu
            organización.
          </p>


          <button
            type="button"
            className="primary-button"
            onClick={
              handleCrearPerfil
            }
            disabled={
              creando
            }
          >
            {creando
              ? 'Creando perfil...'
              : 'Crear perfil'}
          </button>

        </section>

      )}


      {/* ================================================= */}
      {/* PERFIL EXISTENTE */}
      {/* ================================================= */}

      {perfil && (

        <>

          {/* ESTADO DEL PERFIL */}

          <section
            className="panel"
            style={{
              padding:
                '1.5rem',

              marginBottom:
                '1.5rem',
            }}
          >

            <div
              style={{
                display:
                  'flex',

                justifyContent:
                  'space-between',

                alignItems:
                  'flex-start',

                gap:
                  '1rem',

                flexWrap:
                  'wrap',
              }}
            >

              <div>

                <span
                  className="verified-badge"
                >
                  {
                    perfil
                      .estado_publicacion
                  }
                </span>


                <h2
                  style={{
                    margin:
                      '0.8rem 0 0.4rem',

                    color:
                      'var(--primary-dark)',
                  }}
                >
                  {
                    perfil
                      .nombre_visible ||
                    'Perfil institucional'
                  }
                </h2>


                <p
                  style={{
                    margin:
                      0,

                    color:
                      'var(--muted)',
                  }}
                >
                  {
                    perfil.slug
                      ? `/organizaciones/${perfil.slug}`
                      : 'Sin URL pública'
                  }
                </p>
              </div>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  flexWrap: 'wrap',
                }}
              >

                <Link
                  to="/mi-perfil/previsualizacion"
                  className="secondary-button"
                >
                  Previsualizar perfil
                </Link>

                <div
                  className="profile-publication-actions"
                >

                  {perfil.estado_publicacion ===
                    'PUBLICADO' ? (

                    <>

                      <Link
                        to={
                          `/organizaciones/${perfil.slug}`
                        }
                        className="secondary-button"
                      >
                        Ver perfil público
                      </Link>


                      <button
                        type="button"
                        className="profile-withdraw-button"
                        onClick={
                          handleRetirarPerfil
                        }
                        disabled={
                          cambiandoPublicacion
                        }
                      >
                        {cambiandoPublicacion
                          ? 'Procesando...'
                          : 'Retirar publicación'}
                      </button>

                    </>

                  ) : (

                    perfil.estado_publicacion !==
                      'OCULTO' && (

                      <button
                        type="button"
                        className="primary-button"
                        onClick={
                          handlePublicarPerfil
                        }
                        disabled={
                          cambiandoPublicacion
                        }
                      >
                        {cambiandoPublicacion
                          ? 'Publicando...'
                          : 'Publicar perfil'}
                      </button>

                    )

                  )}

                </div>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* PLANTILLAS - ACTIVIDAD 3.6.3 */}
          {/* ================================================= */}

          <section
            className="panel"
            style={{
              padding:
                '1.5rem',

              marginBottom:
                '1.5rem',
            }}
          >

            <div
              style={{
                marginBottom:
                  '1.3rem',
              }}
            >

              <span
                className="home-section-eyebrow"
              >
                Diseño del perfil
              </span>


              <h2
                style={{
                  margin:
                    '0.3rem 0 0.4rem',

                  color:
                    'var(--primary-dark)',
                }}
              >
                Plantilla
              </h2>


              <p
                style={{
                  margin:
                    0,

                  color:
                    'var(--muted)',

                  lineHeight:
                    1.6,
                }}
              >
                Elegí cómo querés presentar la información
                institucional de tu organización.
                Podrás previsualizar el resultado antes
                de publicar el perfil.
              </p>

            </div>


            <div
              className="profile-template-grid"
            >

              {plantillas.map(
                plantilla => {

                  const seleccionada =
                    perfil
                      ?.plantilla
                      ?.codigo ===
                    plantilla.codigo


                  return (

                    <button
                      key={
                        plantilla
                          .id_plantilla
                      }
                      type="button"
                      className={
                        seleccionada
                          ? 'profile-template-card profile-template-card--selected'
                          : 'profile-template-card'
                      }
                      onClick={
                        () =>
                          handleCambiarPlantilla(
                            plantilla.codigo
                          )
                      }
                      disabled={
                        cambiandoPlantilla
                      }
                    >

                      <div
                        className={
                          `profile-template-preview profile-template-preview--${plantilla.codigo}`
                        }
                      >

                        <div
                          className="profile-template-preview__hero"
                        />

                        <div
                          className="profile-template-preview__body"
                        >

                          <span />

                          <span />

                          <span />

                        </div>

                      </div>


                      <div
                        className="profile-template-card__content"
                      >

                        <div
                          className="profile-template-card__head"
                        >

                          <strong>
                            {
                              plantilla.nombre
                            }
                          </strong>


                          {seleccionada && (

                            <span
                              className="verified-badge"
                            >
                              SELECCIONADA
                            </span>

                          )}

                        </div>


                        <p>
                          {
                            plantilla
                              .descripcion
                          }
                        </p>

                      </div>

                    </button>

                  )

                }
              )}

            </div>

          </section>
          
          {/* ================================================= */}
          {/* IMÁGENES DEL PERFIL - ACTIVIDAD 3.6.3 */}
          {/* ================================================= */}

          <section
            className="panel profile-images-panel"
          >

            <div
              style={{
                marginBottom: '1.5rem',
              }}
            >

              <span
                className="home-section-eyebrow"
              >
                Identidad visual
              </span>


              <h2
                style={{
                  margin: '0.3rem 0 0.4rem',
                  color: 'var(--primary-dark)',
                }}
              >
                Imágenes del perfil
              </h2>


              <p
                style={{
                  margin: 0,
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                }}
              >
                Administrá el logo, la portada y las imágenes
                que se mostrarán en el perfil público.
              </p>

            </div>


            {/* LOGO */}

            <div
              className="profile-image-section"
            >

              <div>

                <h3>
                  Logo
                </h3>

                <p>
                  Imagen principal de identidad de la organización.
                </p>

              </div>


              <div
                className="profile-image-control"
              >

                {perfil.imagenes
                  ?.find(
                    imagen =>
                      imagen.tipo === 'LOGO'
                  ) && (

                  <img
                    src={
                      obtenerUrlImagen(
                        perfil.imagenes.find(
                          imagen =>
                            imagen.tipo === 'LOGO'
                        ).url
                      )
                    }
                    alt="Logo actual"
                    className="profile-image-logo-preview"
                  />

                )}


                <input
                  type="text"
                  value={
                    textoAlternativoLogo
                  }
                  onChange={
                    event =>
                      setTextoAlternativoLogo(
                        event.target.value
                      )
                  }
                  placeholder="Texto alternativo del logo"
                />


                <label
                  className="secondary-button"
                >
                  {subiendoImagen
                    ? 'Subiendo...'
                    : 'Cambiar logo'}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={
                      handleSubirLogo
                    }
                    disabled={
                      subiendoImagen
                    }
                    hidden
                  />

                </label>

              </div>

            </div>


            {/* PORTADA */}

            <div
              className="profile-image-section"
            >

              <div>

                <h3>
                  Portada
                </h3>

                <p>
                  Imagen horizontal que aparece en la cabecera del perfil.
                </p>

              </div>


              <div
                className="profile-image-control"
              >

                {perfil.imagenes
                  ?.find(
                    imagen =>
                      imagen.tipo === 'PORTADA'
                  ) && (

                  <img
                    src={
                      obtenerUrlImagen(
                        perfil.imagenes.find(
                          imagen =>
                            imagen.tipo === 'PORTADA'
                        ).url
                      )
                    }
                    alt="Portada actual"
                    className="profile-image-cover-preview"
                  />

                )}


                <input
                  type="text"
                  value={
                    textoAlternativoPortada
                  }
                  onChange={
                    event =>
                      setTextoAlternativoPortada(
                        event.target.value
                      )
                  }
                  placeholder="Texto alternativo de la portada"
                />


                <label
                  className="secondary-button"
                >
                  {subiendoImagen
                    ? 'Subiendo...'
                    : 'Cambiar portada'}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={
                      handleSubirPortada
                    }
                    disabled={
                      subiendoImagen
                    }
                    hidden
                  />

                </label>

              </div>

            </div>


            {/* GALERÍA */}

            <div
              className="profile-image-section"
            >

              <div>

                <h3>
                  Galería
                </h3>

                <p>
                  Imágenes de actividades, eventos y acciones realizadas.
                </p>

              </div>


              <div
                className="profile-image-control"
              >

                <div
                  className="profile-gallery-preview"
                >

                  {perfil.imagenes
                    ?.filter(
                      imagen =>
                        imagen.tipo === 'GALERIA'
                    )
                    .map(
                      imagen => (

                        <div
                          key={
                            imagen.id_imagen
                          }
                          className="profile-gallery-item"
                        >

                          <img
                            src={
                              obtenerUrlImagen(
                                imagen.url
                              )
                            }
                            alt={
                              imagen.texto_alternativo ||
                              'Imagen de galería'
                            }
                          />


                          <button
                            type="button"
                            className="profile-gallery-delete"
                            onClick={
                              () =>
                                handleEliminarImagenGaleria(
                                  imagen.id_imagen
                                )
                            }
                            disabled={
                              subiendoImagen
                            }
                          >
                            Eliminar
                          </button>

                        </div>

                      )
                    )}

                </div>


                <input
                  type="text"
                  value={
                    textoAlternativoGaleria
                  }
                  onChange={
                    event =>
                      setTextoAlternativoGaleria(
                        event.target.value
                      )
                  }
                  placeholder="Texto alternativo de la imagen"
                />


                <label
                  className="secondary-button"
                >
                  {subiendoImagen
                    ? 'Subiendo...'
                    : 'Agregar imagen'}

                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                    onChange={
                      handleAgregarGaleria
                    }
                    disabled={
                      subiendoImagen
                    }
                    hidden
                  />

                </label>

              </div>

            </div>

          </section>

          {/* ================================================= */}
          {/* SECCIONES CONFIGURABLES - ACTIVIDAD 3.6.3 */}
          {/* ================================================= */}

          <section
            className="panel profile-sections-panel"
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >

            <div
              style={{
                marginBottom: '1.5rem',
                order: -1,
              }}
            >

              <span
                className="home-section-eyebrow"
              >
                Contenido institucional
              </span>


              <h2
                style={{
                  margin: '0.3rem 0 0.4rem',
                  color: 'var(--primary-dark)',
                }}
              >
                Secciones del perfil
              </h2>


              <p
                style={{
                  margin: 0,
                  color: 'var(--muted)',
                  lineHeight: 1.6,
                }}
              >
                Editá la información que se mostrará
                dentro de la plantilla pública.
              </p>

            </div>


            {/* ============================================= */}
            {/* SOBRE NOSOTROS */}
            {/* ============================================= */}

            <div
              className="profile-section-editor"
              style={{
                order:
                  ordenSecciones.indexOf(
                    'SOBRE_NOSOTROS'
                  ),
              }}
            >

              <div
                className="profile-section-editor__header"
              >

                <div>

                  <h3>
                    Sobre nosotros
                  </h3>

                  <p>
                    Presentación general de la organización.
                  </p>

                </div>


                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'SOBRE_NOSOTROS',
                        'SUBIR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'SOBRE_NOSOTROS'
                      ) === 0
                    }
                  >
                    ↑ Subir
                  </button>


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'SOBRE_NOSOTROS',
                        'BAJAR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'SOBRE_NOSOTROS'
                      ) ===
                        ordenSecciones.length - 1
                    }
                  >
                    ↓ Bajar
                  </button>


                  <label
                    className="profile-section-visible"
                  >

                    <input
                      type="checkbox"
                      checked={
                        seccionesFormulario
                          .SOBRE_NOSOTROS
                          .visible
                      }
                      onChange={
                        event =>
                          handleCambiarSeccion(
                            'SOBRE_NOSOTROS',
                            'visible',
                            event.target.checked
                          )
                      }
                    />

                    Mostrar sección

                  </label>

                </div>

              </div>


              <div className="field">

                <label>
                  Título
                </label>

                <input
                  type="text"
                  value={
                    seccionesFormulario
                      .SOBRE_NOSOTROS
                      .titulo
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'SOBRE_NOSOTROS',
                        'titulo',
                        event.target.value
                      )
                  }
                  placeholder="Ej.: Quiénes somos"
                />

              </div>


              <div className="field">

                <label>
                  Contenido
                </label>

                <textarea
                  rows="5"
                  value={
                    seccionesFormulario
                      .SOBRE_NOSOTROS
                      .texto
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'SOBRE_NOSOTROS',
                        'texto',
                        event.target.value
                      )
                  }
                  placeholder="Contá brevemente quiénes son y qué hace la organización."
                />

              </div>


              <button
                type="button"
                className="secondary-button"
                onClick={
                  () =>
                    handleGuardarSeccion(
                      'SOBRE_NOSOTROS'
                    )
                }
                disabled={
                  guardandoSeccion
                }
              >
                {guardandoSeccion
                  ? 'Guardando...'
                  : 'Guardar Sobre nosotros'}
              </button>

            </div>


            {/* ============================================= */}
            {/* MISIÓN */}
            {/* ============================================= */}

            <div
              className="profile-section-editor"
              style={{
                order:
                  ordenSecciones.indexOf(
                    'MISION'
                  ),
              }}
            >

              <div
                className="profile-section-editor__header"
              >

                <div>

                  <h3>
                    Misión
                  </h3>

                  <p>
                    Propósito principal de la organización.
                  </p>

                </div>


                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'MISION',
                        'SUBIR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'MISION'
                      ) === 0
                    }
                  >
                    ↑ Subir
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'MISION',
                        'BAJAR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'MISION'
                      ) ===
                        ordenSecciones.length - 1
                    }
                  >
                    ↓ Bajar
                  </button>

                  <label
                    className="profile-section-visible"
                  >

                    <input
                      type="checkbox"
                      checked={
                        seccionesFormulario
                          .MISION
                          .visible
                      }
                      onChange={
                        event =>
                          handleCambiarSeccion(
                            'MISION',
                            'visible',
                            event.target.checked
                          )
                      }
                    />

                    Mostrar sección

                  </label>

                </div>

              </div>


              <div className="field">

                <label>
                  Título
                </label>

                <input
                  type="text"
                  value={
                    seccionesFormulario
                      .MISION
                      .titulo
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'MISION',
                        'titulo',
                        event.target.value
                      )
                  }
                  placeholder="Ej.: Nuestra misión"
                />

              </div>


              <div className="field">

                <label>
                  Contenido
                </label>

                <textarea
                  rows="5"
                  value={
                    seccionesFormulario
                      .MISION
                      .texto
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'MISION',
                        'texto',
                        event.target.value
                      )
                  }
                  placeholder="Describí el propósito principal de la organización."
                />

              </div>


              <button
                type="button"
                className="secondary-button"
                onClick={
                  () =>
                    handleGuardarSeccion(
                      'MISION'
                    )
                }
                disabled={
                  guardandoSeccion
                }
              >
                {guardandoSeccion
                  ? 'Guardando...'
                  : 'Guardar Misión'}
              </button>

            </div>


            {/* ============================================= */}
            {/* IMPACTO */}
            {/* ============================================= */}

            <div
              className="profile-section-editor"
              style={{
                order:
                  ordenSecciones.indexOf(
                    'IMPACTO'
                  ),
              }}
            >

              <div
                className="profile-section-editor__header"
              >

                <div>

                  <h3>
                    Impacto
                  </h3>

                  <p>
                    Resultados, alcance o contribución social.
                  </p>

                </div>


                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'IMPACTO',
                        'SUBIR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'IMPACTO'
                      ) === 0
                    }
                  >
                    ↑ Subir
                  </button>

                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      handleMoverSeccion(
                        'IMPACTO',
                        'BAJAR'
                      )
                    }
                    disabled={
                      cambiandoOrdenSecciones ||
                      ordenSecciones.indexOf(
                        'IMPACTO'
                      ) ===
                        ordenSecciones.length - 1
                    }
                  >
                    ↓ Bajar
                  </button>

                  <label
                    className="profile-section-visible"
                  >

                    <input
                      type="checkbox"
                      checked={
                        seccionesFormulario
                          .IMPACTO
                          .visible
                      }
                      onChange={
                        event =>
                          handleCambiarSeccion(
                            'Impacto',
                            'visible',
                            event.target.checked
                          )
                      }
                    />

                    Mostrar sección

                  </label>

                </div>

              </div>


              <div className="field">

                <label>
                  Título
                </label>

                <input
                  type="text"
                  value={
                    seccionesFormulario
                      .IMPACTO
                      .titulo
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'IMPACTO',
                        'titulo',
                        event.target.value
                      )
                  }
                  placeholder="Ej.: Nuestro impacto"
                />

              </div>


              <div className="field">

                <label>
                  Contenido
                </label>

                <textarea
                  rows="5"
                  value={
                    seccionesFormulario
                      .IMPACTO
                      .texto
                  }
                  onChange={
                    event =>
                      handleCambiarSeccion(
                        'IMPACTO',
                        'texto',
                        event.target.value
                      )
                  }
                  placeholder="Describí resultados, alcance o impacto generado."
                />

              </div>


              <button
                type="button"
                className="secondary-button"
                onClick={
                  () =>
                    handleGuardarSeccion(
                      'IMPACTO'
                    )
                }
                disabled={
                  guardandoSeccion
                }
              >
                {guardandoSeccion
                  ? 'Guardando...'
                  : 'Guardar Impacto'}
              </button>

            </div>

          </section>
          
          {/* ============================================= */}
          {/* ACTUALIDAD */}
          {/* ============================================= */}

          <div
            className="profile-section-editor"
            style={{
              order:
                ordenSecciones.indexOf(
                  'ACTUALIDAD'
                ),
            }}
          >

            <div
              className="profile-section-editor__header"
            >

              <div>

                <h3>
                  Actualidad
                </h3>

                <p>
                  Novedades, jornadas y actividades recientes.
                </p>

              </div>


              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  flexWrap: 'wrap',
                  justifyContent: 'flex-end',
                }}
              >

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleMoverSeccion(
                      'ACTUALIDAD',
                      'SUBIR'
                    )
                  }
                  disabled={
                    cambiandoOrdenSecciones ||
                    ordenSecciones.indexOf(
                      'ACTUALIDAD'
                    ) === 0
                  }
                >
                  ↑ Subir
                </button>

                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    handleMoverSeccion(
                      'ACTUALIDAD',
                      'BAJAR'
                    )
                  }
                  disabled={
                    cambiandoOrdenSecciones ||
                    ordenSecciones.indexOf(
                      'ACTUALIDAD'
                    ) ===
                      ordenSecciones.length - 1
                  }
                >
                  ↓ Bajar
                </button>

                <label
                  className="profile-section-visible"
                >

                  <input
                    type="checkbox"
                    checked={
                      seccionesFormulario
                        .ACTUALIDAD
                        .visible
                    }
                    onChange={
                      event =>
                        handleCambiarSeccion(
                          'ACTUALIDAD',
                          'visible',
                          event.target.checked
                        )
                    }
                  />

                  Mostrar sección

                </label>

              </div>

            </div>


            <div className="field">

              <label>
                Título de la sección
              </label>

              <input
                type="text"
                value={
                  seccionesFormulario
                    .ACTUALIDAD
                    .titulo
                }
                onChange={
                  event =>
                    handleCambiarSeccion(
                      'ACTUALIDAD',
                      'titulo',
                      event.target.value
                    )
                }
                placeholder="Ej.: Novedades y actividades"
              />

            </div>


            <div
              className="profile-news-editor"
            >

              {seccionesFormulario
                .ACTUALIDAD
                .items
                .map(
                  (
                    item,
                    indice
                  ) => (

                    <article
                      key={indice}
                      className="profile-news-editor__item"
                    >

                      <div
                        className="profile-news-editor__head"
                      >

                        <strong>
                          Novedad {indice + 1}
                        </strong>


                        <button
                          type="button"
                          className="profile-news-editor__delete"
                          onClick={
                            () =>
                              handleEliminarItemActualidad(
                                indice
                              )
                          }
                        >
                          Eliminar
                        </button>

                      </div>


                      <div className="field">

                        <label>
                          Título
                        </label>

                        <input
                          type="text"
                          value={
                            item.titulo
                          }
                          onChange={
                            event =>
                              handleCambiarItemActualidad(
                                indice,
                                'titulo',
                                event.target.value
                              )
                          }
                          placeholder="Ej.: Jornada solidaria"
                        />

                      </div>


                      <div className="field">

                        <label>
                          Fecha
                        </label>

                        <input
                          type="date"
                          value={
                            item.fecha
                          }
                          onChange={
                            event =>
                              handleCambiarItemActualidad(
                                indice,
                                'fecha',
                                event.target.value
                              )
                          }
                        />

                      </div>


                      <div className="field">

                        <label>
                          Descripción
                        </label>

                        <textarea
                          rows="4"
                          value={
                            item.texto
                          }
                          onChange={
                            event =>
                              handleCambiarItemActualidad(
                                indice,
                                'texto',
                                event.target.value
                              )
                          }
                          placeholder="Describí brevemente la actividad o novedad."
                        />

                      </div>


                      <div className="field">

                        <label>
                          Imagen
                        </label>

                        <select
                          value={
                            item.imagen
                          }
                          onChange={
                            event =>
                              handleCambiarItemActualidad(
                                indice,
                                'imagen',
                                event.target.value
                              )
                          }
                        >

                          <option value="">
                            Sin imagen
                          </option>


                          {perfil.imagenes
                            ?.filter(
                              imagen =>
                                imagen.tipo ===
                                  'GALERIA'
                            )
                            .map(
                              imagen => (

                                <option
                                  key={
                                    imagen.id_imagen
                                  }
                                  value={
                                    imagen.url
                                  }
                                >
                                  {
                                    imagen
                                      .texto_alternativo ||
                                    `Imagen ${imagen.orden + 1}`
                                  }
                                </option>

                              )
                            )}

                        </select>

                      </div>


                      {item.imagen && (

                        <img
                          src={
                            obtenerUrlImagen(
                              item.imagen
                            )
                          }
                          alt={
                            item.titulo ||
                            'Vista previa de la novedad'
                          }
                          className="profile-news-editor__preview"
                        />

                      )}


                      <div className="field">

                        <label>
                          Enlace opcional
                        </label>

                        <input
                          type="url"
                          value={
                            item.enlace
                          }
                          onChange={
                            event =>
                              handleCambiarItemActualidad(
                                indice,
                                'enlace',
                                event.target.value
                              )
                          }
                          placeholder="https://..."
                        />

                      </div>

                    </article>

                  )
                )}

            </div>


            <div
              className="profile-news-editor__actions"
            >

              <button
                type="button"
                className="secondary-button"
                onClick={
                  handleAgregarActualidad
                }
              >
                + Agregar novedad
              </button>


              <button
                type="button"
                className="primary-button"
                onClick={
                  () =>
                    handleGuardarSeccion(
                      'ACTUALIDAD'
                    )
                }
                disabled={
                  guardandoSeccion
                }
              >
                {guardandoSeccion
                  ? 'Guardando...'
                  : 'Guardar Actualidad'}
              </button>

            </div>

          </div>
          {/* ================================================= */}
          {/* FORMULARIO */}
          {/* ================================================= */}

          <form
            onSubmit={
              handleGuardar
            }
          >

            <section
              className="panel"
              style={{
                padding:
                  '1.5rem',
              }}
            >

              <div
                style={{
                  display:
                    'flex',

                  alignItems:
                    'center',

                  justifyContent:
                    'space-between',

                  gap:
                    '1rem',

                  flexWrap:
                    'wrap',

                  marginBottom:
                    '1.5rem',
                }}
              >

                <h2
                  style={{
                    margin:
                      0,

                    color:
                      'var(--primary-dark)',
                  }}
                >
                  Información del perfil
                </h2>


                {!editando && (

                  <button
                    type="button"
                    className="primary-button"
                    onClick={
                      handleEditar
                    }
                  >
                    Editar perfil
                  </button>


                )}

              </div>


              <div
                className="field"
              >

                <label
                  htmlFor="nombreVisible"
                >
                  Nombre público
                </label>


                <input
                  id="nombreVisible"
                  name="nombreVisible"
                  type="text"
                  value={
                    formulario
                      .nombreVisible
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                />

              </div>


              <div
                className="field"
              >

                <label
                  htmlFor="descripcionPublica"
                >
                  Descripción pública
                </label>


                <textarea
                  id="descripcionPublica"
                  name="descripcionPublica"
                  value={
                    formulario
                      .descripcionPublica
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  rows="6"
                  style={{
                    width:
                      '100%',

                    padding:
                      '0.75rem',

                    border:
                      '1px solid var(--border)',

                    borderRadius:
                      '0.65rem',

                    resize:
                      'vertical',
                  }}
                />

                <div
                  className="field"
                >

                  <label>
                    Tipos de actividad
                  </label>


                  <p
                    style={{
                      margin:
                        '0 0 0.75rem',

                      color:
                        'var(--muted)',

                      fontSize:
                        '0.9rem',

                      lineHeight:
                        1.5,
                    }}
                  >
                    Seleccioná una o más categorías que
                    representen las actividades de tu
                    organización.
                  </p>


                  <div
                    className="profile-activity-types"
                  >

                    {tiposActividad.map(
                      tipo => {

                        const seleccionada =
                          idsTiposActividad.includes(
                            Number(
                              tipo.id_tipo_actividad
                            )
                          )


                        return (

                          <label
                            key={
                              tipo.id_tipo_actividad
                            }
                            className={
                              seleccionada
                                ? 'profile-activity-type profile-activity-type--selected'
                                : 'profile-activity-type'
                            }
                          >

                            <input
                              type="checkbox"
                              checked={
                                seleccionada
                              }
                              onChange={
                                () =>
                                  handleCambiarTipoActividad(
                                    tipo.id_tipo_actividad
                                  )
                              }
                              disabled={
                                !editando ||
                                guardando
                              }
                            />


                            <span>
                              {tipo.nombre}
                            </span>

                          </label>

                        )

                      }
                    )}

                  </div>

                </div>

              </div>

              <div
                className="field"
              >

                <label
                  htmlFor="ubicacionOrganizacion"
                >
                  Ubicación institucional
                </label>


                <p
                  style={{
                    margin:
                      '0 0 0.75rem',

                    color:
                      'var(--muted)',

                    fontSize:
                      '0.9rem',

                    lineHeight:
                      1.5,
                  }}
                >
                  Esta ubicación se utilizará
                  para mostrar y filtrar tu
                  organización en el directorio.
                </p>


                <div
                  style={{
                    position:
                      'relative',
                  }}
                >

                  <input
                    id="ubicacionOrganizacion"
                    type="search"
                    value={
                      busquedaUbicacion
                    }
                    onChange={
                      event => {

                        setBusquedaUbicacion(
                          event.target.value
                        )

                        setUbicacionSeleccionada(
                          null
                        )

                      }
                    }
                    disabled={
                      !editando ||
                      guardando
                    }
                    placeholder="Buscar dirección o localidad"
                  />


                  {buscandoUbicacion && (

                    <span
                      style={{
                        display:
                          'block',

                        marginTop:
                          '0.5rem',

                        color:
                          'var(--muted)',

                        fontSize:
                          '0.85rem',
                      }}
                    >
                      Buscando ubicaciones...
                    </span>

                  )}


                  {editando &&
                    resultadosUbicacion.length >
                      0 && (

                    <div
                      className="profile-location-results"
                    >

                      {resultadosUbicacion.map(
                        ubicacion => (

                          <button
                            key={
                              ubicacion.placeId
                            }
                            type="button"
                            className="profile-location-result"
                            onClick={
                              () =>
                                handleSeleccionarUbicacion(
                                  ubicacion
                                )
                            }
                          >

                            <strong>
                              {
                                ubicacion.nombre
                              }
                            </strong>

                            {ubicacion.detalle && (

                              <span>
                                {
                                  ubicacion.detalle
                                }
                              </span>

                            )}

                          </button>

                        )
                      )}

                    </div>

                  )}

                </div>


                {ubicacionSeleccionada && (

                  <div
                    style={{
                      marginTop:
                        '0.75rem',

                      color:
                        'var(--muted)',

                      fontSize:
                        '0.9rem',
                    }}
                  >
                    Ubicación seleccionada:
                    {' '}
                    <strong>
                      {
                        [
                          ubicacionSeleccionada
                            .localidad,

                          ubicacionSeleccionada
                            .provincia,
                        ]
                          .filter(Boolean)
                          .join(', ')
                      }
                    </strong>
                  </div>

                )}

              </div>


              <div
                className="field"
              >

                <label
                  htmlFor="emailContactoPublico"
                >
                  Correo público
                </label>


                <input
                  id="emailContactoPublico"
                  name="emailContactoPublico"
                  type="email"
                  value={
                    formulario
                      .emailContactoPublico
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                />

              </div>
              

              <div
                className="field"
              >

                <label
                  htmlFor="telefonoContactoPublico"
                >
                  Teléfono público
                </label>


                <input
                  id="telefonoContactoPublico"
                  name="telefonoContactoPublico"
                  type="text"
                  value={
                    formulario
                      .telefonoContactoPublico
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                />

              </div>


              <div
                className="field"
              >

                <label
                  htmlFor="sitioWebUrl"
                >
                  Sitio web
                </label>


                <input
                  id="sitioWebUrl"
                  name="sitioWebUrl"
                  type="url"
                  value={
                    formulario
                      .sitioWebUrl
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  placeholder="https://ejemplo.org"
                />

              </div>

              <div className="field">

                <label htmlFor="instagram">
                  Instagram
                </label>

                <input
                  id="instagram"
                  name="instagram"
                  type="url"
                  value={
                    formulario.instagram
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  placeholder="https://instagram.com/organizacion"
                />

              </div>


              <div className="field">

                <label htmlFor="facebook">
                  Facebook
                </label>

                <input
                  id="facebook"
                  name="facebook"
                  type="url"
                  value={
                    formulario.facebook
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  placeholder="https://facebook.com/organizacion"
                />

              </div>


              <div className="field">

                <label htmlFor="linkedin">
                  LinkedIn
                </label>

                <input
                  id="linkedin"
                  name="linkedin"
                  type="url"
                  value={
                    formulario.linkedin
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  placeholder="https://linkedin.com/company/organizacion"
                />

              </div>


              <div className="field">

                <label htmlFor="horarioAtencion">
                  Horario de atención
                </label>

                <input
                  id="horarioAtencion"
                  name="horarioAtencion"
                  type="text"
                  value={
                    formulario.horarioAtencion
                  }
                  onChange={
                    handleChange
                  }
                  disabled={
                    !editando ||
                    guardando
                  }
                  placeholder="Ej.: Lunes a viernes de 09:00 a 17:00"
                />

              </div>


              {editando && (

                <div
                  style={{
                    marginTop:
                      '1.5rem',

                    display:
                      'flex',

                    gap:
                      '0.75rem',

                    flexWrap:
                      'wrap',
                  }}
                >

                  <button
                    type="submit"
                    className="primary-button"
                    disabled={
                      guardando
                    }
                  >
                    {guardando
                      ? 'Guardando...'
                      : 'Guardar cambios'}
                  </button>


                  <button
                    type="button"
                    className="secondary-button"
                    onClick={
                      handleCancelar
                    }
                    disabled={
                      guardando
                    }
                  >
                    Cancelar
                  </button>

                </div>

              )}

            </section>

          </form>

        </>

      )}

    </main>

  )

}


export default MiPerfilOrganizacionPage