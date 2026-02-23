'use client'

import { Button } from '@/components/ui/button'

interface BackButtonProps {
  className?: string
}

export function BackButton({ className = '' }: BackButtonProps) {
  return (
    <Button 
      variant="ghost" 
      onClick={() => window.history.back()}
      className={`float-right mt-[25px] mr-[12px] w-[100px] shadow-[2px_2px_0px_1px_rgba(0,0,0,0.1)] text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 cursor-pointer ${className}`}
      style={{
        float: 'right',
        marginTop: '35px',
        marginRight: '30px',
        width: '100px',
        boxShadow: '2px 2px 0px 1px rgba(0,0,0,0.1)',
        cursor: 'pointer'
      }}
    >
      ← Back
    </Button>
  )
}
