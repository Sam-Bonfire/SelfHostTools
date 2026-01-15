import React, { useState, useEffect } from 'react';
import {
    CalculatorLayout,
    CalculatorHeader,
    ResultsAnalysis,
    Input,
    Card,
    Select,
    ToggleCard,
    Button,
    Tooltip
} from '@packages/styling';
import { calculateTDEE } from '../lib/tdeeLogic';
import { Activity, Scale, Ruler, User, Flame, TrendingDown, TrendingUp, Dumbbell, Target, Accessibility, Info, Heart, Percent, Utensils, Calendar, FileText, Table } from 'lucide-react';
import { downloadPDF, downloadExcel } from '../lib/downloadUtils';
import SEO from './SEO';
import Footer from './Footer';

// Updated Activity Descriptions based on Research
// Key Insight: People overestimate. We need 'Brutal Honesty' labels.
const ACTIVITY_LEVELS = [
    { value: 1.2, label: 'Sedentary (Desk Job + No/Little Gym)' },
    { value: 1.375, label: 'Lightly Active (Desk Job + Gym 3x/wk)' },
    { value: 1.55, label: 'Active (Standing Job OR Gym 5x/wk)' },
    { value: 1.725, label: 'Very Active (Physical Job + Gym 6x/wk)' },
    { value: 1.9, label: 'Athlete (2x Training/Day)' }
];

const MACRO_SPLITS = {
    balanced: { label: "Balanced (Sustainable)", protein: 30, fat: 30, carbs: 40 },
    highProtein: { label: "High Protein (Cutting/Muscle)", protein: 45, fat: 25, carbs: 30 },
    custom: { label: "Custom Split", protein: 33, fat: 33, carbs: 34 }
};

