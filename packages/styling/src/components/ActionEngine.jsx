import React, { useMemo } from 'react';
import { Target, CheckCircle2, Circle } from 'lucide-react';
import { usePersistedState } from '@packages/persistence';

export const ActionEngine = ({ calculatorId, actions = [] }) => {
    // We persist the checked state as an array of action IDs or titles
    const [completedActions, setCompletedActions] = usePersistedState(calculatorId, 'completedActions', []);

    const toggleAction = (actionTitle) => {
        setCompletedActions(prev => {
            const isCompleted = prev.includes(actionTitle);
            if (isCompleted) {
                return prev.filter(t => t !== actionTitle);
            } else {
                return [...prev, actionTitle];
            }
        });
    };

    // Calculate progress
    const progress = actions.length > 0 ? (completedActions.length / actions.length) * 100 : 0;

    if (!actions || actions.length === 0) return null;

    return (
        <div className="mt-8 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative">
            <div className="bg-purple-200 border-b-4 border-black p-4 flex items-center gap-3">
                <Target className="w-6 h-6 text-black" />
                <h3 className="font-black text-xl text-black uppercase tracking-tight">Your Action Plan</h3>
            </div>
            
            {/* Progress bar */}
            <div className="h-2 bg-gray-200 w-full border-b-4 border-black">
                <div 
                    className="h-full bg-green-400 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            <div className="p-4 sm:p-6 space-y-4">
                {actions.map((action, index) => {
                    const isCompleted = completedActions.includes(action.title);
                    return (
                        <div 
                            key={index} 
                            onClick={() => toggleAction(action.title)}
                            className={`flex items-start gap-4 p-4 border-2 border-black cursor-pointer transition-all ${
                                isCompleted ? 'bg-green-50 opacity-70' : 'bg-white hover:bg-purple-50'
                            }`}
                        >
                            <button 
                                className="mt-1 flex-shrink-0 focus:outline-none"
                                aria-label={isCompleted ? "Mark incomplete" : "Mark complete"}
                            >
                                {isCompleted ? (
                                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                                ) : (
                                    <Circle className="w-6 h-6 text-black" />
                                )}
                            </button>
                            <div>
                                <h4 className={`font-bold text-base sm:text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-black'}`}>
                                    {action.title}
                                </h4>
                                <p className={`text-sm sm:text-base mt-1 ${isCompleted ? 'text-gray-400' : 'text-gray-700'}`}>
                                    {action.description}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-gray-100 p-3 border-t-4 border-black text-xs font-bold text-gray-600 uppercase tracking-wide text-center">
                Disclaimer: These next steps are heuristic-based guidelines, not professional financial advice.
            </div>
        </div>
    );
};
