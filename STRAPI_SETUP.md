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
   - ctaButtonId (Text, Required, Unique)
   - label (Text, Required)
   - href (Text, Required)
   - variant (Enumeration):
     * default
     * outline
     * ghost
   ```

#### B. Dropdown Item Component

1. **Categoría**: `ui`
2. **Nombre**: `dropdown-item`
3. **Campos**:
   ```
   - dropdownItemId (Text, Required, Unique)
   - title (Text, Required)
   - description (Text, Long text, Required)
   - href (Text, Required)
   - icon (Text) // Nombre del ícono (ej: "LayoutGrid", "BarChart")
   ```

#### C. Dropdown Category Component

1. **Categoría**: `ui`
2. **Nombre**: `dropdown-category`
3. **Campos**:
   ```
   - categoryId (Text, Required, Unique)
   - title (Text, Required)
   - items (Component, ui.dropdown-item, Repeatable, Required)
   ```

#### D. Dropdown Footer Action Component

1. **Categoría**: `ui`
2. **Nombre**: `dropdown-footer-action`
3. **Campos**:
   ```
   - footerActionId (Text, Required, Unique)
   - label (Text, Required)
   - href (Text, Required)
   - icon (Text) // Nombre del ícono opcional
   ```

#### E. Nav Item Component  

1. **Categoría**: `ui`
2. **Nombre**: `nav-item`
3. **Campos**:
   ```
   - navItemId (Text, Required, Unique)
   - label (Text, Required)
   - href (Text) // Opcional porque puede ser dropdown
   - hasDropdown (Boolean, default: false)
   - dropdownCategories (Component, ui.dropdown-category, Repeatable)
   - dropdownFooterActions (Component, ui.dropdown-footer-action, Repeatable)
   ```

#### F. SEO Config Component

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
   - ctaButtons (Component, ui.cta-button, Repeatable, Required) // Cambió a plural
   - backgroundColor (Enumeration):
     * transparent
     * white
     * blue
   ```

**⚠️ Importante para Navbar**:
- Los **navItems** ahora soportan dropdowns con categorías e items anidados
- **ctaButtons** cambió de singular a plural para soportar múltiples botones
- Los dropdowns se renderizan como mega menús de 3 columnas en desktop
- En móvil los dropdowns se simplifican como listas anidadas

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
   - bottomImage (Media, Single)
   - bottomImageAlt (Text)
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

#### A. Agregar Navbar con Dropdown
```json
Component: layout.navbar
- logo: [Subir la imagen duxlogo.png desde Media Library]
- logoAlt: "DUX Software"
- logoHref: "/"
- logoWidth: 120
- logoHeight: 40
- navItems:
  * Nav Item 1 (Con Dropdown):
    - navItemId: "platform"
    - label: "Plataforma"
    - hasDropdown: true
    - dropdownCategories:
      * Categoría 1:
        - categoryId: "capabilities"
        - title: "CAPABILITIES"
        - items:
          • { dropdownItemId: "create-apis", title: "Crear APIs", description: "Diseña APIs REST y GraphQL para cualquier frontend.", href: "/platform/create-apis", icon: "LayoutGrid" }
          • { dropdownItemId: "customization", title: "Personalización", description: "Personaliza tu CMS para cumplir los requisitos de tu proyecto.", href: "/platform/customization", icon: "BarChart" }
          • { dropdownItemId: "hosting", title: "Hosting", description: "Aloja tus proyectos en robustas y seguras infraestructuras.", href: "/platform/hosting", icon: "Cloud" }
      * Categoría 2:
        - categoryId: "management"
        - title: "GESTIÓN Y COLABORACIÓN"
        - items:
          • { dropdownItemId: "content-management", title: "Gestión de Contenido", description: "Crea, edita y publica contenido fácilmente.", href: "/platform/content-management", icon: "BookOpen" }
          • { dropdownItemId: "collaboration", title: "Colaboración", description: "Trabaja en equipo de forma sencilla en código y contenido.", href: "/platform/collaboration", icon: "Users" }
          • { dropdownItemId: "security", title: "Seguridad", description: "Implementa medidas de seguridad robustas para proteger tu información.", href: "/platform/security", icon: "LifeBuoy" }
      * Categoría 3:
        - categoryId: "product"
        - title: "PRODUCTO Y CARACTERÍSTICAS"
        - items:
          • { dropdownItemId: "cloud", title: "Cloud", description: "Hosting PaaS para proyectos Dux.", href: "/product/cloud", icon: "Cloud" }
          • { dropdownItemId: "enterprise", title: "Edición Empresarial", description: "Una edición lista para empresas.", href: "/product/enterprise", icon: "Building" }
          • { dropdownItemId: "market", title: "Dux Market", description: "Mercado de plugins e integraciones.", href: "/product/market", icon: "ShoppingCart" }
    - dropdownFooterActions:
      • { footerActionId: "contact-sales", label: "Contactar Ventas", href: "/contact", icon: "Phone" }
      • { footerActionId: "demo", label: "Demo Interactivo", href: "/interactive-demo", icon: "PlayCircle" }
      • { footerActionId: "host-project", label: "Alojar tu Proyecto", href: "/host-project", icon: "Cloud" }
  * Nav Item 2 (Simple): { navItemId: "solutions", label: "Soluciones", href: "/solutions" }
  * Nav Item 3 (Simple): { navItemId: "resources", label: "Recursos", href: "/resources" }
  * Nav Item 4 (Simple): { navItemId: "prices", label: "Precios", href: "/pricing" }
- ctaButtons:
  * { ctaButtonId: "login", label: "Login", href: "/login", variant: "ghost" }
  * { ctaButtonId: "register", label: "Registrarse", href: "/register", variant: "outline" }
  * { ctaButtonId: "demo", label: "Ver Demo", href: "/demo", variant: "default" }
- backgroundColor: "white"
```

