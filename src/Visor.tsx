import { useEffect, useRef, useState } from 'react'
import type { MuebleVista } from './datos'
import '@google/model-viewer'

type EstadoCamara = 'esperando' | 'lista' | 'failed'

type NodoVisor = HTMLElement & { canActivateAR: boolean }

export function Visor({ mueble, onCerrar }: { mueble: MuebleVista; onCerrar: () => void }) {
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const visorRef = useRef<NodoVisor>(null)
  const [estado, setEstado] = useState<EstadoCamara>('esperando')

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

  useEffect(() => {
    const nodo = visorRef.current
    if (!nodo) return
    function alCargar() {
      setEstado(nodo?.canActivateAR ? 'lista' : 'esperando')
    }
    function alEstado(evento: Event) {
      const detalle = (evento as CustomEvent<{ status: string }>).detail
      if (detalle.status === 'failed') setEstado('failed')
    }
    nodo.addEventListener('load', alCargar)
    nodo.addEventListener('ar-status', alEstado)
    return () => {
      nodo.removeEventListener('load', alCargar)
      nodo.removeEventListener('ar-status', alEstado)
    }
  }, [mueble.src])

  const ayuda = estado === 'failed'
    ? 'No se pudo abrir la cámara. Probá con Chrome y aceptá el permiso.'
    : estado === 'lista'
      ? 'Apuntá al piso y tocá para dejarlo. Después caminá: queda quieto, a su tamaño, con la luz y la sombra del lugar.'
      : 'Arrastrá para mirarlo alrededor. En el celular, la cámara lo apoya en el piso.'

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
        ref={visorRef}
        src={mueble.src}
        alt={`${mueble.nombre}, apoyado en el piso a tamaño real`}
        ar
        ar-modes="webxr scene-viewer quick-look"
        ar-scale="fixed"
        ar-placement="floor"
        camera-controls
        disable-pan
        touch-action="none"
        shadow-intensity="1.15"
        shadow-softness="0.5"
        environment-image="neutral"
        exposure="1.05"
        tone-mapping="neutral"
        camera-orbit={mueble.orbita}
        interaction-prompt="none"
        interpolation-decay="80"
      >
        <button slot="ar-button" type="button" className="boton visor-ar">
          Abrir la cámara
        </button>
      </model-viewer>
      <p className="visor-ayuda">{ayuda}</p>
    </div>
  )
}
