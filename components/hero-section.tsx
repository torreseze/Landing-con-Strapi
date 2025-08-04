import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CtaButton {
  ctaButtonId: string
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
  // Nueva prop para la imagen inferior
  bottomImage?: {
    src: string
    alt?: string
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
  seo = { h1: true },
  bottomImage
}: HeroSectionProps) {
  const getBackgroundClass = () => {
    // Sin importar el backgroundColor que venga de Strapi, usamos el nuevo diseño
    return "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 text-gray-900"
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
    const baseClass = "px-8 py-3 text-sm font-semibold transition-all duration-300 rounded-lg"

    switch (variant) {
      case "outline":
        // Botón secundario: fondo blanco, línea azul, texto azul
        return `${baseClass} bg-white border-2 border-[#0763E7] text-[#0763E7] hover:bg-[#0763E7] hover:text-white`
      case "ghost":
        // Mantener el estilo actual para ghost
        return `${baseClass} text-blue-600 hover:bg-blue-50`
      default:
        // Botón principal: fondo azul, línea azul, texto blanco
        return `${baseClass} bg-[#0763E7] border-2 border-[#0763E7] text-white hover:bg-[#0763E7]/90 shadow-lg hover:shadow-xl`
    }
  }

  const TitleTag = seo?.h1 ? "h1" : "h2"

  return (
    <section
      className={`relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4 ${getBackgroundClass()} ${className}`}
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
          {/* Encabezado - H1 */}
          {subtitle && (
            <h1 className="text-sm font-medium text-[#374151] bg-[#fcfdff] px-4 py-2 rounded-lg inline-block">
              {subtitle}
            </h1>
          )}

          {/* Título - H2 */}
          <TitleTag className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight text-[#12385B]">
            {title}
          </TitleTag>

          {/* Subtítulo - P */}
          <p className="text-lg md:text-xl leading-relaxed max-w-4xl mx-auto text-[#4B5563]">
            {description}
          </p>

          {/* CTA Buttons */}
          {ctaButtons.length > 0 && (
            <div className={`flex flex-col sm:flex-row gap-4 ${textAlignment === "center" ? "justify-center" :
              textAlignment === "right" ? "justify-end" : "justify-start"
              }`}>
              {ctaButtons.map((button, index) => (
                <Button
                  key={button.ctaButtonId || `button-${index}`}
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

        {/* Imagen inferior */}
        {bottomImage && (
          <div className="pt-16 max-w-5xl mx-auto">
            <Image
              src={bottomImage.src}
              alt={bottomImage.alt || "Imagen hero"}
              width={1200}
              height={600}
              className="w-full rounded-lg shadow-2xl border border-gray-200 object-cover"
              priority
            />
          </div>
        )}
      </div>
    </section>
  )
}
