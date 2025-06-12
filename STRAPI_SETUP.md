# Guía de Configuración de Strapi para Landing Pages

Esta guía te ayudará a configurar Strapi desde cero para trabajar con los componentes de landing page creados en Next.js.

## 🚀 Instalación de Strapi

### 1. Crear nuevo proyecto Strapi

```bash
# Crear nuevo proyecto Strapi (en carpeta separada)
npx create-strapi-app@latest my-landing-strapi --quickstart

# O si prefieres con una base de datos específica
npx create-strapi-app@latest my-landing-strapi --dbclient=postgres
```

### 2. Iniciar Strapi

```bash
cd my-landing-strapi
npm run develop
```

Tu Strapi estará disponible en: `http://localhost:1337`

### 3. Crear usuario administrador

1. Ve a `http://localhost:1337/admin`
2. Completa el formulario para crear tu cuenta de administrador
3. Inicia sesión en el panel de administración

## 📋 Configuración de Content Types

### 1. Crear Componentes Base

Antes de crear los Content Types, necesitamos crear los componentes reutilizables.

#### A. CTA Button Component

1. Ve a **Content-Type Builder** → **Components** → **Create new component**
2. **Categoría**: `ui`
3. **Nombre**: `cta-button`
4. **Campos**:
   ```
   - id (Text, Required, Unique)
   - label (Text, Required)
   - href (Text, Required)
   - variant (Enumeration):
     * default
     * outline
     * ghost
   ```

#### B. Nav Item Component  

1. **Categoría**: `ui`
2. **Nombre**: `nav-item`
3. **Campos**:
   ```
   - id (Text, Required, Unique)
   - label (Text, Required)
   - href (Text, Required)
   ```

#### C. SEO Config Component

1. **Categoría**: `seo`
2. **Nombre**: `seo-config`
3. **Campos**:
   ```
   - title (Text)
   - description (Text, Long text)
   - keywords (Text)
   - canonical (Text)
   - noIndex (Boolean, default: false)
   ```

### 2. Crear Dynamic Zone Components

#### A. Navbar Component

1. **Categoría**: `layout`
2. **Nombre**: `navbar`
3. **Campos**:
   ```
   - logo (Media, Single, Required)
   - logoAlt (Text, default: "DUX Software")
   - logoHref (Text, default: "/")
   - logoWidth (Number, default: 120)
   - logoHeight (Number, default: 40)
   - navItems (Component, ui.nav-item, Repeatable)
   - ctaButtons (Component, ui.cta-button, Repeatable, Required)
   - backgroundColor (Enumeration):
     * transparent
     * white
     * blue
   ```

#### B. Hero Section Component

1. **Categoría**: `sections`
2. **Nombre**: `hero`
3. **Campos**:
   ```
   - title (Text, Required)
   - subtitle (Text)
   - description (Text, Long text)
   - ctaButtons (Component, ui.cta-button, Repeatable)
   - backgroundImage (Media, Single)
   - backgroundColor (Enumeration):
     * white
     * blue
     * gradient
   - textAlignment (Enumeration):
     * left
     * center
     * right
   - containerSize (Enumeration):
     * sm
     * md
     * lg
     * xl
     * full
   - seoConfig (Component, seo.seo-config)
   ```

#### C. Content Section Component

1. **Categoría**: `sections`
2. **Nombre**: `content`
3. **Campos**:
   ```
   - title (Text, Required)
   - content (Rich text, Required)
   - image (Media, Single)
   - imagePosition (Enumeration):
     * left
     * right
   - ctaButton (Component, ui.cta-button)
   - backgroundColor (Enumeration):
     * white
     * gray
     * blue
   - containerSize (Enumeration):
     * sm
     * md
     * lg
     * xl
   - seoHeadingLevel (Enumeration):
     * h1
     * h2
     * h3
     * h4
   ```

### 3. Crear Collection Type: Landing Page

1. Ve a **Content-Type Builder** → **Collection Types** → **Create new collection type**
2. **Nombre**: `landing-page`
3. **Campos**:
   ```
   - title (Text, Required)
   - slug (UID, Required, attached to: title)
   - metaTitle (Text)
   - metaDescription (Text, Long text)
   - ogImage (Media, Single)
   - dynamicZone (Dynamic Zone, Required)
     * Componentes disponibles:
       - layout.navbar
       - sections.hero  
       - sections.content
   - publishedAt (DateTime, default: now)
   ```

## 🔐 Configuración de Permisos

### 1. Configurar API Tokens

1. Ve a **Settings** → **API Tokens** → **Create new API Token**
2. **Nombre**: `Landing Pages API`
3. **Descripción**: `Token para acceso a landing pages`
4. **Token type**: `Read-only` (recomendado para producción)
5. **Duración**: `Unlimited`
6. Copia el token generado para tu `.env.local`

### 2. Configurar permisos públicos

1. Ve a **Settings** → **Users & Permissions Plugin** → **Roles** → **Public**
2. **Landing-page**:
   - ✅ `find`
   - ✅ `findOne`
3. **Upload**:
   - ✅ `find`
   - ✅ `findOne`
4. Guarda los cambios

## 📝 Crear Contenido de Ejemplo

### 1. Crear Landing Page Principal

