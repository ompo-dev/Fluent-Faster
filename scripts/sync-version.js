#!/usr/bin/env node

/**
 * Script to synchronize app version across all files
 * The single source of truth is package.json
 *
 * Usage: node scripts/sync-version.js
 * Or: npm run version:sync
 */

const fs = require("node:fs");
const path = require("node:path");

// Read version from package.json
const packageJsonPath = path.join(__dirname, "..", "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const appVersion = packageJson.version;

if (!appVersion) {
	console.error("❌ Error: Version not found in package.json");
	process.exit(1);
}

console.log(`🔄 Synchronizing version: ${appVersion}`);

// Convert version to cache format (1.0.0 -> v1.0.0)
const cacheVersion = `v${appVersion}`;

// Update public/sw.js
const swJsPath = path.join(__dirname, "..", "public", "sw.js");
let swJsContent = fs.readFileSync(swJsPath, "utf8");

// Replace CACHE_VERSION line (supports any previous version)
swJsContent = swJsContent.replace(
	/const CACHE_VERSION = "v[^"]+";/,
	`const CACHE_VERSION = "${cacheVersion}";`,
);

// Update comment as well
swJsContent = swJsContent.replace(
	/\/\/ Service Worker for PWA - FluentFaster\nconst CACHE_VERSION = "v[^"]+";/,
	`// Service Worker for PWA - FluentFaster\nconst CACHE_VERSION = "${cacheVersion}";`,
);

fs.writeFileSync(swJsPath, swJsContent, "utf8");
console.log(`✅ Updated: public/sw.js`);

// Update manifest.json version (optional, but good practice)
const manifestPath = path.join(__dirname, "..", "public", "manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.version = appVersion;
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
console.log(`✅ Updated: public/manifest.json`);

console.log(`\n✨ Version synchronized successfully!`);
console.log(`📦 App version: ${appVersion}`);
console.log(`💾 Cache version: ${cacheVersion}`);
