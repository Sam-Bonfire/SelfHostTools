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
const BASE_COSTS_PATH = path.resolve(__dirname, '../data/base_costs_2024.json');

// --- Helper Functions ---
async function fetchWorldBankInflation() {
  try {
    console.log('Fetching India CPI (Inflation) from World Bank...');
    // FP.CPI.TOTL.ZG = Inflation, consumer prices (annual %)
    const response = await axios.get('https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json');

    if (response.data && Array.isArray(response.data) && response.data.length > 1) {
      const dataPoints = response.data[1];
      // Find the most recent non-null value
      const latestPoint = dataPoints.find((point) => point.value !== null);
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

async function fetchWorldBankInterestRate() {
  try {
    console.log('Fetching India Lending Interest Rate from World Bank...');
    // FR.INR.LEND = Lending interest rate (%)
    const response = await axios.get('https://api.worldbank.org/v2/country/IN/indicator/FR.INR.LEND?format=json');

    if (response.data && Array.isArray(response.data) && response.data.length > 1) {
      const dataPoints = response.data[1];
      const latestPoint = dataPoints.find((point) => point.value !== null);
      if (latestPoint) {
        const lendingRate = parseFloat(latestPoint.value);
        console.log(`✅ Success: World Bank Lending Rate -> ${lendingRate.toFixed(2)}% (Year: ${latestPoint.date})`);
        return lendingRate;
      }
    }
  } catch (error) {
    console.error('❌ Failed to fetch World Bank Interest Rate:', error.message);
  }
  return null;
}

async function calculateCumulativeInflationFactor(baseYear, defaultInflation = 5.0) {
  try {
    console.log(`Calculating cumulative inflation since ${baseYear}...`);
    const response = await axios.get(
      'https://api.worldbank.org/v2/country/IN/indicator/FP.CPI.TOTL.ZG?format=json&per_page=50'
    );

    let factor = 1.0;
    const currentYear = new Date().getFullYear();

    if (response.data && Array.isArray(response.data) && response.data.length > 1) {
      const dataPoints = response.data[1];

      for (let year = baseYear + 1; year <= currentYear; year++) {
        const point = dataPoints.find((p) => parseInt(p.date) === year && p.value !== null);
        let yearInflation = defaultInflation;

        if (point) {
          yearInflation = parseFloat(point.value);
        } else {
          const mostRecent = dataPoints.find((p) => p.value !== null);
          yearInflation = mostRecent ? parseFloat(mostRecent.value) : defaultInflation;
        }

        factor *= 1 + yearInflation / 100;
      }
      console.log(`✅ Success: Calculated cumulative inflation factor -> ${factor.toFixed(4)}`);
      return factor;
    }
  } catch (error) {
    console.error('❌ Failed to calculate cumulative inflation:', error.message);
  }

  const yearsPassed = Math.max(0, new Date().getFullYear() - baseYear);
  return Math.pow(1 + defaultInflation / 100, yearsPassed);
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
    const response = await axios.get(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=INDA&apikey=${apiKey}`
    );

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

  let currentData = {};
  let baseCosts = {};
  try {
    const fileContent = await fs.readFile(LATEST_DATA_PATH, 'utf-8');
    currentData = JSON.parse(fileContent);

    const baseContent = await fs.readFile(BASE_COSTS_PATH, 'utf-8');
    baseCosts = JSON.parse(baseContent);
  } catch (error) {
    console.error('❌ Could not read required json files.', error);
    process.exit(1);
  }

  // 2. Fetch fresh macro data
  const wbInflation = await fetchWorldBankInflation();
  const wbInterestRate = await fetchWorldBankInterestRate();
  const avEquityReturn = await fetchAlphaVantageEquityReturn();

  // 3. Extrapolate micro data algorithmically
  const inflationFactor = await calculateCumulativeInflationFactor(baseCosts.baseYear);

  const extrapolatedMicroCosts = {};
  for (const [key, value] of Object.entries(baseCosts.microCosts)) {
    // Round to nearest 10 for clean numbers
    extrapolatedMicroCosts[key] = Math.round((value * inflationFactor) / 10) * 10;
  }

  // 4. Merge data intelligently (only overwrite if we have a valid fetch)
  const updatedData = {
    ...currentData,
    inflation: {
      ...currentData.inflation,
      general: wbInflation !== null ? wbInflation : currentData.inflation.general
    },
    returns: {
      ...currentData.returns,
      equityBenchmark: avEquityReturn !== null ? avEquityReturn : currentData.returns.equityBenchmark
    },
    interestRates: {
      ...currentData.interestRates,
      autoLoan:
        wbInterestRate !== null ? Math.round((wbInterestRate + 0.5) * 100) / 100 : currentData.interestRates.autoLoan
    },
    microCosts: extrapolatedMicroCosts,
    fuelPrices: baseCosts.fuelPrices,
    metadata: {
      lastUpdated: new Date().toISOString(),
      inflationMultiplierApplied: inflationFactor
    }
  };

  // 5. Save back to latest.json
  try {
    await fs.writeFile(LATEST_DATA_PATH, JSON.stringify(updatedData, null, 2));
    console.log('\n✅ Successfully updated latest.json with fresh macro data.');
  } catch (error) {
    console.error('❌ Failed to save updated latest.json:', error);
    process.exit(1);
  }
}

updateMacroData();
