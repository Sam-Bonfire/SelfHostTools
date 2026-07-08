import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import dotenv from 'dotenv';

// Load .env from workspace root
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootEnvPath = path.resolve(__dirname, '../../../.env');
dotenv.config({ path: rootEnvPath });

const LATEST_DATA_PATH = path.resolve(__dirname, '../data/latest.json');

// --- Helper Functions ---
async function fetchWorldBankInflation() {
    try {
        console.log('Fetching India CPI (Inflation) from World Bank...');
        // FP.CPI.TOTL.ZG = Inflation, consumer prices (annual %)
        const response = await axios.get('https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json');
        
        if (response.data && Array.isArray(response.data) && response.data.length > 1) {
            const dataPoints = response.data[1];
            // Find the most recent non-null value
            const latestPoint = dataPoints.find(point => point.value !== null);
            if (latestPoint) {
                const inflationRate = parseFloat(latestPoint.value).toFixed(2);
                console.log(`✅ Success: World Bank Inflation -> ${inflationRate}% (Year: ${latestPoint.date})`);
                return parseFloat(inflationRate);
            }
        }
    } catch (error) {
        console.error('❌ Failed to fetch World Bank Inflation:', error.message);
    }
    return null;
}

// Alpha vantage is often tricky with international indices on free tier, 
// so we'll structure this to fail gracefully.
async function fetchAlphaVantageEquityReturn() {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY;
    if (!apiKey) {
        console.log('⚠️ ALPHA_VANTAGE_API_KEY not found in .env. Skipping Alpha Vantage fetch.');
        return null;
    }

    try {
        console.log('Fetching market data from Alpha Vantage...');
        // We'll fetch INDA (iShares MSCI India ETF) as a proxy for the Indian market return 
        // because Alpha Vantage has reliable data for US-listed ETFs on the free tier.
        const response = await axios.get(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=INDA&apikey=${apiKey}`);
        
        // This gives current quote. To calculate trailing return properly we'd need historical data (TIME_SERIES_MONTHLY_ADJUSTED).
        // Since free tier is heavily rate limited (25 requests/day), we will just mock a sensible parsing here.
        // For a full implementation, you would fetch TIME_SERIES_MONTHLY_ADJUSTED, get price 10 years ago, and calculate CAGR.
        
        // Placeholder check just to ensure API key works.
        if (response.data['Global Quote']) {
            console.log('✅ Success: Alpha Vantage reached.');
            // In a real scenario, calculate the 10-year CAGR here. 
            // We'll stick to our curated baseline of 12.0% for the MVP since we can't do complex historical analysis on the free tier easily.
            // Returning null keeps the curated fallback.
            return null; 
        } else if (response.data['Information']) {
            console.warn('⚠️ Alpha Vantage Rate Limited:', response.data['Information']);
        }
    } catch (error) {
        console.error('❌ Failed to fetch Alpha Vantage data:', error.message);
    }
    return null;
}

// --- Main Script ---
async function updateMacroData() {
    console.log('🚀 Starting Macro Data Update Pipeline...\n');

    // 1. Read existing curated data as baseline
    let currentData = {};
    try {
        const fileContent = await fs.readFile(LATEST_DATA_PATH, 'utf-8');
        currentData = JSON.parse(fileContent);
    } catch (error) {
        console.error('❌ Could not read latest.json baseline.', error);
        process.exit(1);
    }

    // 2. Fetch fresh data
    const wbInflation = await fetchWorldBankInflation();
    const avEquityReturn = await fetchAlphaVantageEquityReturn();

    // 3. Merge data intelligently (only overwrite if we have a valid fetch)
    const updatedData = {
        ...currentData,
        inflation: {
            ...currentData.inflation,
            general: wbInflation !== null ? wbInflation : currentData.inflation.general,
        },
        returns: {
            ...currentData.returns,
            equityBenchmark: avEquityReturn !== null ? avEquityReturn : currentData.returns.equityBenchmark,
        },
        metadata: {
            lastUpdated: new Date().toISOString()
        }
    };

    // 4. Save back to latest.json
    try {
        await fs.writeFile(LATEST_DATA_PATH, JSON.stringify(updatedData, null, 2));
        console.log('\n✅ Successfully updated latest.json with fresh macro data.');
    } catch (error) {
        console.error('❌ Failed to save updated latest.json:', error);
        process.exit(1);
    }
}

updateMacroData();
