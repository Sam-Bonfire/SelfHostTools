import React, { useState, useMemo, useRef } from 'react';
import { Card, Input, Button, Checkbox, CalculatorHeader, CalculatorLayout, ResultsAnalysis, DownloadButtons, Footer } from '@packages/styling';
import { SEO } from '@packages/components';
import { Calendar, Settings, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';

// Helper to merge classes
function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const PHASES = {
    CHILDHOOD: { start: 0, end: 18, color: 'bg-blue-400', label: 'Childhood' },
    CAREER: { start: 18, end: 65, color: 'bg-yellow-400', label: 'Career' },
    RETIREMENT: { start: 65, end: 90, color: 'bg-purple-400', label: 'Retirement' },
};

export default function MementoMori() {
    const [birthDate, setBirthDate] = useState('1990-01-01');
    const [lifeExpectancy, setLifeExpectancy] = useState(90);

    // Freedom Mode Inputs
    const [freedomMode, setFreedomMode] = useState(false);
    const [sleepHours, setSleepHours] = useState(8);
    const [workHours, setWorkHours] = useState(40);
    const [choreHours, setChoreHours] = useState(2);

    const gridRef = useRef(null);

    const weeksData = useMemo(() => {
        const start = new Date(birthDate);
        const now = new Date();
        const totalWeeks = lifeExpectancy * 52;
        const weeksList = [];

        const weeklySleep = sleepHours * 7;
        const weeklyChores = choreHours * 7;
        const weeklyWork = workHours;

        const baseCommittedHours = weeklySleep + weeklyChores;
        const careerCommittedHours = baseCommittedHours + weeklyWork;

        const baseFreedomRatio = Math.max(0, (168 - baseCommittedHours) / 168);
        const careerFreedomRatio = Math.max(0, (168 - careerCommittedHours) / 168);

        // Stats for A11y
        let weeksPassed = 0;

        for (let i = 0; i < totalWeeks; i++) {
            const yearIndex = Math.floor(i / 52);
            const age = yearIndex;
            const weekDate = new Date(start.getTime() + i * 7 * 24 * 60 * 60 * 1000);
            const isPast = weekDate < now;
            if (isPast) weeksPassed++;

            let phase = 'RETIREMENT';
            if (age < PHASES.CHILDHOOD.end) phase = 'CHILDHOOD';
            else if (age < PHASES.CAREER.end) phase = 'CAREER';

            const isRetirementStart = i === (PHASES.CAREER.end * 52);

            let isFree = true;
            if (freedomMode && !isPast) {
                const ratio = phase === 'CAREER' ? careerFreedomRatio : baseFreedomRatio;
                const modulus = 10;
                const threshold = Math.round(ratio * modulus);
                isFree = (i % modulus) < threshold;
            }

            weeksList.push({
                index: i,
                age: (i / 52).toFixed(1),
                year: weekDate.getFullYear(),
                isPast,
                phase,
                isFree,
                isRetirementStart
            });
        }
        return { list: weeksList, stats: { totalWeeks, weeksPassed, percentPassed: ((weeksPassed / totalWeeks) * 100).toFixed(1) } };
    }, [birthDate, lifeExpectancy, freedomMode, sleepHours, workHours, choreHours]);

    const handleDownloadPDF = async () => {
        if (!gridRef.current) return;

        const canvas = await html2canvas(gridRef.current, {
            scale: 2,
            backgroundColor: '#ffffff',
            logging: false
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pdfWidth - 20; // 10mm margin
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.setFontSize(20);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Memento Mori - Life Calendar', 10, 15);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Born: ${birthDate} | Expectancy: ${lifeExpectancy} Years`, 10, 22);

        pdf.addImage(imgData, 'PNG', 10, 30, imgWidth, imgHeight);
        pdf.save('memento-mori-life-calendar.pdf');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.001 // Fast stagger for thousands of elements
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, scale: 0.8 },
        show: { opacity: 1, scale: 1 }
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
            <SEO
                title="Memento Mori Life Calendar"
                description="Visualize your life in weeks. A stoic tool to remind you of the passing of time and the urgency of life."
                keywords="memento mori, life calendar, weeks of your life, stoicism, life visualizer"
                canonical={`${import.meta.env.VITE_SITE_URL}/memento-mori`}
            />

            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader
                        icon={Calendar}
                        title="Memento Mori"
                        subtitle="Your life in weeks. Visualize what has passed and what remains."
                    />
                </div>

                {/* LEFT: Configuration */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <Card className="p-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="bg-yellow-300 p-4 border-b-4 border-black flex justify-between items-center">
                            <h2 className="text-lg font-bold flex items-center gap-2 text-black">
                                <Settings className="w-5 h-5" />
                                Configuration
                            </h2>
                        </div>
                        <div className="p-6 space-y-5">

                            {/* Basic Inputs */}
                            <div>
                                <label htmlFor="birthDate" className="block text-[10px] font-black uppercase mb-1">Birth Date</label>
                                <div className="relative">
                                    <Input
                                        id="birthDate"
                                        type="date"
                                        value={birthDate}
                                        onChange={(e) => setBirthDate(e.target.value)}
                                        className="font-black"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="lifeExpectancy" className="block text-[10px] font-black uppercase mb-1">Life Expectancy</label>
                                <div className="relative">
                                    <Input
                                        id="lifeExpectancy"
                                        type="number"
                                        value={lifeExpectancy}
                                        onChange={(e) => setLifeExpectancy(Number(e.target.value))}
                                        className="font-black"
                                    />
                                </div>
                                <input id="lifeExpectancyRange" type="range" min={50} max={120} value={lifeExpectancy} onChange={(e) => setLifeExpectancy(Number(e.target.value))} className="w-full mt-3 h-2 bg-gray-200 appearance-none cursor-pointer accent-black" aria-label="Life Expectancy Slider" />
                            </div>

                            {/* Freedom Mode Toggle */}
                            <div className="pt-4 border-t-2 border-black/10 space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <Checkbox id="freedomModeToggle" checked={freedomMode} onChange={(e) => setFreedomMode(e.target.checked)} />
                                    <div className="flex-1">
                                        <span className="text-xs font-black uppercase">Enable "True Freedom" Mode</span>
                                        <p className="text-[9px] font-bold text-gray-400 uppercase leading-none">Visualize actual free time after sleep & work</p>
                                    </div>
                                </label>

                                {freedomMode && (
                                    <div className="pl-8 space-y-4">
                                        <div className="p-4 bg-gray-50 border-2 border-dashed border-gray-300">
                                            <div className="space-y-3">
                                                <div>
                                                    <label htmlFor="sleepHours" className="block text-[10px] font-bold uppercase mb-1">Sleep (Hrs/Day)</label>
                                                    <Input id="sleepHours" type="number" value={sleepHours} onChange={(e) => setSleepHours(Number(e.target.value))} className="h-8 font-black bg-white" />
                                                </div>
                                                <div>
                                                    <label htmlFor="workHours" className="block text-[10px] font-bold uppercase mb-1">Work (Hrs/Week)</label>
                                                    <Input id="workHours" type="number" value={workHours} onChange={(e) => setWorkHours(Number(e.target.value))} className="h-8 font-black bg-white" />
                                                    <p className="text-[9px] text-gray-500 mt-1">*Career phase only</p>
                                                </div>
                                                <div>
                                                    <label htmlFor="choreHours" className="block text-[10px] font-bold uppercase mb-1">Commute/Chores (Hrs/Day)</label>
                                                    <Input id="choreHours" type="number" value={choreHours} onChange={(e) => setChoreHours(Number(e.target.value))} className="h-8 font-black bg-white" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="pt-4 border-t-2 border-black/10">
                                <p className="text-[10px] font-black uppercase mb-3">Legend</p>
                                <div className="flex flex-wrap gap-3 text-[10px] font-bold uppercase" aria-hidden="true">
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-black"></div> Passed</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-400"></div> Childhood</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400"></div> Career</div>
                                    <div className="flex items-center gap-1"><div className="w-3 h-3 bg-purple-400"></div> Retirement</div>
                                    {freedomMode && <div className="flex items-center gap-1"><div className="w-3 h-3 bg-gray-300 border border-gray-400"></div> Committed</div>}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-4">
                                <DownloadButtons onDownloadPDF={handleDownloadPDF} />
                            </div>

                        </div>
                    </Card>
                </div>

                {/* RIGHT: Visualizer (Results) */}
                <div className="lg:col-span-12 xl:col-span-8">
                    {/* Sr-Only Summary */}
                    <div className="sr-only" role="status" aria-live="polite">
                        You have lived {weeksData.stats.weeksPassed} weeks, which is {weeksData.stats.percentPassed}% of your estimated {lifeExpectancy} years.
                    </div>

                    <ResultsAnalysis>
                        <Card className="p-0 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                            <div className="bg-black p-4 border-b-4 border-black flex justify-between items-center text-white">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Life Timeline
                                </h2>
                                <span className="text-xs font-mono font-bold">{weeksData.stats.percentPassed}% COMPLETE</span>
                            </div>

                            <div ref={gridRef} className="bg-white p-4 md:p-6">
                                {/* Grid Title for Print */}
                                <div className="hidden print:block mb-4 text-center">
                                    <h1 className="text-3xl font-black uppercase">Memento Mori</h1>
                                    <p>Weeks of your life</p>
                                </div>

                                <motion.div
                                    className="flex flex-wrap gap-[2px] md:gap-[3px] justify-start content-start"
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {weeksData.list.map((week) => {
                                        let bgColor = 'bg-gray-100';

                                        if (week.isPast) {
                                            bgColor = 'bg-black';
                                        } else {
                                            if (freedomMode && !week.isFree) {
                                                bgColor = 'bg-gray-200/50';
                                            } else {
                                                if (week.phase === 'CHILDHOOD') bgColor = PHASES.CHILDHOOD.color;
                                                if (week.phase === 'CAREER') bgColor = PHASES.CAREER.color;
                                                if (week.phase === 'RETIREMENT') bgColor = PHASES.RETIREMENT.color;
                                            }
                                        }

                                        // Do not animate future weeks to save resources, only animate past
                                        const isAnimated = week.isPast;

                                        return (
                                            <React.Fragment key={week.index}>
                                                {week.isRetirementStart && (
                                                    <div className="w-full h-4 bg-red-600 my-1 relative basis-full flex items-center justify-center overflow-hidden border-y-2 border-black">
                                                        <div className="absolute inset-0 text-black text-[10px] font-black uppercase tracking-widest flex items-center justify-center">
                                                            RETIREMENT BEGINS • RETIREMENT BEGINS • RETIREMENT BEGINS
                                                        </div>
                                                    </div>
                                                )}

                                                <motion.div
                                                    variants={isAnimated ? itemVariants : {}}
                                                    className={cn(
                                                        "w-[8px] h-[8px] sm:w-[10px] sm:h-[10px] border-[0.5px] border-none",
                                                        week.isPast ? "bg-black" : "",
                                                        bgColor
                                                    )}
                                                    title={`Age: ${week.age} | Year: ${week.year} | Phase: ${week.phase}`}
                                                    role="img"
                                                    aria-label={`Age ${week.age}, ${week.isPast ? 'Passed' : 'Future'}`}
                                                >
                                                </motion.div>
                                            </React.Fragment>
                                        );
                                    })}
                                </motion.div>
                            </div>
                        </Card>
                    </ResultsAnalysis>
                </div>
            </CalculatorLayout>
        
      <Footer />
    </div>
    );
}
