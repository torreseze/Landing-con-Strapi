#!/usr/bin/env node

/**
 * Script de diagnóstico para probar la conexión a Strapi
 * Ejecutar con: node scripts/test-strapi-connection.js
 */

const fs = require('fs');
const path = require('path');

async function testStrapiConnection() {
  console.log("🔍 DIAGNÓSTICO DE CONEXIÓN A STRAPI");
  console.log("=====================================");
  
  // 1. Verificar variables de entorno
  console.log("\n1️⃣ VERIFICANDO VARIABLES DE ENTORNO:");
  
  let strapiUrl, strapiToken;
  
  try {
    // Intentar leer desde .env.local
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      
      const urlMatch = envContent.match(/NEXT_PUBLIC_STRAPI_URL=(.+)/);
      const tokenMatch = envContent.match(/STRAPI_API_TOKEN=(.+)/);
      
      strapiUrl = urlMatch?.[1]?.trim();
      strapiToken = tokenMatch?.[1]?.trim();
      
      console.log("✅ Archivo .env.local encontrado");
    } else {
      console.log("⚠️ Archivo .env.local no encontrado, usando process.env");
    }
    
    // Usar variables de entorno si no se encontraron en el archivo
    strapiUrl = strapiUrl || process.env.NEXT_PUBLIC_STRAPI_URL;
    strapiToken = strapiToken || process.env.STRAPI_API_TOKEN;
    
    console.log("- NEXT_PUBLIC_STRAPI_URL:", strapiUrl || "❌ NO DEFINIDA");
    console.log("- STRAPI_API_TOKEN existe:", !!strapiToken ? "✅ SÍ" : "❌ NO");
    console.log("- STRAPI_API_TOKEN longitud:", strapiToken?.length || 0);
    console.log("- NODE_ENV:", process.env.NODE_ENV || "development");
    
    if (!strapiUrl) {
      console.log("❌ ERROR: NEXT_PUBLIC_STRAPI_URL no está definida");
      return;
    }
    
    if (!strapiToken) {
      console.log("❌ ERROR: STRAPI_API_TOKEN no está definida");
      return;
    }
    
  } catch (error) {
    console.log("❌ Error leyendo variables de entorno:", error.message);
    return;
  }
  
  // 2. Verificar formato de URL
  console.log("\n2️⃣ VERIFICANDO FORMATO DE URL:");
  
  try {
    const url = new URL(strapiUrl);
    console.log("✅ URL válida");
    console.log("- Protocol:", url.protocol);
    console.log("- Host:", url.host);
    console.log("- Port:", url.port || "default");
  } catch (error) {
    console.log("❌ URL inválida:", error.message);
    return;
  }
  
  // 3. Probar conectividad básica
  console.log("\n3️⃣ PROBANDO CONECTIVIDAD BÁSICA:");
  
  try {
    console.log("⏳ Probando conexión a:", strapiUrl);
    
    const response = await fetch(strapiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Strapi-Connection-Test/1.0'
      }
    });
    
    console.log("✅ Conexión básica exitosa");
    console.log("- Status:", response.status);
    console.log("- Status Text:", response.statusText);
    
  } catch (error) {
    console.log("❌ Error de conectividad básica:");
    console.log("- Error:", error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log("💡 Posible causa: DNS no puede resolver el dominio");
    } else if (error.code === 'ECONNREFUSED') {
      console.log("💡 Posible causa: Servidor no está ejecutándose o puerto cerrado");
    } else if (error.code === 'ETIMEDOUT') {
      console.log("💡 Posible causa: Timeout de conexión, servidor lento o firewall");
    }
    
    return;
  }
  
  // 4. Probar endpoint de API
  console.log("\n4️⃣ PROBANDO ENDPOINT DE API:");
  
  const apiUrl = `${strapiUrl}/api/landing-pages`;
  
  try {
    console.log("⏳ Probando endpoint:", apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Strapi-API-Test/1.0'
      }
    });
    
    console.log("📥 Respuesta recibida:");
    console.log("- Status:", response.status);
    console.log("- Status Text:", response.statusText);
    console.log("- Headers:", Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ API responde correctamente");
      console.log("- Estructura de datos:", {
        hasData: !!data.data,
        dataType: typeof data.data,
        isArray: Array.isArray(data.data),
        dataLength: data.data?.length || 0,
        hasMeta: !!data.meta
      });
      
      if (data.data && data.data.length > 0) {
        console.log("- Primer elemento keys:", Object.keys(data.data[0]));
      }
      
    } else {
      console.log("❌ API devolvió error");
      
      try {
        const errorBody = await response.text();
        console.log("- Error body:", errorBody);
      } catch (e) {
        console.log("- No se pudo leer el cuerpo del error");
      }
      
      // Diagnóstico específico por código de error
      if (response.status === 401) {
        console.log("💡 Error 401: Token de autorización inválido o expirado");
      } else if (response.status === 403) {
        console.log("💡 Error 403: Token válido pero sin permisos para este endpoint");
      } else if (response.status === 404) {
        console.log("💡 Error 404: Endpoint no encontrado, verifica la URL de Strapi");
      } else if (response.status === 500) {
        console.log("💡 Error 500: Error interno del servidor Strapi");
      }
    }
    
  } catch (error) {
    console.log("❌ Error probando API:");
    console.log("- Error:", error.message);
    console.log("- Stack:", error.stack);
  }
  
  // 5. Probar endpoint específico con filtros
  console.log("\n5️⃣ PROBANDO ENDPOINT ESPECÍFICO:");
  
  const specificUrl = `${strapiUrl}/api/landing-pages?filters[slug][$eq]=landing-page&populate=*`;
  
  try {
    console.log("⏳ Probando endpoint específico:", specificUrl);
    
    const response = await fetch(specificUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Strapi-Specific-Test/1.0'
      }
    });
    
    console.log("📥 Respuesta específica:");
    console.log("- Status:", response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log("✅ Endpoint específico funciona");
      console.log("- Encontrados:", data.data?.length || 0, "elementos");
      
      if (data.data && data.data.length > 0) {
        const item = data.data[0];
        console.log("- Primer elemento tiene:");
        console.log("  - ID:", item.id);
        console.log("  - Slug:", item.slug);
        console.log("  - Title:", item.title);
        console.log("  - Dynamic Zone:", !!item.dynamicZone);
        console.log("  - Dynamic Zone length:", item.dynamicZone?.length || 0);
      } else {
        console.log("⚠️ No se encontraron elementos con slug 'landing-page'");
        console.log("💡 Verifica que existe una landing page con ese slug en Strapi");
      }
      
    } else {
      console.log("❌ Endpoint específico falló con status:", response.status);
    }
    
  } catch (error) {
    console.log("❌ Error en endpoint específico:", error.message);
  }
  
  // 6. Resumen y recomendaciones
  console.log("\n6️⃣ RESUMEN Y RECOMENDACIONES:");
  console.log("=====================================");
  
  console.log("\n🔧 Para solucionar problemas en producción:");
  console.log("1. Verifica que las variables de entorno estén configuradas correctamente");
  console.log("2. Asegúrate de que el servidor Strapi esté ejecutándose");
  console.log("3. Verifica que el token tenga los permisos correctos");
  console.log("4. Confirma que existe contenido con el slug correcto");
  console.log("5. Revisa los logs del servidor Strapi para errores");
  
  console.log("\n📋 Variables de entorno necesarias:");
  console.log("NEXT_PUBLIC_STRAPI_URL=https://tu-strapi-url.com");
  console.log("STRAPI_API_TOKEN=tu_token_aqui");
  
  console.log("\n✅ Diagnóstico completado");
}

// Ejecutar el diagnóstico
testStrapiConnection().catch(console.error); 