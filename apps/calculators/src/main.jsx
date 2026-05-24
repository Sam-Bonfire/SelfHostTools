import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { registerSW } from 'virtual:pwa-register';
import Root from './components/Root.jsx';
import PWAInstallPrompt from './components/PWAInstallPrompt.jsx';
import NotFound from './components/NotFound.jsx';
import Forbidden from './components/Forbidden.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import '../../../packages/styling/src/index.css';

// Lazy Load Calculators
const EducationLoan = React.lazy(() => import('./components/EducationLoan.jsx'));
const SIPCalculator = React.lazy(() => import('./components/SIPCalculator.jsx'));
const HomeLoanRentCalculator = React.lazy(() => import('./components/HomeLoanRentCalculator.jsx'));
const LifeInsuranceCalculator = React.lazy(() => import('./components/LifeInsuranceCalculator.jsx'));
const FIRECalculator = React.lazy(() => import('./components/FIRECalculator.jsx'));
const FreelanceIncomeCalculator = React.lazy(() => import('./components/FreelanceIncomeCalculator.jsx'));
const GoldenHandcuffsCalculator = React.lazy(() => import('./components/GoldenHandcuffsCalculator.jsx'));
const DegreeROICalculator = React.lazy(() => import('./components/DegreeROICalculator.jsx'));
const HomeOwnerRealistCalculator = React.lazy(() => import('./components/HomeOwnerRealistCalculator.jsx'));
const TrueHourlyWageCalculator = React.lazy(() => import('./components/TrueHourlyWageCalculator.jsx'));
const JobRelocationCalculator = React.lazy(() => import('./components/JobRelocationCalculator.jsx'));
const TDEECalculator = React.lazy(() => import('./components/TDEECalculator.jsx'));
const InvestVsLoanCalculator = React.lazy(() => import('./components/InvestVsLoanCalculator.jsx'));
const AlternateInvestmentCalculator = React.lazy(() => import('./components/AlternateInvestmentCalculator.jsx'));
const SaasLeakCalculator = React.lazy(() => import('./components/SaasLeakCalculator.jsx'));
const TimeBuyBackCalculator = React.lazy(() => import('./components/TimeBuyBackCalculator.jsx'));
const InflationDestroyer = React.lazy(() => import('./components/InflationDestroyer.jsx'));
const Feedback = React.lazy(() => import('./components/Feedback.jsx'));
const LifestyleCreepCalculator = React.lazy(() => import('./components/LifestyleCreepCalculator.jsx'));

// Loading Spinner
const Loading = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#FFDE59]">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-black border-t-transparent"></div>
  </div>
);

const router = createHashRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <PWAInstallPrompt />
        <Suspense fallback={<Loading />}>
          <Outlet />
        </Suspense>
      </>
    ),
    children: [
      {
        path: '/',
        element: <Root />,
      },
      {
        path: '/education-loan',
        element: <EducationLoan />,
      },
      {
        path: '/sip-calculator',
        element: <SIPCalculator />,
      },
      {
        path: '/home-loan-vs-rent',
        element: <HomeLoanRentCalculator />,
      },
      {
        path: '/life-insurance-calculator',
        element: <LifeInsuranceCalculator />,
      },
      {
        path: '/fire-calculator',
        element: <FIRECalculator />,
      },
      {
        path: '/freelance-calculator',
        element: <FreelanceIncomeCalculator />,
      },
      {
        path: '/degree-roi',
        element: <DegreeROICalculator />,
      },
      {
        path: '/golden-handcuffs',
        element: <GoldenHandcuffsCalculator />,
      },
      {
        path: '/true-hourly-wage',
        element: <TrueHourlyWageCalculator />,
      },
      {
        path: '/home-owner-realist',
        element: <HomeOwnerRealistCalculator />,
      },
      {
        path: '/job-relocation',
        element: <JobRelocationCalculator />,
      },
      {
        path: '/tdee-calculator',
        element: <TDEECalculator />,
      },
      {
        path: '/invest-vs-payoff',
        element: <InvestVsLoanCalculator />,
      },
      {
        path: '/alternate-investment',
        element: <AlternateInvestmentCalculator />,
      },
      {
        path: '/saas-leak',
        element: <SaasLeakCalculator />,
      },
      {
        path: '/time-buyback',
        element: <TimeBuyBackCalculator />,
      },
      {
        path: '/inflation-destroyer',
        element: <InflationDestroyer />,
      },
      {
        path: '/lifestyle-creep',
        element: <LifestyleCreepCalculator />,
      },
      {
        path: '/feedback',
        element: <Feedback />,
      },
      {
        path: '/403',
        element: <Forbidden />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);

// Register Service Worker
registerSW({ immediate: true });
