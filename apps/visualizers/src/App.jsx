import { createHashRouter, RouterProvider } from 'react-router-dom';
import VisualizersHome from './components/VisualizersHome';
import MementoMori from './components/MementoMori';
import SankeyFlowchart from './components/SankeyFlowchart';
import CompoundInterestSandbox from './components/CompoundInterestSandbox';
import DebtRepaymentRace from './components/DebtRepaymentRace';
import RunwayHorizon from './components/RunwayHorizon';
import FreedomClock from './components/FreedomClock';

const router = createHashRouter([
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
        path: "/compound-sandbox",
        element: <CompoundInterestSandbox />,
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
]);

function App() {
    return (
        <div className="min-h-screen bg-[#FFDE59]">
            <RouterProvider router={router} />
        </div>
    );
}

export default App;
