import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ContentSection } from "@/components/content-section"
import { getLandingPage } from "@/lib/strapi"
import {
  isNavbarComponent,
  isHeroSectionComponent,
  isContentSectionComponent,
  getStrapiImageProps
} from "@/types/strapi"
import { Metadata } from "next"

// Metadata optimizada para SEO
export async function generateMetadata(): Promise<Metadata> {
  const landingPageResponse = await getLandingPage("pagina-principal")
  const landingPage = (landingPageResponse.data as unknown as any[])?.[0]

  // Fallback si no hay datos
  if (!landingPage) {
    return {
      title: "DUX Software - Desarrollo de Software a Medida",
      description: "Empresa líder en desarrollo de software personalizado.",
    }
  }

  return {
    title: landingPage.seoTitle || landingPage.title,
    description: landingPage.seoDescription || landingPage.description,
    keywords: landingPage.seoKeywords?.join(", "),
    openGraph: {
      title: landingPage.seoTitle || landingPage.title,
      description: landingPage.seoDescription || landingPage.description,
      type: "website",
      locale: "es_ES",
      siteName: "DUX Software"
    },
    twitter: {
      card: "summary_large_image",
      title: landingPage.seoTitle || landingPage.title,
      description: landingPage.seoDescription || landingPage.description
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

export default async function HomePage() {
  let landingPage: any = null

  try {
    // Obtener data de Strapi
    const landingPageResponse = await getLandingPage("pagina-principal")
    landingPage = (landingPageResponse.data as unknown as any[])?.[0]
  } catch (error) {
    console.error("Error connecting to Strapi:", error)
    console.log("Using mock data for development...")
  }

  // Si no hay datos de Strapi, usar datos mock
  if (!landingPage || !landingPage.dynamicZone) {
    console.log("Using fallback mock data")
    landingPage = {
      title: "DUX Software - Desarrollo de Software a Medida",
      description: "Empresa líder en desarrollo de software personalizado",
      dynamicZone: [
        {
          __component: "layout.navbar",
          id: 1,
          logo: null,
          logoAlt: "DUX Software",
          logoHref: "/",
          logoWidth: 120,
          logoHeight: 40,
          navItems: [
            { id: "home", label: "Inicio", href: "#home" },
            { id: "solutions", label: "Soluciones", href: "#solutions" },
            { id: "prices", label: "Precios", href: "#prices" },
            { id: "resources", label: "Recursos", href: "#resources" },
            { id: "about", label: "Nosotros", href: "#about" }
          ],
          ctaButtons: [
            { id: "cta-primary", label: "Comenzar", href: "#contact", variant: "default" },
            { id: "cta-secondary", label: "Demo", href: "#demo", variant: "outline" }
          ],
          backgroundColor: "white"
        },
        {
          __component: "sections.hero",
          id: 2,
          title: "Desarrollamos Software que Impulsa tu Negocio",
          subtitle: "Soluciones tecnológicas a medida",
          description: "Creamos aplicaciones web, móviles y sistemas empresariales que transforman tu visión en realidad digital.",
          ctaButtons: [
            { id: "hero-primary", label: "Comenzar Proyecto", href: "#contact", variant: "default" },
            { id: "hero-secondary", label: "Ver Casos", href: "#cases", variant: "outline" }
          ],
          backgroundColor: "gradient",
          textAlignment: "center"
        }
      ]
    }
  }

  // Filtrar componentes por tipo
  const navbarComponents = landingPage.dynamicZone.filter(
    (component: any) => component.__component === "layout.navbar"
  )




  const heroComponents = landingPage.dynamicZone.filter(
    (component: any) => component.__component === "sections.hero"
  )
  const contentComponents = landingPage.dynamicZone.filter(
    (component: any) => component.__component === "sections.content"
  )

  return (
    <>
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "DUX Software",
            "url": "https://duxsoftware.com",
            "description": landingPage.description,
            "sameAs": [
              "https://linkedin.com/company/duxsoftware",
              "https://github.com/duxsoftware"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "sales",
              "areaServed": "ES",
              "availableLanguage": "Spanish"
            }
          })
        }}
      />

      <main className="min-h-screen">
        {/* Renderizar Navbar */}
        {navbarComponents.map((navbar: any) => {
          return (
            <Navbar
              key={navbar.id}
              logo={{
                src: navbar.logo ? getStrapiImageProps(navbar.logo).src : "/duxlogo.png",
                alt: navbar.logoAlt || "DUX Software",
                href: navbar.logoHref || "/",
                width: navbar.logoWidth || 120,
                height: navbar.logoHeight || 40
              }}
              navItems={navbar.navItems && navbar.navItems.length > 0 ? navbar.navItems.map((item: any) => ({
                id: item.navItemId || item.id,
                label: item.label,
                href: item.href
              })) : [
                { id: "home", label: "Inicio", href: "#home" },
                { id: "solutions", label: "Soluciones", href: "#solutions" },
                { id: "prices", label: "Precios", href: "#prices" },
                { id: "resources", label: "Recursos", href: "#resources" },
                { id: "about", label: "Nosotros", href: "#about" },
              ]}
              ctaButtons={navbar.ctaButtons && navbar.ctaButtons.length > 0 ? navbar.ctaButtons.map((button: any) => ({
                id: button.ctaButtonId || button.id,
                label: button.label,
                href: button.href,
                variant: button.variant || "default"
              })) : (navbar.ctaButton && Array.isArray(navbar.ctaButton) ? navbar.ctaButton.map((button: any) => ({
                id: button.ctaButtonId || button.id,
                label: button.label,
                href: button.href,
                variant: button.variant || "default"
              })) : [
                {
                  id: "default-cta",
                  label: "Contacto",
                  href: "#contact",
                  variant: "default"
                }
              ])}
              backgroundColor={navbar.backgroundColor || "white"}
            />
          )
        })}

        {/* Renderizar Hero Sections */}
        {heroComponents.map((hero: any, index: number) => (
          <section key={hero.id} id={index === 0 ? "home" : `hero-${hero.id}`}>
            <HeroSection
              title={hero.title || "Título por defecto"}
              subtitle={hero.subtitle}
              description={hero.description || "Descripción por defecto"}
              ctaButtons={hero.ctaButtons || []}
              backgroundImage={hero.backgroundImage ? getStrapiImageProps(hero.backgroundImage).src : undefined}
              backgroundColor={hero.backgroundColor || "white"}
              textAlignment={hero.textAlignment || "center"}
              seo={hero.seo || { h1: true }}
            />
          </section>
        ))}

        {/* Renderizar Content Sections */}
        {contentComponents.map((content: any, index: number) => {
          // Convertir rich text content de Strapi a string
          const convertRichTextToString = (richTextArray: any[] | string) => {
            if (typeof richTextArray === 'string') return richTextArray;
            if (!Array.isArray(richTextArray)) return "Contenido no disponible";

            return richTextArray
              .map(block => {
                if (block.type === 'paragraph' && block.children) {
                  return block.children
                    .map((child: any) => child.text || '')
                    .join('')
                }
                return ''
              })
              .filter(text => text.trim() !== '')
              .join('\n\n')
          }

          return (
            <section key={content.id} id={`section-${content.id}`}>
              <ContentSection
                title={content.title || "Título de sección"}
                subtitle={content.subtitle}
                description={convertRichTextToString(content.content || content.description || "")}
                ctaButton={content.ctaButton}
                image={content.image ? getStrapiImageProps(content.image) : {
                  src: "/placeholder-web.svg",
                  alt: "Imagen placeholder",
                  width: 600,
                  height: 400
                }}
                layout={content.imagePosition === "left" ? "image-left" : "image-right"}
                backgroundColor={content.backgroundColor || "white"}
                containerSize={content.containerSize || "lg"}
                seo={{ headingLevel: content.seoHeadingLevel || "h2" }}
              />
            </section>
          )
        })}
      </main>
    </>
  )
}
