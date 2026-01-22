import React from 'react';
import { Card, Button } from '@packages/styling';
import { MessageSquarePlus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from './SEO';

export default function Feedback() {
    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8 font-outfit">
            <SEO
                title="Feedback & Suggestions - Calculators Hub"
                description="Have an idea for a new calculator? Found a bug? Let us know! We build tools based on your feedback."
                keywords="feedback, contact, suggestions, feature request, calculator ideas"
                canonical={`${import.meta.env.VITE_SITE_URL}/feedback`}
                ogImage={`${import.meta.env.VITE_SITE_URL}/og/home.png`}
            />

            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Link to="/" className="inline-flex items-center gap-2 text-black hover:bg-yellow-300 px-3 py-1 border-2 border-transparent hover:border-black transition-all mb-4 font-bold">
                        <ArrowLeft className="w-5 h-5" />
                        Back to Hub
                    </Link>

                    <div className="p-6 bg-purple-400 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex items-center gap-4">
                        <MessageSquarePlus className="w-10 h-10 md:w-12 md:h-12 text-black" />
                        <div>
                            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight">
                                Feedback & Ideas
                            </h1>
                            <p className="font-bold text-lg md:text-xl mt-1 opacity-90">
                                Tell us what to build next.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <Card className="min-h-[1200px] border-0 shadow-none bg-transparent">
                    <div className="w-full h-full min-h-[1200px] flex flex-col items-center justify-center">
                        {import.meta.env.VITE_NOTION_FORM_URL ? (
                            <iframe
                                src={import.meta.env.VITE_NOTION_FORM_URL}
                                className="w-full h-full min-h-[1200px] border-0"
                                title="Feedback Form"
                                loading="lazy"
                            />
                        ) : (
                            <div className="max-w-md text-center">
                                <h2 className="text-2xl font-black mb-4">Embed Your Form Here</h2>
                                <p className="mb-6 font-medium">
                                    Please add your Notion Form URL to the <code className="bg-yellow-200 px-2 py-1 font-mono text-sm">VITE_NOTION_FORM_URL</code> environment variable in your <code className="bg-yellow-200 px-2 py-1 font-mono text-sm">.env.local</code> file.
                                </p>
                                <div className="p-4 border-2 border-dashed border-gray-400 bg-gray-100 rounded text-sm font-mono text-gray-600 break-all text-left">
                                    VITE_NOTION_FORM_URL=https://your-notion-form-url
                                </div>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
