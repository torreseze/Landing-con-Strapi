import { 
  StrapiLandingPageResponse, 
  StrapiLandingPagesResponse,
  LandingPage,
  DynamicZoneComponent
} from "@/types/strapi"
import ProductionLogger from "@/lib/production-logger"

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN

async function fetchAPI(path: string, options: RequestInit = {}) {
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` }),
    },
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(`${STRAPI_URL}/api${path}`, mergedOptions)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    return response.json()
  } catch (error) {
    console.error(`Error fetching ${path}:`, error)
    throw error
  }
}

// Función principal para obtener una landing page por slug con fallback automático
export async function getLandingPage(slug: string): Promise<StrapiLandingPageResponse> {
  const endTimer = ProductionLogger.startTimer(`getLandingPage(${slug})`)
  
  ProductionLogger.log("🔍 getLandingPage called", { slug })
  ProductionLogger.environment()
  
  const token = process.env.STRAPI_API_TOKEN

  ProductionLogger.debug("Token validation", {
    exists: !!token,
    length: token?.length || 0,
    preview: token?.substring(0, 10) + "..."
  })

  if (!token) {
    ProductionLogger.error('STRAPI_API_TOKEN no está configurado')
    ProductionLogger.warn('Returning mock data due to missing token')
    endTimer()
    return getMockLandingPage()
  }

  ProductionLogger.debug("URL validation", {
    url: STRAPI_URL,
    isValid: !!STRAPI_URL && STRAPI_URL.startsWith('http')
  })

  if (!STRAPI_URL) {
    ProductionLogger.error('NEXT_PUBLIC_STRAPI_URL no está configurado')
    ProductionLogger.warn('Returning mock data due to missing URL')
    endTimer()
    return getMockLandingPage()
  }

  // Strapi v5 - populate profundo
  const url = `${STRAPI_URL}/api/landing-pages?filters[slug][$eq]=${slug}&populate=*`
  
  ProductionLogger.httpRequest('GET', url, {
    'Authorization': 'Bearer [HIDDEN]',
    'Content-Type': 'application/json'
  })

  try {
    ProductionLogger.log("Making fetch request...")
    
    // Configurar timeout más corto para builds
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 segundos timeout
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 }, // Revalidar cada hora
      signal: controller.signal,
      // Removido cache: 'no-store' para permitir SSG
    })
    
    clearTimeout(timeoutId)

    ProductionLogger.httpResponse(response.status, response.statusText)

    if (!response.ok) {
      ProductionLogger.error(`Strapi response error: ${response.status} ${response.statusText}`)
      
      // Intentar leer el cuerpo del error
      try {
        const errorBody = await response.text()
        ProductionLogger.error('Error body', errorBody)
      } catch (e) {
        ProductionLogger.warn('Could not read error body')
      }
      
      // En lugar de throw, retornar mock data
      ProductionLogger.warn('Returning mock data due to HTTP error')
      endTimer()
      return getMockLandingPage()
    }

    ProductionLogger.log("Parsing JSON response...")
    const data = await response.json()
    
    ProductionLogger.structure("Parsed data structure", {
      hasData: !!data.data,
      dataIsArray: Array.isArray(data.data),
      dataLength: data.data?.length || 0,
      hasMeta: !!data.meta,
      firstItemKeys: data.data?.[0] ? Object.keys(data.data[0]) : []
    })
    
    // Strapi v5 devuelve array directamente, convertir a formato v4 para compatibilidad
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      ProductionLogger.log("Converting Strapi v5 format to v4 compatibility format")
      
      const result = {
        data: {
          id: data.data[0].id,
          attributes: data.data[0]
        },
        meta: data.meta
      }
      
      ProductionLogger.success("Conversion successful, returning data")
      endTimer()
      return result
    }
    
    ProductionLogger.log("Returning data as-is (no conversion needed)")
    endTimer()
    return data
    
  } catch (error) {
    ProductionLogger.error('Error in getLandingPage', error)
    
    // Manejo específico para diferentes tipos de errores
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        ProductionLogger.warn('Request timeout (10s) - Strapi server is slow or unreachable')
      } else if (error.message.includes('Dynamic server usage')) {
        ProductionLogger.warn('Next.js SSG error - this should be fixed now')
      } else if (error.message.includes('fetch')) {
        ProductionLogger.warn('Network error detected - possible causes:', [
          'Strapi server is down',
          'Network connectivity issues', 
          'DNS resolution problems',
          'Firewall blocking the request'
        ])
      }
    }
    
    // En lugar de throw, retornar mock data para permitir que el build continúe
    ProductionLogger.warn('Returning mock data due to error - build will continue')
    endTimer()
    return getMockLandingPage()
  }
}

// Función para obtener todas las landing pages
export async function getAllLandingPages(): Promise<StrapiLandingPagesResponse> {
  try {
    const response = await fetchAPI("/landing-pages?populate=*")
    return response
  } catch (error) {
    console.error("Error fetching all landing pages:", error)
    return {
      data: [],
      meta: {
        pagination: {
          page: 1,
          pageSize: 25,
          pageCount: 1,
          total: 0
        }
      }
    }
  }
}

// Función para obtener solo los slugs (útil para generateStaticParams)
export async function getLandingPageSlugs(): Promise<string[]> {
  try {
    const response = await fetchAPI("/landing-pages?fields[0]=slug")
    return response.data.map((page: any) => page.attributes.slug)
  } catch (error) {
    console.error("Error fetching landing page slugs:", error)
    return ["home"]
  }
}

// Mock data para desarrollo y fallback - MEJORADO
function getMockLandingPage(): StrapiLandingPageResponse {
  const mockData: LandingPage = {
    title: "DUX Software - Soluciones Tecnológicas",
    description: "Desarrollamos software a medida que transforma tu negocio",
    slug: "landing-page",
    seoTitle: "DUX Software - Desarrollo de Software a Medida",
    seoDescription: "Empresa líder en desarrollo de software personalizado. Creamos aplicaciones web, móviles y sistemas empresariales que impulsan el crecimiento de tu negocio.",
    seoKeywords: ["desarrollo software", "aplicaciones web", "software empresarial", "desarrollo móvil"],
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
          { id: "home", label: "Inicio", href: "#home" },
          { id: "solutions", label: "Soluciones", href: "#solutions" },
          { id: "prices", label: "Precios", href: "#prices" },
          { id: "resources", label: "Recursos", href: "#resources" },
          { id: "about", label: "Nosotros", href: "#about" }
        ],
        ctaButton: {
          id: "cta-nav",
          label: "Comenzar",
          href: "#contact",
          variant: "default"
        },
        backgroundColor: "white"
      },
      {
        __component: "sections.hero",
        id: 2,
        title: "Transformamos ideas en soluciones digitales innovadoras",
        subtitle: "Desarrollo de Software",
        description: "Creamos aplicaciones web, móviles y sistemas empresariales que impulsan el crecimiento de tu negocio con tecnología de vanguardia.",
        ctaButtons: [
          {
            id: "cta-hero-1",
            label: "Comenzar Proyecto",
            href: "#contact",
            variant: "default"
          },
          {
            id: "cta-hero-2",
            label: "Ver Soluciones",
            href: "#solutions",
            variant: "outline"
          }
        ],
        backgroundColor: "gradient",
        textAlignment: "center",
        seo: {
          h1: true,
          keywords: ["desarrollo software", "aplicaciones web", "software empresarial"]
        }
      },
      {
        __component: "sections.content",
        id: 3,
        title: "Desarrollo Web Moderno",
        subtitle: "Aplicaciones Web",
        description: "Creamos aplicaciones web robustas y escalables utilizando las últimas tecnologías como React, Next.js y Node.js.\n\nNuestras soluciones están optimizadas para rendimiento, SEO y experiencia de usuario, garantizando que tu presencia digital destaque en el mercado.",
        ctaButton: {
          id: "cta-web",
          label: "Conocer Más",
          href: "#contact",
          variant: "default"
        },
        image: {
          data: {
            id: 1,
            attributes: {
              name: "web-development.jpg",
              alternativeText: "Desarrollo web moderno con tecnologías avanzadas",
              caption: "Desarrollo Web",
              width: 800,
              height: 600,
              formats: {},
              hash: "web_dev_hash",
              ext: ".jpg",
              mime: "image/jpeg",
              size: 150.5,
              url: "/placeholder-web.svg",
              provider: "local",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          }
        },
        imagePosition: "right",
        backgroundColor: "white",
        containerSize: "lg",
        seoHeadingLevel: "h2"
      },
      {
        __component: "sections.content",
        id: 4,
        title: "Software Empresarial",
        subtitle: "Sistemas Empresariales",
        description: "Desarrollamos sistemas de gestión empresarial (ERP) y software personalizado que automatiza tus procesos de negocio.\n\nIntegramos soluciones que mejoran la eficiencia operativa y proporcionan insights valiosos para la toma de decisiones estratégicas.",
        ctaButton: {
          id: "cta-enterprise",
          label: "Solicitar Demo",
          href: "#contact",
          variant: "default"
        },
        image: {
          data: {
            id: 2,
            attributes: {
              name: "enterprise-software.jpg",
              alternativeText: "Software empresarial y sistemas de gestión",
              caption: "Software Empresarial",
              width: 800,
              height: 600,
              formats: {},
              hash: "enterprise_hash",
              ext: ".jpg",
              mime: "image/jpeg",
              size: 180.2,
              url: "/placeholder-enterprise.svg",
              provider: "local",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          }
        },
        imagePosition: "left",
        backgroundColor: "gray",
        containerSize: "lg",
        seoHeadingLevel: "h2"
      }
    ]
  }

  return {
    data: {
      id: 1,
      attributes: {
        ...mockData,
        createdAt: "2024-01-01T00:00:00.000Z",
        updatedAt: "2024-01-01T00:00:00.000Z",
        publishedAt: "2024-01-01T00:00:00.000Z"
      }
    },
    meta: {}
  }
}

// Helper function para validar componentes
export function validateDynamicZoneComponent(component: any): component is DynamicZoneComponent {
  if (!component || typeof component !== 'object') return false
  if (!component.__component || typeof component.__component !== 'string') return false
  if (typeof component.id !== 'number') return false
  
  const validComponents = [
    "layout.navbar",
    "sections.hero", 
    "sections.content"
  ]
  
  return validComponents.includes(component.__component)
}

// Helper function para filtrar componentes válidos
export function filterValidComponents(components: any[]): DynamicZoneComponent[] {
  return components.filter(validateDynamicZoneComponent)
}
