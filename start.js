#!/usr/bin/env node

const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Aldaba Job Scraper - Setup y ejecución automática\n');

// Función para ejecutar comandos
function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`📦 ${description}...`);
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`❌ Error: ${error.message}`);
        reject(error);
        return;
      }
      if (stderr && !stderr.includes('npm notice')) {
        console.warn(`⚠️  ${stderr}`);
      }
      console.log(`✅ ${description} completado`);
      resolve(stdout);
    });
  });
}

async function setup() {
  try {
    // 1. Crear .env si no existe
    // if (!fs.existsSync('.env')) {
    //   console.log('📝 Creando archivo .env...');
    //   fs.copyFileSync('.env.example', '.env');
    //   console.log('✅ Archivo .env creado');
    //   console.log('⚠️  Recuerda configurar tus credenciales de Twilio en el archivo .env\n');
    // }

    // // 2. Verificar si node_modules existe
    // if (!fs.existsSync('node_modules')) {
    //   console.log('🔧 Instalando dependencias sin descargar Chrome...');
    //   const installCommand = process.platform === 'win32' 
    //     ? 'set PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true && npm install'
    //     : 'PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true npm install';
      
    //   await runCommand(installCommand, 'Instalación de dependencias');
    // }

    // // 3. Compilar TypeScript si no existe dist
    // if (!fs.existsSync('dist')) {
    //   await runCommand('npx tsc', 'Compilación de TypeScript');
    // }

    // 4. Iniciar servidor
    console.log('\n🌐 Iniciando servidor...');
    console.log('📍 Servidor disponible en: http://localhost:5000');
    console.log('📚 Documentación: http://localhost:5000/api/docs');
    console.log('🔄 Presiona Ctrl+C para detener\n');

    // Usar spawn para mantener el proceso activo
    const server = spawn('node', ['dist/main.js'], {
      stdio: 'inherit',
      shell: true
    });

    server.on('close', (code) => {
      console.log(`\n🛑 Servidor terminado con código: ${code}`);
    });

    server.on('error', (error) => {
      console.error('❌ Error del servidor:', error);
    });

  } catch (error) {
    console.error('\n❌ Error durante el setup:', error.message);
    
    if (error.message.includes('Chrome') || error.message.includes('chromium')) {
      console.log('\n💡 Solución: Instala Chrome o Chromium en tu sistema:');
      console.log('   Ubuntu/Debian: sudo apt install chromium-browser');
      console.log('   macOS: brew install chromium');
      console.log('   Windows: Descargar Chrome desde google.com/chrome');
    }
    
    process.exit(1);
  }
}

// Manejar Ctrl+C
process.on('SIGINT', () => {
  console.log('\n👋 Cerrando servidor...');
  process.exit(0);
});

setup();