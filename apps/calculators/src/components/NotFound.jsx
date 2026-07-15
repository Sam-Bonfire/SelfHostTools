import { Button, Card, Footer } from '@packages/styling';
import { AlertTriangle, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

import SEO from './SEO';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col">
      <SEO
        title="Page Not Found"
        description="The page you are looking for does not exist."
        canonical={`${import.meta.env.VITE_SITE_URL}/404`}
        robots="noindex, nofollow"
      />

      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center">
        <Card className="p-8 w-full max-w-lg border-4 border-black bg-yellow-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertTriangle className="w-16 h-16 text-black" />
            </div>
          </div>

          <h1 className="text-6xl font-black mb-2">404</h1>
          <h2 className="text-2xl font-bold mb-6 uppercase tracking-wider bg-black text-white inline-block px-2 transform rotate-1">
            Calculation Error
          </h2>

          <p className="text-lg font-bold mb-8 text-black">
            We crunched the numbers, but this page didn&apos;t add up.
            <br className="hidden md:block" />
            It might have been divided by zero or seemingly vanished.
          </p>

          <Link to="/">
            <Button className="flex items-center gap-2 mx-auto text-lg px-8 py-3 w-full justify-center md:w-auto hover:-translate-y-1 transition-transform border-4">
              <Home className="w-5 h-5" />
              Return to Safety
            </Button>
          </Link>
        </Card>
      </div>

      <Footer />
    </div>
  );
}
