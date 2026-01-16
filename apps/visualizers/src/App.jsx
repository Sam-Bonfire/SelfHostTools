import { createHashRouter, RouterProvider } from 'react-router-dom';
import VisualizersHome from './components/VisualizersHome';
import MementoMori from './components/MementoMori';

const router = createHashRouter([
    {
        path: "/",
        element: <VisualizersHome />,
    },
    {
        path: "/memento-mori",
        element: <MementoMori />,
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
