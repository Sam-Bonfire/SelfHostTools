import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, GitFork, Landmark, Flame, Sun, Clock } from 'lucide-react';
import { Card } from '@packages/styling';
import { motion } from 'framer-motion';

export default function VisualizersHome() {
    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Hero Section */}
                <header className="mb-12 text-center">
                    <motion.div
                        initial={{ rotate: -2 }}
                        whileHover={{ scale: 1.02, rotate: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        className="inline-block p-4 md:p-6 bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 cursor-default relative w-full md:w-auto mx-auto"
                    >
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
                            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight text-center md:text-left">
                                Visualizers Hub
                            </h1>
                        </div>
                    </motion.div>
                    <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto mb-8">
                        See your life in a new perspective.
                        <br />
                        <span className="bg-blue-200 px-2 box-decoration-clone tracking-tight">Visualize time, freedom, and reality.</span>
                    </p>
                </header>

                {/* Visualizers Grid */}
                <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" role="main">

                    <Link to="/memento-mori" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-black p-6 border-b-4 border-black flex items-center justify-between">
                                <Calendar className="w-8 h-8 text-white" />
                                <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    Memento Mori
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    Your life in weeks. A stoic visualization of time passed and time remaining. Auto-highlights life phases.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Perspective
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/sankey-flowchart" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-[#FFDE59] p-6 border-b-4 border-black flex items-center justify-between">
                                <GitFork className="w-8 h-8 text-black" />
                                <ArrowRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    Capital Flow Sankey
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    Track where your money goes. An interactive flow diagram mapping income streams directly to your expenses.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Finance
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/compound-sandbox" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-blue-400 p-6 border-b-4 border-black flex items-center justify-between">
                                <Landmark className="w-8 h-8 text-black" />
                                <ArrowRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    Compound Snowball
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    Watch compounding wealth build inside a physics-based particle simulator. See contribution and interest coins bounce.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Simulation
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/debt-race" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-red-400 p-6 border-b-4 border-black flex items-center justify-between">
                                <Flame className="w-8 h-8 text-black" />
                                <ArrowRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    Repayment Race
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    Compare Snowball and Avalanche payoff strategies in an interactive race to spot the fastest debt-free path.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Gaming
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/runway-horizon" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-green-400 p-6 border-b-4 border-black flex items-center justify-between">
                                <Sun className="w-8 h-8 text-black" />
                                <ArrowRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    Runway Horizon
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    A rolling interactive 2D landscape charting your financial runway duration and absolute lifestyle crash coordinates.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Horizon
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to="/freedom-clock" className="group block h-full decoration-transparent">
                        <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
                            <div className="bg-[#FFDE59] p-6 border-b-4 border-black flex items-center justify-between">
                                <Clock className="w-8 h-8 text-black" />
                                <ArrowRight className="w-6 h-6 text-black opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
                            </div>
                            <div className="p-6 flex-1 flex flex-col">
                                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                                    24-Hour Freedom Clock
                                </h2>
                                <p className="text-gray-700 font-medium mb-6 flex-1">
                                    A gorgeous circular time auditor mapping how much of your day is dedicated to obligations versus pure freedom.
                                </p>
                                <div className="mt-auto">
                                    <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                                        Time Audit
                                    </span>
                                </div>
                            </div>
                        </Card>
                    </Link>

                </main>
            </div>
        </div>
    );
}
