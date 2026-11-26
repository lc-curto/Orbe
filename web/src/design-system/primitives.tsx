import { forwardRef } from 'react'
import type {
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  MouseEventHandler,
  ReactNode,
} from 'react'

type PrimitiveProps = Record<string, unknown> & {
  children?: ReactNode
  className?: string
  style?: CSSProperties
}

const styleKeys: Record<string, keyof CSSProperties> = {
  alignItems: 'alignItems',
  alignSelf: 'alignSelf',
  backgroundColor: 'backgroundColor',
  borderBottomColor: 'borderBottomColor',
  borderBottomWidth: 'borderBottomWidth',
  borderColor: 'borderColor',
  borderLeftColor: 'borderLeftColor',
  borderLeftWidth: 'borderLeftWidth',
  borderRadius: 'borderRadius',
  borderRightColor: 'borderRightColor',
  borderRightWidth: 'borderRightWidth',
  borderStyle: 'borderStyle',
  borderTopColor: 'borderTopColor',
  borderTopWidth: 'borderTopWidth',
  borderWidth: 'borderWidth',
  bottom: 'bottom',
  boxSizing: 'boxSizing',
  color: 'color',
  cursor: 'cursor',
  display: 'display',
  flex: 'flex',
  flexBasis: 'flexBasis',
  flexDirection: 'flexDirection',
  flexGrow: 'flexGrow',
  flexShrink: 'flexShrink',
  flexWrap: 'flexWrap',
  fontSize: 'fontSize',
  fontStyle: 'fontStyle',
  fontWeight: 'fontWeight',
  gap: 'gap',
  height: 'height',
  justifyContent: 'justifyContent',
  left: 'left',
  letterSpacing: 'letterSpacing',
  lineHeight: 'lineHeight',
  margin: 'margin',
  marginBottom: 'marginBottom',
  marginLeft: 'marginLeft',
  marginRight: 'marginRight',
  marginTop: 'marginTop',
  maxHeight: 'maxHeight',
  maxWidth: 'maxWidth',
  minHeight: 'minHeight',
  minWidth: 'minWidth',
  opacity: 'opacity',
  overflow: 'overflow',
  padding: 'padding',
  paddingBottom: 'paddingBottom',
  paddingLeft: 'paddingLeft',
  paddingRight: 'paddingRight',
  paddingTop: 'paddingTop',
  position: 'position',
  right: 'right',
  textAlign: 'textAlign',
  textDecoration: 'textDecoration',
  textTransform: 'textTransform',
  top: 'top',
  width: 'width',
  zIndex: 'zIndex',
}

function getStyle(props: PrimitiveProps, base: CSSProperties = {}): CSSProperties {
  const style: CSSProperties = { ...base }
  for (const [key, value] of Object.entries(props)) {
    const mapped = styleKeys[key]
    if (mapped && value !== undefined && value !== null) {
      ;(style as Record<string, unknown>)[mapped] = value as CSSProperties[keyof CSSProperties]
    }
  }
  if (props.paddingHorizontal !== undefined) {
    style.paddingLeft = props.paddingHorizontal as CSSProperties['paddingLeft']
    style.paddingRight = props.paddingHorizontal as CSSProperties['paddingRight']
  }
  if (props.paddingVertical !== undefined) {
    style.paddingTop = props.paddingVertical as CSSProperties['paddingTop']
    style.paddingBottom = props.paddingVertical as CSSProperties['paddingBottom']
  }
  if (props.marginHorizontal !== undefined) {
    style.marginLeft = props.marginHorizontal as CSSProperties['marginLeft']
    style.marginRight = props.marginHorizontal as CSSProperties['marginRight']
  }
  if (props.marginVertical !== undefined) {
    style.marginTop = props.marginVertical as CSSProperties['marginTop']
    style.marginBottom = props.marginVertical as CSSProperties['marginBottom']
  }
  if (props.fontVariant === 'tabular-nums') style.fontVariantNumeric = 'tabular-nums'
  if (typeof props.numberOfLines === 'number') {
    style.display = '-webkit-box'
    style.WebkitLineClamp = props.numberOfLines
    style.WebkitBoxOrient = 'vertical'
    style.overflow = 'hidden'
  }
  return { ...style, ...props.style }
}

