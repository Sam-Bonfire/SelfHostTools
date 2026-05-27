import React, { Suspense } from 'react';
import { createHashRouter, RouterProvider, Outlet } from 'react-router-dom';
import VisualizersHome from './components/VisualizersHome';
import MementoMori from './components/MementoMori';
import SankeyFlowchart from './components/SankeyFlowchart';
import ErrorBoundary from './components/ErrorBoundary';
const CompoundInterestSandbox = React.lazy(() => import('./components/CompoundInterestSandbox.jsx'));
const SortingVisualizer = React.lazy(() => import('./components/SortingVisualizer.jsx'));
const AssetJarVisualizer = React.lazy(() => import('./components/AssetJarVisualizer.jsx'));
const CellularAutomataVisualizer = React.lazy(() => import('./components/CellularAutomataVisualizer.jsx'));
const PomodoroFocusVisualizer = React.lazy(() => import('./components/PomodoroFocusVisualizer.jsx'));
const SWRHistoricalVisualizer = React.lazy(() => import('./components/SWRHistoricalVisualizer.jsx'));
import DebtRepaymentRace from './components/DebtRepaymentRace';
import RunwayHorizon from './components/RunwayHorizon';
import FreedomClock from './components/FreedomClock';

const router = createHashRouter([
    {
        element: <Outlet />,
        errorElement: <ErrorBoundary />,
        children: [
            {
                path: "/",
                element: <VisualizersHome />,
            },
            {
                path: "/memento-mori",
                element: <MementoMori />,
            },
            {
                path: "/sankey-flowchart",
                element: <SankeyFlowchart />,
            },
            {
                path: "/compound-interest",
                element: <Suspense fallback={<div>Loading...</div>}><CompoundInterestSandbox /></Suspense>,
            },
            {
                path: "/sorting-visualizer",
                element: <Suspense fallback={<div>Loading...</div>}><SortingVisualizer /></Suspense>,
            },
            {
                path: "/asset-jar",
                element: <Suspense fallback={<div>Loading...</div>}><AssetJarVisualizer /></Suspense>,
            },
            {
                path: "/cellular-automata",
                element: <Suspense fallback={<div>Loading...</div>}><CellularAutomataVisualizer /></Suspense>,
            },
            {
                path: "/pomodoro-focus",
                element: <Suspense fallback={<div>Loading...</div>}><PomodoroFocusVisualizer /></Suspense>,
            },
            {
                path: "/swr-history",
                element: <Suspense fallback={<div>Loading...</div>}><SWRHistoricalVisualizer /></Suspense>,
            },
            {
                path: "/debt-race",
                element: <DebtRepaymentRace />,
            },
            {
                path: "/runway-horizon",
                element: <RunwayHorizon />,
            },
            {
                path: "/freedom-clock",
                element: <FreedomClock />,
            },
        ]
    },
]);

function App() {
    return (
        <div className="min-h-screen bg-[#FFDE59]">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
