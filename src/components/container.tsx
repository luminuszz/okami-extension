import { ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ContainerProps {
  children: ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <main
      className={cn([
        'm-auto my-10  flex w-[400px] items-center justify-center',
        className,
      ])}
    >
      {children}
    </main>
  )
}
