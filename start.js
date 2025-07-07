#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Aldaba Job Scraper - Iniciando...\n');

// Verificar si existe el archivo .env
// if (!fs.existsSync('.env')) {
//     console.log('⚠️  No se encontró archivo .env');
//     console.log('📋 Copia .env.example a .env y configura tus credenciales de Twilio\n');
//     console.log('Comando: cp .env.example .env\n');
//     process.exit(1);
// }

// Verificar si existe la carpeta dist
if (!fs.existsSync('dist')) {
    console.log('📦 Compilando TypeScript...');
    exec('npx tsc', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error compilando:', error);
            return;
        }
        console.log('✅ Compilación completada');
        startServer();
    });
} else {
    startServer();
}

function startServer() {
    console.log('🌐 Iniciando servidor...');
    exec('node dist/main.js', (error, stdout, stderr) => {
        if (error) {
            console.error('❌ Error iniciando servidor:', error);
            return;
        }
        console.log(stdout);
        if (stderr) console.error(stderr);
    });
}