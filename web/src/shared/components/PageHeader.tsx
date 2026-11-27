import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description?: string
  titleId?: string
  className?: string
  actions?: ReactNode
}

/** Shared page-level heading, description and action layout across Orbe modules. */
export function PageHeader({ title, description, titleId, className = '', actions }: PageHeaderProps) {
  return <header className={`orbe-page-header ${className}`}>
    <div className="orbe-page-header-copy">
      <h1 id={titleId}>{title}</h1>
      {description ? <p>{description}</p> : null}
    </div>
    {actions ? <div className="orbe-page-header-actions">{actions}</div> : null}
  </header>
}
