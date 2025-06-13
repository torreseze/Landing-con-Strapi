# 🚨 Guía de Debugging en Producción - Strapi Connection

Esta guía te ayudará a diagnosticar y solucionar problemas de conexión con Strapi en producción.

## 🔧 Logs Agregados

He agregado logs detallados en varios puntos clave de la aplicación para ayudarte a diagnosticar el problema:

### 1. ProductionLogger
- **Ubicación**: `lib/production-logger.ts`
- **Función**: Logger inteligente que se activa automáticamente en desarrollo y opcionalmente en producción
- **Activación en producción**: Agrega `ENABLE_PRODUCTION_LOGS=true` a tus variables de entorno

### 2. Logs en `lib/strapi.ts`
- ✅ Validación de variables de entorno
- ✅ Validación de tokens y URLs
- ✅ Detalles de requests HTTP
- ✅ Análisis de responses
- ✅ Timing de operaciones
- ✅ Diagnóstico específico de errores de red

### 3. Logs en `app/page.tsx`
- ✅ Timing de renderizado
- ✅ Estructura de datos recibidos
- ✅ Fallback a datos mock
- ✅ Conteo de componentes renderizados

## 🛠️ Scripts de Diagnóstico

### 1. Test de Conexión Básico
```bash
node scripts/test-strapi-connection.js
```
**Qué hace:**
- Verifica variables de entorno
- Prueba conectividad básica
- Testa endpoints específicos
- Diagnóstica errores comunes

### 2. Debug de Producción
```bash
node scripts/debug-production.js
```
**Qué hace:**
- Simula entorno de producción
- Verifica configuración de archivos
- Analiza dependencias
- Proporciona checklist de solución

## 🔍 Cómo Usar los Logs

### En Desarrollo
Los logs se muestran automáticamente en la consola.

### En Producción
1. **Activar logs temporalmente:**
   ```env
   ENABLE_PRODUCTION_LOGS=true
   ```

2. **Ver logs en tu plataforma:**
   - **Vercel**: Ve a Functions → View Function Logs
   - **Netlify**: Ve a Functions → Function logs
   - **Railway**: Ve a Deployments → Logs
   - **Heroku**: `heroku logs --tail`

## 🚨 Problemas Comunes y Soluciones

### 1. Variables de Entorno No Definidas
**Síntomas:**
```
[PROD-DEBUG] ❌ STRAPI_API_TOKEN no está configurado
```

**Solución:**
- Verifica que las variables estén configuradas en tu plataforma de deploy
- Asegúrate de que `NEXT_PUBLIC_STRAPI_URL` y `STRAPI_API_TOKEN` estén definidas
- Redeploya después de agregar las variables

### 2. Error de Conectividad de Red
**Síntomas:**
```
[PROD-DEBUG] 🌐 Network error detected - possible causes:
- Strapi server is down
- Network connectivity issues
```

**Solución:**
- Verifica que tu servidor Strapi esté ejecutándose
- Prueba la URL manualmente en un navegador
- Verifica configuración de firewall/CORS

### 3. Token de API Inválido
**Síntomas:**
```
[PROD-DEBUG] ❌ HTTP 401 Unauthorized
💡 Error 401: Token de autorización inválido o expirado
```

**Solución:**
- Regenera el token en Strapi Admin
- Verifica permisos del token (debe tener acceso a landing-pages)
- Actualiza la variable de entorno con el nuevo token

### 4. Contenido No Encontrado
**Síntomas:**
```
[PROD-DEBUG] ⚠️ No se encontraron elementos con slug 'landing-page'
```

**Solución:**
- Verifica que existe contenido en Strapi con slug "landing-page"
- Asegúrate de que el contenido esté publicado
- Revisa la configuración de permisos públicos

### 5. Timeout de Conexión
**Síntomas:**
```
[PROD-DEBUG] - Timeout: La conexión tardó más de 10 segundos
```

**Solución:**
- Verifica la velocidad de tu servidor Strapi
- Considera usar un CDN o servidor más rápido
- Revisa la configuración de timeout en tu plataforma

## 📋 Checklist de Debugging

### Antes de Deployar
- [ ] Variables de entorno configuradas localmente
- [ ] Strapi funcionando en desarrollo
- [ ] Tests de conexión pasando
- [ ] Contenido creado en Strapi

### En Producción
- [ ] Variables de entorno configuradas en la plataforma
- [ ] Strapi desplegado y accesible
- [ ] Token de API válido y con permisos
- [ ] Logs de producción activados temporalmente
- [ ] URL de Strapi accesible desde navegador

### Debugging Activo
- [ ] Ejecutar `node scripts/test-strapi-connection.js`
- [ ] Ejecutar `node scripts/debug-production.js`
- [ ] Revisar logs de la plataforma de deploy
- [ ] Verificar logs del servidor Strapi
- [ ] Probar endpoints manualmente con Postman/curl

## 🔧 Comandos Útiles

### Probar endpoint manualmente
```bash
curl -H "Authorization: Bearer TU_TOKEN" \
     -H "Content-Type: application/json" \
     "https://tu-strapi.com/api/landing-pages?filters[slug][$eq]=landing-page&populate=*"
```

### Ver logs en tiempo real (Vercel)
```bash
vercel logs --follow
```

### Ver logs en tiempo real (Netlify)
```bash
netlify logs --live
```

## 🎯 Próximos Pasos

Una vez identificado el problema:

1. **Soluciona la causa raíz** usando las soluciones arriba
2. **Desactiva los logs de producción** removiendo `ENABLE_PRODUCTION_LOGS=true`
3. **Redeploya** para aplicar los cambios
4. **Verifica** que todo funcione correctamente

## 📞 Soporte Adicional

Si los logs no son suficientes para identificar el problema:

1. **Copia los logs completos** de la consola
2. **Incluye la configuración** de variables de entorno (sin valores sensibles)
3. **Describe el comportamiento esperado** vs el actual
4. **Menciona la plataforma de deploy** que estás usando

---

**Nota**: Los logs de producción pueden generar mucho output. Úsalos solo temporalmente para debugging y desactívalos una vez resuelto el problema. 