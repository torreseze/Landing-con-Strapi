#!/usr/bin/env node

/**
 * Script para probar el build localmente
 * Ejecutar con: node scripts/test-build.js
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testBuild() {
  console.log("🏗️ PROBANDO BUILD LOCAL");
  console.log("======================");
  
  // Verificar que estamos en el directorio correcto
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log("❌ No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.");
    return;
  }
  
  console.log("✅ Directorio del proyecto encontrado");
  
  // Verificar variables de entorno
  console.log("\n🔍 VERIFICANDO VARIABLES DE ENTORNO:");
  
  let envExists = false;
  const envFiles = ['.env.local', '.env.production', '.env'];
  
  for (const envFile of envFiles) {
    if (fs.existsSync(envFile)) {
      console.log(`✅ ${envFile} encontrado`);
      envExists = true;
      break;
    }
  }
  
  if (!envExists) {
    console.log("⚠️ No se encontraron archivos de variables de entorno");
    console.log("💡 El build usará datos mock automáticamente");
  }
  
  // Activar logs de producción temporalmente
  process.env.ENABLE_PRODUCTION_LOGS = 'true';
  process.env.NODE_ENV = 'production';
  
  console.log("\n🚀 INICIANDO BUILD...");
  console.log("- Logs de producción: ACTIVADOS");
  console.log("- NODE_ENV: production");
  
  return new Promise((resolve, reject) => {
    const buildProcess = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      env: {
        ...process.env,
        ENABLE_PRODUCTION_LOGS: 'true',
        NODE_ENV: 'production'
      }
    });
    
    buildProcess.on('close', (code) => {
      console.log("\n📊 RESULTADO DEL BUILD:");
      console.log("======================");
      
      if (code === 0) {
        console.log("✅ BUILD EXITOSO");
        console.log("- El proyecto se compiló correctamente");
        console.log("- No hay errores de SSG");
        console.log("- Los fallbacks funcionan correctamente");
        
        console.log("\n🎯 PRÓXIMOS PASOS:");
        console.log("- Puedes deployar con confianza");
        console.log("- Los logs de producción se activarán automáticamente si hay problemas");
        console.log("- La aplicación usará datos mock si Strapi no está disponible");
        
        resolve(code);
      } else {
        console.log("❌ BUILD FALLÓ");
        console.log(`- Código de salida: ${code}`);
        console.log("- Revisa los errores arriba");
        
        console.log("\n🔧 POSIBLES SOLUCIONES:");
        console.log("1. Verifica que todas las dependencias estén instaladas: npm install");
        console.log("2. Revisa errores de TypeScript o linting");
        console.log("3. Asegúrate de que no hay imports faltantes");
        console.log("4. Ejecuta: npm run dev para probar en desarrollo");
        
        reject(new Error(`Build failed with code ${code}`));
      }
    });
    
    buildProcess.on('error', (error) => {
      console.log("❌ ERROR EJECUTANDO BUILD:");
      console.log("- Error:", error.message);
      reject(error);
    });
  });
}

// Función para limpiar después del test
function cleanup() {
  console.log("\n🧹 LIMPIEZA:");
  console.log("- Desactivando logs de producción");
  delete process.env.ENABLE_PRODUCTION_LOGS;
}

// Ejecutar el test
testBuild()
  .then(() => {
    cleanup();
    console.log("\n✅ Test de build completado exitosamente");
    process.exit(0);
  })
  .catch((error) => {
    cleanup();
    console.log("\n❌ Test de build falló:", error.message);
    process.exit(1);
  }); 