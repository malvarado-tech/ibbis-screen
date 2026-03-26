"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, Github } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"

export function Navbar() {
  const pathname = usePathname()
  const { setTheme, theme } = useTheme()

  const routes = [
    { href: "/screen", label: "Screen" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/about", label: "About" },
    { href: "/api-docs", label: "API Docs" },
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/ibbis-logo-bird.svg" alt="IBBIS" width={28} height={28} />
            <span className="inline-block font-bold">IBBIS Screen</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={`text-sm font-medium transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm ${
                  pathname === route.href
                    ? "text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "light" ? "dark" : "light")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-[transform,opacity] dark:-rotate-90 dark:scale-0" aria-hidden="true" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-[transform,opacity] dark:rotate-0 dark:scale-100" aria-hidden="true" />
            <span className="sr-only">Toggle theme</span>
          </Button>
          
          <Link 
            href="https://github.com/ibbis-bio/commec" 
            target="_blank" 
            rel="noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
          >
            <Github className="h-[1.2rem] w-[1.2rem]" aria-hidden="true" />
            <span className="sr-only">GitHub</span>
          </Link>

          <Sheet>
            <SheetTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "md:hidden")}>
              <Menu className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Toggle menu</span>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 mt-8">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={`text-sm font-medium transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm ${
                      pathname === route.href
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {route.label}
                  </Link>
                ))}
                <Link
                  href="https://github.com/ibbis-bio/commec"
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-2"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  GitHub
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