1. Ve a **Content Manager** → **Landing Page** → **Create new entry**
2. **Título**: `Página Principal`
3. **Slug**: `home`
4. **Meta Title**: `DUX Software - Desarrollo de Software a Medida`
5. **Meta Description**: `Empresa líder en desarrollo de software personalizado. Creamos aplicaciones web, móviles y sistemas empresariales.`

### 2. Configurar Dynamic Zone

#### A. Agregar Navbar
```json
Component: layout.navbar
- logo: [Subir la imagen duxlogo.png desde Media Library]
- logoAlt: "DUX Software"
- logoHref: "/"
- logoWidth: 120
- logoHeight: 40
- navItems:
  * { id: "home", label: "Inicio", href: "#home" }
  * { id: "solutions", label: "Soluciones", href: "#solutions" }
  * { id: "prices", label: "Precios", href: "#prices" }
  * { id: "resources", label: "Recursos", href: "#resources" }
  * { id: "about", label: "Nosotros", href: "#about" }
- ctaButtons:
  * { id: "cta-primary", label: "Comenzar", href: "#contact", variant: "default" }
  * { id: "cta-secondary", label: "Demo", href: "#demo", variant: "outline" }
- backgroundColor: "white"
```

#### B. Agregar Hero Section
```json
Component: sections.hero
- title: "Desarrollamos Software que Impulsa tu Negocio"
- subtitle: "Soluciones tecnológicas a medida"
- description: "Creamos aplicaciones web, móviles y sistemas empresariales que transforman tu visión en realidad digital."
- ctaButtons:
  * { id: "primary", label: "Comenzar Proyecto", href: "#contact", variant: "default" }
  * { id: "secondary", label: "Ver Casos", href: "#cases", variant: "outline" }
- backgroundColor: "gradient"
- textAlignment: "center"
- containerSize: "lg"
```

#### C. Agregar Content Sections
```json
Component: sections.content
- title: "Desarrollo Web Profesional"
- content: "Creamos aplicaciones web modernas usando las últimas tecnologías como React, Next.js y Node.js. Nuestro enfoque garantiza performance, escalabilidad y excelente experiencia de usuario."
- imagePosition: "right"
- backgroundColor: "white"
- containerSize: "lg"
- seoHeadingLevel: "h2"
- ctaButton:
  * { id: "web-cta", label: "Saber más", href: "#web", variant: "default" }
```

### 3. Subir Imágenes

1. Ve a **Media Library** → **Upload files**
2. Sube imágenes para:
   - **Logo de la navbar** (duxlogo.png) - Requerido para el componente navbar
   - Hero background
   - Content sections
   - OG image

**⚠️ Importante**: Asegúrate de subir la imagen `duxlogo.png` antes de configurar el componente navbar, ya que será requerida.

### 4. Publicar contenido

1. **Guardar** como borrador
2. **Publicar** cuando esté listo

## 🔧 Configuración Avanzada

### 1. Configurar CORS (si es necesario)

En `config/middlewares.js`:

```javascript
module.exports = [
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': ["'self'", 'https:'],
          'img-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          'media-src': ["'self'", 'data:', 'blob:', 'res.cloudinary.com'],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      headers: '*',
      origin: ['http://localhost:3000', 'https://tu-dominio.com']
    }
  },
  'strapi::poweredBy',
  'strapi::logger',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### 2. Variables de entorno

En tu archivo `.env` de Strapi:

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=tu_app_key_aqui
API_TOKEN_SALT=tu_api_token_salt
ADMIN_JWT_SECRET=tu_admin_jwt_secret
TRANSFER_TOKEN_SALT=tu_transfer_token_salt
JWT_SECRET=tu_jwt_secret
```

## 🚀 Despliegue de Strapi

### Opciones recomendadas:

1. **Railway** (fácil y económico)
2. **Heroku** (clásico, con addons)
3. **DigitalOcean** (VPS personalizable)
4. **AWS EC2** (empresarial)

### Checklist pre-deploy:

- ✅ Base de datos configurada (PostgreSQL recomendado)
- ✅ Variables de entorno configuradas
- ✅ API tokens creados
- ✅ Permisos configurados
- ✅ CORS configurado para tu dominio
- ✅ Contenido de prueba creado

## 🔍 Troubleshooting

### Error: "Component not found"
- Verifica que los componentes estén creados con los nombres exactos
- Revisa la categoría de cada componente

### Error: "Permission denied"
- Verifica permisos en Settings → Roles → Public
- Confirma que find y findOne están habilitados

### Error de CORS
- Agrega tu dominio a la configuración de CORS
- Reinicia Strapi después de cambios de configuración

### Imágenes no cargan
- Verifica permisos de upload
- Confirma que las imágenes estén publicadas
- Revisa la URL base de Strapi

## ✨ Próximos Pasos

Una vez configurado Strapi:

1. Crea más landing pages para diferentes productos/servicios
2. Agrega componentes adicionales (testimonios, precios, FAQ)
3. Configura webhooks para invalidar cache
4. Implementa preview mode para editores
5. Agrega campos de analytics/tracking

---

¡Tu configuración de Strapi está lista! Ahora puedes crear landing pages dinámicas desde el panel de administración. 🎉 