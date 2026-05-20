import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@packages/styling';

const PWAInstallPrompt = () => {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handler = (e) => {
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the custom prompt
            setIsVisible(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt');
        } else {
            console.log('User dismissed the install prompt');
        }

        // We've used the prompt, and can't use it again
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[90%] max-w-md">
            <div className="bg-[#FFDE59] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 relative">
                <button
                    onClick={() => setIsVisible(false)}
                    className="absolute top-2 right-2 p-1 hover:bg-black/10 transition-colors"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4 pr-6">
                    <div className="bg-white border-2 border-black p-2 shrink-0">
                        <Download size={24} className="text-black" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg mb-1 uppercase tracking-tight">Install App</h3>
                        <p className="text-sm font-medium leading-tight mb-4">
                            Access our financial calculators instantly, even without an internet connection.
                        </p>
                        <Button
                            onClick={handleInstall}
                            className="w-full bg-black text-white hover:bg-zinc-800 border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                        >
                            ADD TO HOME SCREEN
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PWAInstallPrompt;
