
"use client"

import * as React from "react"
import { Moon, Sun, Flame, Leaf, Grape, Contrast, Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const themes = [
  { value: "dark", label: "Default Dark", icon: Moon },
  { value: "theme-green", label: "Green", icon: Leaf },
  { value: "theme-red", label: "Red", icon: Flame },
  { value: "theme-yellow", label: "Yellow", icon: Sun },
  { value: "theme-purple", label: "Purple", icon: Grape },
  { value: "theme-white", label: "White", icon: Contrast },
]

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label="Toggle theme">
                            <Paintbrush className="h-[1.2rem] w-[1.2rem] animate-icon-pulse-glow" />
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change Theme</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <DropdownMenuContent align="end">
        {themes.map((theme) => {
            const Icon = theme.icon;
            return (
                <DropdownMenuItem key={theme.value} onClick={() => setTheme(theme.value)}>
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{theme.label}</span>
                </DropdownMenuItem>
            )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
