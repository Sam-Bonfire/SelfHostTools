import { Button, Card, Footer } from '@packages/styling';
import { AlertOctagon, Home, RefreshCw } from 'lucide-react';
import { Link, useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();
  console.error(error);

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center items-center text-center">
        <Card className="p-8 w-full max-w-lg border-4 border-black bg-[#FF8B8B] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform rotate-1">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertOctagon className="w-16 h-16 text-black" />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-2">UH OH!</h1>
          <h2 className="text-xl font-bold mb-6 uppercase tracking-wider bg-black text-white inline-block px-2 transform -rotate-1">
            Unexpected Error
          </h2>

          <p className="text-lg font-bold mb-8 text-black">
            An unexpected error occurred in this view.
            <br />
            Our formulas got standard-deviated.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Button
              onClick={handleReload}
              className="flex items-center gap-2 text-lg px-8 py-3 w-full justify-center md:w-auto hover:-translate-y-1 transition-transform border-4 bg-white text-black border-black"
            >
              <RefreshCw className="w-5 h-5" />
              Reload App
            </Button>
            <Link to="/">
              <Button className="flex items-center gap-2 text-lg px-8 py-3 w-full justify-center md:w-auto hover:-translate-y-1 transition-transform border-4 bg-black text-white border-black">
                <Home className="w-5 h-5" />
                Return to Safety
              </Button>
            </Link>
          </div>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
