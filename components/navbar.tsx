"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface NavItem {
  id: string
  label: string
  href: string
}

interface CtaButton {
  id: string
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface NavbarProps {
  logo?: {
    src?: string
    alt?: string
    href?: string
    width?: number
    height?: number
  }
  navItems?: NavItem[]
  ctaButtons?: CtaButton[]
  backgroundColor?: "transparent" | "white" | "blue"
  className?: string
}

export function Navbar({
  logo = {
    src: "/duxlogo.png",
    alt: "DUX Software",
    href: "/",
    width: 120,
    height: 40
  },
  navItems = [
    { id: "home", label: "Inicio", href: "#home" },
    { id: "solutions", label: "Soluciones", href: "#solutions" },
    { id: "prices", label: "Precios", href: "#prices" },
    { id: "resources", label: "Recursos", href: "#resources" },
    { id: "about", label: "Nosotros", href: "#about" },
  ],
  ctaButtons = [
    {
      id: "cta",
      label: "Comenzar",
      href: "#contact",
      variant: "default"
    }
  ],
  backgroundColor = "white",
  className = ""
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const getBackgroundClass = () => {
    // Siempre fondo blanco
    return "bg-white shadow-sm"
  }

  const getTextClass = () => {
    // Siempre texto oscuro para fondo blanco
    return "text-gray-900"
  }

  const getNavTextClass = () => {
    // Siempre texto oscuro para fondo blanco
    return "text-gray-700 hover:text-blue-600"
  }

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${getBackgroundClass()} ${className}`}
      role="navigation"
      aria-label="Navegación principal"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href={logo.href || "/"}
              className="block transition-opacity hover:opacity-80"
              aria-label={`${logo.alt} - Ir al inicio`}
            >
              <Image
                src={logo.src || "/duxlogo.png"}
                alt={logo.alt || "DUX Software"}
                width={logo.width || 120}
                height={logo.height || 40}
                className="h-10 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${getNavTextClass()}`}
                  aria-label={`Ir a ${item.label}`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {ctaButtons.map((ctaButton) => (
                <Button
                  key={ctaButton.id}
                  asChild
                  className={ctaButton.variant === "outline"
                    ? "border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                  }
                >
                  <Link href={ctaButton.href} aria-label={ctaButton.label}>
                    {ctaButton.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={isOpen}
            >
              {isOpen ? (
                <X className={`h-6 w-6 ${getTextClass()}`} />
              ) : (
                <Menu className={`h-6 w-6 ${getTextClass()}`} />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t shadow-lg">
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                  onClick={() => setIsOpen(false)}
                  aria-label={`Ir a ${item.label}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 px-3 space-y-3">
                {ctaButtons.map((ctaButton) => (
                  <Button
                    key={ctaButton.id}
                    asChild
                    className={ctaButton.variant === "outline"
                      ? "w-full border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                      : "w-full bg-blue-600 hover:bg-blue-700"
                    }
                  >
                    <Link
                      href={ctaButton.href}
                      onClick={() => setIsOpen(false)}
                      aria-label={ctaButton.label}
                    >
                      {ctaButton.label}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