function getRestProps(props: PrimitiveProps): Record<string, unknown> {
  const omit = new Set([
    'children', 'className', 'style', 'onPress', 'paddingHorizontal',
    'paddingVertical', 'marginHorizontal', 'marginVertical', 'fontVariant',
    'numberOfLines', 'ellipsizeMode',
    ...Object.keys(styleKeys),
  ])
  return Object.fromEntries(Object.entries(props).filter(([key]) => !omit.has(key)))
}

function classNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(' ')
}

export const YStack = forwardRef<HTMLDivElement, PrimitiveProps>(function YStack(props, ref) {
  const { children, className, ...rest } = props
  return <div ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLDivElement>)} className={classNames('orbe-stack', className as string | undefined)} style={getStyle(rest, { display: 'flex', flexDirection: 'column', minWidth: 0, borderStyle: 'solid', borderWidth: 0 })} >{children as ReactNode}</div>
})

export const XStack = forwardRef<HTMLDivElement, PrimitiveProps>(function XStack(props, ref) {
  const { children, className, ...rest } = props
  return <div ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLDivElement>)} className={classNames('orbe-stack', className as string | undefined)} style={getStyle(rest, { display: 'flex', flexDirection: 'row', minWidth: 0, borderStyle: 'solid', borderWidth: 0 })} >{children as ReactNode}</div>
})

export const Text = forwardRef<HTMLSpanElement, PrimitiveProps>(function Text(props, ref) {
  const { children, className, ...rest } = props
  return <span ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLSpanElement>)} className={classNames('orbe-text', className as string | undefined)} style={getStyle(rest, { display: 'block', margin: 0 })} >{children as ReactNode}</span>
})

export const Button = forwardRef<HTMLButtonElement, PrimitiveProps>(function Button(props, ref) {
  const { children, className, onPress, onClick, type = 'button', ...rest } = props
  return <button ref={ref} type={type as 'button' | 'submit' | 'reset'} {...(getRestProps(rest) as ButtonHTMLAttributes<HTMLButtonElement>)} onClick={(onClick ?? onPress) as MouseEventHandler<HTMLButtonElement> | undefined} className={classNames('orbe-button', className as string | undefined)} style={getStyle(rest, { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', font: 'inherit', cursor: rest.disabled === true ? 'not-allowed' : 'pointer', backgroundColor: 'transparent', borderStyle: 'solid', borderWidth: 0 })} >{children as ReactNode}</button>
})

export const Card = forwardRef<HTMLDivElement, PrimitiveProps>(function Card(props, ref) {
  const { children, className, ...rest } = props
  return <div ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLDivElement>)} className={classNames('orbe-card', className as string | undefined)} style={getStyle(rest, { boxSizing: 'border-box', minWidth: 0, borderStyle: 'solid', borderWidth: 0 })} >{children as ReactNode}</div>
})

export const Separator = forwardRef<HTMLHRElement, PrimitiveProps>(function Separator(props, ref) {
  const { className, ...rest } = props
  return <hr ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLHRElement>)} className={classNames('orbe-separator', className as string | undefined)} style={getStyle(rest, { border: 0, borderTop: '1px solid #e4e7ec', margin: 0, width: '100%' })} />
})

export const H1 = forwardRef<HTMLHeadingElement, PrimitiveProps>(function H1(props, ref) {
  const { children, className, ...rest } = props
  return <h1 ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLHeadingElement>)} className={classNames('orbe-heading', className as string | undefined)} style={getStyle(rest, { margin: 0, fontSize: 36, fontWeight: 800 })} >{children as ReactNode}</h1>
})

export const Paragraph = forwardRef<HTMLParagraphElement, PrimitiveProps>(function Paragraph(props, ref) {
  const { children, className, ...rest } = props
  return <p ref={ref} {...(getRestProps(rest) as HTMLAttributes<HTMLParagraphElement>)} className={classNames('orbe-paragraph', className as string | undefined)} style={getStyle(rest, { margin: 0 })} >{children as ReactNode}</p>
})
