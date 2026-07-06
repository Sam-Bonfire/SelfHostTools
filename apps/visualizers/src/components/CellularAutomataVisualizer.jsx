import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, Button, CalculatorHeader, CalculatorLayout, ResultsAnalysis, Footer } from '@packages/styling';
import { SEO } from '@packages/components';
import { Play, Pause, RotateCcw, Box, MousePointer2, FastForward } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { usePersistedState, resetPersistedState } from '@packages/components';

function cn(...inputs) {
    return twMerge(clsx(inputs));
}

const PRESETS = [
    { id: 'gol', name: "Conway's Game of Life", rule: "B3/S23", desc: "The classic simulation of life and death." },
    { id: 'replicator', name: "Replicator (Fractal)", rule: "B1357/S1357", desc: "Replaces itself, creating Sierpinski triangle patterns." },
    { id: 'highlife', name: "HighLife", rule: "B36/S23", desc: "Similar to Conway's, but features replicators." },
    { id: 'seeds', name: "Seeds", rule: "B2/S", desc: "Everything dies instantly, but pairs spawn new life." },
    { id: 'maze', name: "Maze", rule: "B3/S12345", desc: "Grows organically into maze-like structures." },
];

const CELL_SIZE = 12; // Pixel size per cell
const GRID_COLS = 60;
const GRID_ROWS = 40;

