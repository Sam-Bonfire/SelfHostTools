/**
 * Spend Autopsy: bank-statement CSV -> Sankey destinations.
 * Parses quoted CSVs, sniffs date/description/amount columns by header name,
 * keeps expense rows only, and buckets them by keyword rules.
 */

const PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4',
  '#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#6366f1'
];

export const DEFAULT_CATEGORY_RULES = [
  { label: 'Rent / EMI', keywords: ['rent', 'emi', 'landlord', 'housing'] },
  { label: 'Groceries & Food', keywords: ['grocery', 'supermarket', 'swiggy', 'zomato', 'restaurant', 'food', 'blinkit', 'zepto'] },
  { label: 'Subscriptions', keywords: ['netflix', 'spotify', 'prime', 'subscription', 'hotstar', 'youtube'] },
  { label: 'Travel & Commute', keywords: ['uber', 'ola', 'irctc', 'indigo', 'airline', 'fuel', 'petrol', 'metro', 'cab'] },
  { label: 'Shopping', keywords: ['amazon', 'flipkart', 'myntra', 'shopping', 'mall', 'store'] },
  { label: 'Utilities & Bills', keywords: ['electricity', 'water', 'gas', 'mobile', 'recharge', 'broadband', 'jio', 'airtel'] },
  { label: 'Health', keywords: ['pharmacy', 'hospital', 'clinic', 'doctor', 'apollo', 'medplus'] },
  { label: 'Investments', keywords: ['zerodha', 'groww', 'mutual fund', 'sip', 'upstox', 'deposit'] }
];

/** Split one CSV line respecting double-quoted fields. */
export function splitCSVLine(line) {
  const fields = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  fields.push(cur.trim());
  return fields;
}

const HEADER_ALIASES = {
  date: ['date', 'txn date', 'transaction date', 'posted', 'value date'],
  desc: ['description', 'narration', 'particulars', 'details', 'merchant', 'payee'],
  amount: ['amount', 'debit', 'withdrawal', 'paid'],
  credit: ['credit', 'deposit', 'received']
};

function findCol(headers, keys) {
  const lower = headers.map((h) => h.toLowerCase());
  for (const key of keys) {
    const idx = lower.findIndex((h) => h === key || h.includes(key));
    if (idx !== -1) return idx;
  }
  return -1;
}

export function parseAmount(raw) {
  if (raw === null || raw === undefined) return NaN;
  const cleaned = String(raw).replace(/[₹$,\s]/g, '').replace(/[()]/g, (m) => (m === '(' ? '-' : ''));
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

/** Parse CSV text into { description, amount } expense rows. */
export function parseSpendCSV(text) {
  const lines = String(text || '')
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length < 2) return { rows: [], skipped: 0, totalLines: lines.length };

  const headers = splitCSVLine(lines[0]);
  const descCol = findCol(headers, HEADER_ALIASES.desc);
  const amountCol = findCol(headers, HEADER_ALIASES.amount);
  const creditCol = findCol(headers, HEADER_ALIASES.credit);

  if (descCol === -1 || (amountCol === -1 && creditCol === -1)) {
    return { rows: [], skipped: lines.length - 1, totalLines: lines.length, error: 'unrecognized columns' };
  }

  const rows = [];
  let skipped = 0;
  // A debit/withdrawal column holds unsigned expenses; a generic amount
  // column holds signed values where positives are income.
  const unsignedDebit = amountCol !== -1 && /debit|withdrawal|paid|expense/i.test(headers[amountCol]);
  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i]);
    const desc = (fields[descCol] || '').trim();
    const amount = amountCol !== -1 ? parseAmount(fields[amountCol]) : NaN;

    if (!desc || !Number.isFinite(amount) || amount === 0) {
      skipped++;
      continue;
    }
    if (!unsignedDebit && amount > 0) {
      skipped++; // income in a signed amount column
      continue;
    }
    rows.push({ description: desc, amount: Math.abs(amount) });
  }
  return { rows, skipped, totalLines: lines.length };
}

/** Bucket expense rows into Sankey destinations. */
export function categorizeSpending(rows, rules = DEFAULT_CATEGORY_RULES) {
  const totals = new Map();
  let uncategorized = 0;
  let uncategorizedCount = 0;

  for (const row of rows) {
    const hay = row.description.toLowerCase();
    const rule = rules.find((r) => r.keywords.some((k) => hay.includes(k)));
    if (rule) {
      totals.set(rule.label, (totals.get(rule.label) || 0) + row.amount);
    } else {
      uncategorized += row.amount;
      uncategorizedCount++;
    }
  }

  const destinations = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([label, amount], i) => ({
      id: `csv-${Date.now()}-${i}`,
      label,
      amount: Math.round(amount),
      color: PALETTE[i % PALETTE.length]
    }));

  if (uncategorized > 0) {
    destinations.push({
      id: `csv-${Date.now()}-other`,
      label: 'Uncategorized',
      amount: Math.round(uncategorized),
      color: '#9ca3af'
    });
  }

  return { destinations, uncategorizedCount, total: Math.round([...totals.values()].reduce((s, v) => s + v, 0) + uncategorized) };
}
