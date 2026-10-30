import { Link } from 'react-router-dom'

const appDownloadUrl = import.meta.env.VITE_APP_DOWNLOAD_URL

import { QRCodeSVG } from 'qrcode.react'

function AppFooter() {

  return (

    <footer className="site-footer">

      <div className="site-container footer-grid">

        <div className="footer-brand">

          <h2>
            Voluntariado Geolocalizado
          </h2>

          <p>
            Conectamos personas con organizaciones
            sociales y oportunidades de participación.
          </p>

        </div>


        <div className="footer-column">

          <h3>
            Explorar
          </h3>

          <Link to="/">
            Inicio
          </Link>

          <Link to="/organizaciones">
            Organizaciones
          </Link>

        </div>


        <div className="footer-column">

          <h3>
            Plataforma
          </h3>

          <span>
            Organizaciones verificadas
          </span>

          <span>
            Consulta pública
          </span>

          <span>
            Voluntariado geolocalizado
          </span>

        </div>

        <div className="footer-column">

            <h3>
                Aplicación móvil
            </h3>

            {appDownloadUrl ? (
                <>

                    <a
                    href={appDownloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    >
                    Descargar la app
                    </a>

                    <span>
                    Escaneá el código QR para acceder desde tu celular.
                    </span>

                    <div className="footer-qr">

                    <QRCodeSVG
                        value={appDownloadUrl}
                        size={110}
                        bgColor="#ffffff"
                        fgColor="#0f3d32"
                        level="M"
                        includeMargin
                    />

                    </div>

                </>
                ) : (
                <span>
                    Descarga próximamente disponible
                </span>
                )}

            </div>

      </div>


      <div className="site-container footer-bottom">

        <span>
          Proyecto Final de Carrera
        </span>

        <span>
          Voluntariado Geolocalizado
        </span>

      </div>

    </footer>

  )

}

export default AppFooter