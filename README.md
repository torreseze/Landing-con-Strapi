# Landing Page con Strapi Dynamic Zones

Esta es una aplicación Next.js optimizada para crear landing pages dinámicas usando Strapi como CMS headless con Dynamic Zones.

## 🚀 Características

- **Componentes Reutilizables**: 3 componentes principales (Navbar, Hero Section, Content Section)
- **Dynamic Zones de Strapi**: Estructura completamente flexible
- **SEO Optimizado**: Metadata automática, Schema.org, Open Graph
- **TypeScript**: Tipado completo para Strapi y componentes
- **Responsive**: Diseño adaptable a todos los dispositivos
- **Performance**: Optimizado para Core Web Vitals

## 📁 Estructura de Componentes

### 1. Navbar
- Logo personalizable con texto y highlight
- Navegación responsive
- CTA button configurable
- Múltiples variantes de background

### 2. Hero Section  
- Título, subtítulo y descripción
- Múltiples CTAs
- Imagen de fondo opcional
- Alineación de texto configurable

### 3. Content Section
- Layout de dos columnas (imagen + contenido)
- Posicionamiento de imagen configurable
- Background colors variables
- Tamaños de contenedor ajustables

## 🛠️ Instalación

1. **Clona el repositorio**
```bash
git clone [tu-repo]
cd landing-con-strapi
```

2. **Instala dependencias**
```bash
npm install
```

3. **Configura variables de entorno**
Crea un archivo `.env.local` con:
```env
NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
STRAPI_API_TOKEN=9cfd8766ec8c31d65749e09b7f965d314378b2b62309ccb37eb8b34a851b7e45c97bc8934d1fb26205b99abaec15414d1167b27c0389c36d3a448278433eebd6ad52316dac0f018eb8482944eaf521ea7065d0012899a1f421c6300118d135fca49e01aacd4bdcb13548fa9170b29a360564a52099084f849920f5c4061a92c4
NEXT_PUBLIC_SITE_URL=https://tudominio.com
```

4. **Ejecuta en desarrollo**
```bash
npm run dev
```

## 📋 Configuración de Strapi

Sigue la guía detallada en `STRAPI_SETUP.md` para configurar:

1. Content Types
2. Dynamic Zone Components
3. Permisos de API
4. Contenido de ejemplo

### Content Types requeridos:
- **Landing Page** (Collection Type)
- **Navbar Component** (`layout.navbar`)
- **Hero Component** (`sections.hero`)  
- **Content Component** (`sections.content`)
- **CTA Button Component** (`cta-button`)
- **Nav Item Component** (`nav-item`)
- **SEO Config Component** (`seo-config`)

## 🔧 Desarrollo

### Estructura de archivos:
```
/components
  ├── navbar.tsx           # Navbar reutilizable
  ├── hero-section.tsx     # Hero section reutilizable  
  ├── content-section.tsx  # Content section reutilizable
  └── ui/                  # Componentes UI base

/types
  └── strapi.ts           # Tipos TypeScript para Strapi

/lib
  └── strapi.ts           # Funciones API de Strapi

/app
  ├── layout.tsx          # Layout principal con SEO
  └── page.tsx            # Página home con Dynamic Zones
```

### Componentes con Mock Data

Los componentes funcionan con datos de ejemplo si Strapi no está disponible, permitiendo desarrollo sin dependencias.

## 🎨 Personalización

### Colores
El tema usa principalmente azul (`#2563EB`) como color primario. Modifica en:
- `tailwind.config.ts` para colores globales
- Componentes individuales para variantes

### Tipografía
Usa la fuente Inter de Google Fonts. Configurable en `app/layout.tsx`.

### Responsive
Todos los componentes usan clases de Tailwind CSS responsivas:
- `sm:` - 640px+
- `md:` - 768px+  
- `lg:` - 1024px+
- `xl:` - 1280px+

## 📈 SEO y Performance

### SEO Optimizado:
- ✅ Metadata automática desde Strapi
- ✅ Schema.org structured data
- ✅ Open Graph y Twitter Cards
- ✅ Sitemap automático
- ✅ Robots.txt optimizado

### Performance:
- ✅ Next.js App Router
- ✅ Image optimization
- ✅ Lazy loading
- ✅ Core Web Vitals optimized

## 🚢 Deploy

### Variables de entorno para producción:
```env
NEXT_PUBLIC_STRAPI_URL=https://tu-strapi.com
STRAPI_API_TOKEN=tu_token_produccion
NEXT_PUBLIC_SITE_URL=https://tu-sitio.com
GOOGLE_VERIFICATION_ID=tu_verification_id
```

### Plataformas recomendadas:
- **Vercel** (recomendado para Next.js)
- **Netlify**  
- **Railway**
- **Digital Ocean**

## 🎯 Uso con Strapi

### Crear una landing page:
1. Ve a Strapi Admin → Content Manager → Landing Page
2. Crea nueva entrada con slug único
3. Agrega componentes en la Dynamic Zone:
   - Un Navbar
   - Un Hero Section  
   - Múltiples Content Sections

### Estructura de URL:
- `/` - Landing page principal (slug: "home")
- `/[slug]` - Otras landing pages

## 🔍 Troubleshooting

### Error: "Landing page not found"
- Verifica el slug en Strapi
- Revisa permisos de API (Public → find, findOne)
- Confirma variables de entorno

### Imágenes no cargan:
- Verifica `NEXT_PUBLIC_STRAPI_URL`
- Confirma que las imágenes están publicadas en Strapi
- Revisa permisos de media

### Errores de TypeScript:
- Verifica que la estructura de Strapi coincida con los tipos
- Actualiza tipos en `types/strapi.ts` si cambias la estructura

## 📝 Próximos pasos

Una vez que tengas la estructura funcionando, puedes:

1. **Agregar más componentes** (testimonios, pricing, FAQ, etc.)
2. **Implementar ISR** para mejor performance
3. **Agregar analytics** (Google Analytics, Plausible)
4. **Configurar formularios** de contacto
5. **Implementar multi-idioma** con i18n

## 🤝 Contribución

Para contribuir al proyecto:
1. Fork el repositorio
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push y crea un Pull Request

## 📄 Licencia

MIT License - Ve el archivo LICENSE para detalles.

---

**¿Preguntas?** Abre un issue en el repositorio o contacta al equipo de desarrollo. 