export default function CellularAutomataVisualizer() {
    const canvasRef = useRef(null);
    const [isRunning, setIsRunning] = usePersistedState('CellularAutomataVisualizer', 'isRunning', false);
    const [preset, setPreset] = usePersistedState('CellularAutomataVisualizer', 'preset', PRESETS[0]);
    const [speed, setSpeed] = usePersistedState('CellularAutomataVisualizer', 'speed', 15); // frames per second
    
    // We use refs for mutable state that doesn't need to trigger React renders
    const gridRef = useRef(new Uint8Array(GRID_COLS * GRID_ROWS));
    const nextGridRef = useRef(new Uint8Array(GRID_COLS * GRID_ROWS));
    const runningRef = useRef(isRunning);
    const speedRef = useRef(speed);
    const presetRef = useRef(preset);
    
    // Track mouse dragging
    const isDrawingRef = useRef(false);
    const brushValueRef = useRef(1); // 1 to draw, 0 to erase
    const lastCellRef = useRef({x: -1, y: -1});

    // Sync refs
    useEffect(() => { runningRef.current = isRunning; }, [isRunning]);
    useEffect(() => { speedRef.current = speed; }, [speed]);
    useEffect(() => { presetRef.current = preset; }, [preset]);

    const drawGrid = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Clear background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= GRID_COLS; x++) {
            ctx.moveTo(x * CELL_SIZE, 0);
            ctx.lineTo(x * CELL_SIZE, canvas.height);
        }
        for (let y = 0; y <= GRID_ROWS; y++) {
            ctx.moveTo(0, y * CELL_SIZE);
            ctx.lineTo(canvas.width, y * CELL_SIZE);
        }
        ctx.stroke();
        
        // Draw cells
        ctx.fillStyle = '#000000';
        const grid = gridRef.current;
        for (let i = 0; i < grid.length; i++) {
            if (grid[i]) {
                const x = i % GRID_COLS;
                const y = Math.floor(i / GRID_COLS);
                // Draw a pixelated cell with a small gap for retro feel
                ctx.fillRect(x * CELL_SIZE + 1, y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
            }
        }
    }, []);

    const clearGrid = () => {
        gridRef.current.fill(0);
        drawGrid();
        setIsRunning(false);
    };

    const randomizeGrid = () => {
        const grid = gridRef.current;
        for (let i = 0; i < grid.length; i++) {
            grid[i] = Math.random() > 0.85 ? 1 : 0;
        }
        drawGrid();
    };

    const stepSimulation = useCallback(() => {
        const grid = gridRef.current;
        const nextGrid = nextGridRef.current;
        
        const [bStr, sStr] = presetRef.current.rule.split('/');
        const bornRule = bStr.substring(1).split('').map(Number);
        const surviveRule = sStr.substring(1).split('').map(Number);
        
        for (let y = 0; y < GRID_ROWS; y++) {
            for (let x = 0; x < GRID_COLS; x++) {
                const idx = y * GRID_COLS + x;
                const isAlive = grid[idx] === 1;
                
                // Count neighbors (with wrap-around)
                let neighbors = 0;
                for (let dy = -1; dy <= 1; dy++) {
                    for (let dx = -1; dx <= 1; dx++) {
                        if (dx === 0 && dy === 0) continue;
                        
                        const nx = (x + dx + GRID_COLS) % GRID_COLS;
                        const ny = (y + dy + GRID_ROWS) % GRID_ROWS;
                        if (grid[ny * GRID_COLS + nx]) {
                            neighbors++;
                        }
                    }
                }
                
                if (isAlive) {
                    nextGrid[idx] = surviveRule.includes(neighbors) ? 1 : 0;
                } else {
                    nextGrid[idx] = bornRule.includes(neighbors) ? 1 : 0;
                }
            }
        }
        
        // Swap buffers
        gridRef.current = new Uint8Array(nextGrid);
        drawGrid();
    }, [drawGrid]);

    useEffect(() => {
        let timeoutId;
        
        const loop = () => {
            if (runningRef.current) {
                stepSimulation();
            }
            timeoutId = setTimeout(loop, 1000 / speedRef.current);
        };
        
        loop();
        
        return () => clearTimeout(timeoutId);
    }, [stepSimulation]);

    // Initial draw
    useEffect(() => {
        drawGrid();
    }, [drawGrid]);

    // Handle interaction
    const setCell = (e, isFirstClick = false) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        
        // Account for scaling (CSS size vs Canvas internal size)
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = Math.floor(((e.clientX - rect.left) * scaleX) / CELL_SIZE);
        const y = Math.floor(((e.clientY - rect.top) * scaleY) / CELL_SIZE);
        
        if (x >= 0 && x < GRID_COLS && y >= 0 && y < GRID_ROWS) {
            const idx = y * GRID_COLS + x;
            
            if (isFirstClick) {
                // Determine if we are erasing or drawing based on the first cell we click
                brushValueRef.current = gridRef.current[idx] ? 0 : 1;
            }
            
            // Optimization: avoid redrawing if we are still in the same cell
            if (lastCellRef.current.x === x && lastCellRef.current.y === y && !isFirstClick) {
                return;
            }
            
            lastCellRef.current = {x, y};
            gridRef.current[idx] = brushValueRef.current;
            drawGrid();
        }
    };

    const handlePointerDown = (e) => {
        isDrawingRef.current = true;
        setCell(e, true);
        e.target.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e) => {
        if (!isDrawingRef.current) return;
        setCell(e, false);
    };

    const handlePointerUp = (e) => {
        isDrawingRef.current = false;
        lastCellRef.current = {x: -1, y: -1};
        e.target.releasePointerCapture(e.pointerId);
    };

    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans">
            <SEO 
                title="Cellular Automata Pixel Playground"
                description="Explore Conway's Game of Life and fractal growth structures in a retro pixelated playground."
                keywords="cellular automata, game of life, conway, fractals, visualizer"
            />
            
            <CalculatorLayout>
                <div className="lg:col-span-12">
                    <CalculatorHeader 
                        icon={Box}
                        title="Cellular Automata"
                        subtitle="Pixel Playground. Place seed cells and watch fractal structures emerge."
                    
            onReset={() => { resetPersistedState('CellularAutomataVisualizer'); window.location.reload(); }} />
                </div>

                {/* LEFT: Controls */}
                <div className="lg:col-span-12 xl:col-span-4 space-y-6">
                    <Card title="Controls" icon={Box} headerColor="bg-yellow-300">
                        <div className="space-y-6">
                            
                            {/* Rules Select */}
                            <div>
                                <label className="block text-xs font-black uppercase mb-2">Ruleset</label>
                                <div className="space-y-2">
                                    {PRESETS.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setPreset(p)}
                                            className={cn(
                                                "w-full text-left p-3 border-2 border-black font-bold text-sm transition-transform",
                                                preset.id === p.id 
                                                    ? "bg-black text-white shadow-[2px_2px_0px_0px_rgba(253,224,71,1)]" 
                                                    : "bg-white hover:-translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            )}
                                        >
                                            <div className="flex justify-between items-center">
                                                <span>{p.name}</span>
                                                <span className="text-[10px] font-mono opacity-70">{p.rule}</span>
                                            </div>
                                            {preset.id === p.id && (
                                                <p className="text-[10px] mt-1 opacity-80 normal-case font-medium">
                                                    {p.desc}
                                                </p>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Speed Slider */}
                            <div>
                                <label className="block text-xs font-black uppercase mb-2">
                                    Simulation Speed: {speed} FPS
                                </label>
                                <input 
                                    type="range" 
                                    min="1" 
                                    max="60" 
                                    value={speed}
                                    onChange={(e) => setSpeed(Number(e.target.value))}
                                    className="w-full h-2 bg-gray-200 appearance-none cursor-pointer accent-black"
                                    aria-label="Simulation Speed"
                                />
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-3 pt-4 border-t-2 border-black/10">
                                <Button 
                                    onClick={() => setIsRunning(!isRunning)}
                                    className={cn(
                                        "flex justify-center items-center gap-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]",
                                        isRunning ? "bg-red-400 text-black hover:bg-red-500" : "bg-green-400 text-black hover:bg-green-500"
                                    )}
                                >
                                    {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                    {isRunning ? "Pause" : "Play"}
                                </Button>
                                
                                <Button 
                                    onClick={stepSimulation}
                                    disabled={isRunning}
                                    className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100 disabled:opacity-50"
                                >
                                    <FastForward className="w-4 h-4 mr-2 inline" />
                                    Step
                                </Button>

                                <Button 
                                    onClick={randomizeGrid}
                                    className="bg-purple-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-purple-400"
                                >
                                    Random Seed
                                </Button>

                                <Button 
                                    onClick={clearGrid}
                                    className="bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-100"
                                >
                                    <RotateCcw className="w-4 h-4 mr-2 inline" />
                                    Clear
                                </Button>
                            </div>

                        </div>
                    </Card>
                </div>

                {/* RIGHT: Visualizer Area */}
                <div className="lg:col-span-12 xl:col-span-8">
                    <ResultsAnalysis>
                        <Card 
                            title="Playground"
                            icon={MousePointer2}
                            headerColor="bg-black text-white"
                            className="relative overflow-hidden bg-gray-50"
                            action={
                                <span className="text-xs font-mono font-bold text-white" aria-live="polite">
                                    {isRunning ? "SIMULATING..." : "PAUSED"}
                                </span>
                            }
                        >
                            <div className="flex flex-col items-center justify-center">
                                <div className="text-xs font-bold uppercase mb-4 text-gray-500 text-center">
                                    Click and drag to draw cells
                                </div>
                                <div className="border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] overflow-hidden bg-white touch-none">
                                    <canvas
                                        ref={canvasRef}
                                        width={GRID_COLS * CELL_SIZE}
                                        height={GRID_ROWS * CELL_SIZE}
                                        onPointerDown={handlePointerDown}
                                        onPointerMove={handlePointerMove}
                                        onPointerUp={handlePointerUp}
                                        onPointerCancel={handlePointerUp}
                                        className="max-w-full h-auto cursor-crosshair block"
                                        style={{ imageRendering: 'pixelated' }}
                                    />
                                </div>
                            </div>
                        </Card>
                    </ResultsAnalysis>
                </div>

            </CalculatorLayout>
        
      <Footer />
    </div>
    );
}
