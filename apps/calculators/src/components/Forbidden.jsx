import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Lock } from 'lucide-react';
import { Button, Card } from '@packages/styling';
import Footer from './Footer';
import SEO from './SEO';

export default function Forbidden() {
    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col">
            <SEO
                title="Access Denied"
                description="You do not have permission to view this page."
                canonical={`${import.meta.env.VITE_SITE_URL}/403`}
                robots="noindex, nofollow"
            />

            <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center">

                <Card className="p-8 w-full max-w-lg border-4 border-black bg-red-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
                    <div className="flex justify-center mb-6">
                        <div className="bg-white p-4 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <Lock className="w-16 h-16 text-black" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-black mb-2 text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">403</h1>
                    <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider bg-black text-white inline-block px-2 transform -rotate-1">Restricted Zone</h2>

                    <p className="text-lg font-bold mb-8 text-black">
                        Stop right there! You don't have the clearance.
                        <br className="hidden md:block" />
                        This area is strictly for authorized personnel (or future you).
                    </p>

                    <Link to="/">
                        <Button className="flex items-center gap-2 mx-auto text-lg px-8 py-3 w-full justify-center md:w-auto hover:-translate-y-1 transition-transform border-4 bg-white hover:bg-gray-100">
                            <Home className="w-5 h-5" />
                            Back to Calculator Base
                        </Button>
                    </Link>
                </Card>

            </div>

            <Footer />
        </div>
    );
}
