import type { DetailedHTMLProps, HTMLAttributes } from 'react'

type PropsDelVisor = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  src?: string
  alt?: string
  ar?: boolean
  'ar-modes'?: string
  'ar-scale'?: string
  'ar-placement'?: string
  'camera-controls'?: boolean
  'touch-action'?: string
  'shadow-intensity'?: string
  'environment-image'?: string
  exposure?: string
  'camera-orbit'?: string
  'interaction-prompt'?: string
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': PropsDelVisor
    }
  }
}

export {}
