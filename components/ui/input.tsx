import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, onInput, max, ...props }: React.ComponentProps<'input'>) {
  const handleInput: React.ComponentProps<'input'>['onInput'] = (event) => {
    if (type === 'date') {
      const input = event.currentTarget
      const raw = input.value

      // Cap year to 4 digits when typing manually (e.g. 202501 -> 2025)
      const trimmedYear = raw.replace(/^(\d{4})\d+(-.*)?$/, '$1$2')
      if (trimmedYear !== raw) {
        input.value = trimmedYear
      }
    }

    onInput?.(event)
  }

  return (
    <input
      type={type}
      data-slot="input"
      max={type === 'date' ? (max ?? '9999-12-31') : max}
      onInput={handleInput}
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
