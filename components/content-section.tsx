import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

interface CtaButton {
  id: string
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
}

interface ContentSectionProps {
  title: string
  subtitle?: string
  description: string
  ctaButton?: CtaButton
  image: {
    src: string
    alt: string
    width?: number
    height?: number
  }
  layout?: "image-left" | "image-right"
  backgroundColor?: "white" | "gray" | "blue"
  containerSize?: "sm" | "md" | "lg" | "xl"
  className?: string
  seo?: {
    headingLevel?: "h2" | "h3" | "h4"
  }
}

export function ContentSection({
  title,
  subtitle,
  description,
  ctaButton,
  image,
  layout = "image-right",
  backgroundColor = "white",
  containerSize = "lg",
  className = "",
  seo = { headingLevel: "h2" }
}: ContentSectionProps) {
  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case "gray":
        return "bg-gray-50"
      case "blue":
        return "bg-blue-50"
      default:
        return "bg-white"
    }
  }

  const getContainerClass = () => {
    switch (containerSize) {
      case "sm":
        return "max-w-4xl"
      case "md":
        return "max-w-5xl"
      case "xl":
        return "max-w-7xl"
      default:
        return "max-w-6xl"
    }
  }

  const getCtaButtonClass = (variant: string = "default") => {
    const baseClass = "px-6 py-3 font-semibold transition-all duration-300"

    switch (variant) {
      case "outline":
        return `${baseClass} border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white`
      case "ghost":
        return `${baseClass} text-blue-600 hover:bg-blue-50`
      default:
        return `${baseClass} bg-blue-600 text-white hover:bg-blue-700 shadow-lg hover:shadow-xl`
    }
  }

  const TitleTag = seo.headingLevel || "h2"

  const isImageLeft = layout === "image-left"

  return (
    <section
      className={`py-16 lg:py-24 ${getBackgroundClass()} ${className}`}
      role="region"
      aria-label={`Sección de contenido: ${title}`}
    >
      <div className={`container mx-auto px-4 ${getContainerClass()}`}>
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isImageLeft ? "" : "lg:grid-flow-dense"
          }`}>

          {/* Image Column */}
          <div className={`relative ${isImageLeft ? "lg:order-1" : "lg:order-2"}`}>
            <div className="relative overflow-hidden rounded-lg shadow-xl">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width || 600}
                height={image.height || 400}
                className="w-full h-auto object-cover transition-transform duration-500 hover:scale-105"
                loading="lazy"
              />

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-600 rounded-full opacity-20 blur-xl" />
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-blue-400 rounded-full opacity-30 blur-lg" />
            </div>
          </div>

          {/* Content Column */}
          <div className={`space-y-6 ${isImageLeft ? "lg:order-2" : "lg:order-1"}`}>
            {/* Subtitle */}
            {subtitle && (
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wider">
                {subtitle}
              </p>
            )}

            {/* Title */}
            <TitleTag className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              {title}
            </TitleTag>

            {/* Description */}
            <div className="text-lg text-gray-600 leading-relaxed space-y-4">
              {description.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* CTA Button */}
            {ctaButton && (
              <div className="pt-4">
                <Button
                  asChild
                  className={getCtaButtonClass(ctaButton.variant)}
                  size="lg"
                >
                  <Link
                    href={ctaButton.href}
                    aria-label={ctaButton.label}
                  >
                    {ctaButton.label}
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>


    </section>
  )
} 