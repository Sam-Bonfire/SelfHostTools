import React, { Suspense } from 'react';
import { createHashRouter, Outlet, RouterProvider } from 'react-router-dom';

import ErrorBoundary from './components/ErrorBoundary';
import MementoMori from './components/MementoMori';
import SankeyFlowchart from './components/SankeyFlowchart';
import VisualizersHome from './components/VisualizersHome';
const CompoundInterestSandbox = React.lazy(() => import('./components/CompoundInterestSandbox.jsx'));
const SortingVisualizer = React.lazy(() => import('./components/SortingVisualizer.jsx'));
const AssetJarVisualizer = React.lazy(() => import('./components/AssetJarVisualizer.jsx'));
const CellularAutomataVisualizer = React.lazy(() => import('./components/CellularAutomataVisualizer.jsx'));
const PomodoroFocusVisualizer = React.lazy(() => import('./components/PomodoroFocusVisualizer.jsx'));
const SWRHistoricalVisualizer = React.lazy(() => import('./components/SWRHistoricalVisualizer.jsx'));
import DebtRepaymentRace from './components/DebtRepaymentRace';
import FreedomClock from './components/FreedomClock';
import RunwayHorizon from './components/RunwayHorizon';

const router = createHashRouter([
  {
    element: <Outlet />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: '/',
        element: <VisualizersHome />
      },
      {
        path: '/memento-mori',
        element: <MementoMori />
      },
      {
        path: '/sankey-flowchart',
        element: <SankeyFlowchart />
      },
      {
        path: '/compound-interest',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CompoundInterestSandbox />
          </Suspense>
        )
      },
      {
        path: '/sorting-visualizer',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SortingVisualizer />
          </Suspense>
        )
      },
      {
        path: '/asset-jar',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <AssetJarVisualizer />
          </Suspense>
        )
      },
      {
        path: '/cellular-automata',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <CellularAutomataVisualizer />
          </Suspense>
        )
      },
      {
        path: '/pomodoro-focus',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <PomodoroFocusVisualizer />
          </Suspense>
        )
      },
      {
        path: '/swr-history',
        element: (
          <Suspense fallback={<div>Loading...</div>}>
            <SWRHistoricalVisualizer />
          </Suspense>
        )
      },
      {
        path: '/debt-race',
        element: <DebtRepaymentRace />
      },
      {
        path: '/runway-horizon',
        element: <RunwayHorizon />
      },
      {
        path: '/freedom-clock',
        element: <FreedomClock />
      }
    ]
  }
]);

function App() {
  return (
    <div className="min-h-screen bg-[#FFDE59]">
      <RouterProvider router={router} />
    </div>
  );
}

export default App;
