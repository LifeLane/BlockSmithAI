
"use client"

import * as React from "react"
import { Moon, Flame, Leaf, Grape, Contrast, Paintbrush, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const themes = [
  { value: "dark", label: "Default Dark" },
  { value: "theme-green", label: "Green" },
  { value: "theme-red", label: "Red" },
  { value: "theme-yellow", label: "Yellow" },
  { value: "theme-purple", label: "Purple" },
  { value: "theme-white", label: "White" },
]

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  const handleToggle = () => {
    const currentIndex = themes.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  }

  const currentThemeLabel = themes.find(t => t.value === theme)?.label || "Change Theme";

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={handleToggle}>
            <Paintbrush className="h-[1.2rem] w-[1.2rem] animate-icon-pulse-glow" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Switch Theme ({currentThemeLabel})</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
