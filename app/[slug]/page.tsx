import { Metadata } from "next"
import { Navbar } from "@/components/navbar"
import { HeroSection } from "@/components/hero-section"
import { ContentSection } from "@/components/content-section"
import { getLandingPage, getLandingPageSlugs } from "@/lib/strapi"
import { getStrapiImageProps } from "@/types/strapi"
import ProductionLogger from "@/lib/production-logger"

// Generar parámetros estáticos para SSG
export async function generateStaticParams() {
  try {
    const slugs = await getLandingPageSlugs()
    ProductionLogger.log("generateStaticParams", { slugs })

    return slugs.map((slug) => ({
      slug: slug,
    }))
  } catch (error) {
    ProductionLogger.error("Error in generateStaticParams", error)
    // Fallback en caso de error
    return [
      { slug: "landing-page" },
      { slug: "home" },
      { slug: "pricing" },
      { slug: "about" }
    ]
  }
}

// Metadata optimizada para SEO dinámico
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params
  const endTimer = ProductionLogger.startTimer(`generateMetadata(${resolvedParams.slug})`)
  ProductionLogger.log("generateMetadata called", { slug: resolvedParams.slug })

  try {
    ProductionLogger.log("Fetching metadata from Strapi...")
    const landingPageResponse = await getLandingPage(resolvedParams.slug)

    ProductionLogger.structure("Metadata response structure", {
      hasData: !!landingPageResponse.data,
      dataType: typeof landingPageResponse.data,
      isArray: Array.isArray(landingPageResponse.data)
    })

    const landingPage = landingPageResponse.data?.attributes || (landingPageResponse.data as unknown as any[])?.[0]

    // Fallback si no hay datos
    if (!landingPage) {
      ProductionLogger.warn("No landing page data found, using fallback metadata")
      endTimer()
      return {
        title: "DUX Software - Desarrollo de Software a Medida",
        description: "Empresa líder en desarrollo de software personalizado.",
      }
    }

    ProductionLogger.success("Metadata generated successfully from Strapi data")
    endTimer()

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

  } catch (error) {
    ProductionLogger.error("Error in generateMetadata", error)
    ProductionLogger.log("Using fallback metadata due to error")
    endTimer()

    return {
      title: "DUX Software - Desarrollo de Software a Medida",
      description: "Empresa líder en desarrollo de software personalizado.",
    }
  }
}

