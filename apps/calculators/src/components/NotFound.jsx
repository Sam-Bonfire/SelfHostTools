import React from 'react';
import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';
import { Button, Card } from '@packages/styling';
import Footer from './Footer';
import SEO from './SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 font-sans flex flex-col">
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist."
        canonical={`${import.meta.env.VITE_SITE_URL}/404`}
        robots="noindex, nofollow"
      />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center">

        <Card className="p-8 w-full border-4 border-black bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 border-4 border-black rounded-full">
              <AlertTriangle className="w-16 h-16 text-black" />
            </div>
          </div>

          <h1 className="text-6xl font-black mb-4">404</h1>
          <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider">Page Not Found</h2>

          <p className="text-lg font-medium mb-8 text-black/80">
            Oops! It seems you've ventured into the void.
            The page you're looking for has moved, been deleted, or never existed.
          </p>

          <Link to="/">
            <Button className="flex items-center gap-2 mx-auto text-lg px-8 py-3 bg-[#7EAAFF] hover:bg-[#6B99FF]">
              <Home className="w-5 h-5" />
              Return Home
            </Button>
          </Link>
        </Card>

      </div>

      <Footer />
    </div>
  );
}