**💡 Iconos disponibles (Lucide React)**:

🎉 **¡TODOS los iconos de [Lucide React](https://lucide.dev/icons) están disponibles!** 

**✨ Sistema dinámico**: Ya no necesitas importar iconos manualmente. Simplemente usa el nombre exacto del ícono de Lucide.

**📦 Dependencia requerida**:
```bash
npm install lucide-react
```

**🔧 Cómo usar cualquier ícono**:
1. Ve a [Lucide.dev](https://lucide.dev/icons) 
2. Busca el ícono que quieres (ej: `Calendar`, `Settings`, `Mail`)
3. Úsalo directamente en Strapi con el nombre exacto:

```json
{
  "dropdownItemId": "calendar",
  "title": "Calendario", 
  "description": "Gestiona eventos",
  "href": "/calendar",
  "icon": "Calendar"  // ← Cualquier ícono de Lucide
}
```

**✅ Ejemplos de iconos populares**:
| Ícono | Nombre | Categoría |
|-------|---------|-----------|
| 📊 | `BarChart` | Analytics |
| 👥 | `Users` | Colaboración |
| 📖 | `BookOpen` | Documentación |
| ☁️ | `Cloud` | Cloud/Hosting |
| 🏢 | `Building` | Empresarial |
| 🛒 | `ShoppingCart` | E-commerce |
| 📞 | `Phone` | Contacto |
| ⚙️ | `Settings` | Configuración |
| 📧 | `Mail` | Comunicación |
| 📅 | `Calendar` | Fechas/Tiempo |
| 🎯 | `Target` | Objetivos |
| 🚀 | `Rocket` | Lanzamiento |

**⚠️ Importante**: 
- Los nombres son **case-sensitive**: `Calendar` ✅, `calendar` ❌
- Si un ícono no existe, se mostrará un ícono de ayuda (HelpCircle) automáticamente
- Consulta [lucide.dev](https://lucide.dev/icons) para ver la lista completa actualizada

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
- bottomImage: [Subir imagen desde Media Library]
- bottomImageAlt: "Dashboard de software empresarial"
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
   - **Hero background** - Imagen de fondo opcional para el hero
   - **Hero bottom image** - Imagen inferior que aparece debajo del contenido del hero
   - Content sections
   - OG image

**⚠️ Importante**: 
- Asegúrate de subir la imagen `duxlogo.png` antes de configurar el componente navbar, ya que será requerida.
- Para la **bottomImage** del hero, usa imágenes con buena resolución (mínimo 1200px de ancho) que representen tu producto o servicio.

**💡 Tip para bottomImage**: 
- Recomendaciones de imagen: 1200x600px o superior
- Formatos preferidos: JPG, PNG, WebP
- Contenido sugerido: dashboard, mockup, producto, interfaz de usuario
- La imagen aparecerá con bordes redondeados y sombra automáticamente

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

## 🎯 Configuración Avanzada: Dropdowns en Navbar

### Orden de Creación de Componentes

**⚠️ IMPORTANTE**: Crea los componentes en este orden específico:

1. **ui.dropdown-item** (base)
2. **ui.dropdown-category** (usa dropdown-item)  
3. **ui.dropdown-footer-action** (independiente)
4. **ui.nav-item** (usa dropdown-category y dropdown-footer-action)
5. **layout.navbar** (usa nav-item)

### Paso a Paso: Crear Dropdown

#### 1. Crear Dropdown Item
```
Content-Type Builder → Components → Create new component
- Categoría: ui
- Nombre: dropdown-item
- Campos como se especifica arriba
```

#### 2. Crear Dropdown Category  
```
Content-Type Builder → Components → Create new component
- Categoría: ui
- Nombre: dropdown-category
- En campo "items": seleccionar "ui.dropdown-item"
```

#### 3. Crear Nav Item con Dropdown
```
Content-Type Builder → Components → Create new component
- Categoría: ui  
- Nombre: nav-item
- En "dropdownCategories": seleccionar "ui.dropdown-category"
- En "dropdownFooterActions": seleccionar "ui.dropdown-footer-action"
```

#### 4. Actualizar Navbar Component
```
Content-Type Builder → Components → layout.navbar
- Modificar campo "navItems": debe usar "ui.nav-item" 
- Cambiar "ctaButton" a "ctaButtons" (plural)
```

### Estructura Visual del Dropdown

```
Plataforma ↓
┌─────────────────────────────────────────────────────────────────┐
│ CAPABILITIES    │ GESTIÓN Y COLABORACIÓN │ PRODUCTO Y CARACTERÍSTICAS │
│ □ Crear APIs    │ □ Gestión de Contenido │ □ Cloud                    │
│ □ Personalizar  │ □ Colaboración         │ □ Edición Empresarial      │
│ □ Hosting       │ □ Seguridad            │ □ Dux Market               │
├─────────────────┼────────────────────────┼────────────────────────────┤
│     [Contactar Ventas] [Demo Interactivo] [Alojar Proyecto]           │
└─────────────────────────────────────────────────────────────────┘
```

### Troubleshooting Dropdowns

#### Error: "Component not found"
- Asegúrate de crear los componentes en el orden correcto
- Verifica que los nombres coincidan exactamente

#### Dropdown no aparece  
- Confirma que `hasDropdown` está en `true`
- Verifica que hay al menos una categoría con items

#### Iconos no se muestran
- **Problema**: Nombre del ícono incorrecto o no existe en Lucide React
- **Solución**: 
  - Verifica el nombre exacto en [lucide.dev](https://lucide.dev/icons)
  - Los nombres son **case-sensitive**: `Calendar` ✅, `calendar` ❌
  - **Todos los iconos** de Lucide React están disponibles automáticamente
  - Si aparece un ícono de "?" significa que el nombre no existe
- **Debugging**: 
  - Revisa la consola del navegador para warnings sobre iconos no encontrados
  - Confirma que el nombre coincide exactamente con [lucide.dev](https://lucide.dev/icons)
  - Ejemplo correcto: `"Settings"`, `"Calendar"`, `"BarChart"`

#### Error HTTP 401 Unauthorized
- **Problema**: Token de autenticación inválido o expirado
- **Posibles causas**:
  - Cambiaste de servidor (localhost → remoto) pero no actualizaste el token
  - El token expiró o fue regenerado en Strapi
  - Las variables de entorno no coinciden con el servidor
- **Solución**:
  1. **Verifica las variables en tu archivo `.env.local`:**
     ```bash
     # Servidor local
     NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
     STRAPI_API_TOKEN=tu_token_local
     
     # Servidor remoto
     NEXT_PUBLIC_STRAPI_URL=https://strapidux.onrender.com
     STRAPI_API_TOKEN=tu_token_remoto
     ```
  2. **Genera un nuevo token en Strapi**:
     - Ve a: Configuración → API Tokens → Crear nuevo token
     - Tipo: `Full access` (para desarrollo)
     - Copia el token completo (256 caracteres)
  3. **Reinicia el servidor de desarrollo**:
     ```bash
     npm run dev
     ```
- **Debugging**: Verifica que `preview` del token en logs coincida con tu archivo `.env.local`

#### Error HTTP 400 Bad Request - Problema con Sintaxis de Populate
- **Problema**: Query de populate con sintaxis incorrecta (especialmente v4 vs v5)
- **CAUSA PRINCIPAL**: Usar sintaxis de Strapi v4 en un servidor Strapi v5
- **Síntomas**: 
  - El token es válido (longitud 256, preview correcto)
  - Error: "Invalid key deep" o "Invalid populate"
  - Se muestra mock data en lugar de datos reales
- **Solución v5**: 
  - ✅ **USAR SINTAXIS CORRECTA**: Para Strapi v5, los componentes en dynamic zones **REQUIEREN** sintaxis `[on][component-name]`:
    ```
    # ✅ CORRECTO para Strapi v5
    populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true
    
    # ❌ INCORRECTO (sintaxis v4)
    populate[dynamicZone][populate]=*
    populate=deep
    ```
- **Sistema de fallback automático**: El código prueba automáticamente 5 niveles:
    1. **Sintaxis v5 completa** con todas las relaciones anidadas
    2. **Sintaxis v5 básica** por componente 
    3. **Sintaxis v4** (fallback de compatibilidad)
    4. Sin populate
- **Debugging en logs**: Busca estos mensajes:
  ```
  🔄 Attempt 1/5: Testing populate query
  ✅ Success with populate attempt X
  ```
- **Regla fundamental**: **Strapi v5 = sintaxis [on][component-name] obligatoria**

#### Error HTTP 400 en consultas
- **Problema**: Los nombres de campos no coinciden con Strapi
- **Solución**: Usa nombres descriptivos en lugar de "id":
  - ✅ `navItemId` en lugar de `id`
  - ✅ `ctaButtonId` en lugar de `id`
  - ✅ `dropdownItemId` en lugar de `id`
  - ✅ `categoryId` en lugar de `id`
  - ✅ `footerActionId` en lugar de `id`
- **Importante**: El campo "id" está reservado en Strapi

## 🆕 Strapi v5: Diferencias Importantes

### Sintaxis de Populate Obligatoria para Dynamic Zones

En **Strapi v5**, la forma de hacer populate de componentes anidados dentro de dynamic zones cambió completamente:

#### ✅ SINTAXIS CORRECTA (v5):
```bash
# Para obtener dropdowns completos del navbar
populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true
&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownFooterActions]=true
&populate[dynamicZone][on][layout.navbar][populate][ctaButtons]=true
&populate[dynamicZone][on][layout.navbar][populate][logo]=true

# Para hero section con imagen y CTAs
&populate[dynamicZone][on][sections.hero][populate][ctaButtons]=true
&populate[dynamicZone][on][sections.hero][populate][bottomImage]=true

# Para content section
&populate[dynamicZone][on][sections.content][populate][ctaButton]=true
&populate[dynamicZone][on][sections.content][populate][image]=true
```

#### ❌ SINTAXIS OBSOLETA (v4):
```bash
# Estas NO funcionan en Strapi v5
populate=deep
populate[dynamicZone][populate]=*
populate=*
```

### Comportamiento de Relaciones Vacías

En Strapi v5:
- ✅ Puedes tener `hasDropdown: true` con relaciones vacías sin errores
- ✅ Las relaciones vacías se retornan como `[]` (no se omiten)
- ✅ No necesitas configuración especial para relaciones repeatable
- ✅ Solo define los campos como "Repeatable" en Content-Type Builder

### URL de Ejemplo Completa

```
https://tu-strapi.com/api/landing-pages?filters[slug][$eq]=landing-page
&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownCategories][populate][items]=true
&populate[dynamicZone][on][layout.navbar][populate][navItems][populate][dropdownFooterActions]=true
&populate[dynamicZone][on][layout.navbar][populate][ctaButtons]=true
&populate[dynamicZone][on][layout.navbar][populate][logo]=true
&populate[dynamicZone][on][sections.hero][populate][ctaButtons]=true
&populate[dynamicZone][on][sections.hero][populate][bottomImage]=true
&populate[dynamicZone][on][sections.content][populate][ctaButton]=true
&populate[dynamicZone][on][sections.content][populate][image]=true
```

## ✨ Próximos Pasos

Una vez configurado Strapi:

1. Crea más landing pages para diferentes productos/servicios
2. Agrega componentes adicionales (testimonios, precios, FAQ)
3. Configura webhooks para invalidar cache
4. Implementa preview mode para editores
5. Agrega campos de analytics/tracking
6. **Configura mega menús** con dropdowns personalizados

---

¡Tu configuración de Strapi con dropdowns está lista! Ahora puedes crear landing pages dinámicas con navegación avanzada desde el panel de administración. 🎉 