export default async function DynamicLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params
  const endTimer = ProductionLogger.startTimer(`DynamicLandingPage(${resolvedParams.slug}) render`)
  let landingPage: any = null;

  ProductionLogger.log("DynamicLandingPage component called", { slug: resolvedParams.slug })
  ProductionLogger.environment()

  try {
    ProductionLogger.log("Attempting to fetch from Strapi...")

    // Obtener data de Strapi usando el slug dinámico
    const landingPageResponse = await getLandingPage(resolvedParams.slug)

    ProductionLogger.structure("Strapi response received", {
      hasData: !!landingPageResponse.data,
      dataType: typeof landingPageResponse.data,
      hasAttributes: !!landingPageResponse.data?.attributes,
      hasDynamicZone: !!landingPageResponse.data?.attributes?.dynamicZone,
      dynamicZoneLength: landingPageResponse.data?.attributes?.dynamicZone?.length || 0
    })

    landingPage = landingPageResponse.data?.attributes

    if (landingPage) {
      ProductionLogger.success("Landing page data loaded successfully", {
        slug: resolvedParams.slug,
        title: landingPage.title,
        dynamicZoneComponents: landingPage.dynamicZone?.length || 0,
        isFromStrapi: true
      })
    }

  } catch (error) {
    ProductionLogger.error("ERROR connecting to Strapi", error)
    ProductionLogger.log("Using mock data for fallback...")
  }

  // Datos mock para fallback (solo se usa si landingPage es null)
  const mockLandingPage = {
    title: "DUX Software - Desarrollo de Software a Medida",
    description: "Empresa líder en desarrollo de software personalizado",
    dynamicZone: [
      {
        __component: "layout.navbar",
        id: 1,
        logo: {
          data: {
            id: 3,
            attributes: {
              name: "duxlogo.png",
              alternativeText: "DUX Software Logo",
              caption: "Logo DUX Software",
              width: 240,
              height: 80,
              formats: {},
              hash: "dux_logo_hash",
              ext: ".png",
              mime: "image/png",
              size: 25.5,
              url: "/duxlogo.png",
              provider: "local",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          }
        },
        logoAlt: "DUX Software",
        logoHref: "/",
        logoWidth: 120,
        logoHeight: 40,
        navItems: [
          {
            navItemId: "platform",
            label: "Plataforma",
            hasDropdown: true,
            dropdownCategories: [
              {
                categoryId: "capabilities",
                title: "SERVICIOS",
                items: [
                  {
                    dropdownItemId: "web-dev",
                    title: "Desarrollo Web",
                    description: "Aplicaciones web modernas y escalables.",
                    href: "/services/web",
                    icon: "LayoutGrid"
                  },
                  {
                    dropdownItemId: "mobile-dev",
                    title: "Desarrollo Móvil",
                    description: "Apps nativas y multiplataforma.",
                    href: "/services/mobile",
                    icon: "BarChart"
                  }
                ]
              }
            ]
          },
          { navItemId: "solutions", label: "Soluciones", href: "/solutions" },
          { navItemId: "prices", label: "Precios", href: "/pricing" },
          { navItemId: "about", label: "Nosotros", href: "/about" }
        ],
        ctaButtons: [
          { ctaButtonId: "cta-primary", label: "Comenzar", href: "#contact", variant: "default" },
          { ctaButtonId: "cta-secondary", label: "Demo", href: "#demo", variant: "outline" }
        ],
        backgroundColor: "white"
      },
      {
        __component: "sections.hero",
        id: 2,
        title: `Página ${resolvedParams.slug}`,
        subtitle: "Soluciones tecnológicas a medida",
        description: "Creamos aplicaciones web, móviles y sistemas empresariales que transforman tu visión en realidad digital.",
        ctaButtons: [
          { id: "hero-primary", label: "Comenzar Proyecto", href: "#contact", variant: "default" },
          { id: "hero-secondary", label: "Ver Casos", href: "#cases", variant: "outline" }
        ],
        backgroundColor: "gradient",
        textAlignment: "center",
        bottomImage: {
          url: "/placeholder-enterprise.svg",
          alt: "Dashboard de software empresarial"
        }
      }
    ]
  };

  // Si no hay datos de Strapi, usar datos mock
  if (!landingPage || !landingPage.dynamicZone) {
    ProductionLogger.log("Using fallback mock data")
  }

  const actualLandingPage = landingPage || mockLandingPage;

  // Filtrar componentes por tipo
  const navbarComponents = actualLandingPage.dynamicZone.filter(
    (component: any) => component.__component === "layout.navbar"
  )

  const heroComponents = actualLandingPage.dynamicZone.filter(
    (component: any) => component.__component === "sections.hero"
  )

  const contentComponents = actualLandingPage.dynamicZone.filter(
    (component: any) => component.__component === "sections.content"
  )

  // Log final antes del render
  ProductionLogger.success("DynamicLandingPage render complete", {
    slug: resolvedParams.slug,
    navbarComponents: navbarComponents.length,
    heroComponents: heroComponents.length,
    contentComponents: contentComponents.length,
    usingMockData: !landingPage
  })
  endTimer()

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
            "description": actualLandingPage.description,
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
        {navbarComponents.map((navbar: any, index: number) => {
          return (
            <Navbar
              key={navbar.id || `navbar-${index}`}
              logo={{
                src: navbar.logo ? getStrapiImageProps(navbar.logo).src : "/duxlogo.png",
                alt: navbar.logoAlt || "DUX Software",
                href: navbar.logoHref || "/",
                width: navbar.logoWidth || 120,
                height: navbar.logoHeight || 40
              }}
              navItems={navbar.navItems}
              ctaButtons={navbar.ctaButtons}
              backgroundColor={navbar.backgroundColor || "white"}
            />
          )
        })}

        {/* Renderizar Hero Sections */}
        {heroComponents.map((hero: any, index: number) => (
          <section key={hero.id || `hero-${index}`} id={index === 0 ? "home" : `hero-${hero.id || index}`}>
            <HeroSection
              title={hero.title || "Título por defecto"}
              subtitle={hero.subtitle}
              description={hero.description || "Descripción por defecto"}
              ctaButtons={hero.ctaButtons || []}
              backgroundImage={hero.backgroundImage ? getStrapiImageProps(hero.backgroundImage).src : undefined}
              backgroundColor={hero.backgroundColor || "white"}
              textAlignment={hero.textAlignment || "center"}
              bottomImage={hero.bottomImage ? getStrapiImageProps(hero.bottomImage) : undefined}
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
            <section key={content.id || `content-${index}`} id={`section-${content.id || index}`}>
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