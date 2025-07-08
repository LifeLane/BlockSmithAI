
"use client"

import * as React from "react"
import { Moon, Sun, Leaf, Flame, Grape, Contrast, Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const themes = [
  { value: "dark", label: "Default Dark", icon: <Moon className="h-4 w-4" /> },
  { value: "theme-green", label: "Green", icon: <Leaf className="h-4 w-4" /> },
  { value: "theme-red", label: "Red", icon: <Flame className="h-4 w-4" /> },
  { value: "theme-yellow", label: "Yellow", icon: <Sun className="h-4 w-4" /> },
  { value: "theme-purple", label: "Purple", icon: <Grape className="h-4 w-4" /> },
  { value: "theme-white", label: "White", icon: <Contrast className="h-4 w-4" /> },
]

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const currentThemeLabel = themes.find(t => t.value === theme)?.label || "Change Theme";

  return (
    <DropdownMenu>
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Paintbrush className="h-[1.2rem] w-[1.2rem] animate-icon-pulse-glow" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>
            <p>Switch Theme ({currentThemeLabel})</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <DropdownMenuContent align="end">
        {themes.map((t) => (
          <DropdownMenuItem key={t.value} onClick={() => setTheme(t.value)} className="gap-2">
            {t.icon}
            <span>{t.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
