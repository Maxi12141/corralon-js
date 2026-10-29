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
  'shadow-softness'?: string
  'environment-image'?: string
  exposure?: string
  'tone-mapping'?: string
  'camera-orbit'?: string
  'interaction-prompt'?: string
  'interpolation-decay'?: string
  'disable-pan'?: boolean
  ref?: import('react').Ref<HTMLElement>
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': PropsDelVisor
    }
  }
}

export {}
