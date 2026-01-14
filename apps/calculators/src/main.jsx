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
import NotFound from './components/NotFound.jsx';
import '../../../packages/styling/src/index.css';

const router = createHashRouter([
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
    path: '*',
    element: <NotFound />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);
