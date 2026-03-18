
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LogoProps {
  className?: string
  iconOnly?: boolean
}

export function Logo({ className, iconOnly = false }: LogoProps) {
  // SVG Icon element for reuse
  const logoIcon = (
    <div className={cn("relative shrink-0", iconOnly ? className : "w-10 h-10")}>
      <svg 
        viewBox="0 0 100 100" 
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Shape: Rounded Square */}
        <rect width="100" height="100" rx="28" className="fill-primary" />
        
        {/* Stylized 'S' path - Minimalist and Modern */}
        <path 
          d="M72 38H42C37.5817 38 34 41.5817 34 46V48C34 52.4183 37.5817 56 42 56H58C62.4183 56 66 59.5817 66 64V66C66 70.4183 62.4183 74 58 74H28" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          fill="none" 
        />
        
        {/* Connectivity / Info Dot */}
        <circle cx="72" cy="24" r="7" fill="white" className="animate-pulse" />
      </svg>
    </div>
  )

  if (iconOnly) {
    return logoIcon
  }

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {logoIcon}
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black text-primary tracking-tighter uppercase">SITU</span>
        <span className="text-[10px] font-black text-muted-foreground/60 tracking-[0.3em] uppercase">HANURA</span>
      </div>
    </div>
  )
}
