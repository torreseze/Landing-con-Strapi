/**
 * Logger específico para debugging en producción
 * Se puede activar/desactivar con una variable de entorno
 */

const ENABLE_PRODUCTION_LOGS = process.env.ENABLE_PRODUCTION_LOGS === 'true';
const LOG_PREFIX = '[PROD-DEBUG]';

export class ProductionLogger {
  private static isEnabled(): boolean {
    return ENABLE_PRODUCTION_LOGS || process.env.NODE_ENV === 'development';
  }

  static log(message: string, data?: any) {
    if (this.isEnabled()) {
      console.log(`${LOG_PREFIX} ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static error(message: string, error?: any) {
    if (this.isEnabled()) {
      console.error(`${LOG_PREFIX} ❌ ${message}`);
      if (error) {
        console.error(`${LOG_PREFIX} Error details:`, {
          name: error?.name,
          message: error?.message,
          stack: error?.stack,
          cause: error?.cause
        });
      }
    }
  }

  static warn(message: string, data?: any) {
    if (this.isEnabled()) {
      console.warn(`${LOG_PREFIX} ⚠️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static info(message: string, data?: any) {
    if (this.isEnabled()) {
      console.info(`${LOG_PREFIX} ℹ️ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static success(message: string, data?: any) {
    if (this.isEnabled()) {
      console.log(`${LOG_PREFIX} ✅ ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  static debug(message: string, data?: any) {
    if (this.isEnabled()) {
      console.debug(`${LOG_PREFIX} 🔍 ${message}`, data ? JSON.stringify(data, null, 2) : '');
    }
  }

  // Método específico para logging de requests HTTP
  static httpRequest(method: string, url: string, headers?: Record<string, string>) {
    if (this.isEnabled()) {
      console.log(`${LOG_PREFIX} 📡 HTTP ${method} ${url}`);
      if (headers) {
        const safeHeaders = { ...headers };
        // Ocultar tokens sensibles
        if (safeHeaders.Authorization) {
          safeHeaders.Authorization = safeHeaders.Authorization.substring(0, 20) + '...';
        }
        console.log(`${LOG_PREFIX} Headers:`, safeHeaders);
      }
    }
  }

  // Método específico para logging de responses HTTP
  static httpResponse(status: number, statusText: string, data?: any) {
    if (this.isEnabled()) {
      const emoji = status >= 200 && status < 300 ? '✅' : '❌';
      console.log(`${LOG_PREFIX} ${emoji} HTTP ${status} ${statusText}`);
      
      if (data) {
        // Limitar el tamaño del log para evitar spam
        const dataStr = JSON.stringify(data);
        if (dataStr.length > 1000) {
          console.log(`${LOG_PREFIX} Response data (truncated):`, dataStr.substring(0, 1000) + '...');
        } else {
          console.log(`${LOG_PREFIX} Response data:`, data);
        }
      }
    }
  }

  // Método para logging de timing
  static timing(label: string, startTime: number) {
    if (this.isEnabled()) {
      const duration = Date.now() - startTime;
      console.log(`${LOG_PREFIX} ⏱️ ${label}: ${duration}ms`);
    }
  }

  // Método para logging de environment
  static environment() {
    if (this.isEnabled()) {
      console.log(`${LOG_PREFIX} 🌍 Environment Check:`);
      console.log(`${LOG_PREFIX} - NODE_ENV: ${process.env.NODE_ENV}`);
      console.log(`${LOG_PREFIX} - NEXT_PUBLIC_STRAPI_URL: ${process.env.NEXT_PUBLIC_STRAPI_URL ? 'SET' : 'NOT SET'}`);
      console.log(`${LOG_PREFIX} - STRAPI_API_TOKEN: ${process.env.STRAPI_API_TOKEN ? 'SET' : 'NOT SET'}`);
      console.log(`${LOG_PREFIX} - Timestamp: ${new Date().toISOString()}`);
    }
  }

  // Método para crear un timer
  static startTimer(label: string): () => void {
    if (!this.isEnabled()) {
      return () => {}; // No-op si no está habilitado
    }

    const startTime = Date.now();
    console.log(`${LOG_PREFIX} ⏱️ Starting timer: ${label}`);
    
    return () => {
      this.timing(label, startTime);
    };
  }

  // Método para logging de objetos complejos con estructura
  static structure(label: string, obj: any) {
    if (this.isEnabled()) {
      console.log(`${LOG_PREFIX} 📋 ${label}:`);
      
      if (obj === null || obj === undefined) {
        console.log(`${LOG_PREFIX} - Value: ${obj}`);
        return;
      }

      if (typeof obj !== 'object') {
        console.log(`${LOG_PREFIX} - Type: ${typeof obj}`);
        console.log(`${LOG_PREFIX} - Value: ${obj}`);
        return;
      }

      if (Array.isArray(obj)) {
        console.log(`${LOG_PREFIX} - Type: Array`);
        console.log(`${LOG_PREFIX} - Length: ${obj.length}`);
        if (obj.length > 0) {
          console.log(`${LOG_PREFIX} - First item keys: ${Object.keys(obj[0] || {}).join(', ')}`);
        }
      } else {
        console.log(`${LOG_PREFIX} - Type: Object`);
        console.log(`${LOG_PREFIX} - Keys: ${Object.keys(obj).join(', ')}`);
        
        // Log de propiedades importantes
        const importantKeys = ['id', 'slug', 'title', 'data', 'attributes', 'dynamicZone'];
        importantKeys.forEach(key => {
          if (key in obj) {
            const value = obj[key];
            if (Array.isArray(value)) {
              console.log(`${LOG_PREFIX} - ${key}: Array(${value.length})`);
            } else if (typeof value === 'object' && value !== null) {
              console.log(`${LOG_PREFIX} - ${key}: Object with keys [${Object.keys(value).join(', ')}]`);
            } else {
              console.log(`${LOG_PREFIX} - ${key}: ${value}`);
            }
          }
        });
      }
    }
  }
}

// Export por defecto para uso más fácil
export default ProductionLogger; 