"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Menu, X, ChevronDown } from "lucide-react"
import * as LucideIcons from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { NavItem, CtaButton } from "@/types/strapi"
import React from "react"

// Componente dinámico para renderizar cualquier ícono de Lucide
const DynamicIcon = ({ name, size, ...props }: { name: string; size?: number } & React.ComponentProps<"svg">) => {
  const IconComponent = (LucideIcons as any)[name]

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React`)
    // Fallback a un ícono por defecto
    const DefaultIcon = LucideIcons.HelpCircle
    return <DefaultIcon size={size} {...props} />
  }

  return <IconComponent size={size} {...props} />
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
    { navItemId: "home", label: "Inicio", href: "#home" },
    { navItemId: "solutions", label: "Soluciones", href: "#solutions" },
    { navItemId: "prices", label: "Precios", href: "#prices" },
    { navItemId: "resources", label: "Recursos", href: "#resources" },
    { navItemId: "about", label: "Nosotros", href: "#about" },
  ],
  ctaButtons = [
    {
      ctaButtonId: "cta",
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

  // Función para renderizar iconos dinámicamente
  const renderIcon = (iconName?: string, size: number = 20) => {
    if (!iconName) return null
    return <DynamicIcon name={iconName} size={size} className="text-blue-600" />
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
          <div className="hidden md:flex items-center justify-center flex-grow">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => (
                item.hasDropdown ? (
                  <DropdownMenu key={item.navItemId}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={`text-base font-medium ${getNavTextClass()} hover:bg-transparent`}
                      >
                        {item.label} <ChevronDown className="ml-1 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[900px] p-6 grid grid-cols-3 gap-8">
                      {/* Categorías del dropdown */}
                      {item.dropdownCategories?.map((category) => (
                        <div key={category.categoryId}>
                          <h4 className="text-sm font-semibold text-gray-500 uppercase mb-4">
                            {category.title}
                          </h4>
                          <div className="grid gap-3">
                            {category.items.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.dropdownItemId}
                                href={dropdownItem.href}
                                className="flex items-start gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                              >
                                {renderIcon(dropdownItem.icon, 20)}
                                <div>
                                  <p className="font-medium text-gray-900">{dropdownItem.title}</p>
                                  <p className="text-sm text-gray-600">{dropdownItem.description}</p>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Footer del dropdown */}
                      {item.dropdownFooterActions && item.dropdownFooterActions.length > 0 && (
                        <div className="col-span-3 border-t border-gray-200 pt-4 mt-4 flex justify-around">
                          {item.dropdownFooterActions.map((action) => (
                            <Button
                              key={action.footerActionId}
                              asChild
                              variant="ghost"
                              className="text-gray-700 hover:text-blue-600 flex items-center gap-2"
                            >
                              <Link href={action.href}>
                                {renderIcon(action.icon, 18)}
                                {action.label}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    key={item.navItemId}
                    href={item.href || "#"}
                    className={`text-base font-medium transition-colors ${getNavTextClass()} px-4`}
                    aria-label={`Ir a ${item.label}`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-3">
              {ctaButtons.map((ctaButton) => (
                <Button
                  key={ctaButton.ctaButtonId}
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
                item.hasDropdown ? (
                  <div key={item.navItemId} className="space-y-2">
                    <div className="text-gray-900 font-semibold px-3 py-2 text-base">
                      {item.label}
                    </div>
                    {item.dropdownCategories?.map((category) => (
                      <div key={category.categoryId} className="pl-6 space-y-1">
                        <div className="text-gray-600 font-medium text-sm uppercase tracking-wide px-3 py-1">
                          {category.title}
                        </div>
                        {category.items.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.dropdownItemId}
                            href={dropdownItem.href}
                            className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            {dropdownItem.title}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.navItemId}
                    href={item.href || "#"}
                    className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium"
                    onClick={() => setIsOpen(false)}
                    aria-label={`Ir a ${item.label}`}
                  >
                    {item.label}
                  </Link>
                )
              ))}
              <div className="pt-4 px-3 space-y-3">
                {ctaButtons.map((ctaButton) => (
                  <Button
                    key={ctaButton.ctaButtonId}
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
