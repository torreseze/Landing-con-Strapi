import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CtaButton {
  id: string
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface HeroSectionProps {
  title: string
  subtitle?: string
  description: string
  ctaButtons?: CtaButton[]
  backgroundImage?: string
  backgroundColor?: "white" | "blue" | "gradient"
  textAlignment?: "left" | "center" | "right"
  className?: string
  seo?: {
    h1?: boolean
    keywords?: string[]
  }
}

export function HeroSection({
  title,
  subtitle,
  description,
  ctaButtons = [],
  backgroundImage,
  backgroundColor = "white",
  textAlignment = "center",
  className = "",
  seo = { h1: true }
}: HeroSectionProps) {
  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case "blue":
        return "bg-blue-600 text-white"
      case "gradient":
        return "bg-gradient-to-br from-blue-600 to-blue-800 text-white"
      default:
        return "bg-white text-gray-900"
    }
  }

  const getAlignmentClass = () => {
    switch (textAlignment) {
      case "left":
        return "text-left"
      case "right":
        return "text-right"
      default:
        return "text-center"
    }
  }

  const getCtaButtonClass = (variant: string = "default") => {
    const baseClass = "px-8 py-3 text-lg font-semibold transition-all duration-300"

    switch (variant) {
      case "outline":
        return backgroundColor === "white"
          ? `${baseClass} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`
          : `${baseClass} border-2 border-white text-black bg-white hover:bg-orange-600 hover:text-white`
      case "ghost":
        return `${baseClass} text-blue-600 hover:bg-blue-50`
      default:
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl`
    }
  }

  const TitleTag = seo?.h1 ? "h1" : "h2"

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center py-20 px-4 ${getBackgroundClass()} ${className}`}
      style={backgroundImage ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      } : undefined}
      role="banner"
      aria-label="Sección principal de la página"
    >
      <div className="container mx-auto max-w-6xl">
        <div className={`space-y-8 ${getAlignmentClass()}`}>
          {/* Subtitle */}
          {subtitle && (
            <p className="text-2xl font-medium uppercase tracking-wider">
              {subtitle}
            </p>
          )}

          {/* Title */}
          <TitleTag className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {title}
          </TitleTag>

          {/* Description */}
          <p className="text-xl md:text-2xl leading-relaxed max-w-4xl mx-auto opacity-90">
            {description}
          </p>

          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className={`flex flex-col sm:flex-row gap-4 ${textAlignment === "center" ? "justify-center" :
              textAlignment === "right" ? "justify-end" : "justify-start"
              }`}>
              {ctaButtons.map((button, index) => (
                <Button
                  key={button.id}
                  asChild
                  className={getCtaButtonClass(button.variant)}
                  size="lg"
                >
                  <Link
                    href={button.href}
                    aria-label={button.label}
                  >
                    {button.label}
                  </Link>
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>


    </section>
  )
}
