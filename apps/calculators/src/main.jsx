import React from 'react';
import ReactDOM from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Root from './components/Root.jsx';
import EducationLoan from './components/EducationLoan.jsx';
import SIPCalculator from './components/SIPCalculator.jsx';
import HomeLoanRentCalculator from './components/HomeLoanRentCalculator.jsx';
import LifeInsuranceCalculator from './components/LifeInsuranceCalculator.jsx';
import FIRECalculator from './components/FIRECalculator.jsx';
import FreelanceIncomeCalculator from './components/FreelanceIncomeCalculator.jsx';
import GoldenHandcuffsCalculator from './components/GoldenHandcuffsCalculator.jsx';
import DegreeROICalculator from './components/DegreeROICalculator.jsx';
import HomeOwnerRealistCalculator from './components/HomeOwnerRealistCalculator.jsx';
import TrueHourlyWageCalculator from './components/TrueHourlyWageCalculator.jsx';
import JobRelocationCalculator from './components/JobRelocationCalculator.jsx';
import NotFound from './components/NotFound.jsx';
import '../../../packages/styling/src/index.css';

import ScrollToTop from './components/ScrollToTop.jsx';
import { Outlet } from 'react-router-dom';

const router = createHashRouter([
  {
    element: (
      <>
        <ScrollToTop />
        <Outlet />
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
