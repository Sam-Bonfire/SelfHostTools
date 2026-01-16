import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight } from 'lucide-react';
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

                    {/* Placeholder for future visualizers */}
                    <Card className="h-full opacity-60 flex flex-col">
                        <div className="bg-gray-200 p-6 border-b-4 border-black">
                            <Calendar className="w-8 h-8 text-gray-500" />
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                            <h2 className="text-2xl font-black text-gray-500 mb-3">
                                More Coming Soon
                            </h2>
                            <p className="text-gray-500 font-medium">
                                We are building more tools to visualize data and life metrics.
                            </p>
                        </div>
                    </Card>

                </main>
            </div>
        </div>
    );
}
