"use client"

import * as React from "react"
import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className={`h-9 w-9 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-neo-sm rounded-xl ${className || ''}`}
      >
        <Sun className="h-4 w-4 text-black dark:text-white" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={`h-9 w-9 border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-neo-yellow dark:hover:bg-zinc-700 text-black dark:text-white shadow-neo-sm rounded-xl transition-all ${className || ''}`}
          title="Ganti Mode Tema"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 stroke-[2.5]" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 stroke-[2.5]" />
          <span className="sr-only">Ganti Mode Tema</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-2 border-black dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-neo-md rounded-xl p-1 font-extrabold text-xs z-50">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 p-2 ${theme === 'light' ? 'bg-neo-yellow text-black font-black' : 'hover:bg-neo-cream dark:hover:bg-zinc-800 dark:text-zinc-200'}`}
        >
          <Sun className="h-4 w-4 stroke-[2.5]" />
          <span>Mode Terang</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 p-2 ${theme === 'dark' ? 'bg-neo-yellow dark:bg-yellow-500/20 text-black dark:text-yellow-400 font-black' : 'hover:bg-neo-cream dark:hover:bg-zinc-800 dark:text-zinc-200'}`}
        >
          <Moon className="h-4 w-4 stroke-[2.5]" />
          <span>Mode Gelap</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`rounded-lg cursor-pointer flex items-center gap-2 p-2 ${theme === 'system' ? 'bg-neo-yellow dark:bg-yellow-500/20 text-black dark:text-yellow-400 font-black' : 'hover:bg-neo-cream dark:hover:bg-zinc-800 dark:text-zinc-200'}`}
        >
          <Monitor className="h-4 w-4 stroke-[2.5]" />
          <span>Sistem OS</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

