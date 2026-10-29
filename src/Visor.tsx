import { useEffect, useRef } from 'react'
import type { MuebleVista } from './datos'
import '@google/model-viewer'

export function Visor({ mueble, onCerrar }: { mueble: MuebleVista; onCerrar: () => void }) {
  const cerrarRef = useRef<HTMLButtonElement>(null)

  const cerrarActual = useRef(onCerrar)
  cerrarActual.current = onCerrar

  useEffect(() => {
    cerrarRef.current?.focus()
    function alTecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') cerrarActual.current()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', alTecla)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', alTecla)
    }
  }, [])

  return (
    <div className="visor" role="dialog" aria-modal="true" aria-labelledby="titulo-visor">
      <header>
        <div>
          <h2 id="titulo-visor">{mueble.nombre}</h2>
          <p>{mueble.medidas}</p>
        </div>
        <button ref={cerrarRef} type="button" className="cerrar" onClick={onCerrar} aria-label="Cerrar">
          ×
        </button>
      </header>
      <model-viewer
        src={mueble.src}
        alt={`${mueble.nombre}, a tamaño real`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-controls
        touch-action="pan-y"
        shadow-intensity="1.2"
        environment-image="neutral"
        exposure="1"
        camera-orbit={mueble.orbita}
        interaction-prompt="auto"
      >
        <button slot="ar-button" type="button" className="boton visor-ar">
          Ver con la cámara
        </button>
      </model-viewer>
      <p className="visor-ayuda">
        El mueble queda quieto. Acá girás la vista. En el celular, la cámara lo apoya en el piso y caminás alrededor, a su tamaño.
      </p>
    </div>
  )
}
