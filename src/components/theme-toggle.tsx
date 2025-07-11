"use client"

import * as React from "react"
import { Paintbrush } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

const THEMES = [
  { value: "dark", label: "Default Dark" },
  { value: "theme-green", label: "Green" },
  { value: "theme-red", label: "Red" },
  { value: "theme-yellow", label: "Yellow" },
  { value: "theme-purple", label: "Purple" },
  { value: "theme-white", label: "White" },
]

export function ThemeToggle() {
  const [mounted, setMounted] = React.useState(false)
  const { setTheme, theme } = useTheme()

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const handleToggle = () => {
    const currentIndex = THEMES.findIndex((t) => t.value === theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    setTheme(THEMES[nextIndex].value);
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleToggle}>
      <Paintbrush className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
