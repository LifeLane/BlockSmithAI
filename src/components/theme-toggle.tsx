
"use client"

import * as React from "react"
import { Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Toggle theme">
          <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-synthwave")}>
          Synthwave
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-solarflare")}>
          Solar Flare
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-quantum")}>
          Quantum
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-matrix")}>
          Matrix
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("theme-stark")}>
          Stark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
