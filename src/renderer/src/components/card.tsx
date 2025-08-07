import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-white/70 backdrop-blur-xl rounded-2xl border border-slate-200/50 shadow-xl ${className}`}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  icon: ReactNode
  title: string
  description: string
  iconBgColor?: string
}

export function CardHeader({
  icon,
  title,
  description,
  iconBgColor = 'from-teal-500 to-teal-600'
}: CardHeaderProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div
        className={`w-10 h-10 bg-gradient-to-br ${iconBgColor} rounded-xl flex items-center justify-center shadow-lg`}
      >
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
  )
}

interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return <div className={`p-6 ${className}`}>{children}</div>
}
