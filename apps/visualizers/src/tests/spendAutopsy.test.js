import { describe, expect, it } from 'vitest';

import { categorizeSpending, parseAmount, parseSpendCSV, splitCSVLine } from '../lib/spendAutopsy';

const SAMPLE_CSV = `Date,Description,Amount
2026-01-05,RENT TRANSFER LANDLORD,-25000
2026-01-06,SWIGGY FOOD ORDER,-850
2026-01-07,"AMAZON, SHOPPING",-4200
2026-01-08,MONTHLY SALARY CREDIT,150000
2026-01-09,UBER TRIP,-450
2026-01-10,NETFLIX SUBSCRIPTION,-649`;

describe('spendAutopsy CSV parsing', () => {
  it('should respect quoted fields with commas', () => {
    expect(splitCSVLine('a,"b, c",d')).toEqual(['a', 'b, c', 'd']);
  });

  it('should parse amounts with currency symbols and commas', () => {
    expect(parseAmount('₹25,000')).toBe(25000);
    expect(parseAmount('-$1,200.50')).toBe(-1200.5);
    expect(Number.isNaN(parseAmount('n/a'))).toBe(true);
  });

  it('should keep expense rows and skip income rows', () => {
    const { rows, skipped } = parseSpendCSV(SAMPLE_CSV);
    expect(rows.length).toBe(5); // salary credit skipped
    expect(skipped).toBe(1);
    expect(rows[0]).toEqual({ description: 'RENT TRANSFER LANDLORD', amount: 25000 });
    expect(rows.find((r) => r.description === 'AMAZON, SHOPPING').amount).toBe(4200);
  });

  it('should support separate debit/credit columns', () => {
    const csv = `Date,Narration,Debit,Credit
2026-01-01,GROCERY STORE,2500,
2026-01-02,SALARY,,150000`;
    const { rows } = parseSpendCSV(csv);
    expect(rows.length).toBe(1);
    expect(rows[0]).toEqual({ description: 'GROCERY STORE', amount: 2500 });
  });

  it('should reject unrecognized columns with an error', () => {
    const { rows, error } = parseSpendCSV('foo,bar\n1,2');
    expect(rows).toEqual([]);
    expect(error).toBe('unrecognized columns');
  });
});

describe('categorizeSpending', () => {
  it('should bucket rows by keyword rules', () => {
    const { rows } = parseSpendCSV(SAMPLE_CSV);
    const { destinations, total } = categorizeSpending(rows);

    const byLabel = Object.fromEntries(destinations.map((d) => [d.label, d.amount]));
    expect(byLabel['Rent / EMI']).toBe(25000);
    expect(byLabel['Groceries & Food']).toBe(850);
    expect(byLabel['Shopping']).toBe(4200);
    expect(byLabel['Travel & Commute']).toBe(450);
    expect(byLabel['Subscriptions']).toBe(649);
    expect(total).toBe(25000 + 850 + 4200 + 450 + 649);
  });

  it('should collect unknown merchants as Uncategorized', () => {
    const { destinations, uncategorizedCount } = categorizeSpending([
      { description: 'MYSTERY MERCHANT XYZ', amount: 1000 }
    ]);
    expect(destinations.length).toBe(1);
    expect(destinations[0].label).toBe('Uncategorized');
    expect(uncategorizedCount).toBe(1);
  });
});
