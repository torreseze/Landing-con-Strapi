// Strapi Base Types
export interface StrapiBaseAttributes {
  createdAt: string
  updatedAt: string
  publishedAt?: string
  locale?: string
}

export interface StrapiData<T> {
  id: number
  attributes: T & StrapiBaseAttributes
}

export interface StrapiResponse<T> {
  data: StrapiData<T>
  meta: any
}

export interface StrapiCollectionResponse<T> {
  data: StrapiData<T>[]
  meta: {
    pagination: {
      page: number
      pageSize: number
      pageCount: number
      total: number
    }
  }
}

// Media Types - Strapi v4 format
export interface StrapiImageV4 {
  data: {
    id: number
    attributes: {
      name: string
      alternativeText: string
      caption: string
      width: number
      height: number
      formats: any
      hash: string
      ext: string
      mime: string
      size: number
      url: string
      previewUrl?: string
      provider: string
      provider_metadata?: any
      createdAt: string
      updatedAt: string
    }
  } | null
}

// Media Types - Strapi v5 format
export interface StrapiImageV5 {
  id: number
  documentId?: string
  name: string
  alternativeText: string | null
  caption: string | null
  width: number
  height: number
  formats: any
  hash: string
  ext: string
  mime: string
  size: number
  url: string
  previewUrl?: string | null
  provider: string
  provider_metadata?: any
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

// Union type for both Strapi versions
export type StrapiImage = StrapiImageV4 | StrapiImageV5

// Button Component
export interface CtaButton {
  id: string
  label: string
  href: string
  variant?: "default" | "outline" | "ghost"
  openInNewTab?: boolean
}

// Dynamic Zone Components
export interface NavbarComponent {
  __component: "layout.navbar"
  id: number
  logo: StrapiImage
  logoAlt: string
  logoHref: string
  logoWidth?: number
  logoHeight?: number
  navItems: Array<{
    id: string
    label: string
    href: string
  }>
  ctaButton: CtaButton
  backgroundColor: "transparent" | "white" | "blue"
}

export interface HeroSectionComponent {
  __component: "sections.hero"
  id: number
  title: string
  subtitle?: string
  description: string
  ctaButtons: CtaButton[]
  backgroundImage?: StrapiImage
  backgroundColor: "white" | "blue" | "gradient"
  textAlignment: "left" | "center" | "right"
  seo: {
    h1: boolean
    keywords?: string[]
  }
}

export interface ContentSectionComponent {
  __component: "sections.content"
  id: number
  title: string
  subtitle?: string
  description?: string
  content?: any[] | string // Rich text content from Strapi
  ctaButton?: CtaButton
  image?: StrapiImage
  imagePosition?: "left" | "right"
  backgroundColor: "white" | "gray" | "blue"
  containerSize: "sm" | "md" | "lg" | "xl"
  seoHeadingLevel?: "h2" | "h3" | "h4"
}

// Union type for all dynamic zone components
export type DynamicZoneComponent = 
  | NavbarComponent 
  | HeroSectionComponent 
  | ContentSectionComponent

// Landing Page Type
export interface LandingPage {
  title: string
  description: string
  slug: string
  seoTitle?: string
  seoDescription?: string
  seoKeywords?: string[]
  ogImage?: StrapiImage
  dynamicZone: DynamicZoneComponent[]
}

// Strapi Landing Page Response
export type StrapiLandingPageResponse = StrapiResponse<LandingPage>
export type StrapiLandingPagesResponse = StrapiCollectionResponse<LandingPage>

// Helper type for extracting component props
export type ComponentProps<T extends DynamicZoneComponent> = Omit<T, '__component' | 'id'>

// Utility functions for type checking
export function isNavbarComponent(component: DynamicZoneComponent): component is NavbarComponent {
  return component.__component === "layout.navbar"
}

export function isHeroSectionComponent(component: DynamicZoneComponent): component is HeroSectionComponent {
  return component.__component === "sections.hero"
}

export function isContentSectionComponent(component: DynamicZoneComponent): component is ContentSectionComponent {
  return component.__component === "sections.content"
}

// Helper function to check if image is v4 format
function isStrapiImageV4(image: any): image is StrapiImageV4 {
  return image && typeof image === 'object' && 'data' in image && image.data?.attributes
}

// Helper function to check if image is v5 format
function isStrapiImageV5(image: any): image is StrapiImageV5 {
  return image && typeof image === 'object' && 'url' in image && !('data' in image)
}

// Utility function to get image URL - Compatible with v4 and v5
export function getStrapiImageUrl(image: StrapiImage | undefined, baseUrl?: string): string {
  if (!image) return "/placeholder.jpg"
  
  let url: string
  
  if (isStrapiImageV4(image)) {
    // Strapi v4 format
    if (!image.data?.attributes?.url) return "/placeholder.jpg"
    url = image.data.attributes.url
  } else if (isStrapiImageV5(image)) {
    // Strapi v5 format
    if (!image.url) return "/placeholder.jpg"
    url = image.url
  } else {
    return "/placeholder.jpg"
  }
  
  const strapiUrl = baseUrl || process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337"
  
  // Return full URL if already absolute, otherwise prepend Strapi URL
  return url.startsWith('http') ? url : `${strapiUrl}${url}`
}

// Utility function to get optimized image props - Compatible with v4 and v5
export function getStrapiImageProps(image: StrapiImage | undefined, baseUrl?: string) {
  if (!image) {
    return {
      src: "/placeholder.jpg",
      alt: "Placeholder image",
      width: 600,
      height: 400
    }
  }

  let url: string, alternativeText: string | null, width: number, height: number
  
  if (isStrapiImageV4(image)) {
    // Strapi v4 format
    if (!image.data?.attributes) {
      return {
        src: "/placeholder.jpg",
        alt: "Placeholder image",
        width: 600,
        height: 400
      }
    }
    
    const attrs = image.data.attributes
    url = attrs.url
    alternativeText = attrs.alternativeText
    width = attrs.width
    height = attrs.height
  } else if (isStrapiImageV5(image)) {
    // Strapi v5 format
    url = image.url
    alternativeText = image.alternativeText
    width = image.width
    height = image.height
  } else {
    return {
      src: "/placeholder.jpg",
      alt: "Placeholder image",
      width: 600,
      height: 400
    }
  }
  
  return {
    src: getStrapiImageUrl(image, baseUrl),
    alt: alternativeText || "Image",
    width: width || 600,
    height: height || 400
  }
}