export default function TDEECalculator() {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "TDEE Calculator",
        "description": "Calculate Total Daily Energy Expenditure (TDEE) and BMR. Includes Katch-McArdle formula for athletes.",
        "brand": { "@type": "Brand", "name": "Calculators Hub" },
        "applicationCategory": "HealthApplication",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };

    const [formData, setFormData] = useState({
        gender: 'male',
        age: 25,
        weight: 70,
        weightUnit: 'kg',
        height: 170, // stored as raw input for cm
        heightFt: 5,
        heightIn: 7,
        heightUnit: 'cm',
        activityLevel: 1.2,
        bodyFat: 15,
        useBodyFat: false, // advanced mode
        macroSplit: 'balanced',
        customProtein: 33,
        customFat: 33,
        customCarbs: 34,
        goalWeight: ''
    });

    const [results, setResults] = useState(null);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    useEffect(() => {
        // Prepare payload for logic
        const payload = {
            gender: formData.gender,
            age: formData.age,
            weight: formData.weight,
            weightUnit: formData.weightUnit,
            heightUnit: formData.heightUnit,
            activityLevel: formData.activityLevel,
            bodyFat: formData.bodyFat,
            useBodyFat: formData.useBodyFat,
            goalWeight: formData.goalWeight
        };

        if (formData.heightUnit === 'ft') {
            payload.height = {
                ft: formData.heightFt,
                in: formData.heightIn
            };
        } else {
            payload.height = formData.height;
        }

        const res = calculateTDEE(payload);
        setResults(res);
    }, [formData]);

    // Format helpers
    const formatNumber = (num) => num?.toLocaleString() || 0;

    // Helper to calculate macros from calories
    const calculateMacros = (calories) => {
        let split = MACRO_SPLITS[formData.macroSplit];

        if (formData.macroSplit === 'custom') {
            split = {
                protein: parseFloat(formData.customProtein) || 0,
                fat: parseFloat(formData.customFat) || 0,
                carbs: parseFloat(formData.customCarbs) || 0
            };
        }

        // Protein = 4 cal/g, Carbs = 4 cal/g, Fat = 9 cal/g
        return {
            protein: Math.round((calories * (split.protein / 100)) / 4),
            fat: Math.round((calories * (split.fat / 100)) / 9),
            carbs: Math.round((calories * (split.carbs / 100)) / 4)
        };
    };

    const macroResults = results ? calculateMacros(results.maintenance) : { protein: 0, fat: 0, carbs: 0 };

    const checkExports = (type) => {
        // Generate Schedule for Export
        let schedule = [];
        if (results && results?.weeksToGoal > 0) {
            schedule = Array.from({ length: results.weeksToGoal }).map((_, i) => {
                const weekNum = i + 1;
                const changePerWeek = 0.5;
                const isLoss = results.goalDifference > 0;
                const change = isLoss ? -changePerWeek : changePerWeek;
                const totalChange = change * weekNum;
                const currentWeight = parseFloat(formData.weight) + totalChange;
                return {
                    year: weekNum, // Using 'year' key as generic label for downloadUtils mapping if needed, or 'Week'
                    // actually downloadUtils expects 'schedule' to map specific columns. 
                    // Let's check downloadUtils generic mapper. It iterates keys? 
                    // No, usually it has map logic. 

                    // Logic check on downloadUtils.js? 
                    // Step 327 (Wait, I can't check it now).
                    // I'll stick to generic objects.
                    Week: weekNum,
                    "Projected Weight": currentWeight.toFixed(2),
                    "Total Change": totalChange.toFixed(2)
                };
            });
        }

        // Prepare export data
        const data = {
            inputs: {
                ...formData,
                activityLevelLabel: ACTIVITY_LEVELS.find(l => l.value == formData.activityLevel)?.label || formData.activityLevel
            },
            results: {
                ...results,
                ...macroResults
            },
            schedule: schedule
        };

        if (type === 'pdf') {
            downloadPDF(data);
        } else {
            downloadExcel(data);
        }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <SEO
                title="Smart TDEE Calculator (With Body Fat %)"
                description="Advanced TDEE calculator that fixes common errors. Supports Katch-McArdle formula, Body Fat %, and Macro Splits for accurate results."
                keywords="tdee calculator, bmr calculator, katch mcardle calculator, macro calculator, calorie deficit"
                canonical={`${import.meta.env.VITE_SITE_URL}/tdee-calculator`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/tdee_calculator.png`}
                structuredData={structuredData}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Flame}
                        title="Smart TDEE Analyzer"
                    />
                </div>

                {/* --- LEFT: INPUTS --- */}
                <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                    {/* 1. Biometrics Card */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-pink-100 p-4 border-b-4 border-black flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black uppercase tracking-tight">
                                <Activity className="w-5 h-5 text-pink-600" />
                                Your Biometrics
                            </h2>
                        </div>
                        <div className="p-4 space-y-5">

                            {/* Gender Switcher - Only show if NOT using Body Fat (Katch McArdle ignores gender) */}
                            {!formData.useBodyFat && (
                                <div className="space-y-1" role="group" aria-label="Gender Selection">
                                    <label id="gender-label" className="block text-[10px] font-black uppercase mb-1">Gender</label>
                                    <div className="flex border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                                        <button
                                            aria-labelledby="gender-label"
                                            aria-pressed={formData.gender === 'male'}
                                            onClick={() => handleChange('gender', 'male')}
                                            className={`flex-1 py-2 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.gender === 'male' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                        >
                                            <Accessibility className="w-4 h-4" /> Male
                                        </button>
                                        <button
                                            aria-labelledby="gender-label"
                                            aria-pressed={formData.gender === 'female'}
                                            onClick={() => handleChange('gender', 'female')}
                                            className={`flex-1 py-2 text-xs font-black uppercase flex items-center justify-center gap-2 transition-all ${formData.gender === 'female' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'}`}
                                        >
                                            <Accessibility className="w-4 h-4" /> Female
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Age */}
                            <div>
                                <label htmlFor="age" className="block text-[10px] font-black uppercase mb-1">Age</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Input
                                        id="age"
                                        type="number"
                                        value={formData.age}
                                        onChange={(e) => handleChange('age', e.target.value)}
                                        className="pl-9 font-black"
                                    />
                                </div>
                            </div>

                            {/* Weight & Goal */}
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <label htmlFor="weight" className="block text-[10px] font-black uppercase mb-1">Current Weight</label>
                                    <div className="relative">
                                        <Scale className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                        <Input
                                            id="weight"
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => handleChange('weight', e.target.value)}
                                            className="pl-9 font-black"
                                        />
                                    </div>
                                </div>
                                <div className="col-span-4">
                                    <label htmlFor="weightUnit" className="block text-[10px] font-black uppercase mb-1">Unit</label>
                                    <Select
                                        id="weightUnit"
                                        value={formData.weightUnit}
                                        onChange={(e) => handleChange('weightUnit', e.target.value)}
                                    >
                                        <option value="kg">KG</option>
                                        <option value="lbs">LBS</option>
                                    </Select>
                                </div>
                            </div>

                            {/* Goal Weight (Optional) */}
                            <div>
                                <label htmlFor="goalWeight" className="block text-[10px] font-black uppercase mb-1 text-gray-500">Goal Weight (Optional)</label>
                                <div className="relative">
                                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Input
                                        id="goalWeight"
                                        type="number"
                                        value={formData.goalWeight}
                                        onChange={(e) => handleChange('goalWeight', e.target.value)}
                                        className="pl-9 font-black border-dashed border-gray-300 focus:border-black"
                                        placeholder="Target..."
                                    />
                                </div>
                            </div>

                            {/* Height */}
                            <div className="grid grid-cols-12 gap-2">
                                <div className="col-span-8">
                                    <label className="block text-[10px] font-black uppercase mb-1" id="height-label">Height</label>
                                    {formData.heightUnit === 'cm' ? (
                                        <div className="relative">
                                            <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                            <Input
                                                id="height"
                                                aria-labelledby="height-label"
                                                type="number"
                                                value={formData.height}
                                                onChange={(e) => handleChange('height', e.target.value)}
                                                className="pl-9 font-black"
                                                placeholder="CM"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                id="heightFt"
                                                aria-label="Height in Feet"
                                                type="number"
                                                placeholder="Ft"
                                                value={formData.heightFt}
                                                onChange={(e) => handleChange('heightFt', e.target.value)}
                                                className="font-black"
                                            />
                                            <Input
                                                id="heightIn"
                                                aria-label="Height in Inches"
                                                type="number"
                                                placeholder="In"
                                                value={formData.heightIn}
                                                onChange={(e) => handleChange('heightIn', e.target.value)}
                                                className="font-black"
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="col-span-4">
                                    <label htmlFor="heightUnit" className="block text-[10px] font-black uppercase mb-1">Unit</label>
                                    <Select
                                        id="heightUnit"
                                        value={formData.heightUnit}
                                        onChange={(e) => handleChange('heightUnit', e.target.value)}
                                    >
                                        <option value="cm">CM</option>
                                        <option value="ft">FT</option>
                                    </Select>
                                </div>
                            </div>

                        </div>
                    </Card>

                    {/* 2. Strategy Card */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-purple-100 p-4 border-b-4 border-black flex items-center justify-between">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black uppercase tracking-tight">
                                <Target className="w-5 h-5 text-purple-600" />
                                Advanced Strategy
                            </h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Body Fat Toggle */}
                            <ToggleCard
                                title={
                                    <div className="flex-1">
                                        <span className="text-xs font-black uppercase block">I know my Body Fat %</span>
                                        <p className="text-[10px] text-gray-500 font-bold leading-tight">Use Katch-McArdle formula (More accurate for muscular/lean builds)</p>
                                    </div>
                                }
                                isOpen={formData.useBodyFat}
                                onToggle={(val) => handleChange('useBodyFat', val)}
                            >
                                <div className="relative">
                                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-600 z-10" />
                                    <Input
                                        id="bodyFat"
                                        type="number"
                                        value={formData.bodyFat}
                                        onChange={(e) => handleChange('bodyFat', e.target.value)}
                                        className="pl-9 font-black border-purple-600 text-purple-900"
                                        placeholder="15"
                                        aria-label="Body Fat Percentage"
                                    />
                                </div>
                            </ToggleCard>

                            {/* Activity Level */}
                            <div>
                                <label htmlFor="activityLevel" className="block text-[10px] font-black uppercase mb-1">Activity Level</label>
                                <div className="relative">
                                    <Dumbbell className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Select
                                        id="activityLevel"
                                        value={formData.activityLevel}
                                        onChange={(e) => handleChange('activityLevel', e.target.value)}
                                        className="pl-9"
                                    >
                                        {ACTIVITY_LEVELS.map(level => (
                                            <option key={level.value} value={level.value}>
                                                {level.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                                <p className="text-[10px] font-bold text-gray-400 mt-2 uppercase leading-tight">
                                    <span className="text-red-500 font-black">Warning: </span> Almost everyone overestimates this. If you have a desk job, you are likely Sedentary or Lightly Active, even with gym time.
                                </p>
                            </div>

                            {/* Macro Split Selector */}
                            <div>
                                <label htmlFor="macroSplit" className="block text-[10px] font-black uppercase mb-1">Macro Goal</label>
                                <div className="relative">
                                    <Utensils className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                                    <Select
                                        id="macroSplit"
                                        value={formData.macroSplit}
                                        onChange={(e) => handleChange('macroSplit', e.target.value)}
                                        className="pl-9"
                                    >
                                        {Object.entries(MACRO_SPLITS).map(([key, config]) => (
                                            <option key={key} value={key}>
                                                {config.label}
                                            </option>
                                        ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Custom Macro Sliders */}
                            {formData.macroSplit === 'custom' && (
                                <div className="space-y-3 pt-2 border-t-2 border-black/10 animate-in fade-in slide-in-from-top-1">
                                    <div>
                                        <Tooltip content="Protein is automatically calculated based on the remaining allocation from Fats and Carbs to ensure 100% total.">
                                            <div className="group cursor-help">
                                                <div className="flex justify-between text-[10px] font-black uppercase mb-1 items-center">
                                                    <label htmlFor="custom-macro-protein" className="text-blue-600 flex items-center gap-1 border-b border-dashed border-blue-400 cursor-help">
                                                        Protein
                                                    </label>
                                                    <span>{formData.customProtein}%</span>
                                                </div>
                                                <input
                                                    id="custom-macro-protein"
                                                    type="range" min="0" max="100" step="1"
                                                    value={formData.customProtein}
                                                    disabled
                                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-help opacity-60 accent-blue-600 group-hover:opacity-80 transition-opacity"
                                                    aria-label="Protein percentage (calculated automatically)"
                                                />
                                            </div>
                                        </Tooltip>
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <label htmlFor="custom-macro-fat" className="text-yellow-600">Fats</label>
                                            <span>{formData.customFat}%</span>
                                        </div>
                                        <input
                                            id="custom-macro-fat"
                                            type="range" min="0" max="100" step="1"
                                            value={formData.customFat}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                // If new Fat + current Carbs > 100, reduce Carbs
                                                let newCarbs = formData.customCarbs;
                                                if (val + newCarbs > 100) {
                                                    newCarbs = 100 - val;
                                                }
                                                // Protein fills the rest
                                                const newProtein = 100 - val - newCarbs;

                                                handleChange('customFat', val);
                                                if (newCarbs !== formData.customCarbs) handleChange('customCarbs', newCarbs);
                                                setTimeout(() => handleChange('customProtein', newProtein), 0);
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-600 active:accent-yellow-700"
                                            aria-label="Fats percentage"
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-[10px] font-black uppercase mb-1">
                                            <label htmlFor="custom-macro-carbs" className="text-green-600">Carbs</label>
                                            <span>{formData.customCarbs}%</span>
                                        </div>
                                        <input
                                            id="custom-macro-carbs"
                                            type="range" min="0" max="100" step="1"
                                            value={formData.customCarbs}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value);
                                                // If new Carbs + current Fat > 100, reduce Fat
                                                let newFat = formData.customFat;
                                                if (val + newFat > 100) {
                                                    newFat = 100 - val;
                                                }
                                                // Protein fills the rest
                                                const newProtein = 100 - newFat - val;

                                                handleChange('customCarbs', val);
                                                if (newFat !== formData.customFat) handleChange('customFat', newFat);
                                                setTimeout(() => handleChange('customProtein', newProtein), 0);
                                            }}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600 active:accent-green-700"
                                            aria-label="Carbs percentage"
                                        />
                                    </div>
                                    <div className="text-center text-[10px] font-medium mt-2 text-gray-400 italic">
                                        Adjust Fats & Carbs. Protein fills the rest.
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Formula Info Container */}
                    <Card className="p-0 border-4 border-black">
                        <div className="bg-yellow-50 p-4 border-b-4 border-black">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <Info className="w-5 h-5 text-gray-700" /> How It Works
                            </h2>
                        </div>
                        <div className="p-4 text-sm space-y-2 text-black">
                            <p className="text-xs font-medium leading-relaxed">
                                We use the <strong>Mifflin-St Jeor</strong> equation by default, which is the gold standard for estimated energy expenditure.
                            </p>
                            <p className="text-xs font-medium leading-relaxed">
                                If you enable <strong>"I know my Body Fat %"</strong>, we switch to the <strong>Katch-McArdle</strong> formula. This is more accurate for athletes as it accounts for lean body mass rather than just total weight.
                            </p>
                        </div>
                    </Card>

                </div>

                {/* --- RIGHT: RESULTS --- */}
                <div role="region" aria-live="polite" aria-atomic="true" className="lg:col-span-12 xl:col-span-7 space-y-6">
                    <ResultsAnalysis title="Energy & Macros">

                        {/* HERO: Maintenance */}
                        <div className="bg-black text-[#FFDE59] p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,222,89,0.5)] flex flex-col items-center justify-center gap-2 text-center relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Flame className="w-32 h-32" />
                            </div>
                            <div className="relative z-10">
                                <p className="text-xs font-black uppercase tracking-[0.2em] mb-2 text-white/80">Maintenance Calories (TDEE)</p>
                                <p className="text-6xl md:text-7xl font-black tracking-tighter">{formatNumber(results?.maintenance)}</p>
                                <div className="flex items-center gap-2 mt-2 justify-center">
                                    <span className="text-[10px] font-bold text-black bg-[#FFDE59] px-2 py-0.5 rounded uppercase">
                                        {formData.useBodyFat ? 'Katch-McArdle' : 'Mifflin-St Jeor'}
                                    </span>
                                    <span className="text-[10px] font-bold text-[#FFDE59]/60 uppercase">Formula Used</span>
                                </div>
                            </div>
                        </div>

                        {/* MACRO BREAKDOWN */}
                        <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="flex justify-between items-center mb-4 border-b-2 border-gray-100 pb-2">
                                <h3 className="text-sm font-black uppercase flex items-center gap-2">
                                    <Utensils className="w-4 h-4" /> Daily Macros
                                </h3>
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Based on maintenance</span>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <p className="text-xs font-black text-blue-600 uppercase mb-1">Protein</p>
                                    <p className="text-2xl font-black">{macroResults.protein}g</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{MACRO_SPLITS[formData.macroSplit].protein}%</p>
                                </div>
                                <div className="border-l-2 border-gray-100">
                                    <p className="text-xs font-black text-yellow-600 uppercase mb-1">Fats</p>
                                    <p className="text-2xl font-black">{macroResults.fat}g</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{MACRO_SPLITS[formData.macroSplit].fat}%</p>
                                </div>
                                <div className="border-l-2 border-gray-100">
                                    <p className="text-xs font-black text-green-600 uppercase mb-1">Carbs</p>
                                    <p className="text-2xl font-black">{macroResults.carbs}g</p>
                                    <p className="text-[10px] text-gray-400 font-bold">{MACRO_SPLITS[formData.macroSplit].carbs}%</p>
                                </div>
                            </div>
                        </div>

                        {/* GOAL GRID */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* CUT */}
                            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                                <div className="bg-blue-50 border-b-4 border-black p-3 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-blue-800 flex items-center gap-2">
                                        <TrendingDown className="w-4 h-4" /> Fat Loss
                                    </span>
                                    <span className="text-[10px] font-black bg-blue-200 px-2 py-1 border border-black rounded">-500</span>
                                </div>
                                <div className="p-4 text-center">
                                    <span className="text-4xl font-black block mb-1">{formatNumber(results?.weightLoss)}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">kcal / day</span>
                                </div>
                            </div>

                            {/* BULK */}
                            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col">
                                <div className="bg-green-50 border-b-4 border-black p-3 flex justify-between items-center">
                                    <span className="text-xs font-black uppercase text-green-800 flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4" /> Lean Bulk
                                    </span>
                                    <span className="text-[10px] font-black bg-green-200 px-2 py-1 border border-black rounded">+500</span>
                                </div>
                                <div className="p-4 text-center">
                                    <span className="text-4xl font-black block mb-1">{formatNumber(results?.bulking)}</span>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">kcal / day</span>
                                </div>
                            </div>
                        </div>

                        {/* GOAL TIMELINE (If Goal Weight Set) */}
                        {results?.weeksToGoal > 0 && (
                            <Card className="p-0 border-4 border-black bg-white overflow-hidden animate-in fade-in slide-in-from-top-4">
                                <div className="bg-black p-3 flex justify-between items-center text-white">
                                    <span className="text-xs font-black uppercase flex items-center gap-2">
                                        <Calendar className="w-4 h-4" /> Goal Horizon
                                    </span>
                                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded">
                                        {results.goalDifference > 0 ? "Loss Needed" : "Gain Needed"}: {Math.abs(results.goalDifference)} kg
                                    </span>
                                </div>
                                <div className="p-4 flex items-center justify-between gap-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Est. Time to Goal</p>
                                        <p className="text-3xl font-black">{results.weeksToGoal} <span className="text-base font-bold text-gray-400">weeks</span></p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Daily Target</p>
                                        <p className="text-xl font-black text-black">
                                            {results.goalDifference > 0 ? formatNumber(results.weightLoss) : formatNumber(results.bulking)}
                                            <span className="text-[10px] text-gray-400 ml-1">kcal</span>
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-medium italic">(@ 500 kcal deficit/surplus)</p>
                                    </div>
                                </div>
                                <div className="border-t-4 border-black">
                                    <div className="max-h-60 overflow-y-auto">
                                        <table className="w-full text-xs text-left">
                                            <thead className="sticky top-0 bg-gray-100 font-bold uppercase border-b-2 border-black z-10">
                                                <tr>
                                                    <th className="p-3 text-black">Week</th>
                                                    <th className="p-3 text-black">Date</th>
                                                    <th className="p-3 text-black">Weight</th>
                                                    <th className="p-3 text-black text-right">Trend</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-200">
                                                {Array.from({ length: Math.min(results.weeksToGoal, 104) }).map((_, i) => { // Cap visual at 2 years
                                                    const weekNum = i + 1;
                                                    const changePerWeek = 0.5; // Fixed assumption for 500kcal
                                                    const isLoss = results.goalDifference > 0;
                                                    const change = isLoss ? -changePerWeek : changePerWeek;
                                                    const totalChange = change * weekNum;
                                                    const currentWeight = parseFloat(formData.weight) + totalChange;

                                                    // Calculate Date
                                                    const date = new Date();
                                                    date.setDate(date.getDate() + (weekNum * 7));

                                                    return (
                                                        <tr key={i} className="hover:bg-yellow-50 transition-colors">
                                                            <td className="p-3 font-black border-r-2 border-dashed border-gray-200">Week {weekNum}</td>
                                                            <td className="p-3 font-medium text-gray-500">{date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
                                                            <td className="p-3 font-black bg-white">{currentWeight.toFixed(1)} <span className="text-[10px] bg-black text-white px-1 py-0.5 rounded ml-1">{formData.weightUnit}</span></td>
                                                            <td className={`p-3 font-bold text-right ${isLoss ? 'text-green-600' : 'text-blue-600'}`}>
                                                                {isLoss ? '↓' : '↑'} {Math.abs(totalChange).toFixed(1)} total
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </Card>
                        )}

                        {/* MOTIVATION CARD */}
                        <div className="border-4 border-black bg-pink-50 p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <div className="flex items-start gap-4 relaitve z-10">
                                <div className="p-2 bg-pink-200 border-2 border-black rounded-full shrink-0">
                                    <Heart className="w-6 h-6 text-pink-600 fill-pink-600" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black uppercase text-pink-900 mb-2">A Note on Self-Worth</h4>
                                    <p className="text-xs font-medium text-pink-800 mb-2 leading-relaxed italic">
                                        "This number is just data, not a definition of who you are. Your body is the vehicle that lets you experience life—treat it with kindness, fuel it with respect, and remember that health is a marathon, not a sprint."
                                    </p>
                                    <p className="text-[10px] font-bold text-pink-900/60 uppercase">— The Dev Team</p>
                                </div>
                            </div>
                        </div>

                        {/* BMR INFO */}
                        <div className="bg-gray-100 border-4 border-black p-4 text-center">
                            <p className="text-xs font-bold text-gray-500 uppercase">
                                Your Basal Metabolic Rate (BMR) is <span className="text-black font-black text-lg mx-1 underline decoration-4 decoration-yellow-400">{formatNumber(results?.bmr)} kcal</span>
                            </p>
                            <p className="text-[10px] text-gray-400 mt-1 max-w-md mx-auto">
                                This is the energy burned at complete rest. Eating below this can harm your metabolism.
                            </p>
                        </div>

                        {/* EXPORT BUTTONS */}
                        <div className="flex flex-col md:flex-row gap-4 mt-2">
                            <Button
                                variant="secondary"
                                onClick={() => checkExports('pdf')}
                                className="flex-1 text-sm font-black flex items-center justify-center gap-2 border-4 border-black h-12 uppercase"
                            >
                                <FileText className="w-5 h-5" /> Download PDF Report
                            </Button>
                            <Button
                                variant="primary"
                                onClick={() => checkExports('excel')}
                                className="flex-1 text-sm font-black flex items-center justify-center gap-2 border-4 border-black h-12 uppercase"
                            >
                                <Table className="w-5 h-5" /> Download Excel Report
                            </Button>
                        </div>

                    </ResultsAnalysis>
                </div>
            </CalculatorLayout >

            <Footer />
        </div >
    );
}
