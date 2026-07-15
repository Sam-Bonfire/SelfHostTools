import { describe, expect, it } from 'vitest';

import { calculateTDEE } from '../lib/tdeeLogic';

describe('calculateTDEE', () => {
  it('calculates correctly for a sedentary male (Metric)', () => {
    // 25 male, 180cm, 75kg
    // BMR = (10*75) + (6.25*180) - (5*25) + 5
    // BMR = 750 + 1125 - 125 + 5 = 1755
    // TDEE = 1755 * 1.2 = 2106
    const result = calculateTDEE({
      gender: 'male',
      age: 25,
      weight: 75,
      weightUnit: 'kg',
      height: 180,
      heightUnit: 'cm',
      activityLevel: 1.2
    });

    expect(result.maintenance).toBe(2106);
    expect(result.bmr).toBe(1755);
    expect(result.weightLoss).toBe(1606);
    expect(result.bulking).toBe(2606);
  });

  it('calculates correctly for a lightly active female (Imperial)', () => {
    // 30 female, 5ft 4in (162.56 cm), 130lbs (58.967 kg)
    // BMR = (10 * 58.967) + (6.25 * 162.56) - (5 * 30) - 161
    // BMR = 589.67 + 1016 - 150 - 161 = 1294.67 -> 1295
    // TDEE = 1295 * 1.375 = 1780.625 -> 1781

    const result = calculateTDEE({
      gender: 'female',
      age: 30,
      weight: 130,
      weightUnit: 'lbs',
      height: { ft: 5, in: 4 },
      heightUnit: 'ft',
      activityLevel: 1.375
    });

    // Allowing small rounding difference due to float precision
    expect(Math.abs(result.bmr - 1295)).toBeLessThanOrEqual(1);
    expect(Math.abs(result.maintenance - 1781)).toBeLessThanOrEqual(2);
  });

  it('returns zeros for invalid inputs', () => {
    const result = calculateTDEE({
      gender: 'male',
      age: 0,
      weight: 0,
      weightUnit: 'kg',
      height: 0,
      heightUnit: 'cm',
      activityLevel: 1.2
    });

    expect(result.maintenance).toBe(0);
  });
});
