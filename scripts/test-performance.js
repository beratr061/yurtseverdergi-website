#!/usr/bin/env node

/**
 * Performans Test Script
 * 
 * Bu script sayfa yükleme sürelerini test eder
 * Kullanım: node scripts/test-performance.js
 */

const https = require('https');
const http = require('http');

const urls = [
  'http://localhost:3000',
  'http://localhost:3000/yazi/test-slug',
  'http://localhost:3000/siir',
];

function testUrl(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const protocol = url.startsWith('https') ? https : http;
    
    protocol.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const endTime = Date.now();
        const duration = endTime - startTime;
        
        resolve({
          url,
          status: res.statusCode,
          duration,
          size: Buffer.byteLength(data, 'utf8'),
        });
      });
    }).on('error', (err) => {
      resolve({
        url,
        error: err.message,
      });
    });
  });
}

async function runTests() {
  console.log('🚀 Performans Testi Başlatılıyor...\n');
  console.log('⚠️  Not: Dev server çalışıyor olmalı (npm run dev)\n');
  
  for (const url of urls) {
    console.log(`Testing: ${url}`);
    const result = await testUrl(url);
    
    if (result.error) {
      console.log(`  ❌ Error: ${result.error}\n`);
    } else {
      const sizeKB = (result.size / 1024).toFixed(2);
      const durationColor = result.duration < 100 ? '🟢' : result.duration < 500 ? '🟡' : '🔴';
      
      console.log(`  ${durationColor} Status: ${result.status}`);
      console.log(`  ⏱️  Duration: ${result.duration}ms`);
      console.log(`  📦 Size: ${sizeKB} KB\n`);
    }
  }
  
  console.log('✅ Test tamamlandı!');
  console.log('\n📊 Hedef Metrikler:');
  console.log('  - Ana Sayfa: < 500ms');
  console.log('  - Yazı Sayfası: < 300ms');
  console.log('  - Kategori Sayfası: < 400ms');
}

runTests().catch(console.error);
