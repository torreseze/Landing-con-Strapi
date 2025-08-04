
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

  // Sistema de fallback: probar diferentes niveles de populate (STRAPI V5 SYNTAX)
  const populateOptions = [
    // Opción 1: Sintaxis CORRECTA de Strapi v5 para dynamic zones con relaciones anidadas
    `populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownFooterActions]=true&populate[dynamicZone][on][layout.navbar][populate][ctaButtons]=true&populate[dynamicZone][on][layout.navbar][populate][logo]=true&populate[dynamicZone][on][sections.hero][populate][ctaButtons]=true&populate[dynamicZone][on][sections.hero][populate][bottomImage]=true&populate[dynamicZone][on][sections.content][populate][ctaButton]=true&populate[dynamicZone][on][sections.content][populate][image]=true`,
    // Opción 2: Populate específico solo para navbar con sintaxis v5
    `populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownFooterActions]=true&populate[dynamicZone][on][layout.navbar][populate][ctaButtons]=true&populate[dynamicZone][on][layout.navbar][populate][logo]=true`,
    // Opción 3: Populate básico con sintaxis v5 para cada componente
    `populate[dynamicZone][on][layout.navbar][populate]=*&populate[dynamicZone][on][sections.hero][populate]=*&populate[dynamicZone][on][sections.content][populate]=*`,
    // Opción 4: Populate básico de dynamicZone (sintaxis v4 - fallback)
    `populate[dynamicZone][populate]=*`, 
    // Opción 5: Sin populate como último recurso
    `` 
  ]

  let response: Response | null = null
  let lastError: string = ""

  for (const [index, populateQuery] of populateOptions.entries()) {
    const currentUrl = `${STRAPI_URL}/api/landing-pages?filters[slug][$eq]=${slug}${populateQuery ? '&' + populateQuery : ''}`
    
    ProductionLogger.log(`🔄 Attempt ${index + 1}/5: Testing populate query`, { 
      attempt: index + 1, 
      populate: populateQuery || 'none',
      url: currentUrl.replace(token, '[HIDDEN]')
    })
    
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      response = await fetch(currentUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      ProductionLogger.httpResponse(response.status, response.statusText)

      if (response.ok) {
        ProductionLogger.log(`✅ Success with populate attempt ${index + 1}:`, populateQuery || 'no populate')
        break // Salir del loop si funciona
      } else {
        // Intentar leer el error para debug
        try {
          const errorText = await response.text()
          lastError = errorText
          ProductionLogger.warn(`❌ Attempt ${index + 1} failed:`, {
            status: response.status,
            error: errorText || "Empty error body"
          })
        } catch (e) {
          ProductionLogger.warn(`❌ Attempt ${index + 1} failed - couldn't read error:`, response.status)
        }
        
        // Si no es el último intento, continuar
        if (index < populateOptions.length - 1) {
          ProductionLogger.log(`🔄 Trying next populate option...`)
          continue
        }
      }
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError)
      ProductionLogger.warn(`❌ Fetch error on attempt ${index + 1}:`, errorMessage)
      lastError = errorMessage
      
      // Si no es el último intento, continuar
      if (index < populateOptions.length - 1) {
        continue
      }
    }
  }

  // Si llegamos aquí y response no es ok, retornar mock data
  if (!response || !response.ok) {
    ProductionLogger.error('❌ All populate attempts failed. Last error:', lastError)
    ProductionLogger.warn('⚠️ Returning mock data due to HTTP error')
    endTimer()
    return getMockLandingPage()
  }

  try {
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
    // Usar sintaxis correcta de Strapi v5 para dynamic zones con relaciones anidadas
    const populateQuery = `populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownFooterActions]=true&populate[dynamicZone][on][layout.navbar][populate][ctaButtons]=true&populate[dynamicZone][on][layout.navbar][populate][logo]=true&populate[dynamicZone][on][sections.hero][populate][ctaButtons]=true&populate[dynamicZone][on][sections.hero][populate][bottomImage]=true&populate[dynamicZone][on][sections.content][populate][ctaButton]=true&populate[dynamicZone][on][sections.content][populate][image]=true`
    const response = await fetchAPI(`/landing-pages?${populateQuery}`)
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
  const endTimer = ProductionLogger.startTimer("getLandingPageSlugs")
  ProductionLogger.log("getLandingPageSlugs called")

  try {
    // Strapi v5 syntax para obtener solo el campo slug
    const response = await fetchAPI("/landing-pages?fields[0]=slug")
    
    ProductionLogger.structure("Slugs response structure", {
      hasData: !!response.data,
      dataIsArray: Array.isArray(response.data),
      dataLength: response.data?.length || 0
    })

    // Strapi v5 devuelve los datos directamente, no en attributes
    const slugs = response.data.map((page: any) => {
      // Intentar tanto el formato v5 como v4 para compatibilidad
      return page.slug || page.attributes?.slug
    }).filter(Boolean) // Filtrar valores null/undefined

    ProductionLogger.success("Landing page slugs retrieved", { slugs })
    endTimer()
    
    return slugs.length > 0 ? slugs : ["landing-page"] // Fallback si no hay slugs
  } catch (error) {
    ProductionLogger.error("Error fetching landing page slugs", error)
    ProductionLogger.warn("Returning fallback slugs")
    endTimer()
    
    // Fallback con slugs comunes
    return ["landing-page", "home", "pricing", "about", "services"]
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
          {
            navItemId: "platform",
            label: "Plataforma",
            hasDropdown: true,
            dropdownCategories: [
              {
                categoryId: "capabilities",
                title: "CAPABILITIES",
                items: [
                  {
                    dropdownItemId: "create-apis",
                    title: "Crear APIs",
                    description: "Diseña APIs REST y GraphQL para cualquier frontend.",
                    href: "/platform/create-apis",
                    icon: "Code2"
                  },
                  {
                    dropdownItemId: "customization",
                    title: "Personalización",
                    description: "Personaliza tu CMS para cumplir los requisitos de tu proyecto.",
                    href: "/platform/customization",
                    icon: "Settings"
                  },
                  {
                    dropdownItemId: "hosting",
                    title: "Hosting",
                    description: "Aloja tus proyectos en robustas y seguras infraestructuras.",
                    href: "/platform/hosting",
                    icon: "Cloud"
                  }
                ]
              },
              {
                categoryId: "management",
                title: "GESTIÓN Y COLABORACIÓN",
                items: [
                  {
                    dropdownItemId: "content-management",
                    title: "Gestión de Contenido",
                    description: "Crea, edita y publica contenido fácilmente.",
                    href: "/platform/content-management",
                    icon: "FileText"
                  },
                  {
                    dropdownItemId: "collaboration",
                    title: "Colaboración",
                    description: "Trabaja en equipo de forma sencilla en código y contenido.",
                    href: "/platform/collaboration",
                    icon: "Users"
                  },
                  {
                    dropdownItemId: "security",
                    title: "Seguridad",
                    description: "Implementa medidas de seguridad robustas para proteger tu información.",
                    href: "/platform/security",
                    icon: "Shield"
                  }
                ]
              },
              {
                categoryId: "product",
                title: "PRODUCTO Y CARACTERÍSTICAS",
                items: [
                  {
                    dropdownItemId: "cloud",
                    title: "Cloud",
                    description: "Hosting PaaS para proyectos Dux.",
                    href: "/product/cloud",
                    icon: "Cloud"
                  },
                  {
                    dropdownItemId: "enterprise",
                    title: "Edición Empresarial",
                    description: "Una edición lista para empresas.",
                    href: "/product/enterprise",
                    icon: "Building"
                  },
                  {
                    dropdownItemId: "market",
                    title: "Dux Market",
                    description: "Mercado de plugins e integraciones.",
                    href: "/product/market",
                    icon: "ShoppingCart"
                  },
                  {
                    dropdownItemId: "features",
                    title: "Todas las Características",
                    description: "Descubre todas las características disponibles en Dux hoy.",
                    href: "/product/features",
                    icon: "LayoutGrid"
                  }
                ]
              }
            ],
            dropdownFooterActions: [
              {
                footerActionId: "contact-sales",
                label: "Contactar Ventas",
                href: "/contact",
                icon: "MessageCircle"
              },
              {
                footerActionId: "demo",
                label: "Demo Interactivo",
                href: "/interactive-demo",
                icon: "Play"
              },
              {
                footerActionId: "host-project",
                label: "Alojar tu Proyecto",
                href: "/host-project",
                icon: "Rocket"
              }
            ]
          },
          { navItemId: "solutions", label: "Soluciones", href: "/solutions" },
          { navItemId: "resources", label: "Recursos", href: "/resources" },
          { navItemId: "prices", label: "Precios", href: "/pricing" }
        ],
        ctaButtons: [
          {
            ctaButtonId: "login",
            label: "Login",
            href: "/login",
            variant: "ghost"
          },
          {
            ctaButtonId: "register",
            label: "Registrarse",
            href: "/register",
            variant: "outline"
          },
          {
            ctaButtonId: "demo",
            label: "Ver Demo",
            href: "/demo",
            variant: "default"
          }
        ],
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
            ctaButtonId: "cta-hero-1",
            label: "Comenzar Proyecto",
            href: "#contact",
            variant: "default"
          },
          {
            ctaButtonId: "cta-hero-2",
            label: "Ver Soluciones",
            href: "#solutions",
            variant: "outline"
          }
        ],
        backgroundColor: "gradient",
        textAlignment: "center",
        bottomImage: {
          data: {
            id: 5,
            attributes: {
              name: "enterprise-dashboard.svg",
              alternativeText: "Dashboard de software empresarial",
              caption: "Dashboard Empresarial",
              width: 1200,
              height: 800,
              formats: {},
              hash: "enterprise_dashboard_hash",
              ext: ".svg",
              mime: "image/svg+xml",
              size: 85.3,
              url: "/placeholder-enterprise.svg",
              provider: "local",
              createdAt: "2024-01-01T00:00:00.000Z",
              updatedAt: "2024-01-01T00:00:00.000Z"
            }
          }
        },
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
          ctaButtonId: "cta-web",
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
          ctaButtonId: "cta-enterprise",
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
