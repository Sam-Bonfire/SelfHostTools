import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calculator, ArrowRight, TrendingUp, Home, Umbrella, Flame, Briefcase, Lock, GraduationCap, Hammer, MapPin } from 'lucide-react';
import { Card } from '@packages/styling';
import { motion } from 'framer-motion';
import Footer from './Footer';
import SEO from './SEO';

export default function Root() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Calculators Hub",
    "url": `${import.meta.env.VITE_SITE_URL} `,
    "description": "A hub for various calculators, including financial, educational, and more.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${import.meta.env.VITE_SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-white text-black p-4 md:p-8">
      <SEO
        title="Calculators Hub"
        description="A hub for various calculators, including financial, educational, and more. Plan your future with our easy-to-use tools."
        keywords="calculators, financial planning, money tools, retirement, education, investment, savings, wealth growth"
        canonical={`${import.meta.env.VITE_SITE_URL}`}
        structuredData={structuredData}
      />
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
              <img
                src="/favicon.png"
                alt="Mascot"
                className="w-16 h-16 md:w-20 md:h-20 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              />
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-black uppercase tracking-tight text-center md:text-left">
                Calculators Hub
              </h1>
            </div>
          </motion.div>
          <p className="text-xl md:text-2xl font-bold text-gray-700 max-w-2xl mx-auto mb-8">
            Simple tools for complex decisions.
            <br />
            <span className="bg-blue-200 px-2 box-decoration-clone tracking-tight">Plan your finances, studies, and future.</span>
          </p>
        </header>

        {/* Calculators Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">

          <Link to="/education-loan" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-[#7EAAFF] p-6 border-b-4 border-black flex items-center justify-between">
                <Calculator className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                  Education Loan
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Calculate EMI, moratorium interest, and prepayment savings. Plan your repayment strategy effectively.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                    Finance
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/sip-calculator" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-[#FFDE59] p-6 border-b-4 border-black flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4">
                  SIP Calculator
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Estimate future wealth from your monthly investments. Includes Annual Step-Up logic.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">
                    Investment
                  </span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/home-loan-vs-rent" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-[#7EAAFF] p-6 border-b-4 border-black flex items-center justify-between">
                <Home className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Buy vs Rent
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  The 'Buy or Bye' reality check. Compare ownership costs vs. renting and investing the difference.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Housing</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/home-owner-realist" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-[#FF9900] p-6 border-b-4 border-black flex items-center justify-between">
                <Hammer className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Home Warning
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  The 'Sinking Fund' Realist. Calculate the hidden maintenance bombs and true cost of ownership.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Housing</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/fire-calculator" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-orange-400 p-6 border-b-4 border-black flex items-center justify-between">
                <Flame className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  FIRE / Retirement
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Calculate your path to financial freedom. Factor in healthcare inflation and post-retirement taxes.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Freedom</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/life-insurance-calculator" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-emerald-400 p-6 border-b-4 border-black flex items-center justify-between">
                <Umbrella className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Life Cover (HLV)
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Find your Human Life Value. Calculate coverage needed for liabilities, family income, and future goals.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Security</span>
                </div>
              </div>
            </Card>
          </Link>


          <Link to="/golden-handcuffs" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-yellow-300 p-6 border-b-4 border-black flex items-center justify-between">
                <Lock className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Golden Handcuffs
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Should you quit? Calculate the true financial cost of walking away from unvested equity and clawbacks.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Career</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/freelance-calculator" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-purple-400 p-6 border-b-4 border-black flex items-center justify-between">
                <Briefcase className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Freelance 'Real' Pay
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Calculate your true take-home pay after overheads, unpaid admin time, and benefits replacement.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Business</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/true-hourly-wage" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-red-400 p-6 border-b-4 border-black flex items-center justify-between">
                <Briefcase className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  True Hourly Wage
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  The 'Wake Up Call'. Calculate your real earnings per hour after commute, taxes, and life maintenance costs.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Career</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/degree-roi" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-blue-600 p-6 border-b-4 border-black flex items-center justify-between">
                <GraduationCap className="w-8 h-8 text-white" />
                <ArrowRight className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Degree ROI
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Is college worth it? Compare the 20-year ROI of a degree vs entering the workforce immediately.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Education</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/job-relocation" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-teal-400 p-6 border-b-4 border-black flex items-center justify-between">
                <MapPin className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Job Relocation
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Should you move? Calculate the true financial impact of relocating for a job, including hidden costs & lifestyle changes.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Career</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/tdee-calculator" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-pink-400 p-6 border-b-4 border-black flex items-center justify-between">
                <Flame className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  TDEE & BMR
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  Fitness starts here. Calculate your maintenance calories and get custom targets for cutting or bulking.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Health</span>
                </div>
              </div>
            </Card>
          </Link>

          <Link to="/invest-vs-payoff" className="group block h-full decoration-transparent">
            <Card className="h-full hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200 cursor-pointer flex flex-col">
              <div className="bg-lime-400 p-6 border-b-4 border-black flex items-center justify-between">
                <TrendingUp className="w-8 h-8 text-black" />
                <ArrowRight className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="text-2xl font-black text-black mb-3 group-hover:underline decoration-4 decoration-black underline-offset-4 tracking-tight">
                  Invest vs Payoff
                </h2>
                <p className="text-gray-700 font-medium mb-6 flex-1">
                  The eternal dilemma solved. Compare net worth outcomes of investing surplus vs aggressively paying debt.
                </p>
                <div className="mt-auto">
                  <span className="inline-block px-3 py-1 bg-black text-white text-sm font-bold uppercase tracking-wider">Strategy</span>
                </div>
              </div>
            </Card>
          </Link>

          {/* Placeholder for future calculators */}
          <Card className="h-full opacity-60 flex flex-col">
            <div className="bg-gray-200 p-6 border-b-4 border-black">
              <Calculator className="w-8 h-8 text-gray-500" />
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <h2 className="text-2xl font-black text-gray-500 mb-3">
                More Coming Soon
              </h2>
              <p className="text-gray-500 font-medium">
                We are working on adding more calculators for investment, tax, and health. Stay tuned!
              </p>
            </div>
          </Card>

        </section>

        <Footer />
      </div>
    </div>
  );
}
