#!/usr/bin/env node

/**
 * Script de debug para problemas específicos de producción
 * Ejecutar con: node scripts/debug-production.js
 */

const fs = require('fs');
const path = require('path');

async function debugProduction() {
  console.log("🚨 DEBUG DE PRODUCCIÓN - STRAPI CONNECTION");
  console.log("==========================================");
  
  // Simular el entorno de producción
  const originalEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'production';
  
  console.log("\n🔧 CONFIGURACIÓN DE ENTORNO:");
  console.log("- NODE_ENV:", process.env.NODE_ENV);
  console.log("- Timestamp:", new Date().toISOString());
  
  // Verificar si estamos en un entorno de build vs runtime
  console.log("\n📦 CONTEXTO DE EJECUCIÓN:");
  console.log("- Process title:", process.title);
  console.log("- Process argv:", process.argv.slice(2).join(' '));
  console.log("- Working directory:", process.cwd());
  
  // Leer variables de entorno de diferentes fuentes
  console.log("\n🔍 FUENTES DE VARIABLES DE ENTORNO:");
  
  const envSources = [
    { name: '.env.local', path: '.env.local' },
    { name: '.env.production', path: '.env.production' },
    { name: '.env', path: '.env' },
  ];
  
  for (const source of envSources) {
    const fullPath = path.join(process.cwd(), source.path);
    if (fs.existsSync(fullPath)) {
      console.log(`✅ ${source.name} existe`);
      
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const lines = content.split('\n').filter(line => 
          line.trim() && !line.startsWith('#')
        );
        
        console.log(`  - Líneas de configuración: ${lines.length}`);
        
        // Verificar variables específicas sin mostrar valores sensibles
        const hasStrapi = lines.some(line => line.includes('STRAPI'));
        console.log(`  - Contiene variables STRAPI: ${hasStrapi ? '✅' : '❌'}`);
        
      } catch (error) {
        console.log(`  - Error leyendo archivo: ${error.message}`);
      }
    } else {
      console.log(`❌ ${source.name} no existe`);
    }
  }
  
  // Verificar variables en process.env
  console.log("\n🌐 VARIABLES EN PROCESS.ENV:");
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;
  const strapiToken = process.env.STRAPI_API_TOKEN;
  
  console.log("- NEXT_PUBLIC_STRAPI_URL:", strapiUrl ? '✅ Definida' : '❌ No definida');
  console.log("- STRAPI_API_TOKEN:", strapiToken ? '✅ Definida' : '❌ No definida');
  
  if (strapiUrl) {
    console.log("  - URL length:", strapiUrl.length);
    console.log("  - URL starts with https:", strapiUrl.startsWith('https://'));
    console.log("  - URL preview:", strapiUrl.substring(0, 30) + '...');
  }
  
  if (strapiToken) {
    console.log("  - Token length:", strapiToken.length);
    console.log("  - Token preview:", strapiToken.substring(0, 10) + '...');
  }
  
  // Simular la carga del módulo como lo haría Next.js
  console.log("\n📚 SIMULANDO CARGA DE MÓDULOS:");
  
  try {
    // Intentar importar la función getLandingPage
    console.log("⏳ Importando función getLandingPage...");
    
    // En Node.js necesitamos usar require para módulos CommonJS
    // o dynamic import para módulos ES
    const strapiPath = path.join(process.cwd(), 'lib', 'strapi.ts');
    
    if (fs.existsSync(strapiPath)) {
      console.log("✅ Archivo lib/strapi.ts encontrado");
      
      // Leer el contenido para verificar la configuración
      const content = fs.readFileSync(strapiPath, 'utf8');
      
      // Verificar que las constantes estén bien definidas
      const hasStrapi_URL = content.includes('STRAPI_URL');
      const hasStrapi_TOKEN = content.includes('STRAPI_TOKEN');
      
      console.log("- Contiene STRAPI_URL:", hasStrapi_URL ? '✅' : '❌');
      console.log("- Contiene STRAPI_TOKEN:", hasStrapi_TOKEN ? '✅' : '❌');
      
    } else {
      console.log("❌ Archivo lib/strapi.ts no encontrado");
    }
    
  } catch (error) {
    console.log("❌ Error importando módulos:", error.message);
  }
  
  // Probar la conexión con timeout más corto para producción
  console.log("\n🌐 PRUEBA DE CONEXIÓN RÁPIDA:");
  
  if (strapiUrl && strapiToken) {
    try {
      console.log("⏳ Probando conexión con timeout de 10s...");
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      const response = await fetch(`${strapiUrl}/api/landing-pages`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${strapiToken}`,
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log("✅ Conexión exitosa");
      console.log("- Status:", response.status);
      console.log("- Response time: < 10s");
      
      if (response.ok) {
        const data = await response.json();
        console.log("- Data received:", !!data.data);
        console.log("- Items count:", data.data?.length || 0);
      }
      
    } catch (error) {
      console.log("❌ Error de conexión:");
      
      if (error.name === 'AbortError') {
        console.log("- Timeout: La conexión tardó más de 10 segundos");
        console.log("💡 En producción, esto puede causar timeouts de build/render");
      } else {
        console.log("- Error:", error.message);
      }
    }
  } else {
    console.log("⚠️ No se puede probar conexión - faltan variables de entorno");
  }
  
  // Verificar configuración específica de Next.js
  console.log("\n⚙️ CONFIGURACIÓN DE NEXT.JS:");
  
  const nextConfigPath = path.join(process.cwd(), 'next.config.js');
  const nextConfigTsPath = path.join(process.cwd(), 'next.config.ts');
  
  let nextConfigExists = false;
  
  if (fs.existsSync(nextConfigPath)) {
    console.log("✅ next.config.js encontrado");
    nextConfigExists = true;
  } else if (fs.existsSync(nextConfigTsPath)) {
    console.log("✅ next.config.ts encontrado");
    nextConfigExists = true;
  } else {
    console.log("⚠️ No se encontró next.config.js/ts");
  }
  
  if (nextConfigExists) {
    console.log("💡 Verifica que las variables de entorno estén en env config");
  }
  
  // Verificar package.json para scripts de build
  console.log("\n📦 SCRIPTS DE BUILD:");
  
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      console.log("✅ package.json encontrado");
      console.log("- Build script:", packageJson.scripts?.build || 'No definido');
      console.log("- Start script:", packageJson.scripts?.start || 'No definido');
      
      // Verificar dependencias relacionadas con Strapi
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      const strapiRelated = Object.keys(deps).filter(dep => 
        dep.includes('strapi') || dep.includes('cms')
      );
      
      if (strapiRelated.length > 0) {
        console.log("- Dependencias Strapi:", strapiRelated.join(', '));
      }
      
    } catch (error) {
      console.log("❌ Error leyendo package.json:", error.message);
    }
  }
  
  // Recomendaciones específicas para producción
  console.log("\n💡 RECOMENDACIONES PARA PRODUCCIÓN:");
  console.log("=====================================");
  
  console.log("\n🔧 Variables de entorno:");
  console.log("- Asegúrate de que NEXT_PUBLIC_STRAPI_URL esté configurada en tu plataforma de deploy");
  console.log("- Verifica que STRAPI_API_TOKEN esté configurada como variable secreta");
  console.log("- Las variables NEXT_PUBLIC_ son públicas, las otras son privadas del servidor");
  
  console.log("\n🚀 Deploy:");
  console.log("- Verifica que Strapi esté desplegado y accesible desde internet");
  console.log("- Confirma que el token de API tenga los permisos correctos");
  console.log("- Prueba la URL de Strapi manualmente desde un navegador");
  
  console.log("\n🐛 Debug:");
  console.log("- Revisa los logs de build de tu plataforma (Vercel, Netlify, etc.)");
  console.log("- Verifica los logs de runtime/server");
  console.log("- Usa este script en tu servidor de producción si es posible");
  
  console.log("\n📋 Checklist:");
  console.log("□ Strapi está desplegado y funcionando");
  console.log("□ Variables de entorno configuradas en la plataforma");
  console.log("□ Token de API válido y con permisos");
  console.log("□ Contenido existe en Strapi con el slug correcto");
  console.log("□ No hay errores de CORS o firewall");
  
  // Restaurar NODE_ENV original
  process.env.NODE_ENV = originalEnv;
  
  console.log("\n✅ Debug de producción completado");
}

// Ejecutar el debug
debugProduction().catch(console.error); 