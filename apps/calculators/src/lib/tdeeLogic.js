export const calculateTDEE = ({
    gender, // 'male' | 'female'
    age,
    weight,
    weightUnit, // 'kg' | 'lbs'
    height, // number (cm) or { ft, in }
    heightUnit, // 'cm' | 'ft'
    activityLevel, // multiplier
    useBodyFat = false,
    bodyFat = 0,
    goalWeight = 0
}) => {
    // 1. Normalize Weight to kg
    let weightKg = parseFloat(weight) || 0;
    if (weightUnit === 'lbs') {
        weightKg = weightKg * 0.45359237; // Exact conversion
    }

    // 2. Normalize Height to cm
    let heightCm = 0;
    if (heightUnit === 'ft') {
        // Expect height to be an object { ft, in }
        const ft = parseFloat(height?.ft) || 0;
        const inch = parseFloat(height?.in) || 0;
        heightCm = ((ft * 12) + inch) * 2.54;
    } else {
        heightCm = parseFloat(height) || 0;
    }

    const ageVal = parseFloat(age) || 0;
    const activity = parseFloat(activityLevel) || 1.2;
    const bodyFatVal = parseFloat(bodyFat) || 0;

    // Prevent negative/zero calculations if inputs are invalid
    if (weightKg <= 0 || heightCm <= 0 || ageVal <= 0) {
        return {
            bmr: 0,
            maintenance: 0,
            weightLoss: 0,
            extremeLoss: 0,
            bulking: 0,
            weeksToGoal: 0,
            goalDifference: 0
        };
    }

    let bmr = 0;

    // 3. Choose Formula
    if (useBodyFat && bodyFatVal > 0) {
        // Katch-McArdle Formula (Based on Lean Body Mass)
        // BMR = 370 + (21.6 * Lean Body Mass in kg)
        const leanMassKg = weightKg * (1 - (bodyFatVal / 100));
        bmr = 370 + (21.6 * leanMassKg);
    } else {
        // Mifflin-St Jeor Formula (Standard)
        // Men: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
        // Women: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
        bmr = (10 * weightKg) + (6.25 * heightCm) - (5 * ageVal);
        if (gender === 'male') {
            bmr += 5;
        } else {
            bmr -= 161;
        }
    }

    // 4. Calculate TDEE
    const tdee = bmr * activity;

    // 5. Goal Timeline Logic
    let weeksToGoal = 0;
    let goalDifference = 0;

    let goalWeightFloat = parseFloat(goalWeight) || 0;
    if (goalWeightFloat > 0) {
        let goalWeightKg = goalWeightFloat;
        if (weightUnit === 'lbs') {
            goalWeightKg = goalWeightKg * 0.45359237;
        }

        goalDifference = weightKg - goalWeightKg;
        // 1kg fat = ~7700 kcal. Daily swing 500 = 3500/week
        // Rate = ~0.454 kg / week
        const weeklyChangeKg = 3500 / 7700;

        weeksToGoal = Math.abs(goalDifference) / weeklyChangeKg;
    }

    return {
        bmr: Math.round(bmr),
        maintenance: Math.round(tdee),
        weightLoss: Math.round(tdee - 500),
        extremeLoss: Math.round(tdee - 1000),
        bulking: Math.round(tdee + 500),
        weeksToGoal: Math.round(weeksToGoal * 10) / 10,
        goalDifference: Math.round(goalDifference * 10) / 10 // Positive = Need to Lose, Negative = Need to Gain
    };
};
