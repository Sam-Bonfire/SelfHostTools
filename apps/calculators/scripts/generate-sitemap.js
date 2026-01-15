#!/usr/bin/env node

/**
 * Dynamic Sitemap Generator
 * Automatically generates sitemap.xml based on routes in main.jsx
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Simple .env parser since we can't rely on external deps or vite here
 */
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '../.env.local');
        const rootEnvPath = path.join(__dirname, '../../../.env.local');

        // Try package-level .env.local first
        if (fs.existsSync(envPath)) {
            return parseEnvFile(envPath);
        }
        // Try root-level .env.local fallback
        else if (fs.existsSync(rootEnvPath)) {
            console.log('Using root .env.local');
            return parseEnvFile(rootEnvPath);
        }
    } catch (e) {
        // Ignore error
    }
    return {};
}

function parseEnvFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    console.log(`Parsing ${filePath}, size: ${content.length}`);
    const env = {};
    content.split(/\r?\n/).forEach(line => { // Handle \r\n or \n
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) return; // Skip comments and empty lines

        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^["']|["']$/g, '');
            env[key] = value;
        } else {
            // console.log('No match for line:', trimmed);
        }
    });
    return env;
}

const env = loadEnv();
const ENV_SITE_URL = process.env.VITE_SITE_URL || env.VITE_SITE_URL;

if (!ENV_SITE_URL) {
    console.error('❌ Error: VITE_SITE_URL environment variable is not set!');
    console.error('   Please verify .env.local exists or VITE_SITE_URL is exported.');
    process.exit(1);
}

// Configuration
const SITE_URL = ENV_SITE_URL;
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');
const ROUTES_FILE = path.join(__dirname, '../src/main.jsx');

console.log(`Using SITE_URL: ${SITE_URL}`);

// Route configuration - maps route paths to priorities
const ROUTE_CONFIG = {
    '/': { priority: '1.0', changefreq: 'monthly' },
    '/education-loan': { priority: '0.8', changefreq: 'monthly' },
    '/sip-calculator': { priority: '0.8', changefreq: 'monthly' },
    '/home-loan-vs-rent': { priority: '0.8', changefreq: 'monthly' },
    '/life-insurance-calculator': { priority: '0.8', changefreq: 'monthly' },
    '/fire-calculator': { priority: '0.8', changefreq: 'monthly' },
    '/freelance-calculator': { priority: '0.8', changefreq: 'monthly' },
    '/degree-roi': { priority: '0.8', changefreq: 'monthly' },
    '/golden-handcuffs': { priority: '0.8', changefreq: 'monthly' },
    '/true-hourly-wage': { priority: '0.8', changefreq: 'monthly' },
    '/home-owner-realist': { priority: '0.8', changefreq: 'monthly' },
    '/job-relocation': { priority: '0.8', changefreq: 'monthly' }
};

/**
 * Extract routes from main.jsx
 */
function extractRoutes() {
    try {
        const content = fs.readFileSync(ROUTES_FILE, 'utf-8');
        const routes = [];

        // Match route paths using regex
        const pathRegex = /path:\s*['"]([^'"]+)['"]/g;
        let match;

        while ((match = pathRegex.exec(content)) !== null) {
            const route = match[1];
            if (route && route !== '*') {
                routes.push(route);
            }
        }

        return routes;
    } catch (error) {
        console.error('Error reading routes file:', error);
        return Object.keys(ROUTE_CONFIG).filter(r => r !== '/');
    }
}

/**
 * Generate sitemap XML
 */
function generateSitemap(routes) {
    const urls = routes.map(route => {
        const config = ROUTE_CONFIG[route] || { priority: '0.8', changefreq: 'monthly' };
        const loc = route === '/' ? SITE_URL : `${SITE_URL}/#${route}`;

        return `  <url>
    <loc>${loc}</loc>
    <changefreq>${config.changefreq}</changefreq>
    <priority>${config.priority}</priority>
  </url>`;
    }).join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Main execution
 */
function main() {
    console.log('🗺️  Generating sitemap.xml...');

    // Extract routes
    const extractedRoutes = extractRoutes();

    // Combine with configured routes and deduplicate
    const allRoutes = ['/', ...new Set([...extractedRoutes, ...Object.keys(ROUTE_CONFIG).filter(r => r !== '/')])];

    console.log(`   Found ${allRoutes.length} routes:`);
    allRoutes.forEach(route => console.log(`   - ${route}`));

    // Generate sitemap
    const sitemap = generateSitemap(allRoutes);

    // Write to file
    fs.writeFileSync(OUTPUT_PATH, sitemap, 'utf-8');

    console.log(`✅ Sitemap generated successfully at: ${OUTPUT_PATH}`);

    // Generate robots.txt
    generateRobotsTxt();
}

function generateRobotsTxt() {
    const robotsPath = path.join(__dirname, '../public/robots.txt');
    console.log('🤖 Generating robots.txt...');

    const content = `User-agent: *
Allow: /

Sitemap: ${SITE_URL}/sitemap.xml`;

    fs.writeFileSync(robotsPath, content, 'utf-8');
    console.log(`✅ robots.txt generated successfully at: ${robotsPath}`);
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { generateSitemap, extractRoutes };
