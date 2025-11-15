#!/usr/bin/env node
// Simple validator: scans data/*.json for image paths and reports missing files
// Usage: node scripts/validate-images.js

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const root = path.join(__dirname, '..');

function collectJsonFiles(dir) {
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => path.join(dir, f));
}

function findImagePaths(obj) {
  const imgs = [];
  if (!obj || typeof obj !== 'object') return imgs;
  const stack = [obj];
  while (stack.length) {
    const cur = stack.pop();
    if (Array.isArray(cur)) {
      cur.forEach(v => { if (typeof v === 'object') stack.push(v); else if (typeof v === 'string') inspectString(v, imgs); });
    } else if (typeof cur === 'object') {
      Object.values(cur).forEach(v => {
        if (typeof v === 'string') inspectString(v, imgs);
        else if (typeof v === 'object') stack.push(v);
      });
    }
  }
  return imgs;
}

function inspectString(s, out) {
  if (!s) return;
  // Look for image file extensions or common image path patterns
  if (s.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i) || s.includes('/img/')) {
    out.push(s);
  }
}

function resolvePath(p) {
  if (!p) return null;
  // Remove surrounding quotes if any
  p = String(p);
  if (p.startsWith('./')) return path.join(root, p.slice(2));
  if (p.startsWith('../')) return path.join(root, p);
  // absolute or bare path
  return path.join(root, p);
}

(function main(){
  const files = collectJsonFiles(dataDir);
  const missing = [];
  files.forEach(file => {
    let json;
    try { json = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('Failed to parse', file, e); return; }
    const imgs = findImagePaths(json);
    imgs.forEach(p => {
      const resolved = resolvePath(p);
      if (!fs.existsSync(resolved)) {
        missing.push({ file, path: p, resolved });
      }
    });
  });

  if (missing.length === 0) {
    console.log('✅ All referenced image files exist.');
    process.exit(0);
  }

  console.log(`❌ Missing ${missing.length} image(s):`);
  missing.forEach(m => {
    console.log(`- ${m.path} referenced in ${path.relative(root, m.file)} -> expected at ${path.relative(root, m.resolved)}`);
  });
  process.exit(1);
})();
